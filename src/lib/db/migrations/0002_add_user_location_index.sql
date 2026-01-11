
CREATE INDEX IF NOT EXISTS user_location_idx
ON "user"
USING GIST (location);