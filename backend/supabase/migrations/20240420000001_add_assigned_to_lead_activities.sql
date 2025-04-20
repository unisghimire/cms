-- Add assigned_to column to lead_activities table
ALTER TABLE lead_activities
ADD COLUMN assigned_to uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX lead_activities_assigned_to_idx ON lead_activities(assigned_to);

-- Update RLS policies if needed
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities they are assigned to
CREATE POLICY "Users can view assigned activities"
    ON lead_activities
    FOR SELECT
    USING (
        assigned_to = auth.uid() OR
        performed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            AND leads.assigned_to = auth.uid()
        )
    );

-- Users can update activities they are assigned to
CREATE POLICY "Users can update assigned activities"
    ON lead_activities
    FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        performed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            AND leads.assigned_to = auth.uid()
        )
    ); 