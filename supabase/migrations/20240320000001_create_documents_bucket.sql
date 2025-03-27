-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their documents"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'documents'
        AND owner = auth.uid()
    );

CREATE POLICY "Users can delete their documents"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'documents'
        AND owner = auth.uid()
    );

CREATE POLICY "Anyone can view documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'documents'
    ); 