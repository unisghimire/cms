import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Fade,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMenu } from '../../hooks/useMenu';
import { MenuItemWithIcon } from '../../types/menu';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  marginLeft: 0,
  background: 'linear-gradient(135deg, #001f3f 0%, #004d40 100%)',
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.2) 100%)',
    zIndex: 1,
  },
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    marginLeft: drawerWidth,
  }),
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
    zIndex: -1,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
      zIndex: -1,
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
  '&.Mui-selected': {
    background: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '24px',
      background: theme.palette.primary.main,
      borderRadius: '0 4px 4px 0',
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  transition: theme.transitions.create(['transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['transform', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
    background: 'rgba(255, 255, 255, 0.1)',
  },
}));

interface LayoutProps {
  children: React.ReactNode;
}

const MenuItemComponent = ({ item, level = 0 }: { item: MenuItemWithIcon; level?: number }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isSelected = window.location.pathname === item.path;

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setOpen(!open);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <StyledListItemButton
        onClick={handleClick}
        selected={isSelected}
        sx={{ pl: level * 2 + 2 }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.title} />
        {item.children && item.children.length > 0 && (
          open ? <ExpandLessIcon /> : <ExpandMoreIcon />
        )}
      </StyledListItemButton>
      {item.children && item.children.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <MenuItemComponent key={child.id} item={child} level={level + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Leads', icon: <PersonIcon />, path: '/leads' },
  { text: 'Documents', icon: <DescriptionIcon />, path: '/leads/documents' },
  // ... other menu items ...
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { menuItems, loading, error } = useMenu();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <StyledIconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </StyledIconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              background: 'linear-gradient(45deg, #00bfa5 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontWeight: 'bold',
            }}
          >
            CMS Dashboard
          </Typography>
          <Tooltip title="Notifications" TransitionComponent={Fade}>
            <StyledIconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Profile" TransitionComponent={Fade}>
            <StyledIconButton
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <StyledAvatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.email?.[0].toUpperCase()}
              </StyledAvatar>
            </StyledIconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                mt: 1,
                '& .MuiMenuItem-root': {
                  transition: theme.transitions.create(['background-color'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <Divider sx={{ my: 0.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <DrawerHeader>
          <StyledIconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </StyledIconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : (
            menuItems.map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))
          )}
        </List>
      </StyledDrawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}; 