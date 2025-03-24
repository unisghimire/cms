import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Business } from '@mui/icons-material';

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(3),
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 2,
}));

const LogoIcon = styled(Business)(({ theme }) => ({
  fontSize: '32px',
  color: '#fff',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: 700,
  letterSpacing: '1px',
}));

const Logo = () => {
  return (
    <LogoContainer>
      <LogoIcon />
      <LogoText variant="h6">CMS</LogoText>
    </LogoContainer>
  );
};

export default Logo; 