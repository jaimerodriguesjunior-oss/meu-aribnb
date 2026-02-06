-- Create a new bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add image_url column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Set up RLS for the bucket
-- Allow public read access to property images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/delete their images (simplified for now, ideally check organization)
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
