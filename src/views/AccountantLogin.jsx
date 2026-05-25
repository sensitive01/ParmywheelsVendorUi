'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { signIn, getSession } from 'next-auth/react'
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AccountantLogin = ({ mode }) => {
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log('Attempting accountant login with:', { mobile, password });

    const result = await signIn("credentials", {
      redirect: false,
      mobile,
      password,
      loginType: "accountant"
    });

    if (!result.ok) {
      setError(result.error || "Login failed");
      console.error("Accountant login failed:", result.error);
    } else {
      // Get the session details to populate localStorage
      const session = await getSession();

      if (session && session.user) {
        console.log("Accountant Session User Details:", session.user);

        // Ensure localStorage is only accessed in the browser
        if (typeof window !== "undefined") {
          localStorage.setItem("vendorId", session.user.id);
          localStorage.setItem("vendorName", session.user.name || "");
          localStorage.setItem("contacts", JSON.stringify(session.user.contacts || []));
          localStorage.setItem("latitude", session.user.latitude || "");
          localStorage.setItem("longitude", session.user.longitude || "");
          localStorage.setItem("address", session.user.address || "");
          localStorage.setItem("role", session.user.role || "accountant");
          localStorage.setItem("accountName", session.user.accountName || "");
          localStorage.setItem("accountantId", session.user.accountantId || "");
        }
      }

      window.location.href = "/";
    }
  };

  return (
    <div className='flex bs-full justify-center'>
      <div className={classnames(
        'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
        'w-full'
      )}>
        <div className='absolute inset-0 w-full h-full'>
          <img
            src='/images/illustrations/auth/final.gif'
            alt='Login animation'
            className='w-full h-full object-cover'
          />
        </div>
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div className='flex flex-col items-center mb-4'>
            <div className='mb-4 scale-550'>
              <Logo />
            </div>
            <div>
              <Typography variant='h4'>Accountant Portal</Typography>
              <Typography>Login to manage parking accounts and settlements</Typography>
            </div>
          </div>
          <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
            <Typography variant='body2' color='primary.main'>
              Login to manage <span className='font-medium'>accounts and financials</span>
            </Typography>
          </Alert>
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <div>
              <TextField
                fullWidth
                label="Mobile"
                value={mobile}
                onChange={(e) => {
                  const input = e.target.value;

                  if (/^\d{0,10}$/.test(input)) {
                    setMobile(input);
                  }
                }}
                required
                error={!!error}
                helperText={error}
                inputMode="numeric"
                placeholder="Enter 10-digit mobile number"
              />
            </div>

            <div>
              <TextField
                fullWidth
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type={isPasswordShown ? 'text' : 'password'}
                error={!!error}
                helperText={error}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} aria-label="toggle password visibility">
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
              >
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              Log In
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2 mt-2'>
              <Typography>Are you a Vendor?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/vendor', locale)} color='primary.main' className='font-medium'>
                Login as Vendor
              </Typography>
            </div>
          </form>
          <Divider className='gap-3'></Divider>
        </div>
      </div>
    </div>
  )
}

export default AccountantLogin
