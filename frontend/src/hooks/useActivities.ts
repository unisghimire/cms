import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, ActivityType } from '../types/lead';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (leadId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addActivity = useCallback(async (leadId: string, activity: Omit<Activity, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Adding activity to database:', activity); // Debug log

      // Validate required fields
      if (!activity.activity_type || !activity.description) {
        throw new Error('Activity type and description are required');
      }

      const { data, error } = await supabase
        .from('lead_activities')
        .insert([{
          ...activity,
          lead_id: leadId // Ensure lead_id is set
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      console.log('Activity added successfully:', data); // Debug log
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error in addActivity:', err); // Debug log
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
  };
}; 