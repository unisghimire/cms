import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/layout/Layout';
import { useTheme, alpha } from '@mui/material/styles';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import InvoiceFormat from '../components/InvoiceFormat';

interface InvoiceProps {}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
}

interface Invoice {
  id: string;
  lead_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  due_date: string;
  discount_percentage: number;
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface ExpandableRowProps {
  lead: Lead;
  invoices: Invoice[];
  onGenerateInvoice: (lead: Lead) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({
  lead,
  invoices,
  onGenerateInvoice,
  onViewInvoice,
  onEditInvoice,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const leadInvoices = invoices.filter(invoice => invoice.lead_id === lead.id);

  // Add lead information to each invoice
  const enrichedInvoices = leadInvoices.map(invoice => ({
    ...invoice,
    lead: {
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone
    }
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleView = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    onViewInvoice(invoice);
  };

  const handleEdit = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    onEditInvoice(invoice);
  };

  return (
    <>
      <TableRow 
        sx={{
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.04),
          },
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{`${lead.first_name} ${lead.last_name}`}</TableCell>
        <TableCell>{lead.email}</TableCell>
        <TableCell>{lead.phone}</TableCell>
        <TableCell>{lead.status}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Generate Invoice">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateInvoice(lead);
                }}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ReceiptIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Invoice History
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrichedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No invoices found for this lead
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrichedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id.slice(0, 8)}</TableCell>
                        <TableCell>NPR {invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>{invoice.discount_percentage || 0}%</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            color={getStatusColor(invoice.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleView(e, invoice)}
                            title="View Invoice"
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleEdit(e, invoice)}
                            title="Edit Invoice"
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Invoice: React.FC<InvoiceProps> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: invoiceId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showInvoiceFormat, setShowInvoiceFormat] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const isEditMode = location.pathname.includes('/edit');
      setIsEditing(isEditMode);
      setShowInvoiceFormat(true);
      fetchInvoice(invoiceId);
    } else {
      fetchLeads();
      fetchInvoices();
    }
  }, [invoiceId, location.pathname]);

  const fetchInvoice = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          lead:leads(
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentInvoice(data);
        setShowInvoiceFormat(true);
      }
    } catch (err: any) {
      setError('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError('Failed to fetch invoices');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'all' || 
        lead.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [leads, searchQuery, filterStatus]);

  const handleGenerateInvoice = async () => {
    if (!selectedLead || !amount || !dueDate) return;

    try {
      // Generate a unique invoice number (you can modify this format as needed)
      const newInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setInvoiceNumber(newInvoiceNumber);

      const { error } = await supabase
        .from('invoices')
        .insert({
          lead_id: selectedLead.id,
          amount: parseFloat(amount),
          status: 'pending',
          due_date: dueDate,
          invoice_number: newInvoiceNumber,
          discount_percentage: 0
        });

      if (error) throw error;

      // Show the invoice format
      setShowInvoiceFormat(true);
      setIsDialogOpen(false);
      // Refresh invoices list
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInvoiceClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}/edit`);
  };

  const handleBackToList = () => {
    setShowInvoiceFormat(false);
    setCurrentInvoice(null);
    setSelectedLead(null);
    navigate('/invoices', { replace: true });
  };

  if (showInvoiceFormat && (currentInvoice?.lead || selectedLead)) {
    const invoiceLead = currentInvoice?.lead || selectedLead;
    return (
      <Layout>
        <InvoiceFormat
          lead={invoiceLead!}
          amount={currentInvoice ? currentInvoice.amount : parseFloat(amount)}
          dueDate={currentInvoice ? currentInvoice.due_date : dueDate}
          invoiceNumber={currentInvoice ? currentInvoice.id : invoiceNumber}
          isEditing={isEditing}
          invoiceId={currentInvoice?.id}
          initialStatus={currentInvoice?.status}
          initialDiscountPercentage={currentInvoice?.discount_percentage?.toString()}
          onBack={handleBackToList}
          onSave={async () => {
            try {
              console.log('Refreshing invoice data...');
              if (currentInvoice?.id) {
                await fetchInvoice(currentInvoice.id);
                await fetchInvoices();
                console.log('Invoice data refreshed successfully');
              }
            } catch (error) {
              console.error('Error refreshing invoice data:', error);
            }
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Invoices
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1200 }}>
          <TextField
            fullWidth
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ position: 'relative', zIndex: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 50 }} /> {/* Expansion column */}
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <ExpandableRow
                    key={lead.id}
                    lead={lead}
                    invoices={invoices}
                    onGenerateInvoice={handleInvoiceClick}
                    onViewInvoice={handleViewInvoice}
                    onEditInvoice={handleEditInvoice}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Invoice Generation Dialog */}
        <Dialog 
          open={isDialogOpen} 
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedLead(null);
            setAmount('');
            setDueDate('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Lead"
                value={selectedLead ? `${selectedLead.first_name} ${selectedLead.last_name}` : ''}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">NPR</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedLead(null);
                setAmount('');
                setDueDate('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateInvoice} 
              variant="contained" 
              disabled={!amount || !dueDate}
            >
              Generate Invoice
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Invoice; 