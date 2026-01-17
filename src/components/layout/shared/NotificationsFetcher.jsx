'use client'

import { useState, useEffect, useCallback } from 'react'

import { useSession } from 'next-auth/react'

import { formatDistanceToNow } from 'date-fns'

import NotificationsDropdown from './NotificationsDropdown'

const NotificationsFetcher = () => {
  const { data: session } = useSession()
  const vendorId = session?.user?._id || session?.user?.id
  const [notifications, setNotifications] = useState([])

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    if (!vendorId) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchnotification-in-web/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 404 || data?.message === 'No notifications found') {
          setNotifications([])

          return
        }

        return
      }

      if (data?.success === false) {
        setNotifications([])

        return
      }

      if (data) {
        let allNotifs = []

        // 1. General/Existing
        let generic = []

        if (data.notifications && Array.isArray(data.notifications)) generic = data.notifications
        else if (data.data && Array.isArray(data.data)) generic = data.data

        allNotifs = [
          ...allNotifs,
          ...generic.map(n => ({
            ...n,
            read: n.isRead
          }))
        ]

        // 2. Bank Account Notifications
        if (Array.isArray(data.bankAccountNotifications)) {
          const bankNotifs = data.bankAccountNotifications.map(item => ({
            id: item._id,
            read: item.isRead // Check specific read status
          }))

          allNotifs = [...allNotifs, ...bankNotifs]
        }

        // 3. Help & Support (Chat)
        if (Array.isArray(data.helpAndSupports)) {
          const helpNotifs = data.helpAndSupports
            .filter(item => item.status !== 'Pending')
            .map(item => ({
              id: item._id,
              read: item.isRead
            }))

          allNotifs = [...allNotifs, ...helpNotifs]
        }

        if (Array.isArray(data.advNotifications)) {
          const advNotifs = data.advNotifications.map(item => ({
            id: item._id,
            read: item.isVendorRead // Vendor read status
          }))

          allNotifs = [...allNotifs, ...advNotifs]
        }

        // 5. KYC Status
        if (data.kycNotifications && Array.isArray(data.kycNotifications)) {
          const kycNotifs = data.kycNotifications.map(item => ({
            id: item._id,
            read: item.isVendorRead
          }))

          allNotifs = [...allNotifs, ...kycNotifs]
        }

        setNotifications(allNotifs)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [vendorId, session])

  useEffect(() => {
    fetchNotifications()

    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000)

    // Listen for updates from other components (e.g., Notifications Page)
    const handleUpdate = () => fetchNotifications()

    window.addEventListener('notification-update', handleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('notification-update', handleUpdate)
    }
  }, [fetchNotifications])

  // Handlers (kept but unused by new dropdown, but good for completeness or future use)
  const handleRead = async () => {}
  const handleRemove = async () => {}
  const handleReadAll = async () => {}

  return <NotificationsDropdown notifications={notifications} />
}

export default NotificationsFetcher
