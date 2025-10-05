CREATE TABLE declined_rsvps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    declined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT
);