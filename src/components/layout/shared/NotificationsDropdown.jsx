'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = params => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = ({ notifications = [] }) => {
  // Use a subset of notifications for the dropdown (latest 5)
  const previewNotifications = notifications.slice(0, 5)

  // States
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState(notifications)

  // Vars
  const notificationCount = notificationsState.filter(notification => !notification.read).length
  const readAll = notificationsState.every(notification => notification.read)

  // Refs
  const anchorRef = useRef(null)
  const ref = useRef(null)

  // Hooks
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when notification is clicked
  const handleReadNotification = (event, value, index) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications[index].read = value
    setNotificationsState(newNotifications)
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = (event, index) => {
    event.stopPropagation()
    const newNotifications = [...notificationsState]

    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach(notification => {
      notification.read = !readAll
    })
    setNotificationsState(newNotifications)
  }

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <Tooltip title='Notifications'>
        <IconButton
          color='inherit'
          className={classnames('rounded-md', { 'bg-action-selected': open })}
          ref={anchorRef}
          onClick={() => setOpen(!open)}
          aria-label='notifications'
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge color='error' variant='dot' invisible={!hasUnreadNotifications}>
            <i className='tabler-bell' />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement={isBelowMdScreen ? 'bottom' : 'bottom-end'}
        className='z-[1] min-is-[22rem] max-h-[28rem]'
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between p-4'>
                    <Typography variant='h5' className='text-textPrimary'>
                      Notifications
                      {hasUnreadNotifications && (
                        <Chip
                          size='small'
                          label={`${notificationsState.filter(n => !n.read).length} New`}
                          color='error'
                          variant='tonal'
                          className='ml-2'
                        />
                      )}
                    </Typography>
                    <div className='flex items-center gap-2'>
                      <Button size='small' variant='text' onClick={markAllAsRead} disabled={!hasUnreadNotifications}>
                        Mark all as read
                      </Button>
                    </div>
                  </div>
                  <Divider className='m-0' />
                  <ScrollWrapper hidden={hidden}>
                    <div className='p-2'>
                      {previewNotifications.length > 0 ? (
                        <>
                          {previewNotifications.map((notification, index) => (
                            <div
                              key={notification.id || index}
                              className={classnames(
                                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                                notification.read ? 'bg-transparent' : 'bg-action-hover',
                                { 'mt-1': index !== 0 },
                                'hover:bg-action-hover cursor-pointer'
                              )}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className='flex-shrink-0 mt-0.5'>
                                {notification.avatarIcon ? (
                                  <CustomAvatar
                                    color={notification.avatarColor}
                                    skin={notification.avatarSkin}
                                    size='sm'
                                  >
                                    <i className={notification.avatarIcon} />
                                  </CustomAvatar>
                                ) : notification.avatarImage ? (
                                  <Avatar
                                    alt={notification.title}
                                    src={notification.avatarImage}
                                    className='is-8 bs-8'
                                  />
                                ) : (
                                  <CustomAvatar
                                    color={notification.avatarColor}
                                    skin={notification.avatarSkin}
                                    size='sm'
                                  >
                                    {notification.avatarText || getInitials(notification.title || '')}
                                  </CustomAvatar>
                                )}
                              </div>
                              <div className='flex-grow min-w-0'>
                                <div className='flex items-center justify-between'>
                                  <Typography
                                    variant='body2'
                                    className={classnames('font-medium', {
                                      'text-textPrimary': !notification.read,
                                      'text-textSecondary': notification.read
                                    })}
                                  >
                                    {notification.title}
                                  </Typography>
                                  <Typography variant='caption' className='text-textDisabled whitespace-nowrap ml-2'>
                                    {notification.time}
                                  </Typography>
                                </div>
                                <Typography
                                  variant='body2'
                                  className={classnames('text-sm mt-0.5', {
                                    'text-textPrimary': !notification.read,
                                    'text-textSecondary': notification.read
                                  })}
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {notification.subtitle || notification.message}
                                </Typography>
                              </div>
                              {!notification.read && (
                                <div className='flex-shrink-0 mt-2'>
                                  <div className='w-2 h-2 rounded-full bg-error' />
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className='flex flex-col items-center justify-center p-4 text-center'>
                          <i className='tabler-bell-off text-[2rem] text-textDisabled mb-2' />
                          <Typography variant='body2' className='text-textSecondary'>
                            No new notifications
                          </Typography>
                        </div>
                      )}
                    </div>
                  </ScrollWrapper>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
