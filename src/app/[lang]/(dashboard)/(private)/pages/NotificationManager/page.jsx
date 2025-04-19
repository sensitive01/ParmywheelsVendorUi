// // components/NotificationManager.jsx
// 'use client';

// import { useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { requestNotificationPermission } from '@/utils/requestNotificationPermission';


// const NotificationManager = () => {
//   const { data: session } = useSession();

//   useEffect(() => {
//     // Initialize notification permissions when the app loads
//     const initNotifications = async () => {
//       await requestNotificationPermission();
//     };

//     if (session?.user) {
//       initNotifications();
//     }
//   }, [session]);

//   // This is a utility component that doesn't render anything
//   return null;
// };

// export default NotificationManager;
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
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    const type = notification.type;
    const title = notification.title?.toLowerCase() || '';
    
    if (title.includes('cancelled') || type === 'cancelled_subscription') {
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
            width: '350px',
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
            {notifications.map((notification, index) => (
              <div key={notification.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getNotificationIcon(notification)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
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
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
