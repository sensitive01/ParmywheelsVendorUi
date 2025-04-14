// import axios from 'axios';
// import { useState } from 'react';
// import { Grid, Button, TextField, Typography, IconButton, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
// import { Controller, useForm } from 'react-hook-form';
// import CustomIconButton from '@/@core/components/mui/IconButton';
// import ProductImage from '../apps/ecommerce/products/add/ProductImage';
// const StepAccountDetails = ({ handleNext, handlePrev }) => {
//   const [isPasswordShown, setIsPasswordShown] = useState(false);
//   const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
//   // Form Setup
//   const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
//     defaultValues: {
//       password: '',
//       confirmPassword: '',
//       image: '',
//       parkingEntries: [{ type: '', count: '' }],
//     }
//   });
//   // Watch parkingEntries to update dynamically
//   const parkingEntries = watch("parkingEntries");
//   // Password toggle functions
//   const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);
//   const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(!isConfirmPasswordShown);
//   // Handle Parking Entry Updates
// const handleAddParkingEntry = () => {
//   setValue("parkingEntries", [...parkingEntries, { type: '', count: '' }]);
// };
// const handleDeleteParkingEntry = index => {
//   setValue("parkingEntries", parkingEntries.filter((_, i) => i !== index));
// };
//   // Handle Image Change
//   const handleImageChange = (imageUrl) => {
//     setValue("image", imageUrl);
//   };
//   // Submit Form
//   const submitVendorData = (data) => {
//     console.log("Form Data:", data);
//     axios.post('/api/vendor', data)
//       .then(response => {
//         console.log("Success:", response.data);
//         handleNext();
//       })
//       .catch(error => {
//         console.error("Error submitting:", error);
//       });
//   };
//   return (
//     <>
//       <div className="mbe-5">
//         <Typography variant="h4" className="mbe-1">Account Information</Typography>
//         <Typography>Enter Vendor Account Details</Typography>
//       </div>
//       <Grid container spacing={5}>
//         {parkingEntries.map((entry, index) => (
//           <Grid key={index} item xs={12}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Controller
//                   name={`parkingEntries.${index}.type`}
//                   control={control}
//                   render={({ field }) => (
//                     <FormControl fullWidth>
//                       <InputLabel>Parking Type</InputLabel>
//                       <Select {...field} label="Parking Type">
//                         <MenuItem value="bike">Bike</MenuItem>
//                         <MenuItem value="car">Car</MenuItem>
//                         <MenuItem value="others">Others</MenuItem>
//                       </Select>
//                     </FormControl>
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <div className="flex items-center gap-6">
//                   <Controller
//                     name={`parkingEntries.${index}.count`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField fullWidth label="Parking Count" {...field} placeholder="2" />
//                     )}
//                   />
//                   <CustomIconButton onClick={() => handleDeleteParkingEntry(index)} className="min-is-fit">
//                     <i className="ri-close-line" />
//                   </CustomIconButton>
//                 </div>
//               </Grid>
//             </Grid>
//           </Grid>
//         ))}
//         <Grid item xs={12}>
//           <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<i className="ri-add-line" />}>
//             Add Another Option
//           </Button>
//         </Grid>
//         <Grid item xs={12}>
//           <ProductImage onChange={handleImageChange} />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <Controller
//             name="password"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 fullWidth
//                 label="Password"
//                 type={isPasswordShown ? 'text' : 'password'}
//                 {...field}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={handleClickShowPassword} size="small">
//                         <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <Controller
//             name="confirmPassword"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 fullWidth
//                 label="Confirm Password"
//                 type={isConfirmPasswordShown ? 'text' : 'password'}
//                 {...field}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={handleClickShowConfirmPassword} size="small">
//                         <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//               />
//             )}
//           />
//         </Grid>
//         <Grid item xs={12} className="flex justify-between">
//           <Button variant="outlined" color="secondary" onClick={handlePrev}>
//             Previous
//           </Button>
//           <Button variant="contained" color="success" onClick={handleSubmit(submitVendorData)}>
//             Register Vendor
//           </Button>
//         </Grid>
//       </Grid>
//     </>
//   );
// };
// export default StepAccountDetails;

'use client';

// MUI Imports
import { useState } from 'react';

import { Button, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment } from '@mui/material';

// Hook Imports
import { Controller, useForm } from 'react-hook-form';

import CustomIconButton from '@/@core/components/mui/IconButton';
import DirectionalIcon from '@components/DirectionalIcon'

import ProductImage from '../apps/ecommerce/products/add/ProductImage';


// StepAccountDetails Component
const StepAccountDetails = ({ handlePrev, handleNext, accountDetails, setAccountDetails }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [image, setImage] = useState(null);

  // Form Setup
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
      image: '',
      parkingEntries: [{ type: '', count: '' }],
    }
  });


  // Watch parkingEntries to update dynamically
  const parkingEntries = watch("parkingEntries");

  // Password toggle functions
  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(!isConfirmPasswordShown);

  const handleAddParkingEntry = () => {
    setAccountDetails(prevState => ({
      ...prevState,
      parkingEntries: [...prevState.parkingEntries, { type: '', count: '' }]
    }));
  };

  const handleDeleteParkingEntry = (index) => {
    setAccountDetails(prevState => ({
      ...prevState,
      parkingEntries: prevState.parkingEntries.filter((_, i) => i !== index)
    }));
  };


  // Handle Image Change
  const handleImageChange = (file) => {
    if (file instanceof File) {
      setImage(file);
      setAccountDetails((prev) => ({ ...prev, image: file }));
      console.log("Image selected:", file);
    } else {
      console.error("Invalid file type selected");
    }
  };
  
  
  // Handle change for account details fields
  const handleChange = (field, value) => {
    setAccountDetails(prev => ({ ...prev, [field]: value }));
  };

  
return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Account Information</Typography>
      <Typography variant="body2" className="mb-2">Enter Vendor Account Details</Typography>
      <Grid container spacing={2}>
        {/* Parking Entries */}
        <Grid item xs={12}>
          <Typography variant="body2" className="mb-2">Parking Entries</Typography>
          <Grid container spacing={2}> {/* Added spacing here for vertical gaps */}
            {accountDetails.parkingEntries.map((entry, index) => (
              <Grid key={index} item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`parkingEntries.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Parking Type</InputLabel>
                          <Select
                            {...field}
                            label="Parking Type"
                            onChange={(e) => {
                              field.onChange(e); // Update Controller state
                              handleChange('parkingEntries', [
                                ...accountDetails.parkingEntries.slice(0, index),
                                { ...entry, type: e.target.value },
                                ...accountDetails.parkingEntries.slice(index + 1),
                              ]);
                            }}
                          >
                            <MenuItem value="bike">Bike</MenuItem>
                            <MenuItem value="car">Car</MenuItem>
                            <MenuItem value="others">Others</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className="flex items-center gap-8">
                      <TextField
                        label="Count"
                        name={`parkingEntries.${index}.count`}
                        value={entry.count}
                        onChange={(e) => handleChange('parkingEntries', [
                          ...accountDetails.parkingEntries.slice(0, index),
                          { ...entry, count: e.target.value },
                          ...accountDetails.parkingEntries.slice(index + 1),
                        ])}
                        fullWidth
                      />
                      {index > 0 && (
                        <CustomIconButton onClick={() => handleDeleteParkingEntry(index)} className="min-is-fit">
                          <i className="ri-close-line" />
                        </CustomIconButton>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <br />
          {/* Add another Parking Entry Button */}
          <Grid item xs={12} style={{marginBottom:'20px'}} >
            <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<i className="ri-add-line" />}>
              Add Another Option
            </Button>
          </Grid>
        </Grid>

        {/* Profile Image */}
        <Grid item xs={12} style={{marginBottom:'20px'}}>
        <ProductImage onChange={(file) => handleImageChange(file)} />
        </Grid>

        <br/>
        {/* Password and Confirm Password */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Password"
            type={isPasswordShown ? 'text' : 'password'}
            value={accountDetails.password}
            onChange={(e) => handleChange('password', e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} size="small">
                    <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} style={{marginBottom:'20px'}}>
          <TextField
            label="Confirm Password"
            type={isConfirmPasswordShown ? 'text' : 'password'}
            value={accountDetails.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowConfirmPassword} size="small">
                    <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <br />
        {/* Navigation Buttons */}
        <Grid item xs={12} className="flex justify-between" >
          <Button variant="outlined" color="secondary" onClick={handlePrev} startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' />}
          >
            Previous
          </Button>
          <Button variant="contained" color="success" onClick={handleNext}>
            Register Vendor
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default StepAccountDetails;




















































