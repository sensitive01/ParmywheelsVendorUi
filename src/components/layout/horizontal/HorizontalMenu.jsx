// Next Imports
import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const router = useRouter()
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const handleNewBookingClick = async e => {
    e.preventDefault()
    if (!vendorId) return

    try {
      const response = await fetch(`${API_URL}/vendor/fetchsubscription/${vendorId}`)
      const result = await response.json()

      if (response.ok && result?.vendor?.subscription === 'true') {
        router.push(`/${locale}/pages/wizard-examples/property-listing`)
      } else {
        setSubscriptionDialogOpen(true)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      setSubscriptionDialogOpen(true)
    }
  }

  const handleRenewSubscription = () => {
    setSubscriptionDialogOpen(false)
    router.push(`/${locale}/pages/currentplan`)
  }

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuItemStyles={menuItemStyles(theme, 'ri-circle-fill')}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 14),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-fill' /> }
        }}
      >
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='ri-home-smile-line' />}>
          {dictionary['navigation'].dashboards}
        </MenuItem>
        <SubMenu label={dictionary['navigation'].Bookings} icon={<i className='ri-shopping-bag-3-line' />}>
          <MenuItem onClick={handleNewBookingClick}>{dictionary['navigation'].NewBookings || 'New Bookings'}</MenuItem>
          <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>{dictionary['navigation'].Bookings}</MenuItem>
          <MenuItem href={`/${locale}/pages/subscriptionbooking`}>
            {dictionary['navigation'].SubscriptionBooking}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/transactions`}>{dictionary['navigation'].Transactions}</MenuItem>
          <MenuItem href={`/${locale}/pages/vendorpayouts`}>{dictionary['navigation'].vendorpayouts}</MenuItem>
          {/* <MenuItem href={`/${locale}/pages/vendorpayouts`}>{dictionary['navigation'].Settlements}</MenuItem> */}
        </SubMenu>
        {/* <SubMenu label='Vendor' icon={<i className='ri-smartphone-line' />}>
          <MenuItem href={`/${locale}/dashboards/vendor/requests`}>Vendor Requests</MenuItem>
          <MenuItem href={`/${locale}/dashboards/vendor/subscription`}>Vendor Subscriptions</MenuItem>
        </SubMenu> */}
        <SubMenu label='Parking' icon={<i className='ri-shopping-bag-3-line' />}>
          <MenuItem href={`/${locale}/pages/widget-examples/statistics`}>{dictionary['navigation'].slots}</MenuItem>
          <MenuItem href={`/${locale}/apps/kanban`}>{dictionary['navigation'].Charges}</MenuItem>
          <MenuItem href={`/${locale}/pages/user-profile`}>{dictionary['navigation'].ParkingProfile}</MenuItem>
          <MenuItem href={`/${locale}/pages/pricing`}>{dictionary['navigation'].AmenitiesServices}</MenuItem>
          <MenuItem href={`/${locale}/pages/onboardingprocess`}>{dictionary['navigation'].Kyc}</MenuItem>
          <MenuItem href={`/${locale}//pages/bankdetails`}>{dictionary['navigation'].BankDetails}</MenuItem>
          <MenuItem href={`/${locale}/pages/account-settings`}>{dictionary['navigation'].AccountSettings}</MenuItem>
        </SubMenu>
        <MenuItem href={`/${locale}/pages/helpandsupport`} icon={<i className='ri-calendar-line' />}>
          Help
        </MenuItem>
        <MenuItem href={`/${locale}/pages/currentplan`} icon={<i className='ri-shopping-bag-3-line' />}>
          {dictionary['navigation'].Plans}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='ri-calendar-line' />}>
          Advertise
        </MenuItem>
        {/* <SubMenu label={dictionary['navigation'].pages} icon={<i className='ri-file-list-2-line' />}>
          <MenuItem href={`/${locale}/pages/user-profile`} icon={<i className='ri-user-line' />}>
            {dictionary['navigation'].userProfile}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/account-settings`} icon={<i className='ri-user-settings-line' />}>
            {dictionary['navigation'].accountSettings}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/onboardingprocess`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].onBoardingProcess}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/bankdetails`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].bankdetails}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/helpandsupport`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].helpandsupport}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/pricing`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].pricing}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/currentplan`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].currentplan}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/vendorpayouts`} icon={<i className='ri-money-dollar-circle-line' />}>
            {dictionary['navigation'].vendorpayouts}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].widgetExamples} icon={<i className='ri-bar-chart-box-line' />}>
            <MenuItem href={`/${locale}/pages/widget-examples/statistics`}>
              {dictionary['navigation'].statistics}
            </MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale}/pages/privacy-terms`} icon={<i className='ri-shield-user-line' />}>
            {dictionary['navigation'].privacyterms}
          </MenuItem>
        </SubMenu> */}
        {/* <MenuItem href={`/${locale}/pages/notifications`} icon={<i className='ri-notification-3-line' style={{ color: '#black', fontSize: '24px' }} />} /> */}
        <MenuItem
          href={`/${locale}/pages/search`}
          icon={<i className='ri-search-line' style={{ color: '#black', fontSize: '24px' }} />}
        ></MenuItem>
      </Menu>
      <Dialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        aria-labelledby='subscription-dialog-title'
        aria-describedby='subscription-dialog-description'
      >
        <DialogTitle id='subscription-dialog-title'>Subscription Required</DialogTitle>
        <DialogContent>
          <DialogContentText id='subscription-dialog-description'>
            Currently you don't have any active subscription. Please renew to create new bookings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleRenewSubscription} variant='contained' color='primary' autoFocus>
            Renew
          </Button>
        </DialogActions>
      </Dialog>
    </HorizontalNav>
  )
}

export default HorizontalMenu
