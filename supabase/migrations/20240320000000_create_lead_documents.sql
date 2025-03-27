-- Create lead_documents table
CREATE TABLE lead_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for lead_documents
ALTER TABLE lead_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads' documents"
    ON lead_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND leads.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their own leads"
    ON lead_documents
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND leads.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update their own leads' documents"
    ON lead_documents
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND leads.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own leads' documents"
    ON lead_documents
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_documents.lead_id
            AND leads.created_by = auth.uid()
        )
    );

-- Create storage bucket for lead documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-documents', 'lead-documents', true);

-- Set up storage policies
CREATE POLICY "Users can upload documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'lead-documents'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their documents"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'lead-documents'
        AND owner = auth.uid()
    );

CREATE POLICY "Users can delete their documents"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'lead-documents'
        AND owner = auth.uid()
    );

CREATE POLICY "Anyone can view documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'lead-documents'
    ); 