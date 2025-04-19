'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  Container,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const BankDetails = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id

  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' })

  // Fetch existing bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (status !== 'authenticated' || !vendorId) {
        setFetchLoading(false)
        return
      }

      try {
        setFetchLoading(true)
        const response = await axios.get(`${API_URL}/vendor/getbankdetails/${vendorId}`)
        
        if (response.data?.data && response.data.data.length > 0) {
          const bankData = response.data.data[0]
          setAccountNumber(bankData.accountnumber || '')
          setConfirmAccountNumber(bankData.confirmaccountnumber || '')
          setAccountHolderName(bankData.accountholdername || '')
          setIfscCode(bankData.ifsccode || '')
        }
      } catch (error) {
        console.error('Error fetching bank details:', error)
        // If 404, it's fine - just means no existing details
        if (error.response?.status !== 404) {
          setNotification({
            open: true,
            message: 'Failed to load bank details',
            type: 'error'
          })
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchBankDetails()
  }, [vendorId, status, API_URL])

  const validateForm = () => {
    if (!accountNumber) {
      setNotification({
        open: true, 
        message: 'Please enter account number',
        type: 'warning'
      })
      return false
    }
    
    if (accountNumber !== confirmAccountNumber) {
      setNotification({
        open: true, 
        message: 'Account numbers do not match',
        type: 'warning'
      })
      return false
    }
    
    if (!accountHolderName) {
      setNotification({
        open: true, 
        message: 'Please enter account holder name',
        type: 'warning'
      })
      return false
    }
    
    if (!ifscCode) {
      setNotification({
        open: true, 
        message: 'Please enter IFSC code',
        type: 'warning'
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!vendorId) {
      setNotification({
        open: true, 
        message: 'You must be logged in to update bank details',
        type: 'error'
      })
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('vendorId', vendorId)
      formData.append('accountnumber', accountNumber)
      formData.append('confirmaccountnumber', confirmAccountNumber)
      formData.append('accountholdername', accountHolderName)
      formData.append('ifsccode', ifscCode)
      
      const response = await axios.post(`${API_URL}/vendor/bankdetails`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      setNotification({
        open: true, 
        message: response.data.message || 'Bank details saved successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Error saving bank details:', error)
      setNotification({
        open: true, 
        message: error.response?.data?.message || 'Failed to save bank details',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }

  if (fetchLoading) {
    return (
      <Container maxWidth="sm" sx={{ pt: 2, pb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 4, minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pt: 1 }}>
        <Typography variant="h3" component="h1" fontWeight="medium">
          Bank Details
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
            Enter Bank Account Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your Payout will be transferred to this account
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mb: 0.5, display: 'block' }}>
              Account Number
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mb: 0.5, display: 'block' }}>
              Confirm Account Number
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value)}
              placeholder="Confirm account number"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mb: 0.5, display: 'block' }}>
              Account Holder Name
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Enter account holder name"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mb: 0.5, display: 'block' }}>
              IFSC Code
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="Enter IFSC code"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit"
              variant="contained" 
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              sx={{ 
                py: 1.5,
                px: 4, 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: 18,
                boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Notification Toast */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default BankDetails
