'use client';

import { useState, useEffect } from 'react';

import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  ListItemIcon,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';

import { notificationStore } from '@/utils/requestNotificationPermission';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0); // Mark as read when opened
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearAll = () => {
    if (notificationStore) {
      notificationStore.clearHistory();
      setNotifications([]);
    }
  };

  useEffect(() => {
    // Load initial notifications
    if (notificationStore) {
      const history = notificationStore.getHistory();
      setNotifications(history);
      setUnreadCount(history.length);
      
      // Subscribe to new notifications
      const unsubscribe = notificationStore.addListener((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      
      return unsubscribe;
    }
  }, []);

  // Format the timestamp
  const formatTime = (date) => {
    if (!date) return '';
    
    const notificationDate = new Date(date);
    const now = new Date();
    
    // If today, show time only
    if (notificationDate.toDateString() === now.toDateString()) {
      return notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within the last week, show day and time
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (notificationDate > oneWeekAgo) {
      return notificationDate.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show full date
    return notificationDate.toLocaleDateString();
  };

  // Determine if notification is related to cancellation
  const isCancellationNotification = (notification) => {
    return notification.type === 'booking_cancelled' || 
           notification.type === 'cancelled_subscription' ||
           (notification.title?.toLowerCase().includes('cancelled')) ||
           (notification.message?.toLowerCase().includes('cancelled'));
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    const type = notification.type;
    const title = notification.title?.toLowerCase() || '';
    
    if (isCancellationNotification(notification)) {
      return <CancelIcon color="error" />;
    } else if (title.includes('completed')) {
      return <CheckCircleIcon color="success" />;
    } else if (title.includes('parked') || type === 'parked') {
      return <LocalParkingIcon color="info" />;
    } else if (title.includes('scheduled') || type === 'scheduled_subscription') {
      return <EventIcon color="primary" />;
    } else if (title.includes('approved')) {
      return <CheckCircleIcon color="primary" />;
    } else {
      return <AccessTimeIcon color="action" />;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: '70%',
            maxHeight: '450px',
          },
        }}
      >
        <Box sx={{ 
          px: 2, 
          py: 1, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="subtitle1">Notifications</Typography>
          {notifications.length > 0 && (
            <Button 
              size="small" 
              startIcon={<ClearAllIcon />} 
              onClick={handleClearAll}
              sx={{ color: 'white' }}
            >
              Clear
            </Button>
          )}
        </Box>
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Box sx={{ 
              width: '100%', 
              py: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <NotificationsIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">No notifications</Typography>
            </Box>
          </MenuItem>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {notifications.map((notification, index) => {
              const isCancellation = isCancellationNotification(notification);
              
              return (
                <div key={notification.id || index}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{
                      bgcolor: isCancellation ? 'rgba(211, 47, 47, 0.04)' : 'inherit',
                      borderLeft: isCancellation ? '4px solid #d32f2f' : 'none',
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{notification.title}</Typography>
                          {isCancellation && (
                            <Chip 
                              label="Cancelled" 
                              size="small" 
                              color="error" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textPrimary" component="span">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" component="p">
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </div>
              );
            })}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
