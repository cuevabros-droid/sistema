import { pool } from "../../daos/db/pgClient.js";

class LoginService {
  async buscar_usuario(usuario) {
    try {
      const result = await pool.query(
        `
		SELECT
			u.id_usuario,
			u.usuario,
			u.password_hash,
			u.nombre,
			u.email,
			u.activo,
      u.idtipousuario,
			TU.tipousuario,
      u.identidadeducativa,
			EE.entidadeducativa,
      u.imagen,
      u.id_persona,
      COALESCE(P.apellidos, '') AS apellidos,
      COALESCE(P.nombres, '') AS nombres
		FROM usuarios u
		INNER JOIN  public.entidades_educativas EE ON EE.identidadeducativa = u.identidadeducativa
		INNER JOIN  public.tipos_usuarios TU ON TU.idtipousuario = u.idtipousuario
    LEFT JOIN  public.persona P ON (P.id_persona = u.id_persona OR P.usuario = u.usuario)
		WHERE u.usuario =  $1
		AND u.activo = true
                    `,
        [usuario],
      );

      // NO EXISTE
      if (result.rows.length === 0) {
        return null;
      }

      // USUARIO
      const usuarioBD = result.rows[0];

      // ACTUALIZA ULTIMO LOGIN
      await pool.query(
        `
                UPDATE usuarios
                SET ultimo_login = NOW()
                WHERE id_usuario = $1
                `,
        [usuarioBD.id_usuario],
      );

      // DEVUELVE USUARIO
      return usuarioBD;
    } catch (error) {
      //console.log(error);

      throw error;
    }
  }

  // Devuelve todas las instituciones activas a las que pertenece el usuario
  // (usuario_entidades + la institución principal de la tabla usuarios)
  async buscar_entidades(id_usuario) {
    const result = await pool.query(
      `
      SELECT DISTINCT EE.identidadeducativa, EE.entidadeducativa, EE.logo
      FROM entidades_educativas EE
      WHERE EE.identidadeducativa IN (
          SELECT ue.identidadeducativa
          FROM usuario_entidades ue
          WHERE ue.id_usuario = $1
            AND COALESCE(ue.activo, true) = true
          UNION
          SELECT u.identidadeducativa
          FROM usuarios u
          WHERE u.id_usuario = $1
      )
      ORDER BY EE.entidadeducativa
      `,
      [id_usuario],
    );
    return result.rows;
  }

  // Verifica que el usuario pertenezca a la institución indicada y la devuelve
  async buscar_entidad_de_usuario(id_usuario, identidadeducativa) {
    const entidades = await this.buscar_entidades(id_usuario);
    return (
      entidades.find(
        (e) => Number(e.identidadeducativa) === Number(identidadeducativa),
      ) || null
    );
  }
}

export const loginService = new LoginService();
