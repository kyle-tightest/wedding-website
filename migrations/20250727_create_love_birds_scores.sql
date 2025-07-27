-- Migration: Create love_birds_scores table

CREATE TABLE love_birds_scores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL
);
