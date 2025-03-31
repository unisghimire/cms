import React, { useState, useEffect } from 'react';
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
  LinearProgress,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  ViewModule as CardViewIcon,
  TableChart as TableViewIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';

// Styled components
const ApplicationCard = styled(Paper)(({ theme }) => ({
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

interface Application {
  id: string;
  lead_id: string;
  application_number: string;
  visa_type: string;
  target_country: string;
  application_status: string;
  submission_date: string | null;
  processing_start_date: string | null;
  expected_decision_date: string | null;
  decision_date: string | null;
  course_details: any;
  institution_details: any;
  financial_details: any;
  application_fee: number | null;
  service_fee: number | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: {
    first_name: string;
    last_name: string;
  };
}

const Applications: React.FC = () => {
  const theme = useTheme();
  const { leads } = useLeads();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [formData, setFormData] = useState({
    lead_id: '',
    visa_type: '',
    target_country: '',
    application_status: 'draft',
    submission_date: '',
    processing_start_date: '',
    expected_decision_date: '',
    decision_date: '',
    application_fee: '',
    service_fee: '',
    payment_status: 'pending',
    notes: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visa_applications')
        .select(`
          *,
          leads (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedApplication(null);
    setFormData({
      lead_id: '',
      visa_type: '',
      target_country: '',
      application_status: 'draft',
      submission_date: '',
      processing_start_date: '',
      expected_decision_date: '',
      decision_date: '',
      application_fee: '',
      service_fee: '',
      payment_status: 'pending',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (application: Application) => {
    setSelectedApplication(application);
    setFormData({
      lead_id: application.lead_id,
      visa_type: application.visa_type,
      target_country: application.target_country,
      application_status: application.application_status,
      submission_date: application.submission_date || '',
      processing_start_date: application.processing_start_date || '',
      expected_decision_date: application.expected_decision_date || '',
      decision_date: application.decision_date || '',
      application_fee: application.application_fee?.toString() || '',
      service_fee: application.service_fee?.toString() || '',
      payment_status: application.payment_status,
      notes: application.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (application: Application) => {
    try {
      const { error } = await supabase
        .from('visa_applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;
      fetchApplications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateApplicationNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `APP${year}${month}${random}`;
  };

  const handleSubmit = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be authenticated to manage applications');
      }

      // Convert empty date strings to null
      const applicationData = {
        ...formData,
        created_by: user.id,
        application_fee: formData.application_fee ? parseFloat(formData.application_fee) : null,
        service_fee: formData.service_fee ? parseFloat(formData.service_fee) : null,
        submission_date: formData.submission_date || null,
        processing_start_date: formData.processing_start_date || null,
        expected_decision_date: formData.expected_decision_date || null,
        decision_date: formData.decision_date || null,
      };

      if (selectedApplication) {
        const { error } = await supabase
          .from('visa_applications')
          .update(applicationData)
          .eq('id', selectedApplication.id);

        if (error) throw error;
      } else {
        // Generate a unique application number for new applications
        const applicationNumber = generateApplicationNumber();
        
        const { error } = await supabase
          .from('visa_applications')
          .insert([{
            ...applicationData,
            application_number: applicationNumber
          }]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchApplications();
    } catch (err: any) {
      console.error('Error saving application:', err);
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'processing':
        return 'warning';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ 
      borderRadius: '16px',
      background: alpha(theme.palette.background.paper, 0.95),
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Application #</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Lead</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Visa Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Target Country</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Submission Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Payment Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <TableRow 
              key={application.id}
              hover
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {application.application_number}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {application.leads ? 
                    `${application.leads.first_name} ${application.leads.last_name}` : 
                    'Unknown Lead'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{application.visa_type}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{application.target_country}</Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={application.application_status}
                  color={getStatusColor(application.application_status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {application.submission_date ? 
                    new Date(application.submission_date).toLocaleDateString() : 
                    'Not submitted'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={application.payment_status}
                  size="small"
                  color={application.payment_status === 'paid' ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1
                }}>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => handleEdit(application)}
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
                      onClick={() => handleDelete(application)}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
            Visa Applications
          </Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1200
          }}>
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
                cursor: 'pointer',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                },
              }}
            >
              New Application
            </Button>
          </Box>
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
          ) : applications.length === 0 ? (
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
                No applications found
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                Click the New Application button to create your first application
              </Typography>
            </Box>
          ) : viewMode === 'card' ? (
            <Grid container spacing={3}>
              {applications.map((application) => (
                <Grid item xs={12} sm={6} md={4} key={application.id}>
                  <ApplicationCard>
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
                          {application.leads?.first_name?.[0]}{application.leads?.last_name?.[0]}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: theme.palette.text.primary,
                          fontWeight: 600
                        }}>
                          {application.leads ? 
                            `${application.leads.first_name} ${application.leads.last_name}` : 
                            'Unknown Lead'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Application #{application.application_number}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Application Info Section */}
                    <Box sx={{ flex: 1 }}>
                      <Stack spacing={2}>
                        {/* Status */}
                        <Box>
                          <Chip 
                            label={application.application_status}
                            color={getStatusColor(application.application_status)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>

                        {/* Visa Details */}
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Visa Details
                          </Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              Type: {application.visa_type}
                            </Typography>
                            <Typography variant="body2">
                              Country: {application.target_country}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Important Dates */}
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Important Dates
                          </Typography>
                          <Stack spacing={1}>
                            {application.submission_date && (
                              <Typography variant="body2">
                                Submitted: {new Date(application.submission_date).toLocaleDateString()}
                              </Typography>
                            )}
                            {application.expected_decision_date && (
                              <Typography variant="body2">
                                Expected Decision: {new Date(application.expected_decision_date).toLocaleDateString()}
                              </Typography>
                            )}
                            {application.decision_date && (
                              <Typography variant="body2">
                                Decision: {new Date(application.decision_date).toLocaleDateString()}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        {/* Fees */}
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Fees
                          </Typography>
                          <Stack spacing={1}>
                            {application.application_fee && (
                              <Typography variant="body2">
                                Application Fee: ${application.application_fee}
                              </Typography>
                            )}
                            {application.service_fee && (
                              <Typography variant="body2">
                                Service Fee: ${application.service_fee}
                              </Typography>
                            )}
                            <Chip 
                              label={application.payment_status}
                              size="small"
                              color={application.payment_status === 'paid' ? 'success' : 'warning'}
                            />
                          </Stack>
                        </Box>
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
                          onClick={() => handleEdit(application)}
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
                          onClick={() => handleDelete(application)}
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
                  </ApplicationCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            renderTableView()
          )}
        </Box>

        {/* Application Dialog */}
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
            {selectedApplication ? 'Edit Application' : 'New Application'}
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

                {/* Visa Type */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Visa Type</InputLabel>
                    <Select
                      value={formData.visa_type}
                      onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                      label="Visa Type"
                    >
                      <MenuItem value="student">Student Visa</MenuItem>
                      <MenuItem value="work">Work Visa</MenuItem>
                      <MenuItem value="business">Business Visa</MenuItem>
                      <MenuItem value="tourist">Tourist Visa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Target Country */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Target Country</InputLabel>
                    <Select
                      value={formData.target_country}
                      onChange={(e) => setFormData({ ...formData, target_country: e.target.value })}
                      label="Target Country"
                    >
                      <MenuItem value="canada">Canada</MenuItem>
                      <MenuItem value="australia">Australia</MenuItem>
                      <MenuItem value="uk">United Kingdom</MenuItem>
                      <MenuItem value="usa">United States</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Application Status */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.application_status}
                      onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Payment Status */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={formData.payment_status}
                      onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                      label="Payment Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Important Dates */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Submission Date"
                    type="date"
                    value={formData.submission_date}
                    onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expected Decision Date"
                    type="date"
                    value={formData.expected_decision_date}
                    onChange={(e) => setFormData({ ...formData, expected_decision_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Processing Start Date"
                    type="date"
                    value={formData.processing_start_date}
                    onChange={(e) => setFormData({ ...formData, processing_start_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Decision Date"
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) => setFormData({ ...formData, decision_date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fees */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Application Fee"
                    type="number"
                    value={formData.application_fee}
                    onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Service Fee"
                    type="number"
                    value={formData.service_fee}
                    onChange={(e) => setFormData({ ...formData, service_fee: e.target.value })}
                    InputProps={{
                      startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
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
              disabled={!formData.lead_id || !formData.visa_type || !formData.target_country}
            >
              {selectedApplication ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Applications; 