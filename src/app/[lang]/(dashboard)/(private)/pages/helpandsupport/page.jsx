'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'

const VendorHelpAndSupport = () => {
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id 
  const router = useRouter()
  
  const [description, setDescription] = useState('')
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  })
  const [helpRequests, setHelpRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!vendorId) {
      setNotification({
        open: true,
        message: 'You must be logged in to submit a ticket',
        type: 'error',
      })
      return
    }

    if (!description.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a description of your issue',
        type: 'warning',
      })
      return
    }

    try {
      await axios.post(`${API_URL}/vendor/createhelpvendor`, {
        vendorid: vendorId,
        description: description,
      })

      setNotification({
        open: true,
        message: 'Support ticket submitted successfully!',
        type: 'success',
      })
      setDescription('')
      fetchHelpRequests()
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error submitting the support ticket',
        type: 'error',
      })
      console.error(error)
    }
  }

  const fetchHelpRequests = async () => {
    if (status !== 'authenticated' || !vendorId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/vendor/gethelpvendor/${vendorId}`)
      console.log('Help requests response:', response.data)
      const requests = response.data?.helpRequests || []
      setHelpRequests(Array.isArray(requests) ? requests : [])
      setError(null)
    } catch (error) {
      console.error('Error fetching help requests:', error)
      setError('Failed to load help requests')
      setHelpRequests([])
    } finally {
      setLoading(false)
    }
  }

  const closeNotification = () => {
    setNotification({ ...notification, open: false })
  }
  
  const navigateToChat = (helpRequestId) => {
    if (isMounted) {
      router.push(`/pages/supportchat/${helpRequestId}`)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }
  useEffect(() => {
    if (isMounted && (status === 'authenticated' && vendorId)) {
      fetchHelpRequests()
    }
  }, [vendorId, status, isMounted])

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, pt: 1 }}>
        <Typography variant="h3" component="h1" fontWeight="medium" textAlign="center">
          Vendor Help & Support
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/images/assets/call.svg"
            alt="Support"
            sx={{ height: 200, margin: 'auto' }}
          />

          <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
            Need Assistance?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our support team is available 24/7 to help you with your vendor-related questions.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 2, mb: 0.5, display: 'block' }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: 18,
                boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              Submit
            </Button>
          </Box>
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
      
      <Paper sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <TextField
            label="Search by description"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>
        
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Your Support Requests
        </Typography>

        {loading ? (  
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : helpRequests.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            You have no active support requests
          </Typography>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="help requests table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '16px' }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '16px' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '16px' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '16px' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {helpRequests
                  .filter((request) =>
                    request.description.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((request) => (
                  <TableRow key={request._id}>
                    <TableCell component="th" scope="row">
                      {request.description}
                    </TableCell>
                    <TableCell align="right">
                      {request.status || "Pending"}
                    </TableCell>
                    <TableCell align="right">
                      {formatDate(request.date)}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        sx={{ 
                          backgroundColor: '#4CAF50',
                          '&:hover': { backgroundColor: '#388E3C' },
                          textTransform: 'none'
                        }}
                        startIcon={<ChatIcon />}
                        onClick={() => navigateToChat(request._id)}
                      >
                        View Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  )
}

export default VendorHelpAndSupport
