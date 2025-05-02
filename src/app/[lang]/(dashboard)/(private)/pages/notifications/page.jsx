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



// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import axios from 'axios';

// // Environment variables
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// // Notification model class - matches Flutter implementation
// class NotificationModel {
//   constructor(title, message, createdAt) {
//     this.title = title || 'No Title';
//     this.message = message || 'No Message';
//     this.createdAt = new Date(createdAt);
//   }

//   static fromJson(json) {
//     return new NotificationModel(
//       json.title,
//       json.message,
//       json.createdAt
//     );
//   }
// }

// // API function to fetch notifications - matches Flutter implementation
// const fetchNotifications = async (vendorId) => {
//   if (!vendorId) return [];
  
//   try {
//     const response = await axios.get(`${API_URL}/vendor/fetchnotification/${vendorId}`);
    
//     if (response.status === 200) {
//       const data = response.data.notifications;
//       return data.map(notification => NotificationModel.fromJson(notification));
//     } else {
//       throw new Error('Failed to load notifications');
//     }
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     throw error;
//   }
// };

// // Format date to match Flutter's DateFormat('dd-MM-yyyy HH:mm')
// const formatDate = (date) => {
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const year = date.getFullYear();
//   const hours = date.getHours().toString().padStart(2, '0');
//   const minutes = date.getMinutes().toString().padStart(2, '0');
  
//   return `${day}-${month}-${year} ${hours}:${minutes}`;
// };

// const NotificationScreen = () => {
//   const { data: session } = useSession();
//   const vendorId = session?.user?.id;
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const getNotifications = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchNotifications(vendorId);
//         setNotifications(data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load notifications');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (vendorId) {
//       getNotifications();
//     } else {
//       setLoading(false);
//     }
//   }, [vendorId]);

//   // Colors to match Flutter implementation
//   const primaryColor = '#4f46e5'; // Replace with your actual primary color from ColorUtils.primarycolor()
//   const errorColor = '#ef4444'; // Equivalent to Colors.red

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold">Notifications</h1>
//       </div>
      
//       <div className="w-full">
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             {/* You could add a proper loader GIF here to match the Flutter asset */}
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//           </div>
//         ) : error ? (
//           <div className="text-center py-10 text-red-500">Error: {error}</div>
//         ) : notifications.length === 0 ? (
//           <div className="text-center py-10 text-gray-500">No notifications found.</div>
//         ) : (
//           <div className="space-y-4">
//             {notifications.map((notification, index) => {
//               const isSlotCancelled = notification.title.includes("Slot Cancelled");
              
//               return (
//                 <div 
//                   key={index}
//                   className="p-4 rounded-lg border shadow-sm bg-white"
//                   style={{ borderColor: isSlotCancelled ? errorColor : primaryColor }}
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div className="font-bold text-sm">
//                       {notification.title}
//                     </div>
//                     <div className="flex items-center">
//                       <div 
//                         className="w-4 h-4 rounded-full flex items-center justify-center mr-1"
//                         style={{ backgroundColor: isSlotCancelled ? errorColor : primaryColor }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                       </div>
//                       <span className="text-xs font-semibold">
//                         {formatDate(notification.createdAt)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-start mt-2">
//                     <div 
//                       className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
//                       style={{ backgroundColor: isSlotCancelled ? errorColor : primaryColor }}
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                       </svg>
//                     </div>
//                     <p className="text-sm text-gray-800">
//                       {notification.message}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationScreen;
