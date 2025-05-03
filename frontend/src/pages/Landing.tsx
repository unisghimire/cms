import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, Container, Stack, Avatar, Link, TextField, InputAdornment, IconButton, Fade, Alert
} from '@mui/material';
import {
  People, Assignment, Description, NotificationsActive, Receipt, BarChart, CheckCircle, ArrowForward, FormatQuote, Facebook, Twitter, LinkedIn, Star, Email
} from '@mui/icons-material';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import type { SlideProps } from '@mui/material/Slide';
import { useAuth } from '../hooks/useAuth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// SVG dashboard mockup (simple stylized device frame)
const DashboardMockup = () => (
  <svg width="360" height="220" viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)', borderRadius: 24, background: '#fff' }}>
    <rect x="0" y="0" width="360" height="220" rx="24" fill="#fff" stroke="#e0e0e0" strokeWidth="2"/>
    <rect x="24" y="32" width="312" height="32" rx="8" fill="#e3f2fd"/>
    <rect x="24" y="76" width="96" height="24" rx="6" fill="#bbdefb"/>
    <rect x="132" y="76" width="96" height="24" rx="6" fill="#e3f2fd"/>
    <rect x="240" y="76" width="96" height="24" rx="6" fill="#e3f2fd"/>
    <rect x="24" y="112" width="312" height="16" rx="4" fill="#f5f5f5"/>
    <rect x="24" y="136" width="312" height="16" rx="4" fill="#f5f5f5"/>
    <rect x="24" y="160" width="200" height="16" rx="4" fill="#f5f5f5"/>
    <rect x="24" y="184" width="120" height="16" rx="4" fill="#f5f5f5"/>
    <circle cx="340" cy="24" r="6" fill="#90caf9"/>
  </svg>
);

// SVG grayscale logos for trust bar
const TrustLogo = ({ alt }: { alt: string }) => (
  <svg width="64" height="24" viewBox="0 0 64 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'grayscale(1)', opacity: 0.7 }}>
    <rect width="64" height="24" rx="6" fill="#e0e0e0"/>
    <text x="50%" y="50%" textAnchor="middle" fill="#757575" fontSize="12" fontFamily="Arial, sans-serif" dy="0.35em">{alt}</text>
  </svg>
);

// SVG background dots pattern
const DotsPattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}>
    <defs>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill="#ffffff22" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

// Animated CMS Logo SVG with continuous color animation
const AnimatedCMSLogo = () => {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      rotate: [0, 360],
      transition: { repeat: Infinity, duration: 8, ease: 'linear' }
    });
  }, [controls]);
  return (
    <motion.svg
      width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: [0.7, 1.1, 1], opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      aria-label="CMS Logo"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#21cbf3" >
            <animate attributeName="stop-color" values="#21cbf3;#2196f3;#21cbf3" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#2196f3" >
            <animate attributeName="stop-color" values="#2196f3;#21cbf3;#2196f3" dur="4s" repeatCount="indefinite" />
          </stop>
        </radialGradient>
      </defs>
      <motion.circle
        cx="90" cy="90" r="84"
        fill="url(#logoGradient)"
        stroke="#fff" strokeWidth="8"
        animate={controls}
        style={{ originX: '50%', originY: '50%' }}
      />
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontWeight="bold" fontFamily="Poppins, Inter, Arial, sans-serif" fontSize="3.5rem" letterSpacing="4" dominantBaseline="middle">CMS</text>
    </motion.svg>
  );
};

// Add floating animation keyframes:
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-18px); }
  100% { transform: translateY(0px); }
`;

// Add animated background circles component:
const AnimatedCircles = () => (
  <Box sx={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }}>
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 0, opacity: 0.18 + i * 0.05 }}
        animate={{
          y: [0, -30 - i * 10, 0],
          opacity: [0.18 + i * 0.05, 0.28 + i * 0.05, 0.18 + i * 0.05],
        }}
        transition={{ duration: 7 + i, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: `${10 + i * 15}%`,
          top: `${20 + i * 10}%`,
          width: 80 + i * 18,
          height: 80 + i * 18,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff3 60%, #21cbf3 100%)',
          filter: 'blur(2px)',
        }}
      />
    ))}
  </Box>
);

// Add pulse animation keyframes:
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(33,203,243,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(33,203,243,0); }
  100% { box-shadow: 0 0 0 0 rgba(33,203,243,0); }
`;

// --- Features for CMS ---
const features = [
  {
    icon: <People fontSize="large" color="primary" />, 
    title: 'Lead Management',
    description: 'Capture, organize, and nurture all your consultancy leads in one place.'
  },
  {
    icon: <Assignment fontSize="large" color="primary" />, 
    title: 'Visa Applications',
    description: 'Track and manage visa applications with ease and transparency.'
  },
  {
    icon: <Description fontSize="large" color="primary" />, 
    title: 'Document Management',
    description: 'Securely collect, verify, and store all client documents.'
  },
  {
    icon: <NotificationsActive fontSize="large" color="primary" />, 
    title: 'Follow-ups & Reminders',
    description: 'Automate follow-ups and never miss a client interaction.'
  },
  {
    icon: <Receipt fontSize="large" color="primary" />, 
    title: 'Invoicing & Payments',
    description: 'Generate invoices and track payments seamlessly.'
  },
  {
    icon: <BarChart fontSize="large" color="primary" />, 
    title: 'Analytics Dashboard',
    description: 'Get actionable insights with real-time analytics and reporting.'
  },
];

// --- How It Works Steps ---
const steps = [
  { title: 'Sign Up', icon: <CheckCircle color="primary" fontSize="large" />, desc: 'Create your free CMS account.' },
  { title: 'Add Leads', icon: <People color="primary" fontSize="large" />, desc: 'Import or add leads and client details.' },
  { title: 'Manage Apps & Docs', icon: <Assignment color="primary" fontSize="large" />, desc: 'Track visa applications and manage documents.' },
  { title: 'Automate Follow-ups', icon: <NotificationsActive color="primary" fontSize="large" />, desc: 'Set reminders and automate communication.' },
  { title: 'Track Progress', icon: <BarChart color="primary" fontSize="large" />, desc: 'Monitor analytics and grow your consultancy.' },
];

// --- Testimonials ---
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Business Owner',
    avatar: '',
    quote: 'This CMS transformed our consultancy. The dashboard and automation features are a game changer!',
    rating: 5
  },
  {
    name: 'Rahul Verma',
    role: 'Consultant',
    avatar: '',
    quote: 'Super intuitive and fast. Our team collaboration has never been better.',
    rating: 5
  },
  {
    name: 'Aisha Khan',
    role: 'Sales Lead',
    avatar: '',
    quote: 'The best management system for consultancies. Highly recommended!',
    rating: 5
  },
];

const trustedLogos = [
  '/logo1.svg', '/logo2.svg', '/logo3.svg', '/logo4.svg', '/logo5.svg'
];

const quickLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#howitworks' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Login', href: '/login' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' } })
};
const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.18, duration: 0.7, ease: 'easeOut' } })
};

// Fix Transition typing for MUI Dialog:
const Transition = React.forwardRef<HTMLDivElement, SlideProps>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// LoginModal component
const LoginModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  // Signup fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isSignUp) {
      // Simple validation for demo
      if (!name || !email || !password || !confirmPassword) {
        setFormError('Please fill all fields');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      // TODO: Implement real signup logic here
      setFormError('Sign up is not implemented in this demo.');
      return;
    }
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to login');
    }
  };

  // Flip animation
  const cardVariants = {
    login: { rotateY: 0 },
    signup: { rotateY: 180 },
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          TransitionComponent={Transition}
          keepMounted
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 5,
              boxShadow: '0 8px 40px 0 #2196f355',
              bgcolor: 'rgba(30,34,44,0.85)',
              p: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              backdropFilter: 'blur(16px)',
              border: '2px solid',
              borderImage: 'linear-gradient(90deg,#21cbf3,#2196f3 80%) 1',
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              minWidth: 0,
              minHeight: 540,
              maxHeight: '95vh',
            },
          }}
        >
          <motion.div
            style={{ position: 'relative', minHeight: 420, transformStyle: 'preserve-3d' }}
            variants={cardVariants}
            animate={isSignUp ? 'signup' : 'login'}
            initial={false}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.18 }}
          >
            {/* Login Side */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                zIndex: isSignUp ? 1 : 2,
                opacity: isSignUp ? 0 : 1,
                pointerEvents: isSignUp ? 'none' : 'auto',
                transition: 'opacity 0.3s',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 1 }}>
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}>
                  <LockOutlinedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1, boxShadow: 2, bgcolor: 'rgba(33,203,243,0.12)', borderRadius: '50%', p: 1.2 }} />
                </motion.div>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mb: 0.5, letterSpacing: 1 }}>
                  Welcome back!
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Sign in to your account
                </Typography>
              </Box>
              <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2, transition: 'all 0.18s', '&:hover': { color: 'primary.main', transform: 'scale(1.18) rotate(90deg)' } }}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ pt: 0, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: 2, px: { xs: 0.5, sm: 1 } }}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    autoFocus
                    variant="outlined"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((show) => !show)}
                            edge="end"
                            sx={{ color: 'primary.light' }}
                          >
                            {showPassword ? <Fade in={true}><LockOutlinedIcon /></Fade> : <Fade in={true}><LockOutlinedIcon sx={{ opacity: 0.5 }} /></Fade>}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                    <Link href="#" underline="hover" sx={{ color: 'primary.light', fontSize: '0.98rem', fontWeight: 500, transition: 'color 0.18s', '&:hover': { color: 'primary.main' } }}>
                      Forgot password?
                    </Link>
                  </Box>
                  <AnimatePresence>
                    {formError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                        borderRadius: 99,
                        fontSize: '1.15rem',
                        py: 1.5,
                        background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)',
                        boxShadow: 3,
                        transition: 'all 0.18s',
                        '&:hover': {
                          background: 'linear-gradient(90deg,#2196f3,#21cbf3 80%)',
                          boxShadow: 6,
                          transform: 'scale(1.04)',
                        },
                      }}
                      disabled={loading}
                    >
                      {loading ? <Fade in={loading}><Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" opacity="0.3" /><motion.circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" strokeDasharray="60" strokeDashoffset="40" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} /></svg></Box></Fade> : 'Login'}
                    </Button>
                  </motion.div>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Don't have an account?{' '}
                      <Link component="button" onClick={() => setIsSignUp(true)} sx={{ color: 'primary.light', fontWeight: 700, textDecoration: 'none', transition: 'color 0.18s', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                        Sign up
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
            </Box>
            {/* Signup Side */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                zIndex: isSignUp ? 2 : 1,
                opacity: isSignUp ? 1 : 0,
                pointerEvents: isSignUp ? 'auto' : 'none',
                transition: 'opacity 0.3s',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 1 }}>
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}>
                  <LockOutlinedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1, boxShadow: 2, bgcolor: 'rgba(33,203,243,0.12)', borderRadius: '50%', p: 1.2 }} />
                </motion.div>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', mb: 0.5, letterSpacing: 1 }}>
                  Create your account
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Sign up to get started
                </Typography>
              </Box>
              <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2, transition: 'all 0.18s', '&:hover': { color: 'primary.main', transform: 'scale(1.18) rotate(90deg)' } }}>
                <CloseIcon />
              </IconButton>
              <DialogContent sx={{ pt: 0, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: 2, px: { xs: 0.5, sm: 1 } }}>
                  <TextField
                    label="Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((show) => !show)}
                            edge="end"
                            sx={{ color: 'primary.light' }}
                          >
                            {showPassword ? <Fade in={true}><LockOutlinedIcon /></Fade> : <Fade in={true}><LockOutlinedIcon sx={{ opacity: 0.5 }} /></Fade>}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    sx={{
                      borderRadius: 99,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      input: { color: '#fff' },
                      label: { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 99,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.10)',
                        '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                        '&:hover fieldset': { borderColor: '#21cbf3' },
                        '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                      },
                      fontSize: '1.12rem',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((show) => !show)}
                            edge="end"
                            sx={{ color: 'primary.light' }}
                          >
                            {showPassword ? <Fade in={true}><LockOutlinedIcon /></Fade> : <Fade in={true}><LockOutlinedIcon sx={{ opacity: 0.5 }} /></Fade>}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <AnimatePresence>
                    {formError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                        <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 1,
                        fontWeight: 700,
                        borderRadius: 99,
                        fontSize: '1.15rem',
                        py: 1.5,
                        background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)',
                        boxShadow: 3,
                        transition: 'all 0.18s',
                        '&:hover': {
                          background: 'linear-gradient(90deg,#2196f3,#21cbf3 80%)',
                          boxShadow: 6,
                          transform: 'scale(1.04)',
                        },
                      }}
                      disabled={loading}
                    >
                      {loading ? <Fade in={loading}><Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" opacity="0.3" /><motion.circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="3" strokeDasharray="60" strokeDashoffset="40" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} /></svg></Box></Fade> : 'Sign up'}
                    </Button>
                  </motion.div>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Already have an account?{' '}
                      <Link component="button" onClick={() => setIsSignUp(false)} sx={{ color: 'primary.light', fontWeight: 700, textDecoration: 'none', transition: 'color 0.18s', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
            </Box>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

const Landing: React.FC = () => {
  const [ctaHover, setCtaHover] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', fontFamily: 'Poppins, Inter, Roboto, Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* --- HERO SECTION --- */}
      <Box sx={{
        py: 0,
        px: 2,
        background: 'linear-gradient(120deg, #2196f3 0%, #21cbf3 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {/* Animated SVG background and dots pattern */}
        <DotsPattern />
        {/* Animated floating circles */}
        <AnimatedCircles />
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0 }}>
            <path fill="#fff" fillOpacity="0.08" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: { xs: -6, md: -10 } }}>
            {/* Floating CMS Logo */}
            <Box sx={{ animation: `${float} 5.5s ease-in-out infinite` }}>
              <AnimatedCMSLogo />
            </Box>
          </Box>
          <Grid container spacing={6} alignItems="center" justifyContent="center" direction={{ xs: 'column-reverse', md: 'row' }}>
            {/* Left: Headline, subheadline, CTA */}
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ staggerChildren: 0.15 }}>
                {/* Badge above headline */}
                <motion.div variants={fadeUp} custom={-1}>
                  <Box sx={{
                    display: 'inline-block',
                    mb: 1,
                    px: 3,
                    py: 0.6,
                    borderRadius: 99,
                    bgcolor: 'linear-gradient(90deg, #21cbf3 40%, #2196f3 100%)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: { xs: '0.98rem', md: '1.08rem' },
                    letterSpacing: 1,
                    textAlign: 'center',
                    animation: `${pulse} 2.2s infinite`,
                    boxShadow: 3,
                    border: '2px solid #fff',
                    whiteSpace: 'nowrap',
                  }}>
                    Trusted automation. Next-level results
                  </Box>
                </motion.div>
                <motion.div variants={fadeUp} custom={0}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      letterSpacing: 0.5,
                      fontFamily: 'inherit',
                      mb: 1.5,
                      lineHeight: 1.12,
                      textShadow: '0 4px 24px #0006',
                      display: 'inline-block',
                      position: 'relative',
                      fontSize: { xs: '2.1rem', sm: '2.6rem', md: '2.8rem', lg: '3.1rem' },
                      color: '#fff',
                    }}
                  >
                    All-in-one Consultancy Management System
                    <motion.span
                      layoutId="headline-underline"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
                      style={{
                        display: 'block',
                        height: 5,
                        background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)',
                        borderRadius: 4,
                        marginTop: 6,
                        marginLeft: 0,
                        width: '100%',
                      }}
                    />
                  </Typography>
                </motion.div>
                <motion.div variants={fadeUp} custom={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 3,
                      color: 'rgba(255,255,255,0.93)',
                      fontFamily: 'inherit',
                      textShadow: '0 2px 8px #0001',
                      fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.18rem' },
                      fontWeight: 400,
                      maxWidth: 520,
                    }}
                  >
                    Manage leads, applications, documents, follow-ups, and analytics—all in one powerful platform.
                  </Typography>
                </motion.div>
                <motion.div variants={fadeUp} custom={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      color="secondary"
                      sx={{
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        borderRadius: 99,
                        boxShadow: 4,
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px) scale(1.06)',
                          boxShadow: 8,
                          background: 'linear-gradient(90deg,#ff4081,#2196f3)',
                        },
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(120deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.04) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          pointerEvents: 'none',
                        },
                        '&:hover:after': {
                          opacity: 1,
                        },
                      }}
                      onClick={() => setLoginOpen(true)}
                      endIcon={
                        <motion.span
                          animate={{ x: ctaHover ? 8 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                          style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                          <ArrowForward />
                        </motion.span>
                      }
                    >
                      Get Started Free
                    </Button>
                    <Button href="#features" variant="outlined" size="large" color="inherit" sx={{ fontWeight: 700, px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 99, borderColor: 'white', color: 'white', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}>
                      See Features
                    </Button>
                  </Stack>
                </motion.div>
                <motion.div variants={fadeUp} custom={3}>
                  {/* Trust bar */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, textAlign: { xs: 'center', md: 'left' } }}>
                      Trusted by leading consultancies
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                      <TrustLogo alt="Logo1" />
                      <TrustLogo alt="Logo2" />
                      <TrustLogo alt="Logo3" />
                      <TrustLogo alt="Logo4" />
                      <TrustLogo alt="Logo5" />
                    </Stack>
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            {/* Right: Dashboard SVG Mockup */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: { xs: 4, md: 0 } }}>
              <motion.div initial="hidden" animate="visible" variants={fadeRight} style={{ width: '100%' }}>
                <Box sx={{ width: { xs: 320, sm: 360, md: 400 }, height: { xs: 200, sm: 220, md: 240 }, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, boxShadow: 6, background: 'rgba(255,255,255,0.10)', border: '2px solid #fff', position: 'relative', animation: `${float} 7s ease-in-out infinite` }}>
                  <DashboardMockup />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- SVG Section Divider --- */}
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0, bgcolor: 'transparent', mt: -1 }}>
        <svg viewBox="0 0 1440 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg"><path fill="#1e1e1e" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" /></svg>
      </Box>

      {/* --- FEATURES SECTION --- */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} id="features">
        <Typography variant="h4" fontWeight={800} align="center" gutterBottom sx={{ fontFamily: 'inherit' }}>
          Powerful Features for Consultancies
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.7, ease: 'easeOut' }}
                whileHover={{ scale: 1.045, boxShadow: '0 8px 32px #21cbf366', borderColor: '#21cbf3' }}
                style={{ borderRadius: 28, boxShadow: '0 4px 16px #0003', border: '2px solid transparent', background: 'rgba(255,255,255,0.08)', minHeight: 240, height: 240, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative', overflow: 'visible' }}
              >
                {/* Gradient accent bar */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 7, borderTopLeftRadius: 28, borderTopRightRadius: 28, background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)', zIndex: 1 }} />
                <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, flex: 1, justifyContent: 'flex-start', height: '100%' }}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.18, color: '#2196f3' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    style={{ marginBottom: 8 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 2, fontFamily: 'inherit', color: '#fff' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- SVG Section Divider --- */}
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0, bgcolor: 'transparent', mt: -1 }}>
        <svg viewBox="0 0 1440 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg"><path fill="#121212" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" /></svg>
      </Box>

      {/* --- HOW IT WORKS SECTION --- */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }} id="howitworks">
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight={800} align="center" gutterBottom sx={{ fontFamily: 'inherit' }}>
            How It Works
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 2, md: 4 },
              overflowX: { xs: 'auto', md: 'visible' },
              py: 2,
              px: { xs: 1, md: 0 },
              scrollbarWidth: 'thin',
            }}
          >
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.18, duration: 0.7, ease: 'easeOut' }}
                  whileHover={{ scale: 1.07 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, maxWidth: 200 }}
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    style={{ marginBottom: 8 }}
                  >
                    {step.icon}
                  </motion.div>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 1, mb: 0.5, fontFamily: 'inherit', color: 'primary.main', textAlign: 'center' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', minHeight: 40 }}>
                    {step.desc}
                  </Typography>
                </motion.div>
                {/* Animated arrow except after last step */}
                {idx < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.18 + 0.12, duration: 0.5, ease: 'easeOut' }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 36, color: 'primary.main', mx: { xs: 0.5, md: 1 } }} />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- SVG Section Divider --- */}
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0, bgcolor: 'transparent', mt: -1 }}>
        <svg viewBox="0 0 1440 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg"><path fill="#1e1e1e" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" /></svg>
      </Box>

      {/* --- TESTIMONIALS SECTION --- */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }} id="testimonials">
        <Typography variant="h4" fontWeight={800} align="center" gutterBottom sx={{ fontFamily: 'inherit' }}>
          What Our Users Say
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {testimonials.map((t, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.18, duration: 0.7, ease: 'easeOut' }}
                whileHover={{ scale: 1.045, boxShadow: '0 8px 32px #21cbf366', borderColor: '#21cbf3' }}
                style={{ borderRadius: 24, boxShadow: '0 4px 16px #0003', border: '2px solid transparent', background: 'rgba(255,255,255,0.10)', position: 'relative', overflow: 'visible', minHeight: 370, height: 370, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
              >
                {/* Gradient accent bar */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, borderTopLeftRadius: 24, borderTopRightRadius: 24, background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)', zIndex: 1 }} />
                <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, flex: 1, justifyContent: 'flex-start', height: '100%' }}>
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                    <FormatQuote color="primary" sx={{ fontSize: 40, mb: 1, mt: 1 }} />
                  </motion.div>
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: '#fff', fontWeight: 500 }}>
                    {t.quote}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <motion.span key={i} whileHover={{ scale: 1.3, color: '#FFD700' }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                        <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                      </motion.span>
                    ))}
                  </Stack>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 1 }}>{t.name[0]}</Avatar>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff' }}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                </CardContent>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- CTA BANNER --- */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, textAlign: 'center', boxShadow: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={900} sx={{ mb: 2, fontFamily: 'inherit' }}>
            Ready to transform your consultancy?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
            Start your free trial today or book a demo with our team.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button href="/login" variant="contained" size="large" color="secondary" sx={{ fontWeight: 700, px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 99, boxShadow: 4 }} endIcon={<ArrowForward />}>
              Get Started Free
            </Button>
            <Button href="#" variant="outlined" size="large" color="inherit" sx={{ fontWeight: 700, px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 99, borderColor: 'white', color: 'white', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}>
              Book a Demo
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box sx={{
        bgcolor: 'background.paper',
        py: 7,
        borderTop: '2px solid',
        borderColor: 'divider',
        mt: 'auto',
        position: 'relative',
        boxShadow: '0 -2px 24px #2196f322',
      }}>
        {/* Gradient divider */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: 'linear-gradient(90deg,#21cbf3,#2196f3 80%)', opacity: 0.7, zIndex: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="flex-start">
            {/* Newsletter Signup */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontFamily: 'inherit' }}>
                Stay in the loop
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Subscribe to our newsletter for updates and tips.
              </Typography>
              <Box component="form" sx={{ display: 'flex', gap: 1, maxWidth: 400 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Your email address"
                  fullWidth
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.04)',
                    borderRadius: 99,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 99,
                      fontSize: '1rem',
                      color: '#fff',
                      background: 'rgba(255,255,255,0.06)',
                      '& fieldset': { borderColor: 'rgba(33,203,243,0.25)' },
                      '&:hover fieldset': { borderColor: '#21cbf3' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' },
                    },
                    input: { color: '#fff' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.light' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  sx={{
                    borderRadius: 99,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 44,
                    height: 44,
                    boxShadow: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.13) rotate(12deg)',
                      boxShadow: 4,
                    },
                    fontSize: 24,
                    mt: '-2px',
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </Grid>
            {/* Quick Links */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontFamily: 'inherit' }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    color="inherit"
                    underline="none"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 0.5,
                      py: 0.2,
                      transition: 'color 0.18s, background 0.18s',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                        background: 'rgba(33,203,243,0.08)',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
            {/* Contact & Social */}
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontFamily: 'inherit' }}>
                Contact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Email: <Link href="mailto:info@yourcms.com" color="primary.light" underline="hover">info@yourcms.com</Link>
              </Typography>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Link href="#" color="inherit" sx={{ transition: 'color 0.18s, transform 0.18s', '&:hover': { color: 'primary.main', transform: 'scale(1.18) rotate(-8deg)' } }}><Facebook /></Link>
                <Link href="#" color="inherit" sx={{ transition: 'color 0.18s, transform 0.18s', '&:hover': { color: 'primary.main', transform: 'scale(1.18) rotate(-8deg)' } }}><Twitter /></Link>
                <Link href="#" color="inherit" sx={{ transition: 'color 0.18s, transform 0.18s', '&:hover': { color: 'primary.main', transform: 'scale(1.18) rotate(-8deg)' } }}><LinkedIn /></Link>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                © {new Date().getFullYear()} CMS. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Render the LoginModal at the end of the Landing component */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};

export default Landing; 

