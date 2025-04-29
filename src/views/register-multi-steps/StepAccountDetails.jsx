'use client';

import { useState } from 'react';
import {
  Button, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem,
  IconButton, InputAdornment, FormControlLabel, FormHelperText, Checkbox
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import CustomIconButton from '@/@core/components/mui/IconButton';
import DirectionalIcon from '@components/DirectionalIcon';
import ProductImage from '../apps/ecommerce/products/add/ProductImage';

const StepAccountDetails = ({ handlePrev, handleNext, accountDetails, setAccountDetails }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [image, setImage] = useState(null);
  const [termsError, setTermsError] = useState('');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
      image: '',
      parkingEntries: [{ type: '', count: '' }],
      termsAccepted: false
    }
  });

  const parkingEntries = accountDetails.parkingEntries || [{ type: '', count: '' }];
  const allTypes = ['Bikes', 'Cars', 'Others'];

  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(!isConfirmPasswordShown);

  const handleAddParkingEntry = () => {
    setAccountDetails(prevState => ({
      ...prevState,
      parkingEntries: [...prevState.parkingEntries, { type: '', count: '' }]
    }));
  };

  const handleDeleteParkingEntry = (index) => {
    setAccountDetails(prevState => {
      const updatedEntries = prevState.parkingEntries.filter((_, i) => i !== index);
      return { ...prevState, parkingEntries: updatedEntries };
    });
  };

  const handleImageChange = (file) => {
    if (file instanceof File) {
      setImage(file);
      setAccountDetails(prev => ({ ...prev, image: file }));
    } else {
      console.error("Invalid file type selected");
    }
  };

  const handleChange = (field, value) => {
    setAccountDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterVendor = () => {
    if (!accountDetails.termsAccepted) {
      setTermsError('You must accept the terms and conditions to register');
      return;
    }
    setTermsError('');
    handleNext();
  };

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Account Information</Typography>
      <Typography variant="body2" className="mb-2">Enter Vendor Account Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2" className="mb-2">Parking Entries</Typography>
          <Grid container spacing={2}>
            {parkingEntries.map((entry, index) => {
              const selectedTypes = parkingEntries.map(p => p.type).filter((_, i) => i !== index);
              const availableTypes = allTypes.filter(type => !selectedTypes.includes(type));

              return (
                <Grid key={index} item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Parking Type</InputLabel>
                        <Select
                          label="Parking Type"
                          value={entry.type}
                          onChange={(e) => {
                            const updated = [...parkingEntries];
                            updated[index].type = e.target.value;
                            handleChange('parkingEntries', updated);
                          }}
                        >
                          {availableTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div className="flex items-center gap-8">
                        <TextField
                          label="Count"
                          value={entry.count}
                          onChange={(e) => {
                            const updated = [...parkingEntries];
                            updated[index].count = e.target.value;
                            handleChange('parkingEntries', updated);
                          }}
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
              );
            })}
          </Grid>
          <br />
          <Grid item xs={12} style={{ marginBottom: '20px' }}>
            <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<i className="ri-add-line" />}>
              Add Another Option
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ marginBottom: '20px' }}>
          <ProductImage onChange={handleImageChange} />
        </Grid>
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
        <Grid item xs={12} sm={6} style={{ marginBottom: '20px' }}>
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
        <Grid item xs={12} style={{ marginBottom: '20px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={accountDetails.termsAccepted || false}
                onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                color="primary"
              />
            }
            label="I agree to the terms and conditions"
          />
          {termsError && (
            <FormHelperText error>{termsError}</FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} className="flex justify-between">
          <Button
            variant="outlined"
            color="secondary"
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' />}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleRegisterVendor}
          >
            Register Vendor
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default StepAccountDetails;
