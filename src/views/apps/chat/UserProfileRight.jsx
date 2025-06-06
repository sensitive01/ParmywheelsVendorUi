// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSelector } from 'react-redux'

// Component Imports
import { statusObj } from './SidebarLeft'
import AvatarWithBadge from './AvatarWithBadge'

const ScrollWrapper = ({ children, isBelowLgScreen, className }) => {
  if (isBelowLgScreen) {
    return <div className={classnames('bs-full overflow-x-hidden overflow-y-auto', className)}>{children}</div>
  } else {
    return (
      <PerfectScrollbar options={{ wheelPropagation: false }} className={className}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const UserProfileRight = props => {
  // Props
  const { open, handleClose, isBelowLgScreen, isBelowSmScreen } = props

  // Get activeUser from Redux (adding logs here)
  const activeUser = useSelector(state => state.chat?.activeUser)

  // Debugging log to check the value of activeUser
  console.log('Active User:', activeUser)

  // If no user is selected, return null
  if (!activeUser || Object.keys(activeUser).length === 0) {
    console.log('No active user selected.')
    
return null
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='persistent'
      ModalProps={{ keepMounted: true }}
      sx={{
        zIndex: 12,
        '& .MuiDrawer-paper': { width: isBelowSmScreen ? '100%' : '370px', position: 'absolute', border: 0 }
      }}
    >
      <IconButton className='absolute block-start-4 inline-end-4' onClick={handleClose}>
        <i className='ri-close-line' />
      </IconButton>
      <div className='flex flex-col justify-center items-center gap-4 mbs-6 pli-5 pbs-5 pbe-1'>
        <AvatarWithBadge
          alt={activeUser.fullName || 'Unknown'}
          src={activeUser.avatar || ''}
          color={activeUser.avatarColor || 'primary'}
          badgeColor={statusObj[activeUser.status] || 'secondary'}
          className='bs-[84px] is-[84px] text-3xl'
          badgeSize={12}
        />
        <div className='text-center'>
          <Typography variant='h5'>{activeUser.fullName || 'No Name'}</Typography>
          <Typography>{activeUser.role || 'Vendor'}</Typography>
        </div>
      </div>
      <ScrollWrapper isBelowLgScreen={isBelowLgScreen} className='flex flex-col gap-6 p-5'>
        {/* About Section */}
        <div className='flex flex-col gap-1'>
          <Typography className='uppercase' color='text.disabled'>
            About
          </Typography>
          <Typography>{activeUser.about || 'No additional information available'}</Typography>
        </div>

        {/* Personal Information */}
        <div className='flex flex-col gap-1'>
          <Typography className='uppercase' color='text.disabled'>
            Personal Information
          </Typography>
          <List className='plb-0'>
            <ListItem className='p-2 gap-2'>
              <ListItemIcon>
                <i className='ri-mail-line' />
              </ListItemIcon>
              <ListItemText primary={activeUser.email || 'No email available'} />
            </ListItem>
            <ListItem className='p-2 gap-2'>
              <ListItemIcon>
                <i className='ri-phone-line' />
              </ListItemIcon>
              <ListItemText
                primary={
                  activeUser.contacts?.length > 0 ? activeUser.contacts[0].mobile : 'No contact available'
                }
              />
            </ListItem>
            <ListItem className='p-2 gap-2'>
              <ListItemIcon>
                <i className='ri-time-line' />
              </ListItemIcon>
              <ListItemText primary='Mon - Fri 10AM - 8PM' />
            </ListItem>
          </List>
        </div>

        {/* Options */}
        <div className='flex flex-col gap-1'>
          <Typography className='uppercase' color='text.disabled'>
            Options
          </Typography>
          <List className='plb-0'>
            <ListItem disablePadding>
              <ListItemButton className='p-2'>
                <ListItemIcon>
                  <i className='ri-bookmark-line' />
                </ListItemIcon>
                <ListItemText primary='Add Tag' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton className='p-2'>
                <ListItemIcon>
                  <i className='ri-user-star-line' />
                </ListItemIcon>
                <ListItemText primary='Important Contact' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton className='p-2'>
                <ListItemIcon>
                  <i className='ri-image-2-line' />
                </ListItemIcon>
                <ListItemText primary='Shared Image' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton className='p-2'>
                <ListItemIcon>
                  <i className='ri-forbid-2-line' />
                </ListItemIcon>
                <ListItemText primary='Block Contact' />
              </ListItemButton>
            </ListItem>
          </List>
        </div>

        {/* Delete Button */}
        <Button
          variant='contained'
          color='error'
          fullWidth
          className='mbs-auto'
          endIcon={<i className='ri-delete-bin-7-line' />}
        >
          Delete Contact
        </Button>
      </ScrollWrapper>
    </Drawer>
  )
}

export default UserProfileRight
