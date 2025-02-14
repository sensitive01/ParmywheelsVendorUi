'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Button } from '@mui/material'
const UserProfileHeader = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const anchorRef = useRef(null)
  const { lang: locale } = useParams()
  // Extract user details from the session
  const user = session?.user
  const handleClickUrl = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }
    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }
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
            <Typography variant='h4'>{user?.name || 'User Name'}</Typography>
            <div className='flex flex-wrap gap-6 gap-y-3 justify-center sm:justify-normal min-bs-[38px]'>
              <div className='flex items-center gap-2'>
                <i className='ri-map-pin-line' />
                <Typography className='font-medium'>{user?.address || 'User Address'}</Typography>
              </div>
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
