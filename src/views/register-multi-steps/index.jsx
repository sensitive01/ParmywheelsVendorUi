'use client';

// React Imports
import { useState } from 'react';


// Next Imports
import Link from 'next/link';
import { useParams } from 'next/navigation';


// MUI Imports
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// Third-party Imports
import classnames from 'classnames';


// Component Imports
import Logo from '@components/layout/shared/Logo';
import StepperWrapper from '@core/styles/stepper';
import StepAccountDetails from './StepAccountDetails';
import StepPersonalInfo from './StepPersonalInfo';
import StepperCustomDot from '@components/stepper-dot';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n';


// Steps Configuration
const steps = [
  { title: 'Personal', subtitle: 'Enter Information' },
  { title: 'Account', subtitle: 'Account Details' }
];


// Styled Components
const Stepper = styled(MuiStepper)(({ theme }) => ({
  justifyContent: 'center',
  '& .MuiStep-root': {
    '&:first-of-type': { paddingInlineStart: 0 },
    '&:last-of-type': { paddingInlineEnd: 0 },
    [theme.breakpoints.down('md')]: { paddingInline: 0 }
  }
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL

console.log("API_URL===",API_URL);

const RegisterMultiSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [contacts, setContacts] = useState([{ id: 1, name: '', mobile: '' }]);
  const [address, setAddress] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [accountDetails, setAccountDetails] = useState({
    password: '',
    confirmPassword: '',
    parkingEntries: [{ type: '', count: '' }]
  });

  const [image, setImage] = useState(null);

  // Hooks
  const { settings } = useSettings();
  const { lang: locale } = useParams();

  // Step Navigation
  const handleNext = () => setActiveStep(activeStep + 1);
  const handlePrev = () => activeStep > 0 && setActiveStep(activeStep - 1);


  // Handle Image Change
  const handleImageChange = (file) => {
    if (file instanceof File) {
      setImage(file);
      console.log("Image selected:", file);
    } else {
      console.error("Invalid file type selected");
    }
  };


  // Submit Data to API
  const handleSubmit = async () => {
    if (!accountDetails.image) {
      alert("Please select an image.");
      
return;
    }

    const formData = new FormData();

    formData.append('vendorName', vendorName);
    formData.append('contacts', JSON.stringify(contacts));
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('address', address);
    formData.append('landmark', landmark);
    formData.append('password', accountDetails.password);
    formData.append('parkingEntries', JSON.stringify(accountDetails.parkingEntries));

    // Ensure image is appended correctly
    formData.append('image', accountDetails.image, accountDetails.image.name);
    console.log("Final FormData before submit:");

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await fetch(`${API_URL}/vendor/signup`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Registration successful!');
        window.location.href = "/";
      } else {
        alert('Registration failed!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Please try again.');
    }
  };


  // Step Content Renderer
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepPersonalInfo
            handleNext={handleNext}
            contacts={contacts}
            setContacts={setContacts}
            address={address}
            setAddress={setAddress}
            vendorName={vendorName}
            setVendorName={setVendorName}
            landmark={landmark}
            setLandmark={setLandmark}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            handleImageChange={handleImageChange}
          />
        );
      case 1:
        return (
          <StepAccountDetails
            handlePrev={handlePrev}
            handleNext={handleSubmit}
            accountDetails={accountDetails}
            setAccountDetails={setAccountDetails}
            handleImageChange={handleImageChange}
          />
        );
      default:
        return null;
    }
  };

  
return (
    <div className="flex bs-full justify-between items-center">
      <div className={classnames('flex bs-full items-center justify-center is-[450px] max-lg:hidden', {
        'border-ie': settings.skin === 'bordered'
      })}>
        <img
          src="/images/illustrations/characters/2.png"
          alt="multi-steps-character"
          className="mlb-12 bs-auto max-bs-[555px] max-is-full"
        />
      </div>
      <div className="flex flex-1 justify-center items-center bs-full bg-backgroundPaper">
        <Link href={getLocalizedUrl('/', locale)}
          className="absolute block-start-5 sm:block-start-[25px] inline-start-6 sm:inline-start-[25px]">
          <Logo />
        </Link>
        <StepperWrapper className="p-6 sm:p-8 max-is-[740px] mbs-11 sm:mbs-14 lg:mbs-0">
          <Stepper className="mbe-6 md:mbe-12" activeStep={activeStep}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel slots={{ stepIcon: StepperCustomDot }}>
                  <div className="step-label">
                    <Typography className="step-number">{`0${index + 1}`}</Typography>
                    <div>
                      <Typography className="step-title">{step.title}</Typography>
                      <Typography className="step-subtitle">{step.subtitle}</Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent()}
        </StepperWrapper>
      </div>
    </div>
  );
};

export default RegisterMultiSteps;
