-- Migration: Create the rsvps table
-- This table will store the RSVP responses from guests.

CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  meal_preference VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a comment to the table for clarity
COMMENT ON TABLE rsvps IS 'Stores RSVP submissions from the wedding website.';