-- Migration 004: Tracking and Radius Fields for Prompt 2

-- 1. Add tracking and status fields to professionals table
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_busy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add tracking and status timestamps to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS journey_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS estimated_arrival_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_distance_km NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS professional_location GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS last_location_update_at TIMESTAMP WITH TIME ZONE;

-- 3. Create spatial indexes for fast 10 KM distance lookups
CREATE INDEX IF NOT EXISTS idx_professionals_location_gist ON professionals USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_location_gist ON bookings USING GIST (customer_location);
