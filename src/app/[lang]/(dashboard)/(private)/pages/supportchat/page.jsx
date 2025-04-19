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
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'

const SupportChatView = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const vendorId = session?.user?.id
  const [helpRequestId, setHelpRequestId] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.48.42.169:4000'

  // Get helpRequestId from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('helpRequestId')
    if (id) {
      setHelpRequestId(id)
    }
  }, [])

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim() && !selectedImage) return

    try {
      setSending(true)

      const formData = new FormData()
      formData.append('vendorid', vendorId)
      formData.append('message', message)

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      console.log('Sending to:', `${API_URL}/vendor/sendchat/${helpRequestId}`)
      console.log('FormData:', [...formData.entries()])

      const response = await axios.post(
        `${API_URL}/vendor/sendchat/${helpRequestId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      console.log('POST response:', response.data)

      setMessage('')
      setSelectedImage(null)

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleBack = () => {
    router.push('/pages/supportchat')
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#4CAF50' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Support Chat
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Input Area Only */}
      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{
          p: 2,
          bgcolor: '#fff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          mt: 'auto'
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        <IconButton
          color="primary"
          onClick={() => fileInputRef.current.click()}
          sx={{ mr: 1 }}
        >
          <ImageIcon />
        </IconButton>

        {selectedImage && (
          <Typography variant="caption" sx={{ mr: 1 }}>
            {selectedImage.name}
          </Typography>
        )}

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="small"
          sx={{ mx: 1 }}
        />

        <IconButton
          color="primary"
          type="submit"
          disabled={sending || (!message.trim() && !selectedImage)}
          sx={{ bgcolor: '#4CAF50', color: '#fff', '&:hover': { bgcolor: '#388E3C' } }}
        >
          {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  )
}

export default SupportChatView
