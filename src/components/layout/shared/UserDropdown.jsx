'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = ({ dictionary }) => {
  // States
  const [open, setOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  useEffect(() => {
    const fetchUserData = async () => {
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
          setUserData(result.data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
    } catch (error) {
      console.error(error)
    }
  }

  // Merge session user data with fetched user data
  const user = {
    ...session?.user,
    ...(userData || {}),
    image: userData?.image || session?.user?.image || '/default-profile.jpg'
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <div 
          ref={anchorRef}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px] rounded-full overflow-hidden border-2 border-white'
        >
          <img 
            src={user.image} 
            alt={user.name || ''}
            className='w-full h-full object-cover'
            width={38}
            height={38}
          />
        </div>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <div className='rounded-full overflow-hidden bs-[40px] is-[40px] border-2 border-white'>
                      <img 
                        src={user.image} 
                        alt={user.name || ''}
                        className='w-full h-full object-cover'
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {user.vendorName || user.name || ''}
                      </Typography>
                      <Typography variant='caption'>{user.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem 
                    className='gap-3 pli-4' 
                    onClick={e => handleDropdownClose(e, `/${locale}/pages/account-settings`)}
                  >
                    <i className='ri-user-settings-line' />
                    <Typography color='text.primary'>
                      {dictionary?.navigation?.accountSettings || 'Account Settings'}
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    className='gap-3 pli-4' 
                    onClick={e => handleDropdownClose(e, `/${locale}/pages/notifications`)}
                  >
                    <i className='ri-notification-3-line' style={{ color: 'black', fontSize: '1.25rem' }} />
                    <Typography color='text.primary'>
                      {dictionary?.navigation?.notifications || 'Notifications'}
                    </Typography>
                  </MenuItem>
                  <Divider className='mlb-1' />
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      {dictionary?.navigation?.logout || 'Logout'}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
