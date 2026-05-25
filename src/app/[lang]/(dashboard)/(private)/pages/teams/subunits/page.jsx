'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import axios from 'axios'
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'

export default function SubunitsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id
  const router = useRouter()
  const { lang: locale } = useParams()

  const [subunits, setSubunits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter mobile & send OTP, 2: Enter OTP & verify/map
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' })

  // Fetch subunits on load
  const fetchSubunits = async () => {
    if (!vendorId) return
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/vendor/subunits/${vendorId}`)
      if (response.data?.success) {
        setSubunits(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching subunits:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch team subunits',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && vendorId) {
      fetchSubunits()
    } else if (status !== 'loading' && !vendorId) {
      setLoading(false)
    }
  }, [vendorId, status])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/vendor/subunit/${vendorId}/${id}`)
      if (response.data?.success) {
        setSubunits(subunits.filter(sub => sub.id !== id))
        setNotification({
          open: true,
          message: 'Subunit unmapped successfully',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error removing subunit:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to remove subunit',
        type: 'error'
      })
    }
  }

  const handleOpenDialog = () => {
    setStep(1)
    setMobile('')
    setOtp('')
    setDialogOpen(true)
  }

  const handleSendOtp = async () => {
    if (!mobile) {
      setNotification({
        open: true,
        message: 'Please enter a mobile number',
        type: 'warning'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${API_URL}/vendor/subunit/send-otp`, {
        mainVendorId: vendorId,
        mobile: mobile
      })

      if (response.data?.success) {
        setNotification({
          open: true,
          message: 'OTP sent successfully to ' + mobile,
          type: 'success'
        })
        setStep(2)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to send OTP to subunit',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyAndMap = async () => {
    if (!otp) {
      setNotification({
        open: true,
        message: 'Please enter the OTP verification code',
        type: 'warning'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${API_URL}/vendor/subunit/verify-and-map`, {
        mainVendorId: vendorId,
        mobile: mobile,
        otp: otp
      })

      if (response.data?.success) {
        setNotification({
          open: true,
          message: 'Subunit linked and mapped successfully!',
          type: 'success'
        })
        setDialogOpen(false)
        fetchSubunits() // Refresh list
      }
    } catch (error) {
      console.error('Error verifying OTP and mapping:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Invalid or expired OTP',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredSubunits = subunits.filter(sub =>
    (sub.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusChip = (status) => {
    return status === 'Active' ? (
      <Chip label="Active" color="success" size="small" variant="tonal" sx={{ borderRadius: '6px' }} />
    ) : (
      <Chip label="Inactive" color="default" size="small" variant="tonal" sx={{ borderRadius: '6px' }} />
    )
  }

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
            Team Subunits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your operational divisions, designated staff sizes, and specific parking space assignments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" style={{ fontSize: '18px' }} />}
          onClick={handleOpenDialog}
          sx={{ textTransform: 'none', px: 3, borderRadius: '8px' }}
        >
          Add Subunit
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          placeholder="Search subunits by name or description..."
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="ri-search-line text-xl" style={{ color: 'var(--mui-palette-text-secondary)' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '8px', bgcolor: 'background.paper' }
          }}
          sx={{ maxWidth: 400, width: '100%' }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredSubunits.length > 0 ? (
            filteredSubunits.map((sub) => (
              <Grid item xs={12} sm={6} md={4} key={sub.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary" noWrap sx={{ maxWidth: '70%' }}>
                        {sub.name}
                      </Typography>
                      {getStatusChip(sub.status)}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px', mb: 3 }}>
                      {sub.description}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Staff
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {sub.members} Members
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Slots
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold">
                          {sub.slots} Units
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Occupied
                        </Typography>
                        <Typography variant="body2" fontWeight="semibold" color={sub.activeBookings > 0 ? 'success.main' : 'text.primary'}>
                          {sub.activeBookings} Active
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        bgcolor: 'action.hover', 
                        p: 2, 
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total Bookings
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {sub.totalBookings || 0} Bookings
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total Revenue
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          ₹{sub.totalAmount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<i className="ri-file-list-3-line" />}
                      onClick={() => router.push(getLocalizedUrl(`/pages/userbookings?subunitId=${sub.id}`, locale))}
                      sx={{ textTransform: 'none', borderRadius: '6px' }}
                    >
                      View Bookings
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDelete(sub.id)}>
                      <i className="ri-delete-bin-7-line" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }} elevation={0}>
                <Typography variant="body1" color="text.secondary">
                  No subunits linked yet. Click 'Add Subunit' to map an existing vendor as a subunit.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add Subunit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {step === 1 && 'Step 1: Verify Vendor Mobile'}
          {step === 2 && 'Step 2: Enter Verification Code'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {step === 1 && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter the mobile number of the registered vendor you want to link as a subunit. We will send a one-time verification code to verify their identity.
              </Typography>
              <TextField
                fullWidth
                label="Vendor Mobile Number"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => {
                  const input = e.target.value;
                  if (/^\d{0,10}$/.test(input)) {
                    setMobile(input);
                  }
                }}
                variant="outlined"
                size="small"
                disabled={submitting}
              />
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                A verification code was sent to <strong>{mobile}</strong>. Enter the 6-digit code below to link them as a subunit.
              </Typography>
              <TextField
                fullWidth
                label="Verification Code (OTP)"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                variant="outlined"
                size="small"
                disabled={submitting}
                inputProps={{ maxLength: 6 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {step === 1 && (
            <>
              <Button onClick={() => setDialogOpen(false)} color="secondary" sx={{ textTransform: 'none' }} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSendOtp}
                variant="contained"
                sx={{ textTransform: 'none', borderRadius: '8px' }}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                Send OTP
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button onClick={() => setStep(1)} color="secondary" sx={{ textTransform: 'none' }} disabled={submitting}>
                Back
              </Button>
              <Button
                onClick={handleVerifyAndMap}
                variant="contained"
                sx={{ textTransform: 'none', borderRadius: '8px' }}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                Link Subunit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
