CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,  -- This ensures numeric auto-incrementing IDs
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- ... other fields
); 