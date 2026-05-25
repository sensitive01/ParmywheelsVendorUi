'use client'

// MUI Imports
import { useRef, useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useSession } from 'next-auth/react'
import { Button } from '@mui/material'

import { getLocalizedUrl } from '@/utils/i18n'

const UserProfileHeader = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const anchorRef = useRef(null)
  const { lang: locale } = useParams()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const isAccountant = session?.user?.role === 'accountant' || (typeof window !== 'undefined' && localStorage.getItem('role') === 'accountant')
      const accountantId = session?.user?.accountantId || (typeof window !== 'undefined' && localStorage.getItem('accountantId'))
      const idToFetch = isAccountant ? accountantId : session?.user?.id

      if (!idToFetch) {
        setLoading(false)

        return
      }

      try {
        const url = isAccountant
          ? `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetch-accountant-data?id=${idToFetch}`
          : `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetch-vendor-data?id=${idToFetch}`

        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
          }
        })

        const result = await response.json()

        if (response.ok && result.data) {
          if (isAccountant) {
            setUserData({
              ...result.data,
              vendorName: result.data.accountName,
              image: result.data.vendor?.image || '/default-profile.jpg',
              address: result.data.vendor?.address || 'N/A'
            })
          } else {
            setUserData(result.data)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    const hasId = session?.user?.id || session?.user?.accountantId || (typeof window !== 'undefined' && (localStorage.getItem('vendorId') || localStorage.getItem('accountantId')))
    if (hasId) {
      fetchUserData()
    }
  }, [session])

  const handleClickUrl = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }
  }

  const isAccountant = session?.user?.role === 'accountant' || (typeof window !== 'undefined' && localStorage.getItem('role') === 'accountant')
  const localAccountName = typeof window !== 'undefined' && localStorage.getItem('accountName')
  const user = {
    ...session?.user,
    ...(userData || {}),
    name: isAccountant 
      ? (userData?.vendorName || userData?.accountName || localAccountName || session?.user?.accountName || session?.user?.name) 
      : (userData?.vendorName || session?.user?.name),
    image: userData?.image || session?.user?.image || '/default-profile.jpg'
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant='body2' align='center'>
            Loading profile data...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardMedia image={user?.image || '/default-cover.jpg'} className='bs-[250px]' />
      <CardContent className='flex justify-center flex-col items-center gap-6 md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-xl mbs-[-30px] mli-[-5px] border-[5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          <img height={120} width={120} src={user?.image || '/default-profile.jpg'} className='rounded' alt='Profile' />
        </div>
        <div className='flex is-full flex-wrap justify-start flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{user?.vendorName || user?.name || 'User Name'}</Typography>
            <div className='flex flex-wrap gap-6 gap-y-3 justify-center sm:justify-normal min-bs-[38px]'>
              <div className='flex items-center gap-2'>
                <i className='ri-map-pin-line' />
                <Typography className='font-medium'>{user?.address || 'User Address'}</Typography>
              </div>
              {user?.upiId && (
                <div className='flex items-center gap-2'>
                  <i className='ri-bank-card-line' />
                  <Typography className='font-medium'>UPI ID: {user?.upiId}</Typography>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button
          fullWidth
          variant='contained'
          color='error'
          size='small'
          endIcon={<i className='ri-pencil-line' />}
          onClick={e => handleClickUrl(e, '/pages/account-settings')}
          style={{ width: '10%' }}
        >
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
