-- Add new columns to lead_activities table
ALTER TABLE lead_activities
ADD COLUMN follow_up_channel text,
ADD COLUMN outcome_status text,
ADD COLUMN reminder_time time,
ADD COLUMN reminder_before integer,
ADD COLUMN assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN internal_notes text,
ADD COLUMN notify_lead boolean DEFAULT false,
ADD COLUMN notification_message text,
ADD COLUMN follow_up_result text;

-- Create indexes for better query performance
CREATE INDEX lead_activities_follow_up_channel_idx ON lead_activities(follow_up_channel);
CREATE INDEX lead_activities_outcome_status_idx ON lead_activities(outcome_status);
CREATE INDEX lead_activities_assigned_to_idx ON lead_activities(assigned_to);
CREATE INDEX lead_activities_follow_up_result_idx ON lead_activities(follow_up_result); 