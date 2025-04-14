// 'use client'

// // MUI Imports
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'

// // Component Imports
// import Form from '@components/Form'

// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'

// const ComingSoon = ({ mode }) => {
//   // Vars
//   const darkImg = '/images/pages/misc-mask-3-dark.png'
//   const lightImg = '/images/pages/misc-mask-3-light.png'

//   // Hooks
//   const miscBackground = useImageVariant(mode, lightImg, darkImg)

//   return (
//     <div className='flex flex-col items-center justify-center min-bs-[100dvh] relative is-full p-6 overflow-x-hidden'>
//       <div className='flex items-center flex-col text-center gap-10'>
//         <div className='is-[90vw] sm:is-[unset]'>
//           <div className='flex flex-col gap-2'>
//             <Typography variant='h4'>We are launching soon 🚀</Typography>
//             <Typography className='mbe-10'>
//               Our website is opening soon. Please register to get notified when it&#39;s ready!
//             </Typography>
//           </div>
//           <Form noValidate autoComplete='off'>
//             <div className='flex justify-center gap-4'>
//               <TextField autoFocus size='small' type='email' placeholder='Enter your email' className='is-[70%]' />
//               <Button type='submit' variant='contained' className='self-center'>
//                 Notify
//               </Button>
//             </div>
//           </Form>
//         </div>
//         <img
//           alt='error-illustration'
//           src='/images/illustrations/characters/5.png'
//           className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
//         />
//       </div>
//       <img src={miscBackground} className='absolute bottom-0 z-[-1] is-full max-md:hidden' />
//     </div>
//   )
// }

// export default ComingSoon

'use client'
import React, { useState } from 'react';

import { useSession } from "next-auth/react";
import { 
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Fade,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreviewBox = styled(Paper)(({ theme }) => ({
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const KycForm = () => {
  const { data: session } = useSession();
  const vendorId = session?.user?.vendorId;

  const [formData, setFormData] = useState({
    idProof: '',
    idProofNumber: '',
    addressProof: '',
    addressProofNumber: '',
  });

  const [images, setImages] = useState({
    idProofImage: null,
    addressProofImage: null,
  });

  const [previews, setPreviews] = useState({
    idProofImage: null,
    addressProofImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const idProofTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'voter_id', label: 'Voter ID' },
  ];

  const addressProofTypes = [
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'rent_agreement', label: 'Rent Agreement' },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (type, file) => {
    if (file) {
      setImages(prev => ({
        ...prev,
        [type]: file
      }));
      setPreviews(prev => ({
        ...prev,
        [type]: URL.createObjectURL(file)
      }));
    }
  };

  const removeImage = (type) => {
    setImages(prev => ({
      ...prev,
      [type]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId) {
      setError('Vendor ID not found in session');
      
return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('vendorId', vendorId);
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (images.idProofImage) {
        formDataToSend.append('idProofImage', images.idProofImage);
      }

      if (images.addressProofImage) {
        formDataToSend.append('addressProofImage', images.addressProofImage);
      }

      const response = await fetch('/api/kyc', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit KYC details');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ImageUploader = ({ type, label }) => (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <ImagePreviewBox>
        {previews[type] ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={previews[type]}
              alt={`${type} Preview`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '8px'
              }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark',
                }
              }}
              onClick={() => removeImage(type)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Button
            component="label"
            variant="text"
            startIcon={<CloudUploadIcon />}
          >
            Upload {label}
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => handleImageChange(type, e.target.files[0])}
              accept="image/*"
            />
          </Button>
        )}
      </ImagePreviewBox>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            KYC Details Form
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={3}>
              <TextField
                select
                label="ID Proof Type"
                name="idProof"
                value={formData.idProof}
                onChange={handleInputChange}
                fullWidth
                required
              >
                {idProofTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="ID Proof Number"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleInputChange}
                fullWidth
                required
              />

              <TextField
                select
                label="Address Proof Type"
                name="addressProof"
                value={formData.addressProof}
                onChange={handleInputChange}
                fullWidth
                required
              >
                {addressProofTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Address Proof Number"
                name="addressProofNumber"
                value={formData.addressProofNumber}
                onChange={handleInputChange}
                fullWidth
                required
              />

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
              }}>
                <ImageUploader type="idProofImage" label="ID Proof Image" />
                <ImageUploader type="addressProofImage" label="Address Proof Image" />
              </Box>

              {error && (
                <Fade in={true}>
                  <Alert severity="error">{error}</Alert>
                </Fade>
              )}

              {success && (
                <Fade in={true}>
                  <Alert severity="success">KYC details submitted successfully!</Alert>
                </Fade>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Submitting...' : 'Submit KYC Details'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KycForm;
