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
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'

const BankDetails = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id

  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [passbookImage, setPassbookImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

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
          if (bankData.passbookImage) {
            setImagePreview(bankData.passbookImage)
          }
        }
      } catch (error) {
        console.error('Error fetching bank details:', error)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          open: true,
          message: 'Image size should be less than 2MB',
          type: 'error'
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setPassbookImage(file)
    }
  }

  const handleRemoveImage = () => {
    setPassbookImage(null)
    setImagePreview('')
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
      setIsUploading(true)

      const formData = new FormData()
      formData.append('vendorId', vendorId)
      formData.append('accountnumber', accountNumber)
      formData.append('confirmaccountnumber', confirmAccountNumber)
      formData.append('accountholdername', accountHolderName)
      formData.append('ifsccode', ifscCode)

      if (passbookImage) {
        formData.append('passbookImage', passbookImage)
      }

      const response = await axios.post(`${API_URL}/vendor/bankdetails`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      // Reset image state after successful upload
      if (passbookImage) {
        setPassbookImage(null)
        setImagePreview('')
      }

      setNotification({
        open: true,
        message: response.data.message || 'Bank details saved successfully',
        type: 'success'
      })

      // Exit edit mode after successful save
      setIsEditMode(false)
    } catch (error) {
      console.error('Error saving bank details:', error)
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to save bank details',
        type: 'error'
      })
    } finally {
      setLoading(false)
      setIsUploading(false)
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

  // View Mode
  if (!isEditMode) {
    return (
      <Container maxWidth="sm" sx={{ pt: 2, pb: 4, minHeight: '100vh', bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pt: 1 }}>
          <Typography variant="h4" component="h1" fontWeight="medium">
            Bank Details
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(true)}
            size="large"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Edit Details
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Bank Account Details
            </Typography>

            {imagePreview && (
              <Box sx={{
                textAlign: 'center',
                mb: 4,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Passbook Image
                </Typography>
                <img
                  src={imagePreview}
                  alt="Passbook"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
            )}

            <Box sx={{
              display: 'grid',
              gap: 3,
              '& > div': {
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider'
              }
            }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {accountNumber || 'Not provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Holder Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {accountHolderName || 'Not provided'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  IFSC Code
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {ifscCode || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    )
  }

  // Edit Mode
  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 4, minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pt: 1 }}>
        <Typography variant="h3" component="h1" fontWeight="medium">
          {vendorId ? 'Edit Bank Details' : 'Add Bank Details'}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setIsEditMode(false)}
          disabled={loading}
        >
          Cancel
        </Button>
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
          {/* Passbook Image Upload */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Upload Passbook (Optional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="passbook-upload"
              type="file"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            <label htmlFor="passbook-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
                sx={{ mb: 2 }}
              >
                {imagePreview ? 'Change Passbook Image' : 'Upload Passbook Image'}
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="Passbook preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Max file size: 2MB. Supported formats: JPG, PNG, JPEG
            </Typography>
          </Box>

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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mb: 0.5, display: 'block' }}>
              IFSC Code
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="Enter IFSC code"
              sx={{ mb: 2 }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Bank Details'}
          </Button>
        </form>
      </Paper>

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

export default BankDetails
