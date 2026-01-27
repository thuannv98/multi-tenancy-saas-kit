-- db/db.sql

-- Create the db
CREATE DATABASE ak;
\c ak;

-- SQL script to create and seed the roles table
BEGIN;

-- Create practices (tenants) table
CREATE TABLE IF NOT EXISTS practices (
   id BIGSERIAL PRIMARY KEY,
   name TEXT NOT NULL UNIQUE,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
   id BIGSERIAL PRIMARY KEY,
   username TEXT NOT NULL UNIQUE,
   email TEXT NOT NULL UNIQUE,
   password_hash TEXT NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
   id BIGSERIAL PRIMARY KEY,
   practice_id BIGINT REFERENCES practices(id) ON DELETE CASCADE,
   name TEXT NOT NULL UNIQUE,
   secret TEXT NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS practice_users (
   practice_id BIGINT REFERENCES practices(id) ON DELETE CASCADE,
   user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
   PRIMARY KEY (practice_id, user_id)
);

-- Create the roles table
CREATE TABLE IF NOT EXISTS roles (
   id BIGSERIAL PRIMARY KEY,
   name TEXT NOT NULL UNIQUE,
   description TEXT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
   id BIGSERIAL PRIMARY KEY,
   name TEXT NOT NULL UNIQUE,
   description TEXT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
   role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
   permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
   PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
   user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
   role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
   PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS integrations (
   id BIGSERIAL PRIMARY KEY,
   name TEXT NOT NULL UNIQUE,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_permissions (
   integration_id BIGINT REFERENCES integrations(id) ON DELETE CASCADE,
   permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
   practice_id BIGINT REFERENCES practices(id) ON DELETE CASCADE,
   is_approved BOOLEAN NOT NULL DEFAULT FALSE,
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   PRIMARY KEY (integration_id, permission_id, practice_id)
);

-- Trigger to keep updated_at current on update
CREATE OR REPLACE FUNCTION updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practices_updated_at ON practices;
CREATE TRIGGER trg_practices_updated_at
BEFORE UPDATE ON practices
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_permissions_updated_at ON permissions;
CREATE TRIGGER trg_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_integrations_updated_at ON integrations;
CREATE TRIGGER trg_integrations_updated_at
BEFORE UPDATE ON integrations
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();

DROP TRIGGER IF EXISTS trg_integration_permissions_updated_at ON integration_permissions;
CREATE TRIGGER trg_integration_permissions_updated_at
BEFORE UPDATE ON integration_permissions
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();


-- Trigger to auto-create integration_permissions for new practices
CREATE OR REPLACE FUNCTION create_integration_permissions_for_new_practice()
RETURNS TRIGGER AS $$
DECLARE
   integration_id BIGINT;
   permission_id BIGINT;
BEGIN
   SELECT id INTO integration_id FROM integrations WHERE name = 'EmailProvider' LIMIT 1;
   SELECT id INTO permission_id FROM permissions WHERE name = 'action:email.write' LIMIT 1;

   IF integration_id IS NOT NULL AND permission_id IS NOT NULL THEN
      INSERT INTO integration_permissions (integration_id, permission_id, practice_id, is_approved)
      VALUES (integration_id, permission_id, NEW.id, FALSE)
      ON CONFLICT DO NOTHING;
   END IF;

   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_practices_after_insert_integration_permissions ON practices;
CREATE TRIGGER trg_practices_after_insert_integration_permissions
AFTER INSERT ON practices
FOR EACH ROW
EXECUTE PROCEDURE create_integration_permissions_for_new_practice();


-- Seed default roles
DELETE FROM roles;
INSERT INTO roles (name, description)
VALUES
	('PracticeAdmin', 'Administrator with full access'),
	('Staff', 'Regular authenticated user'),
	('Integration', 'Non-human user for integrations')
ON CONFLICT (name) DO NOTHING;


DELETE FROM permissions;
INSERT INTO permissions (name, description)
VALUES
   ('read:clients', 'Permission to read clients'),
   ('write:clients', 'Permission to create or modify clients'),
   ('action:email.send', 'Permission to send emails'),
   ('action:email.write', 'Permission to write emails (For integration role)')
ON CONFLICT (name) DO NOTHING;


DELETE FROM role_permissions;
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE
   (r.name = 'PracticeAdmin' AND p.name IN ('read:clients', 'write:clients', 'action:email.send'))
   OR
   (r.name = 'Staff' AND p.name in ('read:clients', 'action:email.send'))
ON CONFLICT DO NOTHING;


DELETE FROM integrations;
INSERT INTO integrations (name)
VALUES
   ('EmailProvider')
ON CONFLICT (name) DO NOTHING;


DELETE FROM practices;
INSERT INTO practices (name)
VALUES
   ('practice1'),
   ('practice2')
ON CONFLICT (name) DO NOTHING;


DELETE FROM users;
INSERT INTO users (username, email, password_hash)
VALUES
   ('practice1_admin', 'admin@practice1.com', '$2b$12$example_hash'),
   ('staff', 'staff@example.com', '$2b$12$example_hash')
ON CONFLICT (username) DO NOTHING;

DELETE FROM user_roles;
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE
   (u.username = 'practice1_admin' AND r.name = 'PracticeAdmin')
   OR
   (u.username = 'staff' AND r.name = 'Staff')
ON CONFLICT DO NOTHING;

DELETE FROM practice_users;
INSERT INTO practice_users (practice_id, user_id)
SELECT p.id, u.id
FROM practices p, users u
WHERE u.username = 'staff'
ON CONFLICT DO NOTHING;
-- Each PracticeAdmin is assigned to one practice
INSERT INTO practice_users (practice_id, user_id)
SELECT p.id, u.id
FROM practices p, users u
WHERE p.name = 'practice1' AND u.username = 'practice1_admin'
ON CONFLICT DO NOTHING;

DELETE FROM clients;
INSERT INTO clients (practice_id, name, secret)
SELECT p.id, 'client_123', 'secret_abc'
FROM practices p
WHERE p.name = 'practice1'
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- Usage notes:
-- Apply with: psql -d your_db -f db/db.sql

