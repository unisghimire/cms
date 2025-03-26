import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  useTheme, 
  Fade, 
  Tooltip,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Layout } from '../components/layout/Layout';

const StatCard = ({ title, value, icon, color, trend }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={500}>
      <Paper
        sx={{
          p: 3,
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: theme.transitions.create(['transform', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.primary.main} 100%)`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="body2"
            sx={{
              color: trend.startsWith('+') ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TrendingUpIcon
              sx={{
                mr: 0.5,
                transform: trend.startsWith('+') ? 'none' : 'rotate(180deg)',
              }}
            />
            {trend}
          </Typography>
        )}
      </Paper>
    </Fade>
  );
};

const ActivityCard = () => {
  const theme = useTheme();
  const activities = [
    {
      user: 'John Doe',
      action: 'Completed task',
      time: '2 minutes ago',
      avatar: 'JD',
      color: '#2196f3',
    },
    {
      user: 'Jane Smith',
      action: 'Added new comment',
      time: '5 minutes ago',
      avatar: 'JS',
      color: '#4caf50',
    },
    {
      user: 'Mike Johnson',
      action: 'Updated profile',
      time: '10 minutes ago',
      avatar: 'MJ',
      color: '#ff9800',
    },
  ];

  return (
    <Fade in timeout={500}>
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%',
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.user}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: activity.color }}>
                      {activity.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.user}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          {activity.action}
                        </Typography>
                        <Chip
                          label={activity.time}
                          size="small"
                          sx={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiChip-label': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            View All
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );
};

const ProgressCard = () => {
  const theme = useTheme();
  const tasks = [
    { name: 'Project Alpha', progress: 75 },
    { name: 'Project Beta', progress: 45 },
    { name: 'Project Gamma', progress: 90 },
  ];

  return (
    <Fade in timeout={500}>
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%',
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Progress
          </Typography>
          {tasks.map((task) => (
            <Box key={task.name} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{task.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                }}
              />
            </Box>
          ))}
        </CardContent>
        <CardActions>
          <Button size="small" color="primary">
            View Details
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [showAddButton, setShowAddButton] = useState(false);

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <PeopleIcon sx={{ color: 'white' }} />,
      color: '#2196f3',
      trend: '+12% from last month',
    },
    {
      title: 'Total Orders',
      value: '456',
      icon: <ShoppingCartIcon sx={{ color: 'white' }} />,
      color: '#4caf50',
      trend: '+8% from last month',
    },
    {
      title: 'Revenue',
      value: '$12,345',
      icon: <MoneyIcon sx={{ color: 'white' }} />,
      color: '#f44336',
      trend: '+15% from last month',
    },
    {
      title: 'Growth Rate',
      value: '23%',
      icon: <TrendingUpIcon sx={{ color: 'white' }} />,
      color: '#ff9800',
      trend: '+5% from last month',
    },
  ];

  return (
    <Layout>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
        }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #00bfa5 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Dashboard Overview
          </Typography>
          <Tooltip title="Add New Item">
            <IconButton
              color="primary"
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}
          
          <Grid item xs={12} md={6}>
            <ActivityCard />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ProgressCard />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard; 