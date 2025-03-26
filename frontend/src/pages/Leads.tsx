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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Lead, LeadStatus, VisaType, TargetCountry, EducationLevel, LeadSource } from '../types/lead';
import { Layout } from '../components/layout/Layout';
import { useLeads } from '../hooks/useLeads';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  padding: '4px 8px',
  height: '24px',
  '& .MuiChip-label': {
    padding: '0 8px',
    fontSize: '0.75rem',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(2),
}));

const Leads: React.FC = () => {
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
    setSelectedLead(null);
  };

  const handleMenuItemClick = (handler: () => void) => {
    return () => {
      handler();
      handleLeadMenuClose();
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

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Leads Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLeadClick}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            Add New Lead
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search leads..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isSearching}
                sx={{ position: 'relative', zIndex: 1 }}
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
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFilterClick}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* Leads Grid */
          <Grid container spacing={3}>
            {leads.map((lead: Lead) => (
              <Grid item xs={12} sm={6} md={4} key={lead.id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <IconWrapper>
                        {getVisaTypeIcon(lead.visa_type)}
                      </IconWrapper>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="div">
                          {lead.first_name} {lead.last_name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {lead.email}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleLeadMenuClick(e, lead)}
                        sx={{ 
                          position: 'relative',
                          zIndex: 2
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <StatusChip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Visa Type:</strong> {lead.visa_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Target Country:</strong> {lead.target_country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Source:</strong> {lead.source}
                    </Typography>
                  </CardContent>
                </StyledCard>
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
          sx={{ zIndex: 1300 }}
        >
          <MenuItem onClick={handleMenuItemClick(handleEditClick)}>Edit Lead</MenuItem>
          <MenuItem onClick={handleMenuItemClick(() => {/* View Details logic */})}>View Details</MenuItem>
          <MenuItem onClick={handleMenuItemClick(() => {/* Add Activity logic */})}>Add Activity</MenuItem>
          {Object.values(LeadStatus).map((status) => (
            <MenuItem
              key={status}
              onClick={handleMenuItemClick(() => handleStatusUpdate(status))}
            >
              Update Status: {status}
            </MenuItem>
          ))}
          <MenuItem 
            onClick={handleMenuItemClick(handleDeleteLead)}
            sx={{ color: 'error.main' }}
          >
            Delete Lead
          </MenuItem>
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
          sx={{ zIndex: 1300 }}
        >
          <MenuItem onClick={handleFilterClose}>Status</MenuItem>
          <MenuItem onClick={handleFilterClose}>Visa Type</MenuItem>
          <MenuItem onClick={handleFilterClose}>Target Country</MenuItem>
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
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle>
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
      </Box>
    </Layout>
  );
};

export default Leads; 