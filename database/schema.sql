-- PostgreSQL starter schema. Apply only after reviewing with the university's IT/privacy team.
CREATE TYPE user_role AS ENUM ('student','doctor','admin');
CREATE TABLE users (
 id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
 role user_role NOT NULL DEFAULT 'student', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE submissions (
 id BIGSERIAL PRIMARY KEY, student_id BIGINT NOT NULL REFERENCES users(id),
 message_encrypted BYTEA, language VARCHAR(8), consent_to_contact BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), retention_until TIMESTAMPTZ
);
CREATE TABLE predictions (
 id BIGSERIAL PRIMARY KEY, submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
 category VARCHAR(64) NOT NULL, confidence NUMERIC(5,4), model_version VARCHAR(128), needs_human_review BOOLEAN NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE referrals (
 id BIGSERIAL PRIMARY KEY, submission_id BIGINT NOT NULL REFERENCES submissions(id),
 assigned_doctor_id BIGINT REFERENCES users(id), status VARCHAR(24) NOT NULL DEFAULT 'pending',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), closed_at TIMESTAMPTZ
);
CREATE TABLE appointments (
 id BIGSERIAL PRIMARY KEY, student_id BIGINT NOT NULL REFERENCES users(id), doctor_id BIGINT REFERENCES users(id),
 scheduled_at TIMESTAMPTZ NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'requested'
);
CREATE TABLE feedback (
 id BIGSERIAL PRIMARY KEY, submission_id BIGINT REFERENCES submissions(id), helpful BOOLEAN NOT NULL,
 comment TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE audit_logs (
 id BIGSERIAL PRIMARY KEY, actor_id BIGINT REFERENCES users(id), action VARCHAR(100) NOT NULL,
 resource_type VARCHAR(64), resource_id BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Add row-level security, encryption/key management, least-privilege roles, and retention jobs before production.
