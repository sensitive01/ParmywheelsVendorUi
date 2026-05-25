'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'

export default function AccountsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id

  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter mobile & check/send OTP, 2: Enter & verify OTP, 3: Fill name & password
  const [otp, setOtp] = useState('')
  const [newMember, setNewMember] = useState({ name: '', mobile: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' })

  // Fetch accounts on load
  const fetchAccounts = async () => {
    if (!vendorId) return
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/vendor/get-accountants/${vendorId}`)
      if (response.data?.success) {
        setAccounts(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch accounts team',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && vendorId) {
      fetchAccounts()
    } else if (status !== 'loading' && !vendorId) {
      setLoading(false)
    }
  }, [vendorId, status])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/vendor/delete-accountant/${id}`)
      if (response.data?.success) {
        setAccounts(accounts.filter(acc => acc._id !== id))
        setNotification({
          open: true,
          message: 'Accountant deleted successfully',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error deleting accountant:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to delete accountant',
        type: 'error'
      })
    }
  }

  const handleOpenDialog = () => {
    setStep(1)
    setNewMember({ name: '', mobile: '', password: '' })
    setOtp('')
    setDialogOpen(true)
  }

  const handleSendOtp = async () => {
    if (!newMember.mobile) {
      setNotification({
        open: true,
        message: 'Please enter a mobile number',
        type: 'warning'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${API_URL}/vendor/accountant/send-otp`, {
        mobile: newMember.mobile
      })

      if (response.data?.success) {
        setNotification({
          open: true,
          message: 'OTP sent successfully to ' + newMember.mobile,
          type: 'success'
        })
        setStep(2)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to check or send OTP',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
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
      const response = await axios.post(`${API_URL}/vendor/accountant/verify-otp`, {
        mobile: newMember.mobile,
        otp: otp
      })

      if (response.data?.success) {
        setNotification({
          open: true,
          message: 'OTP verified successfully!',
          type: 'success'
        })
        setStep(3)
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Invalid or expired OTP',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.password) {
      setNotification({
        open: true,
        message: 'Please fill in name and password fields',
        type: 'warning'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${API_URL}/vendor/add-new-accountant/${vendorId}`, {
        accountName: newMember.name,
        mobile: newMember.mobile,
        password: newMember.password,
        otp: otp
      })

      if (response.data?.success) {
        setNotification({
          open: true,
          message: 'Accountant added successfully',
          type: 'success'
        })
        setDialogOpen(false)
        fetchAccounts() // Refresh list
      }
    } catch (error) {
      console.error('Error adding accountant:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to add accountant',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAccounts = accounts.filter(acc => 
    (acc.accountName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.mobile || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusChip = (statusState) => {
    const s = (statusState || '').toLowerCase()
    if (s === 'active') {
      return <Chip label="Active" color="success" size="small" variant="tonal" sx={{ borderRadius: '6px' }} />
    } else if (s === 'inactive') {
      return <Chip label="Inactive" color="default" size="small" variant="tonal" sx={{ borderRadius: '6px' }} />
    } else {
      return <Chip label={statusState || 'Active'} color="success" size="small" variant="tonal" sx={{ borderRadius: '6px' }} />
    }
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
            Team Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization's accountants, roles, and platform permissions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" style={{ fontSize: '18px' }} />}
          onClick={handleOpenDialog}
          sx={{ textTransform: 'none', px: 3, borderRadius: '8px' }}
        >
          Add Accountant
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search accounts by name, mobile, or role..."
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
              sx: { borderRadius: '8px' }
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'semibold', color: 'text.secondary' } }}>
                  <TableCell>Member</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((row) => (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={3} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 'bold', fontSize: '14px', width: 38, height: 38 }}>
                            {getInitials(row.accountName)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium" color="text.primary">
                            {row.accountName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.mobile}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.role || 'accountant'} 
                          size="small" 
                          variant="outlined" 
                          color="primary" 
                          sx={{ borderRadius: '6px', textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <i className="ri-edit-box-line" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                          <i className="ri-delete-bin-7-line" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No team accounts found. Click 'Add Accountant' to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {step === 1 && 'Step 1: Verify Mobile'}
          {step === 2 && 'Step 2: Enter Verification Code'}
          {step === 3 && 'Step 3: Accountant Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {step === 1 && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter the mobile number of the accountant. We will send a one-time verification code to verify their identity.
              </Typography>
              <TextField
                fullWidth
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                value={newMember.mobile}
                onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                variant="outlined"
                size="small"
                disabled={submitting}
              />
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                A verification code was sent to <strong>{newMember.mobile}</strong>. Enter the 6-digit code below.
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

          {step === 3 && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mobile number verified! Now fill in the accountant's full name and set a secure login password.
              </Typography>
              <TextField
                fullWidth
                label="Mobile Number"
                value={newMember.mobile}
                variant="outlined"
                size="small"
                disabled
              />
              <TextField
                fullWidth
                label="Accountant Name"
                placeholder="e.g. Amit Sharma"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                variant="outlined"
                size="small"
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Password"
                placeholder="Set secure password"
                type="password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                variant="outlined"
                size="small"
                disabled={submitting}
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
                onClick={handleVerifyOtp} 
                variant="contained" 
                sx={{ textTransform: 'none', borderRadius: '8px' }} 
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                Verify OTP
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button onClick={() => setStep(2)} color="secondary" sx={{ textTransform: 'none' }} disabled={submitting}>
                Back
              </Button>
              <Button 
                onClick={handleAddMember} 
                variant="contained" 
                sx={{ textTransform: 'none', borderRadius: '8px' }} 
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                Create Account
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
