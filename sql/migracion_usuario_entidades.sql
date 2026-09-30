-- ============================================================
-- MIGRACIÓN: Soporte multi-institución para usuarios
-- Fecha: 2026-09-27
-- ============================================================

-- 1. Crear tabla de relación usuario <-> múltiples instituciones
-- ============================================================
CREATE TABLE IF NOT EXISTS usuario_entidades (
    id_usuario_entidad  SERIAL      PRIMARY KEY,
    id_usuario          INTEGER     NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    identidadeducativa  INTEGER     NOT NULL REFERENCES entidades_educativas(identidadeducativa) ON DELETE CASCADE,
    activo              BOOLEAN     NOT NULL DEFAULT TRUE,
    fecha_alta          TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(id_usuario, identidadeducativa)
);

-- 2. Índice de rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_usuario_entidades_usuario
    ON usuario_entidades(id_usuario);

-- 3. Migrar la institución principal actual de cada usuario a la nueva tabla
--    (ADMIN idtipousuario=1, OPERADOR idtipousuario=2 --- ajustar si difiere en tu BD)
-- ============================================================
INSERT INTO usuario_entidades (id_usuario, identidadeducativa)
SELECT id_usuario, identidadeducativa
FROM   usuarios
WHERE  identidadeducativa IS NOT NULL
ON CONFLICT (id_usuario, identidadeducativa) DO NOTHING;

-- 4. Verificación: cuántos registros quedaron migrados
-- ============================================================
SELECT COUNT(*) AS total_migrados FROM usuario_entidades;
