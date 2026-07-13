'use client'
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select,
  InputLabel, FormControl, Grid, Chip, Tooltip, Slide, Paper,
  Divider, List, ListItem, ListItemIcon, ListItemText, Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DesktopMacIcon from '@mui/icons-material/DesktopMac';
import PublicIcon from '@mui/icons-material/Public';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldIcon from '@mui/icons-material/Shield';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import WifiIcon from '@mui/icons-material/Wifi';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WebIcon from '@mui/icons-material/Web';
import React from 'react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ActivityLogsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [filters, setFilters] = useState({
    search: '',
    action: '',
    resourceType: '',
    actorType: '',
    accessType: ''
  });

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopyUserAgent = () => {
    if (selectedData?.userAgent) {
      navigator.clipboard.writeText(selectedData.userAgent);
      setSnackbarOpen(true);
    }
  };

  const [vendorId, setVendorId] = useState(null)

  useEffect(() => {
    const id = localStorage.getItem('vendorId') || 'some-vendor-id-from-session'
    setVendorId(id)
  }, [])

  const fetchLogs = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: filters.search,
        action: filters.action,
        resourceType: filters.resourceType,
        actorType: filters.actorType,
        accessType: filters.accessType,
      });

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendor/activity-logs/${vendorId}?${queryParams}`);
      if (response.data && response.data.success) {
        setData(response.data.logs);
        setTotalRowCount(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching auth logs:', error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters, vendorId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({ search: '', action: '', resourceType: '', actorType: '', accessType: '' });
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['Date', 'Vendor', 'Actor Type', 'Action', 'Resource Type', 'Access Type', 'Device', 'OS', 'Browser', 'IP Address'];
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = [
        new Date(row.createdAt).toLocaleString().replace(/,/g, ''),
        row.actorName ? `${row.actorName} (${row.actorId})` : (row.actorId || 'UNKNOWN'),
        row.actorType || 'UNKNOWN',
        row.action || 'UNKNOWN',
        row.resourceType || 'UNKNOWN',
        row.accessType || 'UNKNOWN',
        row.deviceType || 'UNKNOWN',
        row.osType || 'UNKNOWN',
        row.browser || 'UNKNOWN',
        row.ipAddress || 'UNKNOWN',
      ];
      csvRows.push(values.map(val => `"${val}"`).join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `activity_logs_${new Date().getTime()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleView = (row) => {
    setSelectedData(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE_BOOKING': return 'primary';
      case 'PARKING': return 'success';
      case 'EXITING': return 'warning';
      case 'GENERATE_REPORT': return 'info';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'actorId',
      headerName: 'Vendor',
      width: 220,
      renderCell: (params) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" fontWeight="500">
            {params.row.actorName || (params.row.actorType === 'VENDOR' ? 'Unknown Vendor' : params.row.actorType)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </div>
      )
    },
    {
      field: 'actorType',
      headerName: 'Actor Type',
      width: 120,
      renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" />
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: (params) => <Chip size="small" label={params.value} color={getActionColor(params.value)} />
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value} color="default" />
    },
    { field: 'ipAddress', headerName: 'IP Address', width: 140 },
    {
      field: 'clientInfo',
      headerName: 'Client',
      width: 180,
      renderCell: (params) => `${params.row.deviceType} / ${params.row.osType}`
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          disabled={loading || data.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {/* Filters Section */}
      <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search User (Name/Email)"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select name="action" value={filters.action} label="Action" onChange={handleFilterChange} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="CREATE_BOOKING">CREATE_BOOKING</MenuItem>
                <MenuItem value="PARKING">PARKING</MenuItem>
                <MenuItem value="EXITING">EXITING</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Resource Type</InputLabel>
              <Select name="resourceType" value={filters.resourceType} label="Resource Type" onChange={handleFilterChange} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Resource Types</MenuItem>
                <MenuItem value="BOOKING">BOOKING</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>User Type</InputLabel>
              <Select name="actorType" value={filters.actorType} label="User Type" onChange={handleFilterChange} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="VENDOR">VENDOR</MenuItem>
                <MenuItem value="USER">USER</MenuItem>
                <MenuItem value="ACCOUNTANT">ACCOUNTANT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleResetFilters} fullWidth>Reset</Button>
            <Button variant="contained" color="primary" onClick={fetchLogs} fullWidth startIcon={<RefreshIcon />}>Refresh</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper elevation={0} sx={{ height: 600, width: '100%', borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={totalRowCount}
          loading={loading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e2e8f0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8fafc',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              color: '#475569',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '2px solid #e2e8f0',
            }
          }}
        />
      </Paper>

      {/* Detail Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          p: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldIcon sx={{ fontSize: 28, color: '#10b981' }} />
            <Typography variant="h6" fontWeight="700" color="#1e293b">Audit Log Details</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f9fafb' }}>
          {selectedData && (
            <Grid container spacing={4}>

              {/* User Information Section */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: '#ffffff',
                  border: '1px solid #f0f0f0',
                  height: '100%',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <PersonIcon sx={{ color: '#4f46e5' }} />
                    <Typography variant="h6" fontWeight="700" color="#1e293b">User Identity</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Vendor / Actor */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f4ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PersonIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Vendor</Typography>
                        <Typography variant="body2" color="#1e293b">
                          {selectedData?.actorName
                            ? `${selectedData.actorName} (${selectedData.actorId})`
                            : selectedData?.actorId || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

                    {/* Role */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f4ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Role / Type</Typography>
                        <Chip size="small" label={selectedData.actorType} sx={{ mt: 0.5, bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, borderRadius: 1.5 }} />
                      </Box>
                    </Box>

                  </Box>
                </Paper>
              </Grid>

              {/* Event Information Section */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: '#ffffff',
                  border: '1px solid #f0f0f0',
                  height: '100%',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <DateRangeIcon sx={{ color: '#10b981' }} />
                    <Typography variant="h6" fontWeight="700" color="#1e293b">Event Details</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Timestamp */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AccessTimeIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Timestamp</Typography>
                        <Typography variant="body1" color="#1e293b" fontWeight="600">{new Date(selectedData.createdAt).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

                    {/* Action & Resource */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircleOutlineIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Action & Resource</Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip size="medium" label={selectedData.action} color={getActionColor(selectedData.action)} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                          <Chip size="medium" label={selectedData.resourceType} color="default" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                        </Box>
                      </Box>
                    </Box>



                    {/* JSON Details */}
                    {selectedData.details && Object.keys(selectedData.details).length > 0 && (
                      <>
                        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ErrorOutlineIcon />
                          </Box>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" color="#a855f7" fontWeight="600" display="block">Details JSON</Typography>
                            <Box sx={{ p: 1, mt: 0.5, backgroundColor: '#f8fafc', borderRadius: 1, fontSize: '0.75rem', overflowX: 'auto' }}>
                              <pre style={{ margin: 0 }}>{JSON.stringify(selectedData.details, null, 2)}</pre>
                            </Box>
                          </Box>
                        </Box>
                      </>
                    )}

                  </Box>
                </Paper>
              </Grid>

              {/* Client & Connection Details */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: '#ffffff',
                  border: '1px solid #f0f0f0',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <PublicIcon sx={{ color: '#0ea5e9' }} />
                    <Typography variant="h6" fontWeight="700" color="#1e293b">Client Telemetry</Typography>
                  </Box>

                  <Grid container sx={{ mb: 4 }} rowSpacing={3}>
                    {/* IP */}
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRight: { md: '1px solid #f0f0f0' }, pr: { md: 2 } }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WifiIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">IP Address</Typography>
                        <Typography variant="body1" color="#1e293b" fontWeight="600">{selectedData.ipAddress}</Typography>
                      </Box>
                    </Grid>

                    {/* Device */}
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRight: { md: '1px solid #f0f0f0' }, px: { md: 2 } }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DesktopMacIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Device / OS</Typography>
                        <Typography variant="body1" color="#1e293b" fontWeight="600">{selectedData.deviceType}<br />{selectedData.osType}</Typography>
                      </Box>
                    </Grid>

                    {/* Browser */}
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRight: { md: '1px solid #f0f0f0' }, px: { md: 2 } }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LanguageIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Browser</Typography>
                        <Typography variant="body1" color="#1e293b" fontWeight="600">{selectedData.browser}<br /><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{selectedData.browserVersion}</span></Typography>
                      </Box>
                    </Grid>

                    {/* Channel */}
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: { md: 2 } }}>
                      <Box sx={{ minWidth: 48, width: 48, height: 48, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WebIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94a3b8" fontWeight="600" display="block">Access Channel</Typography>
                        <Chip size="small" label={selectedData.accessType} sx={{ mt: 0.5, bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, borderRadius: 1.5 }} />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Raw User Agent */}
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <Typography variant="body2" color="#1e293b" fontWeight="700">Raw User-Agent</Typography>
                      <Tooltip title="Copy to clipboard" placement="top">
                        <IconButton size="small" onClick={handleCopyUserAgent} sx={{ color: '#64748b' }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{
                      p: 2,
                      backgroundColor: '#ffffff',
                      color: '#64748b',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      fontSize: '0.85rem'
                    }}>
                      {selectedData.userAgent || 'N/A'}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#ffffff', borderTop: '1px solid #f0f0f0' }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              bgcolor: '#10b981',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: 'none'
              }
            }}
          >
            Close Details
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="User Agent copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ActivityLogsTable;
