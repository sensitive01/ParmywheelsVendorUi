// Component Imports
import AccountantLogin from '@views/AccountantLogin'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Accountant Login',
  description: 'Login to your accountant account'
}

const AccountantLoginPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <AccountantLogin mode={mode} />
}

export default AccountantLoginPage
