'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Badge,
    Paper,
    Button
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsNone as NotificationsNoneIcon,
    Event as EventIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    LocalParking as ParkingIcon,
    AccessTime as ReminderIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Mock data - replace with your actual API call
const mockNotifications = [
    {
        id: 1,
        title: 'New Booking',
        message: 'You have a new booking for Parking Spot #A12',
        type: 'booking',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
        id: 2,
        title: 'Payment Received',
        message: 'Payment of $15.00 received for booking #12345',
        type: 'payment',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
        id: 3,
        title: 'Reminder',
        message: 'Your parking spot will be available in 30 minutes',
        type: 'reminder',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        id: 4,
        title: 'Booking Cancelled',
        message: 'Booking #12346 has been cancelled',
        type: 'cancellation',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
];

const getNotificationIcon = (type) => {
    switch (type) {
        case 'booking':
            return <EventIcon color="primary" />;
        case 'payment':
            return <CheckCircleIcon color="success" />;
        case 'cancellation':
            return <CancelIcon color="error" />;
        case 'reminder':
            return <ReminderIcon color="warning" />;
        case 'parking':
            return <ParkingIcon color="info" />;
        case 'warning':
            return <WarningIcon color="warning" />;
        default:
            return <NotificationsIcon />;
    }
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }

    return 'just now';
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { data: session } = useSession();
    const router = useRouter();

    // Load notifications
    useEffect(() => {
        // In a real app, you would fetch notifications from your API here
        // For now, we'll use mock data
        const fetchNotifications = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));

                // Set the notifications from mock data
                setNotifications(mockNotifications);

                // Calculate unread count
                const unread = mockNotifications.filter(n => !n.read).length;
                setUnreadCount(unread);

            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const refreshNotifications = () => {
        setLoading(true);
        // In a real app, you would refetch notifications here
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Typography>Loading notifications...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon color="primary" />
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
                    )}
                </Box>

                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        sx={{ mr: 1 }}
                    >
                        Mark all as read
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={refreshNotifications}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            No notifications to display
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={refreshNotifications}
                            sx={{ mt: 2 }}
                            startIcon={<RefreshIcon />}
                        >
                            Refresh
                        </Button>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((notification, index) => (
                            <Box key={notification.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        bgcolor: notification.read ? 'background.paper' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={notification.read ? 'normal' : 'medium'}
                                                >
                                                    {notification.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                                sx={{
                                                    opacity: notification.read ? 0.8 : 1,
                                                    fontWeight: notification.read ? 'normal' : 'regular',
                                                }}
                                            >
                                                {notification.message}
                                            </Typography>
                                        }
                                        sx={{ m: 0 }}
                                    />
                                    {!notification.read && (
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            bgcolor: 'primary.main',
                                            borderRadius: '50%',
                                            ml: 1
                                        }} />
                                    )}
                                </ListItem>
                                {index < notifications.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                )}
            </Paper>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                    variant="text"
                    color="primary"
                    onClick={() => router.back()}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </Box>
    );
}
