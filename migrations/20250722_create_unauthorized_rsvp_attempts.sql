-- Migration: Create unauthorized_rsvp_attempts table

CREATE TABLE unauthorized_rsvp_attempts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    meal VARCHAR(100),
    ip_address VARCHAR(45),
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);