import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Card,
  CardContent,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as FollowupIcon,
  Description as DocumentIcon,
  Description as ApplicationIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalLeads: number;
  recentLeads: number;
  pendingFollowups: number;
  totalDocuments: number;
  unverifiedDocuments: number;
  totalApplications: number;
  pendingApplications: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { leads } = useLeads();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    recentLeads: 0,
    pendingFollowups: 0,
    totalDocuments: 0,
    unverifiedDocuments: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch leads stats
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');
      
      if (leadsError) throw leadsError;

      // Fetch pending followups from lead_activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('activity_type', 'follow_up')
        .is('follow_up_date', null);
      
      if (activitiesError) throw activitiesError;

      // Fetch documents stats
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*');
      
      if (documentsError) throw documentsError;

      // Fetch visa applications stats
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('visa_applications')
        .select('*');
      
      if (applicationsError) throw applicationsError;

      // Calculate recent leads (last 7 days)
      const recentLeads = leadsData.filter(lead => {
        const leadDate = new Date(lead.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return leadDate >= sevenDaysAgo;
      }).length;

      // Calculate unverified documents
      const unverifiedDocuments = documentsData.filter(doc => !doc.is_verified).length;

      // Calculate pending applications (where application_status is 'draft' or 'submitted')
      const pendingApplications = applicationsData.filter(app => 
        ['draft', 'submitted'].includes(app.application_status)
      ).length;

      setStats({
        totalLeads: leadsData.length,
        recentLeads,
        pendingFollowups: activitiesData.length,
        totalDocuments: documentsData.length,
        unverifiedDocuments,
        totalApplications: applicationsData.length,
        pendingApplications,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    onClick?: () => void;
  }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: alpha(color, 0.3),
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: '50%', 
            backgroundColor: alpha(color, 0.1),
            mr: 2
          }}>
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color }
            })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderLeadsDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<PeopleIcon />}
          color={theme.palette.primary.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Recent Leads"
          value={stats.recentLeads}
          icon={<AddIcon />}
          color={theme.palette.success.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Pending Followups"
          value={stats.pendingFollowups}
          icon={<FollowupIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/followups')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<DocumentIcon />}
          color={theme.palette.info.main}
          onClick={() => navigate('/leads/documents')}
        />
      </Grid>
    </Grid>
  );

  const renderFollowupsDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Pending Followups"
          value={stats.pendingFollowups}
          icon={<ScheduleIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/followups')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<PeopleIcon />}
          color={theme.palette.primary.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Recent Leads"
          value={stats.recentLeads}
          icon={<AddIcon />}
          color={theme.palette.success.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
    </Grid>
  );

  const renderDocumentsDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<DocumentIcon />}
          color={theme.palette.info.main}
          onClick={() => navigate('/leads/documents')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Unverified Documents"
          value={stats.unverifiedDocuments}
          icon={<WarningIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/documents')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<PeopleIcon />}
          color={theme.palette.primary.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
    </Grid>
  );

  const renderApplicationsDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<ApplicationIcon />}
          color={theme.palette.info.main}
          onClick={() => navigate('/leads/applications')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={<ScheduleIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/applications')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<PeopleIcon />}
          color={theme.palette.primary.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
    </Grid>
  );

  // Get the current path to determine which dashboard to show
  const currentPath = window.location.pathname;
  let activeDashboard = 'default';

  if (currentPath.includes('/followups')) {
    activeDashboard = 'followups';
  } else if (currentPath.includes('/documents')) {
    activeDashboard = 'documents';
  } else if (currentPath.includes('/applications')) {
    activeDashboard = 'applications';
  } else if (currentPath.includes('/leads')) {
    activeDashboard = 'leads';
  }

  const renderDefaultDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<PeopleIcon />}
          color={theme.palette.primary.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Recent Leads"
          value={stats.recentLeads}
          icon={<AddIcon />}
          color={theme.palette.success.main}
          onClick={() => navigate('/leads/all')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Pending Followups"
          value={stats.pendingFollowups}
          icon={<FollowupIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/followups')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<DocumentIcon />}
          color={theme.palette.info.main}
          onClick={() => navigate('/leads/documents')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<ApplicationIcon />}
          color={theme.palette.info.main}
          onClick={() => navigate('/leads/applications')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={<ScheduleIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/applications')}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard
          title="Unverified Documents"
          value={stats.unverifiedDocuments}
          icon={<WarningIcon />}
          color={theme.palette.warning.main}
          onClick={() => navigate('/leads/documents')}
        />
      </Grid>
    </Grid>
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
            Dashboard
          </Typography>
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
            <>
              {activeDashboard === 'default' && renderDefaultDashboard()}
              {activeDashboard === 'leads' && renderLeadsDashboard()}
              {activeDashboard === 'followups' && renderFollowupsDashboard()}
              {activeDashboard === 'documents' && renderDocumentsDashboard()}
              {activeDashboard === 'applications' && renderApplicationsDashboard()}
            </>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard; 