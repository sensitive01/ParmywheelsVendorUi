// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import TwoFactorAuth from '@components/dialogs/two-factor-auth'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const DialogAuthentication = () => {
  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Show'
  }

  return (
    <Card>
      <CardContent className='flex flex-col items-center text-center gap-4'>
        <i className='ri-lock-line text-[28px] text-textPrimary' />
        <Typography variant='h5'>Two Factor Authentication</Typography>
        <Typography color='text.primary'>
          Enhance your application security by enabling two factor authentication.
        </Typography>
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
      </CardContent>
    </Card>
  )
}

export default DialogAuthentication


