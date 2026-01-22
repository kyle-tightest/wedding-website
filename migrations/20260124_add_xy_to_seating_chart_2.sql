-- Migration to add x and y coordinates to seating_chart_2 table
ALTER TABLE seating_chart_2 
ADD COLUMN IF NOT EXISTS x INTEGER DEFAULT 0, 
ADD COLUMN IF NOT EXISTS y INTEGER DEFAULT 0;
