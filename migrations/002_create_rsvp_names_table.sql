-- Migration

CREATE TABLE IF NOT EXISTS rsvp_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
);

-- Add a comment to the table for clarity
COMMENT ON TABLE rsvps IS 'Stores a whitelist of names that can RSVP.';