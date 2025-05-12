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
import { signIn } from 'next-auth/react'
import classnames from 'classnames'


// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const Login = ({ mode }) => {
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
    console.log('Attempting login with:', { mobile, password });

    const result = await signIn("credentials", {
      redirect: false,
      mobile,
      password,
    });

    if (!result.ok) {
      setError(result.error || "Login failed");
      console.error("Login failed:", result.error);
    } else {
      // Fetch user details after login
      const user = await fetchUserDetails(mobile);

      if (user) {
        console.log("User Details:", user);


        // Ensure localStorage is only accessed in the browser
        if (typeof window !== "undefined") {
          localStorage.setItem("vendorId", user.vendorId);
          localStorage.setItem("vendorName", user.vendorName);
          localStorage.setItem("contacts", JSON.stringify(user.contacts));
          localStorage.setItem("latitude", user.latitude);
          localStorage.setItem("longitude", user.longitude);
          localStorage.setItem("address", user.address);
        }
      }

      window.location.href = "/";
    }
  };


  // Function to fetch user details (replace with actual API call)
  const fetchUserDetails = async (mobile) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUserByMobile?mobile=${mobile}`);
      const data = await response.json();

      
return data.success ? data.user : null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      
return null;
    }
  };

  console.log(process.env.NEXT_PUBLIC_API_URL);
  
return (
    <div className='flex bs-full justify-center'>
      <div className={classnames('flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden')}>
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img src='/images/illustrations/auth/v2-login-light.png' alt='character-illustration' className='max-bs-[673px] max-is-full bs-auto' />
        </div>
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Welcome to Vendor  ${themeConfig.templateName}!👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
            <Typography variant='body2' color='primary.main'>
              Mobile: <span className='font-medium'>admin@materialize.com</span> / Pass: <span className='font-medium'>admin</span>
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
      // Allow only digits and max length 10
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
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/pages/auth/register-multi-steps', locale)} color='primary.main'>
                Create an account
              </Typography>
            </div>
          </form>
          <Divider className='gap-3'></Divider>
        </div>
      </div>
    </div>
  )
}

export default Login
