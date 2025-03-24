import React from 'react';
import { Box, styled, keyframes } from '@mui/material';
import {
  Business,
  People,
  TrendingUp,
  Lightbulb,
  Timeline,
  Assessment,
} from '@mui/icons-material';

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const orbitAnimation = keyframes`
  0% {
    transform: rotate(0deg) translateX(120px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(120px) rotate(-360deg);
  }
`;

const AnimationContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    animation: `${pulse} 4s ease-in-out infinite`,
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  '& svg': {
    fontSize: '40px',
    color: '#fff',
    transition: 'all 0.3s ease-in-out',
  }
}));

const OrbitingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '50px',
  height: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(4px)',
  '& svg': {
    fontSize: '24px',
    color: '#fff',
  }
}));

const ConsultancyAnimation = () => {
  return (
    <AnimationContainer>
      {/* Central icon */}
      <IconWrapper
        sx={{
          width: '100px',
          height: '100px',
          position: 'relative',
          animation: `${pulse} 3s ease-in-out infinite`,
          '& svg': {
            fontSize: '50px',
          }
        }}
      >
        <Business />
      </IconWrapper>

      {/* Floating icons */}
      <IconWrapper
        sx={{
          top: '20%',
          left: '25%',
          animation: `${float} 4s ease-in-out infinite, ${fadeInUp} 0.6s ease-out`,
        }}
      >
        <People />
      </IconWrapper>
      <IconWrapper
        sx={{
          top: '15%',
          right: '30%',
          animation: `${float} 4s ease-in-out infinite 0.5s, ${fadeInUp} 0.6s ease-out 0.2s`,
        }}
      >
        <TrendingUp />
      </IconWrapper>
      <IconWrapper
        sx={{
          bottom: '25%',
          left: '20%',
          animation: `${float} 4s ease-in-out infinite 1s, ${fadeInUp} 0.6s ease-out 0.4s`,
        }}
      >
        <Lightbulb />
      </IconWrapper>

      {/* Orbiting icons */}
      <OrbitingIcon
        sx={{
          animation: `${orbitAnimation} 12s linear infinite`,
        }}
      >
        <Timeline />
      </OrbitingIcon>
      <OrbitingIcon
        sx={{
          animation: `${orbitAnimation} 12s linear infinite 4s`,
        }}
      >
        <Assessment />
      </OrbitingIcon>

      {/* Background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: `${rotate} 20s linear infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '50%',
          animation: `${rotate} 15s linear infinite reverse`,
        }}
      />
    </AnimationContainer>
  );
};

export default ConsultancyAnimation; 