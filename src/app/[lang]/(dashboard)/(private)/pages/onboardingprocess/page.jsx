'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  Button,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const UploadDocuments = () => {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status: sessionStatus } = useSession()
  const vendorId = session?.user?.id
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  
  // Form state
  const [idProof, setIdProof] = useState('')
  const [idProofNumber, setIdProofNumber] = useState('')
  const [addressProof, setAddressProof] = useState('')
  const [addressProofNumber, setAddressProofNumber] = useState('')
  const [kycStatus, setKycStatus] = useState('pending')
  
  // File state
  const [idProofImage, setIdProofImage] = useState(null)
  const [addressProofImage, setAddressProofImage] = useState(null)
  const [idProofFile, setIdProofFile] = useState(null)
  const [addressProofFile, setAddressProofFile] = useState(null)

  // Fetch KYC data on component mount and when session loads
  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !vendorId) {
      if (sessionStatus !== 'loading') {
        setFetchLoading(false)
      }
      return
    }
    
    fetchKycData()
  }, [sessionStatus, vendorId])

  const fetchKycData = async () => {
    try {
      setFetchLoading(true)
      console.log(`Fetching KYC data from: ${API_URL}/vendor/getkyc/${vendorId}`)
      const response = await axios.get(`${API_URL}/vendor/getkyc/${vendorId}`)
      const { data } = response.data
      
      console.log('Full KYC Data:', data)
      console.log('Address Proof:', data.addressProof)
      console.log('ID Proof:', data.idProof)
      
      // Set form data
      if (data.idProof) {
        console.log('Setting ID Proof:', data.idProof)
        setIdProof(data.idProof)
      }
      
      if (data.idProofNumber) setIdProofNumber(data.idProofNumber)
      
      if (data.addressProof) {
        console.log('Setting Address Proof:', data.addressProof)
        setAddressProof(data.addressProof)
      } else {
        console.log('Address Proof data is missing or undefined')
      }
      
      if (data.addressProofNumber) setAddressProofNumber(data.addressProofNumber)
      if (data.status) setKycStatus(data.status)
      
      // Set image previews if they exist
      if (data.idProofImage) {
        setIdProofImage(data.idProofImage)
      }
      
      if (data.addressProofImage) {
        setAddressProofImage(data.addressProofImage)
      }
      
      console.log('Final state values after setting:')
      console.log('addressProof state:', addressProof)
      console.log('idProof state:', idProof)
      
      setFetchLoading(false)
    } catch (error) {
      console.error('Error fetching KYC data:', error)
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to fetch KYC data', 
        severity: 'error' 
      })
      setFetchLoading(false)
    }
  }

  const handleIdProofUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setIdProofFile(file)
      setIdProofImage(URL.createObjectURL(file))
    }
  }

  const handleAddressProofUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setAddressProofFile(file)
      setAddressProofImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!vendorId) {
      setSnackbar({ 
        open: true, 
        message: 'Session expired. Please login again.', 
        severity: 'error' 
      })
      return
    }
    
    if (!idProof || !idProofNumber || !addressProof || !addressProofNumber) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill all required fields', 
        severity: 'warning' 
      })
      return
    }
    
    // Validate that images are selected if not already uploaded
    if (!idProofImage) {
      setSnackbar({ 
        open: true, 
        message: 'Please upload ID proof image', 
        severity: 'warning' 
      })
      return
    }
    
    if (!addressProofImage) {
      setSnackbar({ 
        open: true, 
        message: 'Please upload address proof image', 
        severity: 'warning' 
      })
      return
    }
    
    try {
      setLoading(true)
      
      // Create form data for file upload
      const formData = new FormData()
      formData.append('idProof', idProof)
      formData.append('idProofNumber', idProofNumber)
      formData.append('addressProof', addressProof)
      formData.append('addressProofNumber', addressProofNumber)
      formData.append('status', kycStatus)
      
      // Only append files if they're newly selected
      if (idProofFile) {
        formData.append('idProofImage', idProofFile)
      }
      
      if (addressProofFile) {
        formData.append('addressProofImage', addressProofFile)
      }
      
      console.log(`Updating KYC data at: ${API_URL}/vendor/updatekyc/${vendorId}`)
      
      // Send update request
      const response = await axios.put(
        `${API_URL}/vendor/updatekyc/${vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      console.log('Update response:', response.data)
      
      setSnackbar({ 
        open: true, 
        message: 'KYC details updated successfully', 
        severity: 'success' 
      })
      
      // Reset file states to avoid re-uploading the same files
      setIdProofFile(null)
      setAddressProofFile(null)
      
      setLoading(false)
    } catch (error) {
      console.error('Error updating KYC details:', error)
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update KYC details', 
        severity: 'error' 
      })
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleGoBack = () => {
    router.back()
  }

  // Display loading while session is loading or data is fetching
  if (sessionStatus === 'loading' || fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  
  // Display error if not authenticated
  if (sessionStatus === 'unauthenticated') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Please login to access this page
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/login')}
        >
          Go to Login
        </Button>
      </Box>
    )
  }

  // Helper function to determine the image source
  const getImageSource = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a blob URL (newly uploaded)
    if (typeof imageUrl === 'string' && imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    
    // If it's a full URL with http/https
    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path from API
    if (typeof imageUrl === 'string') {
      // Make sure API_URL doesn't end with slash and imageUrl doesn't start with slash
      const baseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const imagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${baseUrl}${imagePath}`;
    }
    
    return null;
  };

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="medium">
          Upload Documents
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Owner KYC Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Owner KYC</Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel id="id-proof-label">ID Proof Type</InputLabel>
                <Select
                  labelId="id-proof-label"
                  value={idProof}
                  onChange={(e) => setIdProof(e.target.value)}
                  label="ID Proof Type"
                  required
                >
                  <MenuItem value="Passport">Passport</MenuItem>
                  <MenuItem value="Driving License">Driving License</MenuItem>
                  <MenuItem value="Phone Bill">Phone Bill</MenuItem>
                  <MenuItem value="Ration Card">Ration Card</MenuItem>
                  <MenuItem value="Pancard">Pancard</MenuItem>
                  <MenuItem value="Latest Bank Statement">Latest Bank Statement</MenuItem>
                  <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                  <MenuItem value="Bank Passbook Photo">Bank Passbook Photo</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="ID Proof Number"
                variant="outlined"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              <Typography variant="body1" sx={{ mb: 1 }}>
                ID Proof Picture
              </Typography>
              
              <Box 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1, 
                  mb: 2, 
                  height: 200, // Reduced height
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {idProofImage ? (
                  <>
                    <Box 
                      component="img" 
                      src={getImageSource(idProofImage)}
                      alt="ID proof" 
                      sx={{ 
                        maxWidth: '100%',  
                        maxHeight: '100%',
                        width: 'auto',     // Auto width
                        height: 'auto',    // Auto height
                        objectFit: 'contain' // Changed to contain
                      }} 
                    />
                    <Button
                      component="label"
                      variant="contained"
                      sx={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)'
                      }}
                    >
                      Change
                      <input type="file" hidden onChange={handleIdProofUpload} accept="image/*" />
                    </Button>
                  </>
                ) : (
                  <Button
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    color="primary"
                  >
                    Upload Image
                    <input type="file" hidden onChange={handleIdProofUpload} accept="image/*" required />
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Business Docs Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Business Documents</Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel id="address-proof-label">Address Proof Type</InputLabel>
                <Select
                  labelId="address-proof-label"
                  value={addressProof}
                  onChange={(e) => setAddressProof(e.target.value)}
                  label="Address Proof Type"
                  required
                >
                  <MenuItem value="Driving License">Driving License</MenuItem>
                  <MenuItem value="Passport">Passport</MenuItem>
                  <MenuItem value="Ration Card">Ration Card</MenuItem>
                  <MenuItem value="Aadhar Card">Aadhar Card</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Address Proof Number"
                variant="outlined"
                value={addressProofNumber}
                onChange={(e) => setAddressProofNumber(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              <Typography variant="body1" sx={{ mb: 1 }}>
                Address Proof Picture
              </Typography>
              
              <Box 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1, 
                  mb: 2, 
                  height: 200, // Reduced height
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {addressProofImage ? (
                  <>
                    <Box 
                      component="img" 
                      src={getImageSource(addressProofImage)}
                      alt="Address proof" 
                      sx={{ 
                        maxWidth: '100%',  
                        maxHeight: '100%',
                        width: 'auto',     // Auto width
                        height: 'auto',    // Auto height
                        objectFit: 'contain' // Changed to contain
                      }} 
                    />
                    <Button
                      component="label"
                      variant="contained"
                      sx={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)'
                      }}
                    >
                      Change
                      <input type="file" hidden onChange={handleAddressProofUpload} accept="image/*" />
                    </Button>
                  </>
                ) : (
                  <Button
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    color="primary"
                  >
                    Upload Image
                    <input type="file" hidden onChange={handleAddressProofUpload} accept="image/*" required />
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Update Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CloudUploadIcon />}
            sx={{ 
              py: 1.5,
              px: 6, 
              borderRadius: 1,
              textTransform: 'none',
              fontSize: 18
            }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Documents'}
          </Button>
        </Box>
      </form>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default UploadDocuments
