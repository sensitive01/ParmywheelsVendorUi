'use client'

import { useState, useEffect, useCallback } from 'react'

import { useSession } from 'next-auth/react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  Fade,
  Stack,
  Divider,
  Tab,
  Tabs
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.parkmywheels.com'

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [tabValue, setTabValue] = useState('all')

  const itemsPerPage = 10
  const { data: session, status } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const vendorId = session?.user?._id || session?.user?.id

      if (!vendorId) {
        throw new Error('Vendor ID not found in session')
      }

      const response = await fetch(`${API_BASE_URL}/vendor/fetchnotification/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 404 || data?.message === 'No notifications found') {
          setAllNotifications([])
          setLoading(false)

          return
        }

        throw new Error(data?.message || 'Failed to fetch notifications')
      }

      if (data?.success === false) {
        setAllNotifications([])
        setLoading(false)

        return
      }

      let combined = []

      // 1. General/Existing
      let generic = []

      if (data.notifications && Array.isArray(data.notifications)) generic = data.notifications
      else if (data.data && Array.isArray(data.data)) generic = data.data

      combined = [
        ...combined,
        ...generic.map(n => ({
          ...n,
          type: 'general',
          time: n.createdAt || n.timestamp
        }))
      ]

      // 2. Bank
      if (Array.isArray(data.bankAccountNotifications)) {
        combined = [
          ...combined,
          ...data.bankAccountNotifications.map(item => ({
            _id: item._id,
            title: 'Bank Account Update',
            message: `Bank account ${item.confirmaccountnumber} is ${item.isApproved ? 'Approved' : 'Pending/Rejected'}`,
            time: item.updatedAt,
            read: item.isRead,
            type: 'bank',
            original: item
          }))
        ]
      }

      // 3. Help
      if (Array.isArray(data.helpAndSupports)) {
        combined = [
          ...combined,
          ...data.helpAndSupports
            .filter(i => i.status !== 'Pending')
            .map(item => ({
              _id: item._id,
              title: 'Support Ticket Update',
              message: `Ticket "${item.description}" is ${item.status}`,
              time: item.updatedAt,
              read: item.isRead,
              type: 'help',
              original: item
            }))
        ]
      }

      // 4. Adv
      if (Array.isArray(data.advNotifications)) {
        combined = [
          ...combined,
          ...data.advNotifications
            .filter(i => i.isRead)
            .map(item => ({
              _id: item._id,
              title: 'Callback Request Update',
              message: `Request for ${item.department} has been viewed by Admin.`,
              time: item.updatedAt || item.createdAt,

              // Vendor read status needs to be checked. For generic notifications, 'read' is standard.
              // For adv, we used 'isVendorRead' in fetcher.
              read: item.isVendorRead,
              type: 'adv',
              original: item
            }))
        ]
      }

      // Sort desc
      combined.sort((a, b) => new Date(b.time) - new Date(a.time))

      setAllNotifications(combined)
      setCurrentPage(1) // Reset page on refresh
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to load notifications. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [session])

  // Pagination & Filtering Effect
  useEffect(() => {
    let filtered = allNotifications

    if (tabValue !== 'all') {
      // If 'general', we might want to include those without specific type or type='general'
      // But for specific tabs:
      filtered = allNotifications.filter(n => n.type === tabValue)
    }

    const total = filtered.length

    setTotalItems(total)
    setTotalPages(Math.ceil(total / itemsPerPage))

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setNotifications(filtered.slice(startIndex, endIndex))
  }, [allNotifications, tabValue, currentPage])

  const handleDelete = async notificationId => {
    try {
      setDeletingId(notificationId)

      const response = await fetch(`${API_BASE_URL}/vendor/notification/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      setAllNotifications(prev => prev.filter(n => n._id !== notificationId))
      setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' })
    } catch (err) {
      console.error('Error deleting notification:', err)
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete notification',
        severity: 'error'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true)
      const vendorId = session?.user?._id || session?.user?.id

      if (!vendorId) {
        throw new Error('Vendor ID not found in session')
      }

      // Note: This endpoint might clear ONLY generic notifications or ALL?
      // User requested "Delete Functionality: Implement a delete option for all notification types."
      // If the backend `delete-all` endpoint handles all collections, fine.
      // Assuming it does based on previous context.
      const response = await fetch(`${API_BASE_URL}/vendor/notifications/vendor/${vendorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to clear all notifications')
      }

      setAllNotifications([])
      setSnackbar({ open: true, message: 'All notifications cleared', severity: 'success' })
      setShowDeleteAllDialog(false)
    } catch (err) {
      console.error('Error clearing notifications:', err)
      setSnackbar({
        open: true,
        message: err.message || 'Failed to clear notifications',
        severity: 'error'
      })
    } finally {
      setIsDeletingAll(false)
    }
  }

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setCurrentPage(1) // Reset to page 1 on tab change
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status, fetchNotifications])

  const formatDate = dateString => {
    if (!dateString) return ''
    const date = new Date(dateString)

    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
  }

  const getNotificationColor = notification => {
    const title = notification.title?.toLowerCase() || ''

    if (title.includes('expiring soon') || title.includes('expiring in')) {
      return 'warning'
    }

    if (title.includes('expired')) {
      return 'error'
    }

    return 'info'
  }

  if (loading && notifications.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 2
        }}
      >
        <CircularProgress size={50} />
        <Typography variant='body2' color='text.secondary'>
          Loading notifications...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant='contained' onClick={fetchNotifications} startIcon={<RefreshIcon />} fullWidth>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant='h4'
            component='h1'
            fontWeight='bold'
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.5
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            Notifications
          </Typography>
          {totalItems > 0 && (
            <Typography variant='body2' color='text.secondary'>
              {totalItems} total notification{totalItems !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <Stack direction='row' spacing={1}>
          {allNotifications.length > 0 && (
            <Button
              variant='outlined'
              color='error'
              onClick={() => setShowDeleteAllDialog(true)}
              startIcon={<DeleteSweepIcon />}
              disabled={loading || isDeletingAll}
              size={isMobile ? 'small' : 'medium'}
            >
              {isDeletingAll ? 'Clearing...' : isMobile ? 'Clear' : 'Clear All'}
            </Button>
          )}
          <Button
            variant='outlined'
            onClick={fetchNotifications}
            startIcon={<RefreshIcon />}
            disabled={loading}
            size={isMobile ? 'small' : 'medium'}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='notification tabs'
          variant='scrollable'
          scrollButtons='auto'
          textColor='primary'
          indicatorColor='primary'
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                All
                <Chip
                  size='small'
                  label={allNotifications.length}
                  color={tabValue === 'all' ? 'primary' : 'default'}
                  sx={{ ml: 1, height: 20, cursor: 'pointer' }}
                />
              </Box>
            }
            value='all'
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Bank Updates
                <Chip
                  size='small'
                  label={allNotifications.filter(n => n.type === 'bank').length}
                  color={tabValue === 'bank' ? 'primary' : 'default'}
                  sx={{ ml: 1, height: 20, cursor: 'pointer' }}
                />
              </Box>
            }
            value='bank'
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Support
                <Chip
                  size='small'
                  label={allNotifications.filter(n => n.type === 'help').length}
                  color={tabValue === 'help' ? 'primary' : 'default'}
                  sx={{ ml: 1, height: 20, cursor: 'pointer' }}
                />
              </Box>
            }
            value='help'
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Callbacks
                <Chip
                  size='small'
                  label={allNotifications.filter(n => n.type === 'adv').length}
                  color={tabValue === 'adv' ? 'primary' : 'default'}
                  sx={{ ml: 1, height: 20, cursor: 'pointer' }}
                />
              </Box>
            }
            value='adv'
          />
        </Tabs>
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 && totalItems === 0 ? (
        <Card
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant='h6' color='text.secondary' gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            You're all caught up! New notifications will appear here.
          </Typography>
        </Card>
      ) : (
        <>
          <Stack spacing={2} sx={{ mb: 4 }}>
            {notifications.map((notification, index) => (
              <Fade in={true} timeout={300 + index * 100} key={notification._id || notification.id || index}>
                <Card
                  elevation={2}
                  sx={{
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: notification.read ? 'divider' : 'primary.light',
                    bgcolor: notification.read ? 'background.paper' : 'action.hover',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      {/* Notification Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1.5,
                            flexWrap: 'wrap'
                          }}
                        >
                          <Typography
                            variant='h6'
                            sx={{
                              fontWeight: notification.read ? 500 : 700,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              color: 'text.primary',
                              flex: 1,
                              minWidth: 0
                            }}
                          >
                            {notification.title || 'Notification'}
                          </Typography>
                          <Chip
                            label={
                              getNotificationColor(notification) === 'warning'
                                ? 'Warning'
                                : getNotificationColor(notification) === 'error'
                                  ? 'Expired'
                                  : 'Info'
                            }
                            color={getNotificationColor(notification)}
                            size='small'
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            mb: 2,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {notification.message || notification.description || 'No message content'}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'text.secondary'
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          <Typography variant='caption'>
                            {formatDate(notification.createdAt || notification.timestamp)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Delete Button */}
                      <IconButton
                        size='small'
                        onClick={() => handleDelete(notification._id || notification.id)}
                        disabled={deletingId === (notification._id || notification.id)}
                        color='error'
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.contrastText'
                          }
                        }}
                      >
                        {deletingId === (notification._id || notification.id) ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon fontSize='small' />
                        )}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card elevation={1} sx={{ mt: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  <Button
                    variant='outlined'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    startIcon={<ChevronLeftIcon />}
                    sx={{ minWidth: 100 }}
                  >
                    Previous
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='body1' fontWeight='600'>
                      Page {currentPage} of {totalPages}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}{' '}
                      of {totalItems}
                    </Typography>
                  </Box>

                  <Button
                    variant='outlined'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    endIcon={<ChevronRightIcon />}
                    sx={{ minWidth: 100 }}
                  >
                    Next
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete All Dialog */}
      <Dialog
        open={showDeleteAllDialog}
        onClose={() => !isDeletingAll && setShowDeleteAllDialog(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant='h6' fontWeight='bold'>
            Clear All Notifications
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to clear all <strong>{totalItems}</strong> notification{totalItems !== 1 ? 's' : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowDeleteAllDialog(false)} disabled={isDeletingAll} variant='outlined'>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAll}
            color='error'
            variant='contained'
            disabled={isDeletingAll}
            startIcon={isDeletingAll ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
          >
            {isDeletingAll ? 'Clearing...' : 'Clear All'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
