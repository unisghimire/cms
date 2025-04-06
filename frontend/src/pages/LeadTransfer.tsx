import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/layout/Layout';
import { Person as PersonIcon, TransferWithinAStation as TransferIcon, Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const LeadTransfer: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
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
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError('Failed to fetch users');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'all' || 
        lead.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [leads, searchQuery, filterStatus]);

  const handleTransfer = async () => {
    if (!selectedLead || !selectedUser) return;

    try {
      // Update lead assignment
      const { error: updateError } = await supabase
        .from('leads')
        .update({ assigned_to: selectedUser })
        .eq('id', selectedLead.id);

      if (updateError) throw updateError;

      // Log the transfer activity
      const { error: activityError } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: selectedLead.id,
          activity_type: 'transfer',
          description: `Lead transferred to ${users.find(u => u.id === selectedUser)?.full_name}`,
          follow_up_notes: transferNotes,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (activityError) throw activityError;

      // Refresh leads
      await fetchLeads();
      setIsDialogOpen(false);
      setSelectedLead(null);
      setSelectedUser('');
      setTransferNotes('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          backgroundColor: theme.palette.background.default,
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            gap: 2,
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Lead Transfer
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Box 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            position: 'relative',
            zIndex: 1200,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Content */}
        <Box
          component="section"
          sx={{
            flex: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <StyledTableRow key={lead.id}>
                      <TableCell>
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>
                        {users.find((u) => u.id === lead.assigned_to)?.full_name ||
                          'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Transfer Lead">
                          <IconButton
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDialogOpen(true);
                            }}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <TransferIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Transfer Dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Transfer Lead</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Lead"
                value={selectedLead ? `${selectedLead.first_name} ${selectedLead.last_name}` : ''}
                disabled
                fullWidth
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Transfer To</InputLabel>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Transfer To"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Transfer Notes"
                multiline
                rows={4}
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTransfer}
              variant="contained"
              disabled={!selectedUser}
            >
              Transfer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default LeadTransfer; 