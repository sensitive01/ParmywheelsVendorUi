'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Button,
  Typography,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Paper,
  Grid,
  Box,
  Divider,
  Alert,
  Container,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PrivacyTermsPage = () => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const termsContainerRef = useRef(null);
  const router = useRouter();

  const handleScroll = () => {
    if (!termsContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = termsContainerRef.current;
    // Consider scrolled to bottom when within 20px of the bottom
    const isBottom = scrollHeight - scrollTop - clientHeight < 20;
    
    if (isBottom) {
      setIsScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (!termsAccepted) {
      setError('You must accept the terms and conditions to continue');
      return;
    }
    
    if (!isScrolledToBottom) {
      setError('Please read the entire agreement before accepting');
      return;
    }
    
    setError('');
    // Go back to previous page after accepting
    router.back();
  };

  const handleDecline = () => {
    // Go back to previous page if declined
    router.back();
  };

  useEffect(() => {
    const termsElement = termsContainerRef.current;
    if (termsElement) {
      termsElement.addEventListener('scroll', handleScroll);
      return () => {
        termsElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs aria-label="breadcrumb" className="mb-4">
        <Link href="/dashboard" passHref>
          <MuiLink underline="hover" color="inherit">
            Dashboard
          </MuiLink>
        </Link>
        <Typography color="text.primary">Privacy Terms</Typography>
      </Breadcrumbs>

      <Paper elevation={3} className="p-6">
        <Typography variant="h4" className="mb-4">Privacy Terms and Conditions Agreement</Typography>
        <Typography variant="body2" className="mb-4">
          By accessing or using the parking management services provided by Vayusutha Technologies LLP (the "Services"), 
          you agree to the terms and conditions outlined in this Agreement. Please read the entire agreement carefully.
        </Typography>

        {!isScrolledToBottom && (
          <Alert severity="info" className="mb-4">
            Please scroll through the entire agreement to enable the accept button
          </Alert>
        )}

        <Paper elevation={2} className="mb-4">
          <Box
            ref={termsContainerRef}
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
              p: 3,
              backgroundColor: '#fafafa'
            }}
          >
            <Typography variant="h6" gutterBottom>Privacy Terms and Conditions Agreement</Typography>
            <Typography variant="subtitle2" gutterBottom>Between Parkmywheel shall mean Vayusutha Technologies LLP ("the Company") and the Client ("the Client")</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" paragraph>
              This Privacy Terms and Conditions Agreement ("Agreement") is entered into by and between Parkmywheels shall mean Vayusutha Technologies LLP, 
              a limited liability partnership registered under the laws of [Insert Jurisdiction], with its principal office located at [Insert Address] 
              ("Vayusutha", "Company", "we", or "our"), and the Client ("Client", "you", or "your").
            </Typography>

            <Typography variant="body2" paragraph>
              By accessing or using the parking management services provided by Vayusutha Technologies LLP (the "Services"), 
              the Client agrees to the terms and conditions outlined in this Agreement. If you do not agree to the terms, 
              you should immediately discontinue use of the Services.
            </Typography>

            <Typography variant="body2" paragraph>
              Welcome to our mobile application and / or our website.
            </Typography>

            <Typography variant="body2" paragraph>
              This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable 
              and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000. 
              This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011 
              that require publishing the rules and regulations, privacy policy and Terms of Use for access or usage of website and 
              Vayusutha Technologies LLP (Parkmywheels) applications for mobile and handheld devices.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>1. Definitions (Additional)</Typography>
            <Typography variant="body2" paragraph>
              Personal Data: Any information that can be used to identify an individual, including but not limited to, name, contact information, 
              vehicle details (e.g., license plate number), payment details, and usage information.
            </Typography>
            <Typography variant="body2" paragraph>
              Data Processing: Any operation or set of operations performed on Personal Data, such as collection, storage, use, and transmission.
            </Typography>
            <Typography variant="body2" paragraph>
              Client Data: All data that the Client provides to Vayusutha or that is collected during the Client's use of the Services, 
              including Personal Data of the Client's customers, employees, or other individuals interacting with the Services.
            </Typography>
            <Typography variant="body2" paragraph>
              Service Providers: Third-party vendors or contractors engaged by Vayusutha to assist in providing the Services.
            </Typography>
            <Typography variant="body2" paragraph>
              User or User's: User means any individual or business entity/organization that legally operates in India or in other countries, 
              and uses and has the right to use the Services provided by Parkmywheels. Our Services are available only to those individuals 
              or entities who can execute legally binding contracts under the applicable law. Therefore, a User must not be a minor as per Indian Law; 
              i.e., User(s) must be at least 18 years of age to be eligible to use our Services.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>2. Acceptance of Terms (Additional)</Typography>
            <Typography variant="body2" paragraph>
              By using the Services, you acknowledge and agree to this Privacy Terms and Conditions Agreement. 
              These terms govern the collection, use, and protection of Personal Data related to your use of Vayusutha's parking management services.
            </Typography>
            <Typography variant="body2" paragraph>
              Vayusutha reserves the right to modify or amend these terms at any time. Any changes will be communicated to the Client, 
              and continued use of the Services after such changes constitutes acceptance of the updated terms.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>3. Information We Collect</Typography>
            <Typography variant="body2" paragraph>
              To provide the Services, we collect the following categories of Personal Data:
            </Typography>
            <Typography variant="body2" paragraph>
              Registration Information: Name, phone number, email address, and account details.
            </Typography>
            <Typography variant="body2" paragraph>
              Vehicle Information: Vehicle registration details (e.g., license plate number), parking session details, and location data.
            </Typography>
            <Typography variant="body2" paragraph>
              Payment Information: Credit or debit card details, transaction records.
            </Typography>
            <Typography variant="body2" paragraph>
              Usage Data: Information regarding your use of our Services, including parking location, duration, frequency of parking sessions, and preferences.
            </Typography>
            <Typography variant="body2" paragraph>
              We collect this information when you register for our Services, use the Services, or interact with us via customer support or other communication channels.
            </Typography>

            {/* Adding more sections to make the agreement longer and require scrolling */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>4. How We Use Your Information</Typography>
            <Typography variant="body2" paragraph>
              We use your personal information for the following purposes:
            </Typography>
            <Typography variant="body2" paragraph>
              Providing Services: To register you, allocate parking spaces, manage payments, and facilitate customer support.
            </Typography>
            <Typography variant="body2" paragraph>
              Billing and Payments: To process payments, issue invoices, and manage transaction history.
            </Typography>
            <Typography variant="body2" paragraph>
              Customer Support: To respond to your inquiries, provide support, and troubleshoot issues.
            </Typography>
            <Typography variant="body2" paragraph>
              Service Improvement: To analyze parking usage patterns, improve service efficiency, and enhance user experience.
            </Typography>
            <Typography variant="body2" paragraph>
              Marketing Communications: If you have opted-in, we may send you promotional communications related to our services. You can opt-out at any time.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>5. Data Sharing and Disclosure</Typography>
            <Typography variant="body2" paragraph>
              We do not sell, rent, or share your personal data with third parties except in the following circumstances:
            </Typography>
            <Typography variant="body2" paragraph>
              Service Providers: We may share data with trusted third-party service providers (e.g., payment processors, cloud services, IT support) 
              who assist us in providing the Services. These third parties are contractually obligated to protect your information and use it 
              only for the purposes for which it was provided.
            </Typography>
            <Typography variant="body2" paragraph>
              Legal Compliance: We may disclose your information if required by law or in response to a valid legal request 
              (e.g., a subpoena, court order, or government regulation).
            </Typography>
            <Typography variant="body2" paragraph>
              Business Transfers: In the event of a merger, acquisition, or sale of all or part of our business, 
              your personal data may be transferred to the new owner, subject to applicable data protection laws.
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>21. Contact Us</Typography>
            <Typography variant="body2" paragraph>
              If you have any questions or concerns regarding this Privacy Terms and Conditions Agreement, 
              or if you wish to exercise your data rights, please contact us at:
            </Typography>
            <Typography variant="body2" paragraph>
              Vayusutha Technologies LLP<br />
              No142 Sai lotus layout Channasandra Bangalore-560098<br />
              Parkmywheels3@gmail.com<br />
              Attn: Data Protection Officer
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" paragraph>
                By using our Services, you agree to the terms outlined in this Privacy Terms and Conditions Agreement.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label="I have read and accept the terms and conditions"
            />
            {error && (
              <FormHelperText error>{error}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} className="flex justify-between mt-4">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleDecline}
              startIcon={<i className="ri-close-line" />}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              disabled={!isScrolledToBottom}
              endIcon={<i className="ri-check-line" />}
            >
              Accept
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PrivacyTermsPage;
