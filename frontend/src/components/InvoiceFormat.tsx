import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  InputAdornment,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Print as PrintIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { supabase } from '../lib/supabase';

interface InvoiceFormatProps {
  lead: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  isEditing?: boolean;
  invoiceId?: string;
  initialStatus?: 'pending' | 'paid' | 'cancelled';
  initialDiscountPercentage?: string;
  onSave?: () => void;
  onBack?: () => void;
}

const InvoiceFormat: React.FC<InvoiceFormatProps> = ({ 
  lead, 
  amount, 
  dueDate, 
  invoiceNumber,
  isEditing = false,
  invoiceId,
  initialStatus = 'pending',
  initialDiscountPercentage = '0',
  onSave,
  onBack
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [discountPercentage, setDiscountPercentage] = useState<string>(initialDiscountPercentage);
  const [status, setStatus] = useState<'pending' | 'paid' | 'cancelled'>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  
  const subTotal = amount;
  const discount = (subTotal * parseFloat(discountPercentage || '0')) / 100;
  const taxRate = 0;
  const taxableAmount = subTotal - discount;
  const taxAmount = taxableAmount * taxRate;
  const totalAmount = taxableAmount + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setDiscountPercentage(value);
    }
  };

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
  };

  const handleSave = async () => {
    if (!invoiceId) {
      console.error('No invoice ID provided');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Attempting to save invoice:', {
        id: invoiceId,
        discount_percentage: parseFloat(discountPercentage || '0'),
        status: status
      });

      const updates = {
        discount_percentage: parseFloat(discountPercentage || '0'),
        status: status,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId)
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        alert(`Failed to update invoice: ${error.message}`);
        return;
      }

      console.log('Invoice updated successfully:', data);

      if (onSave) {
        await onSave();
      }

      // Show success message
      alert('Invoice updated successfully!');
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      alert(`Failed to update invoice: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToList = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/invoices', { replace: true });
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      '@media print': {
        p: 0,
        backgroundColor: 'white',
        '@page': {
          size: 'A4',
          margin: '1cm'
        }
      }
    }}>
      {/* Header with buttons - hide in print */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        position: 'relative',
        zIndex: 2,
        '@media print': {
          display: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBackToList}
            sx={{ minWidth: 120 }}
            type="button"
          >
            Back to List
          </Button>
          <Typography variant="h4">Invoice</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isEditing && (
            <>
              <FormControl size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={handleStatusChange}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{ minWidth: 140 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ minWidth: 130 }}
          >
            Print Invoice
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={1}
        sx={{
          p: 4,
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: theme.palette.background.paper,
          position: 'relative',
          zIndex: 1,
          '@media print': {
            boxShadow: 'none',
            backgroundColor: 'white',
            margin: 0,
            padding: '0',
            color: '#000',
            width: '100%',
            minHeight: 'auto',
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        {/* Company Info */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 4,
          '@media print': {
            borderBottom: '1px solid #eee',
            paddingBottom: '0.5cm',
            marginBottom: '0.5cm'
          }
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              color: theme.palette.primary.main,
              '@media print': { 
                color: '#000',
                fontSize: '1.5rem',
                marginBottom: '0.2cm'
              }
            }}>
              CMS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              '@media print': {
                color: '#000',
                fontSize: '0.8rem',
                marginBottom: '0.1cm'
              }
            }}>
              Your Company Address
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              '@media print': {
                color: '#000',
                fontSize: '0.8rem'
              }
            }}>
              Phone: +1234567890
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" sx={{ 
              mb: 1,
              '@media print': {
                fontSize: '1.2rem',
                marginBottom: '0.2cm'
              }
            }}>
              Invoice #{invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              '@media print': {
                color: '#000',
                fontSize: '0.8rem',
                marginBottom: '0.1cm'
              }
            }}>
              Date: {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              mt: 1,
              '@media print': {
                color: status === 'paid' ? '#2e7d32' : status === 'cancelled' ? '#d32f2f' : '#ed6c02',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }
            }}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ 
          mb: 4,
          '@media print': {
            borderBottom: '1px solid #eee',
            paddingBottom: '0.5cm',
            marginBottom: '0.5cm',
            spacing: 2
          }
        }}>
          {/* Bill To */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              '@media print': { 
                color: '#000',
                fontSize: '0.9rem',
                marginBottom: '0.2cm'
              }
            }}>
              Bill To:
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 'medium',
              '@media print': {
                fontSize: '0.9rem',
                marginBottom: '0.2cm'
              }
            }}>
              {lead.first_name} {lead.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              '@media print': {
                color: '#000',
                fontSize: '0.8rem',
                marginBottom: '0.1cm'
              }
            }}>
              {lead.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              '@media print': {
                color: '#000',
                fontSize: '0.8rem'
              }
            }}>
              {lead.phone}
            </Typography>
          </Grid>

          {/* Invoice Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              '@media print': { 
                color: '#000',
                fontSize: '0.9rem',
                marginBottom: '0.2cm'
              }
            }}>
              Invoice Details:
            </Typography>
            <Typography variant="body2" sx={{ 
              '@media print': { 
                color: '#000',
                fontSize: '0.8rem'
              }
            }}>
              Due Date: {new Date(dueDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Amount Details */}
        <TableContainer sx={{ 
          '@media print': {
            marginBottom: '0.5cm'
          }
        }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ 
                  border: 'none', 
                  pl: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  Sub Total:
                </TableCell>
                <TableCell align="right" sx={{ 
                  border: 'none', 
                  pr: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  NPR {subTotal.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ 
                  border: 'none', 
                  pl: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span>Discount:</span>
                    {isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={discountPercentage}
                        onChange={handleDiscountChange}
                        disabled={!isEditing}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { 
                            min: 0, 
                            max: 100, 
                            step: 'any'
                          }
                        }}
                        sx={{ 
                          width: '100px',
                          '@media print': { display: 'none' }
                        }}
                      />
                    ) : (
                      <span>{discountPercentage}%</span>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ 
                  border: 'none', 
                  pr: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  NPR {discount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ 
                  border: 'none', 
                  pl: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  Taxable Amount:
                </TableCell>
                <TableCell align="right" sx={{ 
                  border: 'none', 
                  pr: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  NPR {taxableAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ 
                  border: 'none', 
                  pl: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  Tax Amount:
                </TableCell>
                <TableCell align="right" sx={{ 
                  border: 'none', 
                  pr: 0,
                  '@media print': {
                    fontSize: '0.8rem',
                    padding: '0.2cm 0'
                  }
                }}>
                  NPR {taxAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ 
                  border: 'none', 
                  pl: 0, 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  '@media print': {
                    borderTop: '1px solid #eee',
                    paddingTop: '0.3cm',
                    fontSize: '0.9rem'
                  }
                }}>
                  Total Amount:
                </TableCell>
                <TableCell align="right" sx={{ 
                  border: 'none', 
                  pr: 0, 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  '@media print': {
                    borderTop: '1px solid #eee',
                    paddingTop: '0.3cm',
                    fontSize: '0.9rem'
                  }
                }}>
                  NPR {totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ 
          mt: 'auto', 
          textAlign: 'center',
          '@media print': {
            marginTop: '0.5cm',
            borderTop: '1px solid #eee',
            paddingTop: '0.5cm'
          }
        }}>
          <Typography variant="body1" sx={{ 
            fontWeight: 'medium',
            mb: 1,
            '@media print': { 
              color: '#000',
              fontSize: '0.9rem',
              marginBottom: '0.2cm'
            }
          }}>
            Thank you for your business!
          </Typography>
          <Typography variant="body2" sx={{
            '@media print': {
              color: '#666',
              fontSize: '0.8rem'
            }
          }}>
            Please make payment by the due date.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceFormat; 