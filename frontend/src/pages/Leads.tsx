import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Alert,
  CircularProgress,
  Fade,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Badge,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Flight as FlightIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AddTask as AddTaskIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Lead, LeadStatus, VisaType, TargetCountry, EducationLevel, LeadSource, ActivityType } from '../types/lead';
import { Layout } from '../components/layout/Layout';
import { useLeads } from '../hooks/useLeads';
import { useActivities } from '../hooks/useActivities';
import { supabase } from '../lib/supabase';

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.3),
    '& .MuiCardContent-root': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  padding: '4px 12px',
  height: '28px',
  fontWeight: 500,
  '& .MuiChip-label': {
    padding: '0 8px',
    fontSize: '0.75rem',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    padding: '2px',
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  },
  '&:hover': {
    transform: 'scale(1.1)',
    '&::after': {
      opacity: 1,
    },
  },
}));

const SearchPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '16px',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  zIndex: 5,
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    zIndex: 0,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    '&::before': {
      opacity: 1,
    },
    '& .MuiButton-startIcon': {
      transform: 'scale(1.1)',
    },
  },
  '& .MuiButton-startIcon': {
    transition: 'transform 0.3s ease-in-out',
  },
}));

const LeadInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  transition: 'all 0.3s ease-in-out',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(2),
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
    transition: 'transform 0.3s ease-in-out',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    }
  }
}));

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: '8px',
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
  },
}));

const DetailDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    maxWidth: '900px'
  }
}));

const DetailHeader = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: '#fff',
  padding: theme.spacing(3),
  '& .MuiTypography-root': {
    fontSize: '1.75rem',
    fontWeight: 600,
    letterSpacing: '-0.5px'
  }
}));

const InfoSection = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.95),
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    borderColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const ActivityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  background: alpha(theme.palette.background.paper, 0.95),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-2px)',
  }
}));

const ActivityIcon = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
}));

const Leads: React.FC = () => {
  const theme = useTheme();
  const {
    leads,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    searchLeads,
    fetchLeads,
  } = useLeads();
  const { activities, loading: activitiesLoading, addActivity, fetchActivities } = useActivities();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadMenuAnchorEl, setLeadMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    status: LeadStatus.New,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddActivityDialogOpen, setIsAddActivityDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
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
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle search with debounce
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const performSearch = async () => {
      if (!searchQuery) {
        if (isMounted) {
          await fetchLeads();
        }
        return;
      }

      setIsSearching(true);
      try {
        await searchLeads(searchQuery);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    timer = setTimeout(performSearch, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, searchLeads, fetchLeads]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleLeadMenuClick = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedLead(lead);
    setLeadMenuAnchorEl(event.currentTarget);
  };

  const handleLeadMenuClose = () => {
    setLeadMenuAnchorEl(null);
  };

  const handleMenuItemClick = (handler: () => void) => {
    return () => {
      handler();
      setLeadMenuAnchorEl(null);
    };
  };

  const handleAddLeadClick = () => {
    setIsAddLeadDialogOpen(true);
    setNewLead({ status: LeadStatus.New });
  };

  const handleAddLead = async () => {
    try {
      setFormError(null);
      await addLead(newLead as Omit<Lead, 'id' | 'created_at' | 'updated_at'>);
      setIsAddLeadDialogOpen(false);
      setNewLead({ status: LeadStatus.New });
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleEditLead = async () => {
    if (!selectedLead) return;
    try {
      setFormError(null);
      await updateLead(selectedLead.id, newLead as Partial<Lead>);
      setIsEditLeadDialogOpen(false);
      setSelectedLead(null);
      setNewLead({ status: LeadStatus.New });
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    try {
      await deleteLead(selectedLead.id);
      handleLeadMenuClose();
    } catch (err: any) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleStatusUpdate = async (status: LeadStatus) => {
    if (!selectedLead) return;
    try {
      await updateLeadStatus(selectedLead.id, status);
      handleLeadMenuClose();
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleEditClick = () => {
    if (selectedLead) {
      setNewLead(selectedLead);
      setIsEditLeadDialogOpen(true);
      handleLeadMenuClose();
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.New:
        return 'info';
      case LeadStatus.InitialContact:
        return 'warning';
      case LeadStatus.DocumentCollection:
        return 'secondary';
      case LeadStatus.AssessmentCompleted:
        return 'primary';
      case LeadStatus.VisaApplicationSubmitted:
        return 'success';
      case LeadStatus.VisaApproved:
        return 'success';
      case LeadStatus.VisaRejected:
        return 'error';
      case LeadStatus.VisaIssued:
        return 'success';
      case LeadStatus.Lost:
        return 'error';
      default:
        return 'default';
    }
  };

  const getVisaTypeIcon = (visaType: VisaType) => {
    switch (visaType) {
      case VisaType.Student:
        return <SchoolIcon />;
      case VisaType.Work:
        return <WorkIcon />;
      case VisaType.Business:
        return <BusinessIcon />;
      default:
        return <FlightIcon />;
    }
  };

  const handleAddActivity = () => {
    if (!selectedLead) {
      console.error('No lead selected for activity');
      return;
    }
    setIsAddActivityDialogOpen(true);
    setLeadMenuAnchorEl(null);
  };

  const handleActivitySubmit = async () => {
    console.log('handleActivitySubmit called'); // Debug log
    
    if (!selectedLead) {
      console.error('No lead selected');
      setFormError('No lead selected');
      return;
    }

    try {
      console.log('Getting user from Supabase'); // Debug log
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        throw new Error('User not authenticated');
      }

      const activityData = {
        lead_id: selectedLead.id,
        activity_type: newActivity.activity_type as ActivityType,
        description: newActivity.description,
        meeting_date: newActivity.meeting_date || undefined,
        meeting_duration: newActivity.meeting_duration || undefined,
        meeting_notes: newActivity.meeting_notes || undefined,
        follow_up_date: newActivity.follow_up_date || undefined,
        follow_up_notes: newActivity.follow_up_notes || undefined,
        documents_collected: newActivity.documents_collected,
        documents_pending: newActivity.documents_pending,
        performed_by: user.data.user.id,
      };

      console.log('Submitting activity:', activityData); // Debug log

      const result = await addActivity(selectedLead.id, activityData);
      console.log('Activity submission result:', result); // Debug log

      if (result) {
        setIsAddActivityDialogOpen(false);
        setNewActivity({
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
        // Refresh activities list
        await fetchActivities(selectedLead.id);
      }
    } catch (err: any) {
      console.error('Error adding activity:', err);
      setFormError(err.message || 'Failed to add activity');
    }
  };

  useEffect(() => {
    if (selectedLead) {
      fetchActivities(selectedLead.id);
    }
  }, [selectedLead, fetchActivities]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -16,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
            }
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Leads Management
            </Typography>
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLeadClick}
              sx={{ 
                position: 'relative', 
                zIndex: 1,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              Add New Lead
            </ActionButton>
          </Box>
        </Fade>

        {/* Search and Filter Bar */}
        <Fade in timeout={500} style={{ transitionDelay: '100ms' }}>
          <SearchPaper>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  disabled={isSearching}
                  sx={{ 
                    position: 'relative',
                    zIndex: 6,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: alpha('#fff', 0.8),
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.9),
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButton
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                  sx={{ position: 'relative', zIndex: 2 }}
                >
                  Filters
                </ActionButton>
              </Grid>
            </Grid>
          </SearchPaper>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={500}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* Leads Grid */
          <Grid container spacing={3}>
            {leads.map((lead: Lead, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={lead.id}>
                <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <StyledCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <IconWrapper>
                            {getVisaTypeIcon(lead.visa_type)}
                          </IconWrapper>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                              {lead.first_name} {lead.last_name}
                            </Typography>
                            <LeadInfoItem>
                              <EmailIcon />
                              <Typography variant="body2">{lead.email}</Typography>
                            </LeadInfoItem>
                          </Box>
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 20
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleLeadMenuClick(e, lead)}
                              sx={{ 
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <StatusChip
                            label={lead.status}
                            color={getStatusColor(lead.status)}
                            size="small"
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <LeadInfoItem>
                          <FlightIcon />
                          <Typography variant="body2">
                            <strong>Visa Type:</strong> {lead.visa_type}
                          </Typography>
                        </LeadInfoItem>
                        <LeadInfoItem>
                          <LocationIcon />
                          <Typography variant="body2">
                            <strong>Target Country:</strong> {lead.target_country}
                          </Typography>
                        </LeadInfoItem>
                        <LeadInfoItem>
                          <PersonIcon />
                          <Typography variant="body2">
                            <strong>Source:</strong> {lead.source}
                          </Typography>
                        </LeadInfoItem>
                      </CardContent>
                    </StyledCard>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Lead Actions Menu */}
        <Menu
          anchorEl={leadMenuAnchorEl}
          open={Boolean(leadMenuAnchorEl)}
          onClose={handleLeadMenuClose}
          MenuListProps={{
            'aria-labelledby': 'lead-actions-button',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                mt: 1
              }
            }
          }}
          sx={{ 
            zIndex: 2000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItemStyled onClick={handleMenuItemClick(handleEditClick)}>
            <EditIcon /> Edit Lead
          </MenuItemStyled>
          <MenuItemStyled onClick={handleMenuItemClick(() => {
            if (selectedLead) {
              fetchActivities(selectedLead.id);
              setIsViewDetailsDialogOpen(true);
            }
          })}>
            <VisibilityIcon /> View Details
          </MenuItemStyled>
          <MenuItemStyled onClick={handleMenuItemClick(handleAddActivity)}>
            <AddTaskIcon /> Add Activity
          </MenuItemStyled>
          <Divider sx={{ my: 1 }} />
          {Object.values(LeadStatus).map((status) => (
            <MenuItemStyled
              key={status}
              onClick={handleMenuItemClick(() => handleStatusUpdate(status))}
            >
              <CheckCircleIcon /> Update Status: {status}
            </MenuItemStyled>
          ))}
          <Divider sx={{ my: 1 }} />
          <MenuItemStyled 
            onClick={handleMenuItemClick(handleDeleteLead)}
            sx={{ 
              color: 'error.main',
              '&:hover': {
                backgroundColor: alpha('#f44336', 0.1),
              }
            }}
          >
            <DeleteIcon /> Delete Lead
          </MenuItemStyled>
        </Menu>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          MenuListProps={{
            'aria-labelledby': 'filter-button',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{ 
            zIndex: 1500,
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItemStyled onClick={handleFilterClose}>
            <FilterIcon /> Status
          </MenuItemStyled>
          <MenuItemStyled onClick={handleFilterClose}>
            <FlightIcon /> Visa Type
          </MenuItemStyled>
          <MenuItemStyled onClick={handleFilterClose}>
            <LocationIcon /> Target Country
          </MenuItemStyled>
        </Menu>

        {/* Add/Edit Lead Dialog */}
        <Dialog
          open={isAddLeadDialogOpen || isEditLeadDialogOpen}
          onClose={() => {
            setIsAddLeadDialogOpen(false);
            setIsEditLeadDialogOpen(false);
            setNewLead({ status: LeadStatus.New });
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${alpha('#000', 0.1)}`,
            pb: 2,
            '& .MuiTypography-root': {
              fontWeight: 600,
            }
          }}>
            {isEditLeadDialogOpen ? 'Edit Lead' : 'Add New Lead'}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  value={newLead.first_name || ''}
                  onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={newLead.last_name || ''}
                  onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  required
                  value={newLead.date_of_birth || ''}
                  onChange={(e) => setNewLead({ ...newLead, date_of_birth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    value={newLead.gender || ''}
                    onChange={(e) => setNewLead({ ...newLead, gender: e.target.value })}
                  >
                    <MuiMenuItem value="Male">Male</MuiMenuItem>
                    <MuiMenuItem value="Female">Female</MuiMenuItem>
                    <MuiMenuItem value="Other">Other</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nationality"
                  required
                  value={newLead.nationality || ''}
                  onChange={(e) => setNewLead({ ...newLead, nationality: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Country"
                  required
                  value={newLead.current_country || ''}
                  onChange={(e) => setNewLead({ ...newLead, current_country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={newLead.email || ''}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  required
                  value={newLead.phone || ''}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  required
                  value={newLead.address_line1 || ''}
                  onChange={(e) => setNewLead({ ...newLead, address_line1: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  required
                  value={newLead.city || ''}
                  onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  required
                  value={newLead.state || ''}
                  onChange={(e) => setNewLead({ ...newLead, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  required
                  value={newLead.postal_code || ''}
                  onChange={(e) => setNewLead({ ...newLead, postal_code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  required
                  value={newLead.country || ''}
                  onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Education Level</InputLabel>
                  <Select
                    label="Education Level"
                    value={newLead.education_level || ''}
                    onChange={(e) => setNewLead({ ...newLead, education_level: e.target.value as EducationLevel })}
                  >
                    {Object.values(EducationLevel).map((level) => (
                      <MuiMenuItem key={level} value={level}>
                        {level}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Visa Type</InputLabel>
                  <Select
                    label="Visa Type"
                    value={newLead.visa_type || ''}
                    onChange={(e) => setNewLead({ ...newLead, visa_type: e.target.value as VisaType })}
                  >
                    {Object.values(VisaType).map((type) => (
                      <MuiMenuItem key={type} value={type}>
                        {type}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Target Country</InputLabel>
                  <Select
                    label="Target Country"
                    value={newLead.target_country || ''}
                    onChange={(e) => setNewLead({ ...newLead, target_country: e.target.value as TargetCountry })}
                  >
                    {Object.values(TargetCountry).map((country) => (
                      <MuiMenuItem key={country} value={country}>
                        {country}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Lead Source</InputLabel>
                  <Select
                    label="Lead Source"
                    value={newLead.source || ''}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value as LeadSource })}
                  >
                    {Object.values(LeadSource).map((source) => (
                      <MuiMenuItem key={source} value={source}>
                        {source}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsAddLeadDialogOpen(false);
              setIsEditLeadDialogOpen(false);
              setNewLead({ status: LeadStatus.New });
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={isEditLeadDialogOpen ? handleEditLead : handleAddLead}
              disabled={!newLead.first_name || !newLead.last_name || !newLead.email || !newLead.phone || !newLead.visa_type || !newLead.target_country}
            >
              {isEditLeadDialogOpen ? 'Update Lead' : 'Add Lead'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog
          open={isAddActivityDialogOpen}
          onClose={() => {
            setIsAddActivityDialogOpen(false);
            setSelectedLead(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${alpha('#000', 0.1)}`,
            pb: 2,
            '& .MuiTypography-root': {
              fontWeight: 600,
            }
          }}>
            Add Activity for {selectedLead?.first_name} {selectedLead?.last_name}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    label="Activity Type"
                    value={newActivity.activity_type}
                    onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
                  >
                    <MuiMenuItem value={ActivityType.Call}>Call</MuiMenuItem>
                    <MuiMenuItem value={ActivityType.Email}>Email</MuiMenuItem>
                    <MuiMenuItem value={ActivityType.Meeting}>Meeting</MuiMenuItem>
                    <MuiMenuItem value={ActivityType.Document}>Document Submission</MuiMenuItem>
                    <MuiMenuItem value={ActivityType.Other}>Other</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  required
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </Grid>
              {newActivity.activity_type === ActivityType.Meeting && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Meeting Date"
                      type="datetime-local"
                      value={newActivity.meeting_date}
                      onChange={(e) => setNewActivity({ ...newActivity, meeting_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration (e.g., 1 hour)"
                      value={newActivity.meeting_duration}
                      onChange={(e) => setNewActivity({ ...newActivity, meeting_duration: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Meeting Notes"
                      multiline
                      rows={3}
                      value={newActivity.meeting_notes}
                      onChange={(e) => setNewActivity({ ...newActivity, meeting_notes: e.target.value })}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Follow-up Date"
                  type="datetime-local"
                  value={newActivity.follow_up_date}
                  onChange={(e) => setNewActivity({ ...newActivity, follow_up_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Follow-up Notes"
                  multiline
                  rows={2}
                  value={newActivity.follow_up_notes}
                  onChange={(e) => setNewActivity({ ...newActivity, follow_up_notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddActivityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                console.log('Add Activity button clicked'); // Debug log
                handleActivitySubmit();
              }}
              disabled={!newActivity.activity_type || !newActivity.description}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              Add Activity
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Details Dialog */}
        <DetailDialog
          open={isViewDetailsDialogOpen}
          onClose={() => setIsViewDetailsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DetailHeader>
            Lead Details: {selectedLead?.first_name} {selectedLead?.last_name}
          </DetailHeader>
          <DialogContent sx={{ 
            p: 4, 
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary 
          }}>
            <Grid container spacing={4}>
              {/* Lead Information */}
              <Grid item xs={12}>
                <InfoSection>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&::after': {
                      content: '""',
                      flex: 1,
                      height: '2px',
                      background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                      marginLeft: theme.spacing(2)
                    }
                  }}>
                    <PersonIcon /> Lead Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <EmailIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>
                            {selectedLead?.email}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <PhoneIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Phone
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>
                            {selectedLead?.phone}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <LocationIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>
                            {selectedLead?.address_line1}, {selectedLead?.city}, {selectedLead?.country}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <FlightIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Visa Type
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>
                            {selectedLead?.visa_type}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <BusinessIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Target Country
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>
                            {selectedLead?.target_country}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LeadInfoItem>
                        <SchoolIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="caption" 
                            component="div"
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            Education Level
                          </Typography>
                          <Typography 
                            variant="body1" 
                            component="div"
                            sx={{ 
                              color: theme.palette.text.primary,
                              fontWeight: 500,
                              fontSize: '0.95rem'
                            }}
                          >
                            {selectedLead?.education_level}
                          </Typography>
                        </Box>
                      </LeadInfoItem>
                    </Grid>
                  </Grid>
                </InfoSection>
              </Grid>

              {/* Activities Section */}
              <Grid item xs={12}>
                <InfoSection>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3 
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&::after': {
                        content: '""',
                        flex: 1,
                        height: '2px',
                        background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                        marginLeft: theme.spacing(2)
                      }
                    }}>
                      <AddTaskIcon /> Activities
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddTaskIcon />}
                      onClick={() => {
                        setIsViewDetailsDialogOpen(false);
                        setIsAddActivityDialogOpen(true);
                      }}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                        }
                      }}
                    >
                      Add Activity
                    </Button>
                  </Box>
                  
                  {activitiesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : activities.length === 0 ? (
                    <Box sx={{
                      p: 4,
                      textAlign: 'center',
                      border: '2px dashed',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '16px',
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      color: theme.palette.text.primary
                    }}>
                      <AddTaskIcon sx={{ 
                        fontSize: 48, 
                        color: theme.palette.primary.main,
                        opacity: 0.7,
                        mb: 2 
                      }} />
                      <Typography variant="h6" sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 1
                      }}>
                        No Activities Yet
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: '0.9rem'
                      }}>
                        Start tracking your interactions with this lead
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {activities.map((activity) => (
                        <ActivityCard key={activity.id}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <ActivityIcon>
                              {activity.activity_type === ActivityType.Call && <PhoneIcon />}
                              {activity.activity_type === ActivityType.Email && <EmailIcon />}
                              {activity.activity_type === ActivityType.Meeting && <CalendarIcon />}
                              {activity.activity_type === ActivityType.Document && <DescriptionIcon />}
                              {activity.activity_type === ActivityType.Other && <MoreHorizIcon />}
                            </ActivityIcon>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 1, 
                                gap: 1,
                                flexWrap: 'wrap'
                              }}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                  fontSize: '1.1rem'
                                }}>
                                  {activity.activity_type}
                                </Typography>
                                <Chip
                                  label={new Date(activity.created_at).toLocaleString()}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                              <Typography variant="body1" sx={{ 
                                color: theme.palette.text.primary,
                                mb: 2,
                                lineHeight: 1.6,
                                fontSize: '0.95rem'
                              }}>
                                {activity.description}
                              </Typography>
                            </Box>
                          </Box>
                        </ActivityCard>
                      ))}
                    </Stack>
                  )}
                </InfoSection>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid', 
            borderColor: theme.palette.divider,
            background: alpha(theme.palette.background.paper, 0.95)
          }}>
            <Button 
              onClick={() => setIsViewDetailsDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </DetailDialog>
      </Box>
    </Layout>
  );
};

export default Leads; 