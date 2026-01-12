'use client'

import { useState, useEffect, useRef } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'
import axios from 'axios'
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar,
  Paper,
  Avatar,
  Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import AttachFileIcon from '@mui/icons-material/AttachFile'

const VendorSupportChatView = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()

  const vendorId = session?.user?.id
  const [helpRequestId, setHelpRequestId] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [sending, setSending] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const [issueDetails, setIssueDetails] = useState({
    description: '',
    status: ''
  })

  const [ticketVendorId, setTicketVendorId] = useState(null)

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    let id = null

    if (params) {
      id = params.id
    }

    if (!id) {
      const pathParts = window.location.pathname.split('/')

      id = pathParts[pathParts.length - 1]
    }

    if (id) {
      console.log('Found help request ID:', id)
      setHelpRequestId(id)
    } else {
      console.error('Could not find help request ID in URL')
    }
  }, [params])
  useEffect(() => {
    if (helpRequestId && vendorId) {
      fetchChatData()
    }
  }, [helpRequestId, vendorId])
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const fetchChatData = async () => {
    if (!helpRequestId) return

    try {
      setLoading(true)
      console.log(`Fetching chat data for request: ${helpRequestId}`)
      const response = await axios.get(`${API_URL}/vendor/fetchchat/${helpRequestId}`)

      if (response.status === 200) {
        const data = response.data

        console.log('Received chat data:', data)
        setChatMessages(data.chatbox || [])

        if (data.vendorid) {
          setTicketVendorId(data.vendorid)
        }

        try {
          const helpRequestsResponse = await axios.get(`${API_URL}/vendor/gethelpvendor/${vendorId}`)
          const helpRequests = helpRequestsResponse.data?.helpRequests || []
          const currentRequest = helpRequests.find(req => req._id === helpRequestId)

          if (currentRequest) {
            setIssueDetails({
              description: currentRequest.description,
              status: currentRequest.status || 'Pending'
            })
          }
        } catch (err) {
          console.error('Error fetching help request details:', err)
        }
      }
    } catch (error) {
      console.error('Error fetching chat data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async e => {
    e.preventDefault()

    if (issueDetails.status === 'Completed') {
      return // Don't allow sending messages if chat is completed
    }

    if (!message.trim() && !selectedImage) return

    if (!helpRequestId || !vendorId) {
      console.error('Missing helpRequestId or vendorId')

      return
    }

    try {
      setSending(true)

      const formData = new FormData()

      formData.append('vendorid', vendorId)
      formData.append('message', message)

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      formData.append('userId', vendorId)

      const response = await axios.post(`${API_URL}/vendor/sendchat/${helpRequestId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 200) {
        const newMessage = {
          userId: vendorId,
          message: message,
          image: selectedImage ? URL.createObjectURL(selectedImage) : null,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString()
        }

        setChatMessages(prev => [...prev, newMessage])
        setMessage('')
        setSelectedImage(null)
        setTimeout(() => fetchChatData(), 500)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleImageSelect = e => {
    if (issueDetails.status === 'Completed') return

    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleBack = () => {
    router.push('/en/pages/helpandsupport')
  }

  const formatDate = dateString => {
    if (!dateString) return ''

    return new Date(dateString).toLocaleString()
  }

  const isCurrentUser = messageUserId => {
    if (ticketVendorId) {
      return messageUserId === ticketVendorId
    }

    return messageUserId === vendorId
  }

  const isChatCompleted = issueDetails.status === 'Completed'

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h3' component='div' sx={{ flexGrow: 1, color: 'white' }}>
            Vendor Support Chat
          </Typography>
          <Typography variant='subtitle2' component='div' sx={{ color: 'white' }}>
            Status: {issueDetails.status || 'Pending'}
          </Typography>
        </Toolbar>
      </AppBar>
      {issueDetails.description && (
        <Paper elevation={1} sx={{ p: 2, m: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant='subtitle1' fontWeight='bold'>
            Issue Description:
          </Typography>
          <Typography variant='body2'>{issueDetails.description}</Typography>
        </Paper>
      )}
      <Paper elevation={0} sx={{ p: 1, m: 1, bgcolor: '#e8f5e9' }}>
        <Typography variant='caption' color='textSecondary'>
          Request ID: {helpRequestId || 'Not found'}
        </Typography>
        {isChatCompleted && (
          <Typography variant='caption' color='error' sx={{ display: 'block', mt: 1 }}>
            This conversation has been marked as completed. No further messages can be sent.
          </Typography>
        )}
      </Paper>
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : chatMessages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color='text.secondary'>No messages yet. Start the conversation!</Typography>
          </Box>
        ) : (
          chatMessages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: isCurrentUser(msg.userId) ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isCurrentUser(msg.userId) ? '#e3f2fd' : '#f5f5f5',
                  boxShadow: 1
                }}
              >
                {!isCurrentUser(msg.userId) && (
                  <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                    Support Team
                  </Typography>
                )}

                <Typography variant='body1'>{msg.message}</Typography>

                {msg.image && (
                  <Box
                    component='img'
                    src={msg.image.startsWith('blob:') ? msg.image : msg.image}
                    alt='Chat image'
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      mt: 1,
                      borderRadius: 1
                    }}
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = '/images/broken-image.png'
                    }}
                  />
                )}

                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 1, display: 'block', textAlign: 'right' }}
                >
                  {msg.time || formatDate(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {!isChatCompleted ? (
        <Box
          component='form'
          onSubmit={sendMessage}
          sx={{
            p: 2,
            bgcolor: '#fff',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <input
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageSelect}
          />

          <IconButton color='primary' onClick={() => fileInputRef.current.click()} sx={{ mr: 1 }}>
            <ImageIcon />
          </IconButton>

          {selectedImage && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', mr: 1, px: 1, py: 0.5, bgcolor: '#f0f0f0', borderRadius: 1 }}
            >
              <Typography
                variant='caption'
                sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {selectedImage.name}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            variant='outlined'
            placeholder='Type your message...'
            value={message}
            onChange={e => setMessage(e.target.value)}
            size='small'
            sx={{ mx: 1 }}
          />

          <IconButton
            color='primary'
            type='submit'
            disabled={sending || (!message.trim() && !selectedImage)}
            sx={{
              bgcolor: '#4CAF50',
              color: '#fff',
              '&:hover': { bgcolor: '#388E3C' },
              '&.Mui-disabled': {
                bgcolor: '#c8e6c9',
                color: '#7cb342'
              }
            }}
          >
            {sending ? <CircularProgress size={24} color='inherit' /> : <SendIcon />}
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            p: 2,
            bgcolor: '#f5f5f5',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            This conversation has been completed. No further messages can be sent.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default VendorSupportChatView
