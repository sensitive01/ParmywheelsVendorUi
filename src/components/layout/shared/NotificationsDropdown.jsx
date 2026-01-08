'use client'

import { useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'

const NotificationDropdown = ({ notifications = [] }) => {
  // States
  const [notificationsState, setNotificationsState] = useState(notifications)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  useEffect(() => {
    setNotificationsState(notifications)
  }, [notifications])

  // Vars
  const notificationCount = notificationsState.filter(notification => !notification.read).length

  const handleNavigate = () => {
    router.push(`/${locale}/pages/notifications`)
  }

  return (
    <Tooltip title='Notifications'>
      <IconButton color='inherit' onClick={handleNavigate} aria-label='notifications' className='rounded-md'>
        <Badge
          color='error'
          badgeContent={notificationCount}
          invisible={!notificationCount}
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              top: 4,
              right: 4,
              boxShadow: '0 0 0 2px #fff'
            }
          }}
        >
          <i className='ri-notification-3-line text-[1.5rem]' />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

export default NotificationDropdown
