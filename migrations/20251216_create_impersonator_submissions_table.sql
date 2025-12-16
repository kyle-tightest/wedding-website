CREATE TABLE impersonator_submissions (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  impersonated_photo_url VARCHAR(255) NOT NULL,
  submission_photo_url VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
