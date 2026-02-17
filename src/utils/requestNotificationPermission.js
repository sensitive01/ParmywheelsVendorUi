'use client';

// Check if window is defined (client-side)
const isClient = typeof window !== 'undefined';

export const requestNotificationPermission = async () => {
  if (!isClient || !("Notification" in window)) {
    console.error("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = (title, options = {}) => {
  if (!isClient || Notification.permission !== "granted") {
    return false;
  }

  const defaultOptions = {
    icon: '/favicon.ico', // Use your site favicon or replace with your own icon
    badge: '/favicon.ico',
    vibrate: [200, 100, 200]
  };

  // For cancellations, add more noticeable vibration pattern
  if (title.toLowerCase().includes('cancelled') || options?.tag === 'status_change_cancelled') {
    defaultOptions.vibrate = [100, 50, 100, 50, 100, 50, 200];
  }

  try {
    const notification = new Notification(title, { ...defaultOptions, ...options });

    // Add click handler to focus window when notification is clicked
    notification.onclick = function () {
      window.focus();
      this.close();
    };

    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
};

// Create a notification store to simulate server events
class NotificationStore {
  constructor() {
    this.listeners = new Set();
    this.notificationHistory = [];

    // Load history from localStorage if available
    if (isClient && localStorage.getItem('notificationHistory')) {
      try {
        this.notificationHistory = JSON.parse(localStorage.getItem('notificationHistory'));
      } catch (e) {
        console.error('Failed to load notification history from localStorage', e);
      }
    }

    // Listen for storage events (cross-tab communication)
    if (isClient) {
      window.addEventListener('storage', this.handleStorageUpdate.bind(this));
    }
  }

  handleStorageUpdate(event) {
    if (event.key === 'notificationHistory' && event.newValue) {
      try {
        const newHistory = JSON.parse(event.newValue);
        const latestNotification = newHistory[0];

        // If we have a new notification that is newer than our latest known
        if (latestNotification &&
          (!this.notificationHistory[0] ||
            new Date(latestNotification.timestamp).getTime() > new Date(this.notificationHistory[0].timestamp).getTime())) {

          // Update local history
          this.notificationHistory = newHistory;

          // Notify listeners
          this.listeners.forEach(listener => listener(latestNotification));

          // Show browser notification
          const notificationTag = latestNotification.type === 'status_change' &&
            latestNotification.title?.toLowerCase().includes('cancelled') ?
            'status_change_cancelled' : latestNotification.type;

          showNotification(latestNotification.title, {
            body: latestNotification.message,
            tag: notificationTag
          });
        }
      } catch (e) {
        console.error('Error handling storage update', e);
      }
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(notification) {
    const notificationWithMeta = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Ensure unique ID
      timestamp: new Date()
    };

    // Add to history
    this.notificationHistory.unshift(notificationWithMeta);

    // Limit history size to prevent memory issues
    if (this.notificationHistory.length > 50) {
      this.notificationHistory = this.notificationHistory.slice(0, 50);
    }

    // Save to localStorage for persistence - This triggers 'storage' event in OTHER tabs
    if (isClient) {
      try {
        localStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
      } catch (e) {
        console.error('Failed to save notification history to localStorage', e);
      }
    }

    // Notify all listeners in THIS tab
    this.listeners.forEach(listener => listener(notificationWithMeta));

    // Show browser notification in THIS tab
    const notificationTag = notification.type === 'status_change' &&
      notification.title?.toLowerCase().includes('cancelled') ?
      'status_change_cancelled' : notification.type;

    showNotification(notification.title, {
      body: notification.message,
      tag: notificationTag
    });

    return notificationWithMeta;
  }

  getHistory() {
    return [...this.notificationHistory];
  }

  clearHistory() {
    this.notificationHistory = [];
    if (isClient) {
      localStorage.removeItem('notificationHistory');
    }
    return [];
  }
}

// Create a singleton instance
export const notificationStore = isClient ? new NotificationStore() : null;

// Utility function to create booking notifications
export const createBookingNotification = (booking) => {
  if (!notificationStore) return null;

  return notificationStore.notify({
    title: "New Booking Created",
    message: `New ${booking.vehicleType || 'vehicle'} booking for ${booking.vehicleNumber || 'unknown vehicle'}`,
    type: "new_booking"
  });
};

// Utility function for status change notifications
export const createStatusChangeNotification = (booking, status) => {
  if (!notificationStore) return null;

  let title, message;

  // Handle case sensitivity issues
  const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';

  switch (normalizedStatus) {
    case 'CANCELLED':
      title = "Booking Cancelled";
      message = `Booking for ${booking.vehicleNumber || 'vehicle'} has been cancelled`;
      break;
    case 'APPROVED':
      title = "Booking Approved";
      message = `Booking for ${booking.vehicleNumber || 'vehicle'} has been approved`;
      break;
    case 'COMPLETED':
      title = "Booking Completed";
      message = `Booking for ${booking.vehicleNumber || 'vehicle'} has been completed`;
      break;
    case 'PARKED':
      title = "Vehicle Parked";
      message = `Vehicle ${booking.vehicleNumber || 'vehicle'} is now parked`;
      break;
    default:
      title = "Booking Updated";
      message = `Booking status updated to ${status}`;
  }

  return notificationStore.notify({
    title,
    message,
    type: "status_change"
  });
};

// Utility function specifically for cancellation notifications
export const createCancellationNotification = (booking) => {
  if (!notificationStore) return null;

  return notificationStore.notify({
    title: "Booking Cancelled",
    message: `Booking for ${booking.vehicleNumber || 'vehicle'} has been cancelled`,
    type: "booking_cancelled"
  });
};

// New utility for scheduled subscription notifications
export const createScheduledSubscriptionNotification = (subscription) => {
  if (!notificationStore) return null;

  return notificationStore.notify({
    title: "Subscription Scheduled",
    message: `New subscription for ${subscription.vehicleNumber || 'vehicle'} scheduled to start on ${new Date(subscription.startDate).toLocaleDateString()}`,
    type: "scheduled_subscription"
  });
};

// New utility for cancelled subscription notifications
export const createCancelledSubscriptionNotification = (subscription) => {
  if (!notificationStore) return null;

  return notificationStore.notify({
    title: "Subscription Cancelled",
    message: `Subscription for ${subscription.vehicleNumber || 'vehicle'} has been cancelled`,
    type: "cancelled_subscription"
  });
};
