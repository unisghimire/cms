import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  ViewModule as CardViewIcon,
  TableChart as TableViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';

// Styled components
const FollowupCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.95),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

interface Followup {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  meeting_date: string | null;
  meeting_duration: string | null;
  meeting_notes: string | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  documents_collected: string[];
  documents_pending: string[];
  performed_by: string;
  created_at: string;
  leads?: {
    first_name: string;
    last_name: string;
  };
}

const Followups: React.FC = () => {
  const theme = useTheme();
  const { leads } = useLeads();
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    lead_id: '',
    activity_type: '',
    description: '',
    meeting_date: '',
    meeting_duration: '',
    meeting_notes: '',
    follow_up_date: '',
    follow_up_notes: '',
    documents_collected: [] as string[],
    documents_pending: [] as string[],
  });

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_activities')
        .select(`
          *,
          leads (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowups(data || []);
    } catch (err: any) {
      console.error('Error fetching followups:', err);
      setError(err.message);
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFollowup(null);
    setFormData({
      lead_id: '',
      activity_type: '',
      description: '',
      meeting_date: '',
      meeting_duration: '',
      meeting_notes: '',
      follow_up_date: '',
      follow_up_notes: '',
      documents_collected: [],
      documents_pending: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (followup: Followup) => {
    setSelectedFollowup(followup);
    setFormData({
      lead_id: followup.lead_id,
      activity_type: followup.activity_type,
      description: followup.description,
      meeting_date: followup.meeting_date || '',
      meeting_duration: followup.meeting_duration || '',
      meeting_notes: followup.meeting_notes || '',
      follow_up_date: followup.follow_up_date || '',
      follow_up_notes: followup.follow_up_notes || '',
      documents_collected: followup.documents_collected || [],
      documents_pending: followup.documents_pending || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (followup: Followup) => {
    try {
      const { error } = await supabase
        .from('lead_activities')
        .delete()
        .eq('id', followup.id);

      if (error) throw error;
      fetchFollowups();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be authenticated to manage followups');
      }

      const followupData = {
        ...formData,
        performed_by: user.id,
        meeting_date: formData.meeting_date || null,
        meeting_duration: formData.meeting_duration || null,
        follow_up_date: formData.follow_up_date || null,
      };

      if (selectedFollowup) {
        const { error } = await supabase
          .from('lead_activities')
          .update(followupData)
          .eq('id', selectedFollowup.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lead_activities')
          .insert([followupData]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchFollowups();
    } catch (err: any) {
      console.error('Error saving followup:', err);
      setError(err.message);
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'primary';
      case 'call':
        return 'info';
      case 'email':
        return 'success';
      case 'document':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredFollowups = useMemo(() => {
    return followups.filter(followup => {
      const matchesSearch = searchQuery === '' || 
        (followup.leads?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         followup.leads?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         followup.description?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = filterType === 'all' || 
        followup.activity_type.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [followups, searchQuery, filterType]);

  const renderCardView = (followups: Followup[]) => {
    if (followups.length === 0) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          p: 4,
          borderRadius: '16px',
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
        }}>
          <DescriptionIcon sx={{ 
            fontSize: 64, 
            color: alpha(theme.palette.text.secondary, 0.5),
            mb: 2
          }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            No followups found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Click the New Followup button to create your first followup
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {followups.map((followup) => (
          <Grid item xs={12} sm={6} md={4} key={followup.id}>
            <FollowupCard>
              {/* Lead Info Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Typography sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  }}>
                    {followup.leads?.first_name?.[0]}{followup.leads?.last_name?.[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: theme.palette.text.primary,
                    fontWeight: 600
                  }}>
                    {followup.leads ? 
                      `${followup.leads.first_name} ${followup.leads.last_name}` : 
                      'Unknown Lead'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {new Date(followup.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Followup Info Section */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  {/* Activity Type */}
                  <Box>
                    <Chip 
                      label={followup.activity_type}
                      color={getActivityTypeColor(followup.activity_type)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  {/* Description */}
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {followup.description}
                    </Typography>
                  </Box>

                  {/* Meeting Details */}
                  {followup.meeting_date && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Meeting Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Date: {new Date(followup.meeting_date).toLocaleDateString()}
                        </Typography>
                        {followup.meeting_duration && (
                          <Typography variant="body2">
                            Duration: {followup.meeting_duration}
                          </Typography>
                        )}
                        {followup.meeting_notes && (
                          <Typography variant="body2">
                            Notes: {followup.meeting_notes}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Follow-up Details */}
                  {followup.follow_up_date && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Follow-up Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Date: {new Date(followup.follow_up_date).toLocaleDateString()}
                        </Typography>
                        {followup.follow_up_notes && (
                          <Typography variant="body2">
                            Notes: {followup.follow_up_notes}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Document Status */}
                  {(followup.documents_collected?.length > 0 || followup.documents_pending?.length > 0) && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Document Status
                      </Typography>
                      <Stack spacing={1}>
                        {followup.documents_collected?.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="success.main">
                              Collected:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {followup.documents_collected.map((doc, index) => (
                                <Chip
                                  key={index}
                                  label={doc}
                                  size="small"
                                  color="success"
                                  icon={<CheckCircleIcon />}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                        {followup.documents_pending?.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="warning.main">
                              Pending:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {followup.documents_pending.map((doc, index) => (
                                <Chip
                                  key={index}
                                  label={doc}
                                  size="small"
                                  color="warning"
                                  icon={<PendingIcon />}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Actions Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 1,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Tooltip title="Edit">
                  <IconButton 
                    size="small"
                    onClick={() => handleEdit(followup)}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small"
                    onClick={() => handleDelete(followup)}
                    sx={{ 
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </FollowupCard>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTableView = (followups: Followup[]) => {
    if (followups.length === 0) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          p: 4,
          borderRadius: '16px',
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
        }}>
          <DescriptionIcon sx={{ 
            fontSize: 64, 
            color: alpha(theme.palette.text.secondary, 0.5),
            mb: 2
          }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            No followups found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Click the New Followup button to create your first followup
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ 
        borderRadius: '16px',
        background: alpha(theme.palette.background.paper, 0.95),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lead</TableCell>
              <TableCell>Activity Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Meeting Date</TableCell>
              <TableCell>Follow-up Date</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {followups.map((followup) => (
              <TableRow key={followup.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {followup.leads?.first_name?.[0]}{followup.leads?.last_name?.[0]}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {followup.leads ? 
                        `${followup.leads.first_name} ${followup.leads.last_name}` : 
                        'Unknown Lead'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={followup.activity_type}
                    color={getActivityTypeColor(followup.activity_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ 
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {followup.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  {followup.meeting_date ? (
                    <Typography variant="body2">
                      {new Date(followup.meeting_date).toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {followup.follow_up_date ? (
                    <Typography variant="body2">
                      {new Date(followup.follow_up_date).toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {followup.documents_collected?.map((doc, index) => (
                      <Chip
                        key={index}
                        label={doc}
                        size="small"
                        color="success"
                        icon={<CheckCircleIcon />}
                      />
                    ))}
                    {followup.documents_pending?.map((doc, index) => (
                      <Chip
                        key={index}
                        label={doc}
                        size="small"
                        color="warning"
                        icon={<PendingIcon />}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small"
                        onClick={() => handleEdit(followup)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(followup)}
                        sx={{ 
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
            position: 'relative',
            zIndex: 1200,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Lead Followups
          </Typography>
          <Box 
            sx={{ 
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              position: 'relative',
              zIndex: 1200,
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1200 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setViewMode(newValue);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.1),
                    },
                    '&:not(.Mui-selected)': {
                      color: theme.palette.text.secondary,
                    },
                  },
                  '& .MuiToggleButtonGroup-grouped': {
                    '&:not(:first-of-type)': {
                      borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    },
                  },
                }}
              >
                <ToggleButton value="card" aria-label="card view">
                  <CardViewIcon />
                </ToggleButton>
                <ToggleButton value="table" aria-label="table view">
                  <TableViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1200 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  borderRadius: '8px',
                  padding: '8px 16px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  minWidth: '160px',
                  height: '40px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  },
                }}
              >
                New Followup
              </Button>
            </Box>
          </Box>
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
            placeholder="Search followups..."
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
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter by Type"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="call">Call</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="document">Document</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Content */}
        <Box 
          component="section"
          sx={{ 
            flex: 1,
            position: 'relative',
            zIndex: 1
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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '200px'
            }}>
              <CircularProgress />
            </Box>
          ) : (
            viewMode === 'card' ? renderCardView(filteredFollowups) : renderTableView(filteredFollowups)
          )}
        </Box>

        {/* Followup Dialog */}
        <Dialog 
          open={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle>
            {selectedFollowup ? 'Edit Followup' : 'New Followup'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* Lead Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Lead</InputLabel>
                    <Select
                      value={formData.lead_id}
                      onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                      label="Select Lead"
                    >
                      {leads.map((lead) => (
                        <MenuItem key={lead.id} value={lead.id}>
                          {lead.first_name} {lead.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Activity Type */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Activity Type</InputLabel>
                    <Select
                      value={formData.activity_type}
                      onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                      label="Activity Type"
                    >
                      <MenuItem value="meeting">Meeting</MenuItem>
                      <MenuItem value="call">Call</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="document">Document</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* Meeting Details */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Meeting Date"
                    type="date"
                    value={formData.meeting_date}
                    onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Meeting Duration"
                    value={formData.meeting_duration}
                    onChange={(e) => setFormData({ ...formData, meeting_duration: e.target.value })}
                    placeholder="e.g., 1 hour"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meeting Notes"
                    multiline
                    rows={3}
                    value={formData.meeting_notes}
                    onChange={(e) => setFormData({ ...formData, meeting_notes: e.target.value })}
                  />
                </Grid>

                {/* Follow-up Details */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Follow-up Date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Follow-up Notes"
                    multiline
                    rows={3}
                    value={formData.follow_up_notes}
                    onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                  />
                </Grid>

                {/* Document Status */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Document Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Documents Collected"
                        multiline
                        rows={3}
                        value={formData.documents_collected.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          documents_collected: e.target.value.split(',').map(doc => doc.trim()).filter(Boolean)
                        })}
                        placeholder="Comma-separated list"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Documents Pending"
                        multiline
                        rows={3}
                        value={formData.documents_pending.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          documents_pending: e.target.value.split(',').map(doc => doc.trim()).filter(Boolean)
                        })}
                        placeholder="Comma-separated list"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.lead_id || !formData.activity_type || !formData.description}
            >
              {selectedFollowup ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Followups; 