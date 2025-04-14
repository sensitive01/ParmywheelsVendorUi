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
import axios from 'axios'

import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Axios for API calls

const ResetPasswordV2 = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [mobile, setMobile] = useState('')

  // Fetch mobile number from localStorage
  useEffect(() => {
    const storedMobile = localStorage.getItem('vendor-mobile')

    if (storedMobile) {
      setMobile(storedMobile)
    }
  }, [])

  const { lang: locale } = useParams()
  const { settings } = useSettings()

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vendor/change-password`, {
        mobile,
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
      {/* ...rest of the JSX code remains the same */}
    </div>
  )
}

export default ResetPasswordV2
