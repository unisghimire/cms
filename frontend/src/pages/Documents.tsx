import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  VerifiedUser as VerifiedIcon,
  ViewModule as CardViewIcon,
  TableChart as TableViewIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import { useLeads } from '../hooks/useLeads';

// Styled components
const DocumentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.95),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease-in-out',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const UploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: '16px',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
  },
}));

interface Document {
  id: string;
  lead_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  document_size: number;
  document_type_mime: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: {
    first_name: string;
    last_name: string;
  };
}

const Documents: React.FC = () => {
  const theme = useTheme();
  const { leads } = useLeads();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [documentToVerify, setDocumentToVerify] = useState<Document | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          leads (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched documents:', data); // Debug log
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedLeadId || !documentType) return;

    try {
      setUploadProgress(0);
      setError(null);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be authenticated to upload documents');
      }

      // Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'audio/mpeg',
        'video/mp4',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        throw new Error('Invalid file type. Allowed types: JPG, PNG, MP3, MP4, PDF, DOC, DOCX');
      }

      // Create unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedLeadId}/${fileName}`;

      console.log('Starting file upload...', {
        bucket: 'leaddocument',
        filePath,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        userId: user.id // Log user ID for debugging
      });

      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from('leaddocument')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL using the correct method
      const {
        data: { publicUrl },
      } = supabase.storage.from('leaddocument').getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          lead_id: selectedLeadId,
          document_type: documentType,
          document_name: selectedFile.name,
          document_url: publicUrl,
          document_size: selectedFile.size,
          document_type_mime: selectedFile.type,
          notes: notes || null,
          is_verified: false
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Failed to create document record: ${dbError.message}`);
      }

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentType('');
      setNotes('');
      await fetchDocuments();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
    }
  };

  const handleView = async (document: Document) => {
    try {
      setSelectedDocument(document);
      setViewDialogOpen(true);

      // Extract the file path from the URL for the iframe
      const url = new URL(document.document_url);
      const pathMatch = url.pathname.match(/\/public\/leaddocument\/(.*)/);
      if (!pathMatch) {
        throw new Error('Invalid document URL format');
      }
      const path = pathMatch[1];

      console.log('Viewing document:', {
        originalUrl: document.document_url,
        extractedPath: path
      });

      const { data: { publicUrl } } = supabase.storage
        .from('leaddocument')
        .getPublicUrl(path);

      if (!publicUrl) {
        throw new Error('Could not generate document URL');
      }

      // The publicUrl will be used in the iframe in the dialog
      setSelectedDocument({ ...document, document_url: publicUrl });
    } catch (err: any) {
      console.error('Error viewing document:', err);
      setError('Error viewing document. Please try again.');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      // Extract the file path from the URL
      const url = new URL(document.document_url);
      const pathMatch = url.pathname.match(/\/public\/leaddocument\/(.*)/);
      if (!pathMatch) {
        throw new Error('Invalid document URL format');
      }
      const path = pathMatch[1];

      console.log('Downloading document:', {
        originalUrl: document.document_url,
        extractedPath: path
      });

      const { data, error } = await supabase.storage
        .from('leaddocument')
        .download(path);

      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }

      // Create a download link
      const blob = new Blob([data], { type: document.document_type_mime });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.document_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError('Error downloading document. Please try again.');
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
      fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async (document: Document) => {
    setDocumentToVerify(document);
    setIsVerifyDialogOpen(true);
  };

  const handleVerifySubmit = async () => {
    if (!documentToVerify) return;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be authenticated to verify documents');
      }

      const { error } = await supabase
        .from('documents')
        .update({
          is_verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          notes: verificationNotes || documentToVerify.notes
        })
        .eq('id', documentToVerify.id);

      if (error) throw error;

      setIsVerifyDialogOpen(false);
      setDocumentToVerify(null);
      setVerificationNotes('');
      fetchDocuments();
    } catch (err: any) {
      console.error('Error verifying document:', err);
      setError(err.message || 'Failed to verify document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ 
      borderRadius: '16px',
      background: alpha(theme.palette.background.paper, 0.95),
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Document Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Lead</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Upload Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <TableRow 
              key={document.id}
              hover
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {document.document_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {document.leads ? 
                    `${document.leads.first_name} ${document.leads.last_name}` : 
                    'Unknown Lead'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={document.document_type}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatFileSize(document.document_size)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={document.is_verified ? <VerifiedIcon /> : undefined}
                    label={document.is_verified ? "Verified" : "Not Verified"}
                    size="small"
                    color={document.is_verified ? "success" : "default"}
                  />
                  {!document.is_verified && (
                    <Tooltip title="Verify Document">
                      <IconButton
                        size="small"
                        onClick={() => handleVerify(document)}
                        sx={{
                          color: theme.palette.success.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                          }
                        }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(document.created_at).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1
                }}>
                  <Tooltip title="View">
                    <IconButton 
                      size="small"
                      onClick={() => handleView(document)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton 
                      size="small"
                      onClick={() => handleDownload(document)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(document)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
            Lead Documents
          </Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1200
          }}>
            <Box sx={{ position: 'relative', zIndex: 1200 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setViewMode(newValue);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.1),
                    },
                    '&:not(.Mui-selected)': {
                      color: theme.palette.text.secondary,
                    },
                  },
                  '& .MuiToggleButtonGroup-grouped': {
                    '&:not(:first-of-type)': {
                      borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    },
                  },
                }}
              >
                <ToggleButton value="card" aria-label="card view">
                  <CardViewIcon />
                </ToggleButton>
                <ToggleButton value="table" aria-label="table view">
                  <TableViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsUploadDialogOpen(true);
              }}
              sx={{
                borderRadius: '8px',
                padding: '8px 16px',
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: '160px',
                height: '40px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                },
              }}
            >
              Upload Document
            </Button>
          </Box>
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
          ) : documents.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              p: 4,
              borderRadius: '16px',
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
            }}>
              <DocumentIcon sx={{ 
                fontSize: 64, 
                color: alpha(theme.palette.text.secondary, 0.5),
                mb: 2
              }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                No documents found
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                Click the Upload Document button to add your first document
              </Typography>
            </Box>
          ) : viewMode === 'card' ? (
            <Grid container spacing={3}>
              {documents.map((document) => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <DocumentCard>
                    {/* Lead Info Section */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 'bold'
                        }}>
                          {document.leads?.first_name?.[0]}{document.leads?.last_name?.[0]}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ 
                          color: theme.palette.text.primary,
                          fontWeight: 600
                        }}>
                          {document.leads ? 
                            `${document.leads.first_name} ${document.leads.last_name}` : 
                            'Unknown Lead'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Document Owner
                        </Typography>
                      </Box>
                    </Box>

                    {/* Document Info Section */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <DocumentIcon sx={{ 
                          fontSize: 40, 
                          color: theme.palette.primary.main,
                          mr: 2 
                        }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 0.5,
                            color: theme.palette.text.primary
                          }}>
                            {document.document_name}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Chip 
                              label={document.document_type} 
                              size="small"
                              sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }} 
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                icon={document.is_verified ? <VerifiedIcon /> : undefined}
                                label={document.is_verified ? "Verified" : "Not Verified"}
                                size="small"
                                color={document.is_verified ? "success" : "default"}
                              />
                              {!document.is_verified && (
                                <Tooltip title="Verify Document">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleVerify(document)}
                                    sx={{
                                      color: theme.palette.success.main,
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </Box>

                      {/* File Details */}
                      <Stack spacing={0.5} sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Box component="span" sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            backgroundColor: theme.palette.primary.main 
                          }} />
                          Size: {formatFileSize(document.document_size)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Box component="span" sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            backgroundColor: theme.palette.primary.main 
                          }} />
                          Uploaded: {new Date(document.created_at).toLocaleDateString()}
                        </Typography>
                        {document.verified_at && (
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box component="span" sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              backgroundColor: theme.palette.success.main 
                            }} />
                            Verified: {new Date(document.verified_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>

                      {/* Notes Section */}
                      {document.notes && (
                        <Box sx={{ 
                          mb: 2,
                          p: 1.5,
                          backgroundColor: alpha(theme.palette.background.default, 0.5),
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontStyle: 'italic'
                            }}
                          >
                            {document.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Actions Section */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: 1,
                      pt: 2,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <Tooltip title="View">
                        <IconButton 
                          size="small"
                          onClick={() => handleView(document)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small"
                          onClick={() => handleDownload(document)}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(document)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </DocumentCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            renderTableView()
          )}
        </Box>

        {/* Upload Dialog */}
        <Dialog 
          open={isUploadDialogOpen} 
          onClose={() => setIsUploadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          keepMounted
          disablePortal={false}
          sx={{
            zIndex: theme.zIndex.modal,
            '& .MuiDialog-paper': {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                fullWidth
                label="Select Lead"
                value={selectedLeadId || ''}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                sx={{ mb: 2 }}
                SelectProps={{
                  native: true,
                }}
                autoFocus
              >
                <option value="">Select a lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Document Type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              <Box
                onClick={() => document.getElementById('file-input')?.click()}
                sx={{
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: '16px',
                  padding: theme.spacing(4),
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.mp3,.mp4,.pdf,.doc,.docx"
                />
                <UploadIcon sx={{ 
                  fontSize: 48, 
                  color: theme.palette.primary.main, 
                  mb: 2 
                }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: JPG, PNG, MP3, MP4, PDF, DOC, DOCX
                </Typography>
              </Box>

              {uploadProgress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsUploadDialogOpen(false)}
              tabIndex={0}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || !selectedLeadId || !documentType}
              tabIndex={0}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Document Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <DeleteIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedDocument && (
              <Box sx={{ display: 'flex', height: '80vh' }}>
                {/* Document Preview */}
                <Box sx={{ 
                  flex: 1, 
                  borderRight: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={selectedDocument.document_url}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: theme.palette.background.paper
                    }}
                    title="Document Preview"
                  />
                </Box>

                {/* Document Information */}
                <Box sx={{ 
                  width: '300px',
                  p: 3,
                  overflowY: 'auto'
                }}>
                  <Stack spacing={2}>
                    {/* Lead Information */}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Lead
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedDocument.leads ? 
                          `${selectedDocument.leads.first_name} ${selectedDocument.leads.last_name}` :
                          'N/A'}
                      </Typography>
                    </Box>

                    {/* Document Type */}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Document Type
                      </Typography>
                      <Chip 
                        label={selectedDocument.document_type}
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>

                    {/* File Information */}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        File Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Name: {selectedDocument.document_name}
                        </Typography>
                        <Typography variant="body2">
                          Size: {formatFileSize(selectedDocument.document_size)}
                        </Typography>
                        <Typography variant="body2">
                          Type: {selectedDocument.document_type_mime}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Verification Status */}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Verification Status
                      </Typography>
                      <Chip 
                        icon={selectedDocument.is_verified ? <VerifiedIcon /> : undefined}
                        label={selectedDocument.is_verified ? "Verified" : "Not Verified"}
                        size="small"
                        color={selectedDocument.is_verified ? "success" : "default"}
                      />
                      {selectedDocument.verified_at && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Verified on: {new Date(selectedDocument.verified_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Notes */}
                    {selectedDocument.notes && (
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Notes
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          p: 1.5,
                          backgroundColor: alpha(theme.palette.background.default, 0.5),
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}>
                          {selectedDocument.notes}
                        </Typography>
                      </Box>
                    )}

                    {/* Timestamps */}
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Timestamps
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Created: {new Date(selectedDocument.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Updated: {new Date(selectedDocument.updated_at).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(selectedDocument)}
                        sx={{ mb: 1 }}
                      >
                        Download
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          handleDelete(selectedDocument);
                          setViewDialogOpen(false);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Verification Dialog */}
        <Dialog
          open={isVerifyDialogOpen}
          onClose={() => setIsVerifyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle>Verify Document</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to verify this document?
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Document Details:
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Name: {documentToVerify?.document_name}
                </Typography>
                <Typography variant="body2">
                  Type: {documentToVerify?.document_type}
                </Typography>
                <Typography variant="body2">
                  Lead: {documentToVerify?.leads ? 
                    `${documentToVerify.leads.first_name} ${documentToVerify.leads.last_name}` : 
                    'Unknown Lead'}
                </Typography>
              </Stack>
              <TextField
                fullWidth
                label="Verification Notes (Optional)"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleVerifySubmit}
            >
              Verify Document
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Documents; 