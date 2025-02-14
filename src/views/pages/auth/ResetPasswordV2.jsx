'use client'
// React Imports
import { useEffect, useState } from 'react'
// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
// Third-party Imports
import classnames from 'classnames'
// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
// Axios for API calls
import axios from 'axios'

const ResetPasswordV2 = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [mobile, setMobile] = useState('')

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-3-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-reset-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-reset-password-light-border.png'
  // Fetch mobile number from localStorage
  useEffect(() => {
    const storedMobile = localStorage.getItem('vendor-mobile')
    if (storedMobile) {
      setMobile(storedMobile)
    }
  }, [])
  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown((show) => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown((show) => !show)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vendor/change-password`,  {
        mobile, // Replace with actual mobile
        password,
        confirmPassword,
      })
      setSuccessMessage('Password updated successfully!')
    } catch (err) {
      setError('Error updating password, please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered',
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[703px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute z-[-1] bottom-[4%] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography className='mbs-1'>
              Your new password must be different from previously used passwords
            </Typography>
          </div>
          {error && <Typography color='error'>{error}</Typography>}
          {successMessage && <Typography color='success'>{successMessage}</Typography>}
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              autoFocus
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label='Confirm Password'
              type={isConfirmPasswordShown ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Updating...' : 'Set New Password'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href={getLocalizedUrl('/pages/auth/login-v2', locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon
                  ltrIconClass='ri-arrow-left-s-line'
                  rtlIconClass='ri-arrow-right-s-line'
                  className='text-xl'
                />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordV2

