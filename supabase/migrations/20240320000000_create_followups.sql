-- Create followups table
CREATE TABLE IF NOT EXISTS public.followups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT NOT NULL DEFAULT 'medium',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Add RLS policies
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

-- Policy for selecting followups
CREATE POLICY "Users can view their own followups"
    ON public.followups
    FOR SELECT
    USING (
        auth.uid() = created_by
    );

-- Policy for inserting followups
CREATE POLICY "Users can create followups"
    ON public.followups
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
    );

-- Policy for updating followups
CREATE POLICY "Users can update their own followups"
    ON public.followups
    FOR UPDATE
    USING (
        auth.uid() = created_by
    );

-- Policy for deleting followups
CREATE POLICY "Users can delete their own followups"
    ON public.followups
    FOR DELETE
    USING (
        auth.uid() = created_by
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_followups_updated_at
    BEFORE UPDATE ON public.followups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON public.followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_created_by ON public.followups(created_by);
CREATE INDEX IF NOT EXISTS idx_followups_status ON public.followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON public.followups(due_date); 