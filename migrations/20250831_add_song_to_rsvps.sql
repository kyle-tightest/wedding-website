-- Migration: Add 'song' column to rsvp tables

ALTER TABLE rsvps
ADD COLUMN song VARCHAR(255);

ALTER TABLE unauthorized_rsvp_attempts
ADD COLUMN song VARCHAR(255);