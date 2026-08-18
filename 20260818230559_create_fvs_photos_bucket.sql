/*
# Create fvs-photos storage bucket

Creates a public storage bucket for FVS inspection photos.
*/
INSERT INTO storage.buckets (id, name, public)
VALUES ('fvs-photos', 'fvs-photos', true)
ON CONFLICT (id) DO NOTHING;
