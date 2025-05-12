'use client'

import React, { useState, useEffect } from 'react';

import { useRouter , useParams } from 'next/navigation';
import Link from 'next/link';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import classnames from 'classnames';

import Grid from '@mui/material/Grid2';

import Logo from '@components/layout/shared/Logo';
import DirectionalIcon from '@components/DirectionalIcon';
import { useImageVariant } from '@core/hooks/useImageVariant';
import { useSettings } from '@core/hooks/useSettings';
import { getLocalizedUrl } from '@/utils/i18n';


const ForgotPasswordV2 = ({ mode }) => {
  const router = useRouter();
  const darkImg = '/images/pages/auth-v2-mask-4-dark.png';
  const lightImg = '/images/pages/auth-v2-mask-4-light.png';
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png';
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png';
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png';
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png';
  const { settings } = useSettings();
  const { lang: locale } = useParams();
  const authBackground = useImageVariant(mode, lightImg, darkImg);

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  );

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(10);

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setResendDisabled(false);
        }

        
return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpField(true);
        setAlert({ open: true, message: `OTP Sent: ${data.otp}`, severity: 'success' });
        localStorage.setItem('vendor-mobile', mobile);
        startResendCountdown();
      } else {
        setAlert({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      setAlert({ open: true, message: 'Error requesting OTP', severity: 'error' });
    }
  };

  const handleResendOtp = async () => {
    startResendCountdown();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ open: true, message: `OTP Resent: ${data.otp}`, severity: 'success' });
      } else {
        setAlert({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      setAlert({ open: true, message: 'Error resending OTP', severity: 'error' });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ open: true, message: data.message, severity: 'success' });
        router.push('/en/pages/auth/reset-password-v2');
      } else {
        setAlert({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      setAlert({ open: true, message: 'Error verifying OTP', severity: 'error' });
    }
  };

  useEffect(() => {
    if (showOtpField) {
      startResendCountdown();
    }
  }, [showOtpField]);

  return (
    <div className='flex bs-full justify-center'>
      <Snackbar
        open={alert.open}
        autoHideDuration={60000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant='filled' severity={alert.severity}>
          {alert.message}
        </MuiAlert>
      </Snackbar>
      <div
        className={classnames(
          'flex items-center justify-center bs-full flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[677px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper p-6 md:p-12 md:is-[480px]'>
        <Link href={getLocalizedUrl('/', locale)} className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:max-is-[400px]'>
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <form noValidate autoComplete='off' className='flex flex-col gap-5'>
          <TextField
  autoFocus
  fullWidth
  label="Mobile Number"
  value={mobile}
  onChange={e => {
    const input = e.target.value;
    if (/^\d{0,10}$/.test(input)) {
      setMobile(input);
    }
  }}
  inputMode="numeric"
  placeholder="Enter 10-digit mobile number"
/>  

            {showOtpField && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label='OTP'
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant='text'
                      onClick={handleResendOtp}
                      disabled={resendDisabled}
                    >
                      Resend OTP {resendDisabled ? `(${countdown}s)` : ''}
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
            <Button fullWidth variant='contained' onClick={showOtpField ? handleVerifyOtp : handleRequestOtp}>
              {showOtpField ? 'Verify OTP' : 'Request OTP'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href='/' className='flex items-center gap-1.5'>
                <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' className='text-xl' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordV2;
