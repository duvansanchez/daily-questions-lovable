-- **INSTRUCCIONES PARA RESOLVER EL ERROR DE CREACIÓN DE OBJETIVOS**
-- 
-- El error ocurre porque:
-- 1. La tabla [objetivos] tiene user_id NOT NULL
-- 2. La tabla [objetivos] tiene una FK a [user](id)
-- 3. No existe un usuario con ID 1 en la tabla [user]
--
-- OPCIÓN 1 (RECOMENDADA): Crear un usuario dummy con ID 1
-- Ejecuta esto en SQL Server Management Studio:

INSERT INTO [dbo].[user] (id) VALUES (1);

-- Si dauna error de que ya existe, ignora, significa que ya fue creado.


-- OPCIÓN 2: Si la opción 1 falla, hacer user_id nullable
-- (solo si la tabla [user] realmente requiere user_id NOT NULL)

-- PRIMERO: Remover la FK constraint
ALTER TABLE [dbo].[objetivos]
DROP CONSTRAINT FK__objetivos__user___4CA06362;

-- SEGUNDO: Hacer columna nullable
ALTER TABLE [dbo].[objetivos]
ALTER COLUMN user_id INT NULL;

-- TERCERO: Opcionalmente recrear la FK (sin requerirefuerzo)
-- ALTER TABLE [dbo].[objetivos]
-- ADD CONSTRAINT FK__objetivos__user___4CA06362 FOREIGN KEY (user_id) REFERENCES [dbo].[user](id);


-- VERIFICAR QUÉ USUARIO EXISTE:
SELECT * FROM [dbo].[user];

-- VERIFICAR CONSTRAINTSEN LA TABLA objetivos:
SELECT CONSTRAINT_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'objetivos';
