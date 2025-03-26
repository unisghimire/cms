import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, LeadStatus } from '../types/lead';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads from Supabase
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new lead
  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();

      if (error) throw error;
      setLeads(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Update a lead
  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Delete a lead
  const deleteLead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Update lead status
  const updateLeadStatus = useCallback(async (id: string, status: LeadStatus) => {
    return updateLead(id, { status });
  }, [updateLead]);

  // Search leads
  const searchLeads = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    fetchLeads,
    searchLeads,
  };
}; 