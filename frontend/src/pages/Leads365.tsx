import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DocumentIcon,
  Assignment as KYCIcon,
  EventNote as FollowupIcon,
  SwapHoriz as TransferIcon,
  Receipt as InvoiceIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/layout/Layout';

interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  meeting_date: string | null;
  meeting_duration: string | null;
  meeting_notes: string | null;
  follow_up_date: string | null;
  follow_up_notes: string;
  documents_collected: string[] | null;
  documents_pending: string[] | null;
  performed_by: string;
  created_at: string;
}

interface Document {
  id: string;
  lead_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  document_size: number;
  document_type_mime: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  lead_id: string;
  amount: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  invoice_number: string;
  discount_percentage: string;
}

interface VisaApplication {
  id: string;
  lead_id: string;
  application_number: string;
  visa_type: string;
  target_country: string;
  application_status: string;
  submission_date: string;
  processing_start_date: string | null;
  expected_decision_date: string | null;
  decision_date: string | null;
  course_details: string | null;
  institution_details: string | null;
  financial_details: string | null;
  application_fee: string;
  service_fee: string;
  payment_status: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  current_country: string;
  email: string;
  phone: string;
  alternate_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  education_level: string;
  current_education: string | null;
  institution_name: string | null;
  graduation_year: string | null;
  current_occupation: string | null;
  years_of_experience: string | null;
  current_employer: string | null;
  visa_type: string;
  target_country: string;
  target_course: string | null;
  target_institution: string | null;
  target_intake: string | null;
  status: string;
  source: string;
  source_details: string | null;
  budget_range: string | null;
  funding_source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  documents: Document[];
  activities: LeadActivity[];
  invoices: Invoice[];
  visa_applications: VisaApplication[];
}

// Add custom hook for handling resize observations
const useResizeObserver = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const observedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Cleanup function to handle errors
    const handleError = (event: ErrorEvent) => {
      if (event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
          event.message === 'ResizeObserver loop limit exceeded') {
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('error', handleError);
    
    // Create ResizeObserver instance
    resizeObserver.current = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        
        const entry = entries[0];
        if (entry.contentRect) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
    });

    return () => {
      window.removeEventListener('error', handleError);
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  const observe = useCallback((element: HTMLElement | null) => {
    if (observedElement.current && resizeObserver.current) {
      resizeObserver.current.unobserve(observedElement.current);
    }

    if (element && resizeObserver.current) {
      resizeObserver.current.observe(element);
      observedElement.current = element;
    }
  }, []);

  return { observe, size };
};

const Leads365: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Add refs for tables
  const documentsTableRef = useRef<HTMLDivElement>(null);
  const activitiesTableRef = useRef<HTMLDivElement>(null);
  const invoicesTableRef = useRef<HTMLDivElement>(null);
  const visaTableRef = useRef<HTMLDivElement>(null);

  // Use the custom hook
  const { observe } = useResizeObserver();

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup state
      setSelectedLead(null);
      setActiveTab(0);
      setError(null);
      setSearchQuery('');
      setLoading(false);

      // Cleanup any existing ResizeObserver
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const existingObserver = (table as any)._resizeObserver;
        if (existingObserver) {
          existingObserver.disconnect();
          delete (table as any)._resizeObserver;
        }
      });
    };
  }, []);

  // Update useEffect for table observations
  useEffect(() => {
    const tables = [
      documentsTableRef.current,
      activitiesTableRef.current,
      invoicesTableRef.current,
      visaTableRef.current
    ];

    tables.forEach(table => {
      if (table) {
        observe(table);
      }
    });

    return () => {
      tables.forEach(table => {
        if (table) {
          observe(null);
        }
      });
    };
  }, [observe, activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          documents(*),
          lead_activities(*),
          invoices(*),
          visa_applications(*)
        `)
        .or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedLead({
          ...data,
          activities: data.lead_activities || [],
        });
      } else {
        setError('No lead found with the given search criteria');
      }
    } catch (error) {
      console.error('Error searching lead:', error);
      setError('Error searching for lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Memoize the tab change handler
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    try {
      setActiveTab(newValue);
    } catch (error) {
      console.error('Error changing tab:', error);
    }
  }, []);

  const renderSearchSection = () => (
    <Card 
      sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #001f3f 0%, #004d40 100%)',
        color: 'white',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 20,
      }}
    >
      <CardContent sx={{ 
        position: 'relative',
        zIndex: 21,
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2,
          background: 'linear-gradient(45deg, #00bfa5 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          Search Lead Details
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 22 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by email, name, or phone number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1,
                  position: 'relative',
                  zIndex: 23,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00bfa5',
                  },
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  cursor: 'text',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #00bfa5 30%, #21CBF3 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00a896 30%, #1ba9d0 90%)',
                },
                cursor: 'pointer',
                position: 'relative',
                zIndex: 23,
                boxShadow: '0 4px 20px rgba(0, 191, 165, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease-in-out',
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
        {error && (
          <Alert severity="error" sx={{ mt: 2, position: 'relative', zIndex: 23 }}>
            {error}
          </Alert>
        )}
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </Card>
  );

  const renderLeadInfo = () => {
    if (!selectedLead) return null;

    return (
      <Card sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: theme.palette.primary.main,
              boxShadow: '0 2px 10px rgba(33, 150, 243, 0.3)',
            }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>{`${selectedLead.first_name} ${selectedLead.last_name}`}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  icon={<EmailIcon />}
                  label={selectedLead.email}
                  size="small"
                  variant="outlined"
                  sx={{ color: theme.palette.text.primary }}
                />
                <Chip
                  icon={<PhoneIcon />}
                  label={selectedLead.phone}
                  size="small"
                  variant="outlined"
                  sx={{ color: theme.palette.text.primary }}
                />
                <Chip
                  icon={<InfoIcon />}
                  label={selectedLead.status.replace(/_/g, ' ').toUpperCase()}
                  size="small"
                  color="primary"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={`Visa Type: ${selectedLead.visa_type.replace(/_/g, ' ').toUpperCase()}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Target: ${selectedLead.target_country.replace(/_/g, ' ').toUpperCase()}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Education: ${selectedLead.education_level.toUpperCase()}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Address</Typography>
              <Typography color="textPrimary">
                {selectedLead.address_line1}
                {selectedLead.address_line2 && `, ${selectedLead.address_line2}`}
                {`, ${selectedLead.city}, ${selectedLead.state}`}
                {`, ${selectedLead.postal_code}, ${selectedLead.country}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Additional Info</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Source: ${selectedLead.source.replace(/_/g, ' ').toUpperCase()}`}
                  size="small"
                  variant="outlined"
                  sx={{ color: theme.palette.text.primary }}
                />
                {selectedLead.source_details && (
                  <Chip
                    label={selectedLead.source_details}
                    size="small"
                    variant="outlined"
                    sx={{ color: theme.palette.text.primary }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Update renderTable function
  const renderTable = (children: React.ReactNode, ref: React.RefObject<HTMLDivElement>) => (
    <Box
      ref={ref}
      sx={{ 
        width: '100%',
        overflow: 'auto',
        '& table': {
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        '& th': {
          position: 'sticky',
          top: 0,
          background: theme.palette.background.paper,
          zIndex: 1,
        }
      }}
    >
      {children}
    </Box>
  );

  const renderLeadDetails = () => {
    if (!selectedLead) return null;

    return (
      <Card sx={{ 
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 400px)',
        position: 'relative',
        zIndex: 0,
      }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          position: 'relative',
          zIndex: 10,
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                padding: '12px 16px',
                color: theme.palette.text.primary,
                position: 'relative',
                zIndex: 11,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <Tab icon={<DocumentIcon />} label="Documents" />
            <Tab icon={<FollowupIcon />} label="Activities" />
            <Tab icon={<InvoiceIcon />} label="Invoice" />
            <Tab icon={<DocumentIcon />} label="Visa Applications" />
          </Tabs>
        </Box>

        <Box sx={{ 
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}>
          <Box sx={{
            height: '100%',
            overflow: 'auto',
            p: 2,
          }}>
            {activeTab === 0 && renderTable(
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Document Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLead.documents.map((doc, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip
                          label={doc.document_type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doc.document_name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(doc.document_size / 1024).toFixed(2)} KB
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.is_verified ? 'Verified' : 'Pending'}
                          size="small"
                          color={doc.is_verified ? 'success' : 'warning'}
                          icon={doc.is_verified ? <CheckCircleIcon /> : <PendingIcon />}
                        />
                        {doc.verified_at && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(doc.verified_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {doc.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Document">
                          <IconButton
                            size="small"
                            onClick={() => window.open(doc.document_url, '_blank')}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Document">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.document_url;
                              link.download = doc.document_name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>,
              documentsTableRef
            )}

            {activeTab === 1 && renderTable(
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Meeting Details</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell>Documents</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLead.activities.map((activity, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(activity.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.activity_type.toUpperCase()}
                          size="small"
                          color={
                            activity.activity_type.toLowerCase() === 'transfer' ? 'warning' :
                            activity.activity_type.toLowerCase() === 'meeting' ? 'success' :
                            activity.activity_type.toLowerCase() === 'call' ? 'info' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{activity.description}</Typography>
                      </TableCell>
                      <TableCell>
                        {activity.meeting_date ? (
                          <Box>
                            <Typography variant="body2">
                              Date: {new Date(activity.meeting_date).toLocaleDateString()}
                            </Typography>
                            {activity.meeting_duration && (
                              <Typography variant="body2" color="textSecondary">
                                Duration: {activity.meeting_duration}
                              </Typography>
                            )}
                            {activity.meeting_notes && (
                              <Typography variant="body2" color="textSecondary">
                                Notes: {activity.meeting_notes}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.follow_up_date ? (
                          <Box>
                            <Typography variant="body2">
                              Date: {new Date(activity.follow_up_date).toLocaleDateString()}
                            </Typography>
                            {activity.follow_up_notes && (
                              <Typography variant="body2" color="textSecondary">
                                Notes: {activity.follow_up_notes}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {(Array.isArray(activity.documents_collected) || Array.isArray(activity.documents_pending)) ? (
                          <Box>
                            {Array.isArray(activity.documents_collected) && activity.documents_collected.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {activity.documents_collected.map((doc, idx) => (
                                  <Chip
                                    key={idx}
                                    label={doc}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            )}
                            {Array.isArray(activity.documents_pending) && activity.documents_pending.length > 0 && (
                              <Stack direction="row" spacing={1}>
                                {activity.documents_pending.map((doc, idx) => (
                                  <Chip
                                    key={idx}
                                    label={doc}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            )}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>,
              activitiesTableRef
            )}

            {activeTab === 2 && renderTable(
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLead.invoices.map((invoice, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2">{invoice.invoice_number}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          ₹ {parseFloat(invoice.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Typography>
                        {parseFloat(invoice.discount_percentage) > 0 && (
                          <Typography variant="caption" color="textSecondary">
                            Final: ₹ {(
                              parseFloat(invoice.amount) * 
                              (1 - parseFloat(invoice.discount_percentage) / 100)
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {parseFloat(invoice.discount_percentage) > 0 ? (
                          <Chip
                            label={`${invoice.discount_percentage}%`}
                            size="small"
                            color="info"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </Typography>
                        {new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && (
                          <Typography variant="caption" color="error">
                            Overdue
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.toUpperCase()}
                          size="small"
                          color={invoice.status.toLowerCase() === 'paid' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedLead.invoices.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="right">
                        <Typography variant="subtitle2">Total Amount:</Typography>
                      </TableCell>
                      <TableCell colSpan={4}>
                        <Typography variant="subtitle2">
                          ₹ {selectedLead.invoices.reduce((total, invoice) => 
                            total + parseFloat(invoice.amount) * (1 - parseFloat(invoice.discount_percentage) / 100), 
                            0
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Original: ₹ {selectedLead.invoices.reduce((total, invoice) => 
                            total + parseFloat(invoice.amount), 
                            0
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })})
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>,
              invoicesTableRef
            )}

            {activeTab === 3 && renderTable(
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>Visa Details</TableCell>
                    <TableCell>Status & Dates</TableCell>
                    <TableCell>Fees</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLead.visa_applications.map((app, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {app.application_number}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Created: {new Date(app.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={1}>
                          <Chip
                            label={app.visa_type.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={app.target_country.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={app.application_status.toUpperCase()}
                            size="small"
                            color={
                              app.application_status === 'approved' ? 'success' :
                              app.application_status === 'rejected' ? 'error' :
                              app.application_status === 'processing' ? 'info' :
                              'warning'
                            }
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Submitted: {new Date(app.submission_date).toLocaleDateString()}
                          </Typography>
                          {app.processing_start_date && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Processing: {new Date(app.processing_start_date).toLocaleDateString()}
                            </Typography>
                          )}
                          {app.expected_decision_date && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Expected Decision: {new Date(app.expected_decision_date).toLocaleDateString()}
                            </Typography>
                          )}
                          {app.decision_date && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Decision: {new Date(app.decision_date).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            Application Fee: ₹ {parseFloat(app.application_fee).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="body2">
                            Service Fee: ₹ {parseFloat(app.service_fee).toLocaleString('en-IN')}
                          </Typography>
                          <Chip
                            label={app.payment_status.toUpperCase()}
                            size="small"
                            color={
                              app.payment_status === 'paid' ? 'success' :
                              app.payment_status === 'partial' ? 'warning' :
                              'error'
                            }
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {app.notes || '-'}
                        </Typography>
                        {(app.course_details || app.institution_details || app.financial_details) && (
                          <Box sx={{ mt: 1 }}>
                            {app.course_details && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                Course: {app.course_details}
                              </Typography>
                            )}
                            {app.institution_details && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                Institution: {app.institution_details}
                              </Typography>
                            )}
                            {app.financial_details && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                Financial: {app.financial_details}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>,
              visaTableRef
            )}
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Layout>
      <Box sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.paper,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        <Typography variant="h4" sx={{ 
          mb: 3,
          color: theme.palette.text.primary,
          fontWeight: 600,
        }}>
          Leads 365
        </Typography>
        {renderSearchSection()}
        {renderLeadInfo()}
        {renderLeadDetails()}
      </Box>
    </Layout>
  );
};

export default React.memo(Leads365); 