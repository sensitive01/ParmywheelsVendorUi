'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'

// Third-party Components
import classnames from 'classnames'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const Award = () => {
  // Hooks
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const [vendorData, setVendorData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/fetch-vendor-data?id=${session.user.id}`, {
          cache: 'no-store',
          headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
          }
        })
        const result = await response.json()
        
        if (response.ok && result.data) {
          setVendorData(result.data)
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session?.user?.id) {
      fetchVendorData()
    }
  }, [session])

  const handleViewProfile = () => {
    router.push('/pages/user-profile')
  }

  if (loading) {
    return (
      <Card className='relative bs-full'>
        <CardContent>
          <Typography variant='body2' align='center'>
            Loading vendor data...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Combine session user data with fetched vendor data
  const user = {
    ...session?.user,
    ...(vendorData || {}),
    name: vendorData?.vendorName || session?.user?.name,
    image: vendorData?.image || session?.user?.image
  }

  return (
    <Card className='relative bs-full'>
      <CardContent>
        <div className='flex flex-col items-start gap-2.5'>
          <div className='flex items-center gap-3'>
            <Avatar 
              src={user?.image || '/default-profile.jpg'}
              sx={{ width: 56, height: 56 }}
              alt={user?.name}
            />
            <div>
              <Typography variant='h5'>
                Congratulations <span className='font-bold'>{user?.name || 'User'}!</span> 🎉
              </Typography>
            </div>
          </div>
          <div className='flex flex-col'>
            <Typography variant='h5' color='primary.main'>
              {vendorData?.salesAmount ? 
                `$${(vendorData.salesAmount / 1000).toFixed(1)}k` : 
                'Your Details'
              }
            </Typography>
          </div>
          <Button 
            size='small' 
            variant='contained'
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
        <img
          src='/images/cards/trophy.png'
          className={classnames('is-[106px] absolute block-end-0 inline-end-5', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </CardContent>
    </Card>
  )
}

export default Award
