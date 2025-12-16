CREATE TABLE seating_chart (
  table_number INTEGER NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (table_number, guest_name)
);
