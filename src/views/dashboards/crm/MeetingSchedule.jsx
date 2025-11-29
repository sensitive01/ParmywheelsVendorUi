import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

// Components Imports
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';

// Format date from DD/MM/YYYY HH:mm to a more readable format
const formatDate = (dateString) => {
  if (!dateString) return 'No date';

  try {
    // Parse the date string
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];

    // Create a date object
    const date = new Date(year, month - 1, day, hours, minutes);

    // Format the date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const MeetingSchedule = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const vendorId = session?.user?.id;

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!vendorId) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchmeetingsbyvendorid/${vendorId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );

        if (response.data && Array.isArray(response.data.meetings)) {
          setMeetings(response.data.meetings);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [vendorId]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchmeetingsbyvendorid/${vendorId}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      if (response.data && Array.isArray(response.data.meetings)) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error refreshing meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title='Meeting Schedule'
        action={
          <OptionMenu
            options={[
              { text: 'Refresh', menuItemProps: { onClick: handleRefresh } },
              'Share',
              'Reschedule'
            ]}
          />
        }
      />
      <CardContent className='flex flex-col gap-6'>
        {meetings.length > 0 ? (
          meetings.map((meeting, index) => (
            <div key={meeting._id || index} className='flex items-center gap-4'>
              <CustomAvatar
                variant='rounded'
                size={38}
                color="primary"
                skin="light"
              >
                {meeting.name ? meeting.name.charAt(0).toUpperCase() : 'M'}
              </CustomAvatar>
              <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-0.5'>
                  <Typography color='text.primary' className='font-medium'>
                    {meeting.name || 'No Name'}
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='ri-calendar-line text-base text-textSecondary' />
                    <Typography variant='body2'>
                      {meeting.callbackTime ? formatDate(meeting.callbackTime) : 'No date'}
                    </Typography>
                  </div>
                </div>
                <Chip
                  label={meeting.department || 'General'}
                  color="primary"
                  size='small'
                  variant='tonal'
                />
              </div>
            </div>
          ))
        ) : (
          <Typography variant="body2" className="text-center py-4">
            No upcoming meetings scheduled
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingSchedule
