import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  color: '#fff',
  textAlign: 'center',
  height: '100%',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(8),
  marginTop: theme.spacing(8),
  animation: `${floatAnimation} 3s infinite ease-in-out`,
}));

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  animation: `${fadeInAnimation} 0.5s ease-out forwards`,
  opacity: 0,
  '&:nth-of-type(1)': { animationDelay: '0.2s' },
  '&:nth-of-type(2)': { animationDelay: '0.4s' },
  '&:nth-of-type(3)': { animationDelay: '0.6s' },
  '&:nth-of-type(4)': { animationDelay: '0.8s' },
}));

const StyledIcon = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(1),
  color: '#fff',
}));

const AnimatedIllustration = () => {
  return (
    <Container>
      <Typography variant="h2" gutterBottom sx={{ 
        fontWeight: 700, 
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        mb: 3
      }}>
        Welcome to CMS
      </Typography>
      <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, maxWidth: '600px' }}>
        Your Complete Consultancy Management Solution
      </Typography>
      
      <IconWrapper>
        <IconBox>
          <StyledIcon>
            <BusinessIcon sx={{ fontSize: 'inherit', color: 'inherit' }} />
          </StyledIcon>
          <Typography variant="body1" sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Business Management
          </Typography>
        </IconBox>
        
        <IconBox>
          <StyledIcon>
            <GroupIcon sx={{ fontSize: 'inherit', color: 'inherit' }} />
          </StyledIcon>
          <Typography variant="body1" sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Team Collaboration
          </Typography>
        </IconBox>
        
        <IconBox>
          <StyledIcon>
            <AssessmentIcon sx={{ fontSize: 'inherit', color: 'inherit' }} />
          </StyledIcon>
          <Typography variant="body1" sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Project Tracking
          </Typography>
        </IconBox>
        
        <IconBox>
          <StyledIcon>
            <TimelineIcon sx={{ fontSize: 'inherit', color: 'inherit' }} />
          </StyledIcon>
          <Typography variant="body1" sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Analytics
          </Typography>
        </IconBox>
      </IconWrapper>
    </Container>
  );
};

export default AnimatedIllustration; 