-- Add Google Maps URL field to cemetery_maps for storing live map links
ALTER TABLE cemetery_maps
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
