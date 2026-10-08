-- MAKU Platform — PostgreSQL initialisation
-- Runs once on first container start

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fast full-text search on member names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
