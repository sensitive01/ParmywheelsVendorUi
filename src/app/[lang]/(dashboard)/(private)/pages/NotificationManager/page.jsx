'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { requestNotificationPermission } from '@/utils/requestNotificationPermission';


const NotificationManager = () => {
  const { data: session } = useSession();

  useEffect(() => {
    // Initialize notification permissions when the app loads
    const initNotifications = async () => {
      await requestNotificationPermission();
    };

    if (session?.user) {
      initNotifications();
    }
  }, [session]);

  // This is a utility component that doesn't render anything
  return null;
};

export default NotificationManager;
