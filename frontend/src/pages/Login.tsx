import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import ConsultancyAnimation from '../components/ConsultancyAnimation';
import Logo from '../components/Logo';

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled components
const PageContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #004d40 0%, #001f3f 100%)',
});

const LeftSection = styled(Box)(({ theme }) => ({
  flex: '1.2',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
    zIndex: 0,
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: '0.8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
    animation: `${rotate} 20s linear infinite`,
    zIndex: 0,
  }
}));

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  padding: theme.spacing(6),
  position: 'relative',
  zIndex: 2,
  animation: `${slideIn} 0.6s ease-out`,
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  }
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:nth-of-type(2)': {
    animationDelay: '0.1s',
  },
  '& .MuiOutlinedInput-root': {
    height: '56px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '30px',
    transition: 'all 0.3s ease-in-out',
    backdropFilter: 'blur(5px)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: '1px',
      transition: 'all 0.3s ease-in-out',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      '& fieldset': {
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
    '& .MuiInputAdornment-root': {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
      '& .MuiSvgIcon-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 24,
        transition: 'all 0.3s ease-in-out',
      },
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 14px',
    color: '#fff',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
      opacity: 1,
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: '16px',
  borderRadius: '30px',
  textTransform: 'uppercase',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '1px',
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeInUp} 0.6s ease-out 0.2s`,
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const AnimatedTypography = styled(Typography)`
  animation: ${fadeInUp} 0.6s ease-out;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <PageContainer>
      <LeftSection>
        <Logo />
        <ConsultancyAnimation />
      </LeftSection>
      
      <RightSection>
        <FormContainer>
          <AnimatedTypography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              letterSpacing: '2px',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}
          >
            USER LOGIN
          </AnimatedTypography>

          <Form onSubmit={handleSubmit}>
            <StyledTextField
              variant="outlined"
              required
              fullWidth
              id="username"
              placeholder="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              variant="outlined"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        mr: 1,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          color: '#fff',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              LOGIN
            </SubmitButton>
          </Form>
        </FormContainer>
      </RightSection>
    </PageContainer>
  );
};

export default Login; 