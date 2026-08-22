import { pool } from "../../daos/db/pgClient.js";

class LoginService {
  async buscar_usuario(usuario) {
    try {
      const result = await pool.query(
        `
		SELECT
			id_usuario,
			usuario,
			password_hash,
			nombre,
			email,
			activo,
      u.idtipousuario,
			TU.tipousuario,
      u.identidadeducativa,
			EE.entidadeducativa
		FROM usuarios u
		INNER JOIN  public.entidades_educativas EE ON EE.identidadeducativa = u.identidadeducativa
		INNER JOIN  public.tipos_usuarios TU ON TU.idtipousuario = u.idtipousuario
		WHERE usuario =  $1
		AND activo = true
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
}

export const loginService = new LoginService();
