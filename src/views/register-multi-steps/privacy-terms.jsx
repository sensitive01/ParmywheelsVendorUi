'use client';

import { useRouter } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const TermsAndConditionsPage = () => {
  const router = useRouter();

//   const handleBack = () => {
//     router.back();
//   };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxHeight: '80vh', 
          overflow: 'auto',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Privacy Terms and Conditions Agreement
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
          Between Parkmywheel shall mean Vayusutha Technologies LLP ("the Company") and the Client ("the Client")
        </Typography>
        
        <Typography paragraph>
          This Privacy Terms and Conditions Agreement ("Agreement") is entered into by and between Parkmywheels shall mean
          Vayusutha Technologies LLP, a limited liability partnership registered under the laws of [Insert Jurisdiction], with its principal
          office located at [Insert Address] ("Vayusutha", "Company", "we", or "our"), and the Client ("Client", "you", or "your").
        </Typography>

        <Typography paragraph>
          By accessing or using the parking management services provided by Vayusutha Technologies LLP (the "Services"), the Client
          agrees to the terms and conditions outlined in this Agreement. If you do not agree to the terms, you should immediately
          discontinue use of the Services.
        </Typography>

        <Typography paragraph>
          Welcome to our mobile application and / or our website.
        </Typography>

        <Typography paragraph>
          This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable and the
          amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000.
          This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries
          guidelines) Rules, 2011 that require publishing the rules and regulations, privacy policy and Terms of Use for access or usage
          of website and Vayusutha Technologies LLP (Parkmywheels) applications for mobile and handheld devices.
        </Typography>

        <Typography paragraph>
          These Terms of Use may be modified from time to time in our sole discretion. It is your responsibility to review these Terms and
          Conditions from time to time. If you continue to use the Service after notice of change has been intimated or published on our
          Website/Application, you thereby provide your consent to the changed practices on the same terms hereof. For this reason, we
          encourage you to review these Terms of Use each time you access and use the Website/Application. Most content and some
          of the features on the Website/Application are made available to Users free of charge. However, Park reserves the right to
          terminate access to certain areas or features of the Website/Application at any time for any reason, with or without notice.
        </Typography>

        <Typography paragraph>
          If you are not agreeable to these Terms of Use, you may not use the Services, the Website or the Application.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          1. Definitions (Additional)
        </Typography>
        <Typography paragraph>
          Personal Data: Any information that can be used to identify an individual, including but not limited to, name, contact information, vehicle details (e.g., license plate number), payment details, and usage information.
        </Typography>
        <Typography paragraph>
          Data Processing: Any operation or set of operations performed on Personal Data, such as collection, storage, use, and transmission.
        </Typography>
        <Typography paragraph>
          Client Data: All data that the Client provides to Vayusutha or that is collected during the Client's use of the Services, including Personal Data of the Client's customers, employees, or other individuals interacting with the Services.
        </Typography>
        <Typography paragraph>
          Service Providers: Third-party vendors or contractors engaged by Vayusutha to assist in providing the Services.
        </Typography>
        <Typography paragraph>
          User or User's: User means any individual or business entity/organization that legally operates in India or in other countries, and uses and has the right to use the Services provided by Parkmywheels. Our Services are available only to those individuals or entities who can execute legally binding contracts under the applicable law. Therefore, a User must not be a minor as per Indian Law; i.e., User(s) must be at least 18 years of age to be eligible to use our Services.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          2. Acceptance of Terms (Additional)
        </Typography>
        <Typography paragraph>
          By using the Services, you acknowledge and agree to this Privacy Terms and Conditions Agreement. These terms govern the collection, use, and protection of Personal Data related to your use of Vayusutha's parking management services.
        </Typography>
        <Typography paragraph>
          Vayusutha reserves the right to modify or amend these terms at any time. Any changes will be communicated to the Client, and continued use of the Services after such changes constitutes acceptance of the updated terms.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          3. Information We Collect
        </Typography>
        <Typography paragraph>
          To provide the Services, we collect the following categories of Personal Data:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Registration Information: Name, phone number, email address, and account details." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Vehicle Information: Vehicle registration details (e.g., license plate number), parking session details, and location data." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Payment Information: Credit or debit card details, transaction records." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Usage Data: Information regarding your use of our Services, including parking location, duration, frequency of parking sessions, and preferences." />
          </ListItem>
        </List>
        <Typography paragraph>
          We collect this information when you register for our Services, use the Services, or interact with us via customer support or other communication channels.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          4. How We Use Your Information
        </Typography>
        <Typography paragraph>
          We use your personal information for the following purposes:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Providing Services: To register you, allocate parking spaces, manage payments, and facilitate customer support." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Billing and Payments: To process payments, issue invoices, and manage transaction history." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Customer Support: To respond to your inquiries, provide support, and troubleshoot issues." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Service Improvement: To analyze parking usage patterns, improve service efficiency, and enhance user experience." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Marketing Communications: If you have opted-in, we may send you promotional communications related to our services. You can opt-out at any time." />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          5. Data Sharing and Disclosure
        </Typography>
        <Typography paragraph>
          We do not sell, rent, or share your personal data with third parties except in the following circumstances:
        </Typography>
        <Typography paragraph>
          <strong>Service Providers:</strong> We may share data with trusted third-party service providers (e.g., payment processors, cloud services, IT support) who assist us in providing the Services. These third parties are contractually obligated to protect your information and use it only for the purposes for which it was provided.
        </Typography>
        <Typography paragraph>
          <strong>Legal Compliance:</strong> We may disclose your information if required by law or in response to a valid legal request (e.g., a subpoena, court order, or government regulation).
        </Typography>
        <Typography paragraph>
          <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or part of our business, your personal data may be transferred to the new owner, subject to applicable data protection laws.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          6. Data Security
        </Typography>
        <Typography paragraph>
          We take reasonable steps to protect the personal data you provide us through technical and organizational measures, including:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Encryption: Personal data is transmitted over secure channels using encryption technology." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Access Control: We limit access to your personal data to authorized employees and third-party vendors who need to know the information to perform their duties." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Regular Audits: We regularly monitor and audit our data security practices to ensure compliance with industry standards." />
          </ListItem>
        </List>
        <Typography paragraph>
          However, please note that no data transmission over the internet is entirely secure, and we cannot guarantee the security of your data transmitted to our Services.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          7. Data Retention
        </Typography>
        <Typography paragraph>
          We retain your personal data only as long as necessary to fulfill the purposes for which it was collected or as required by law. Once your data is no longer needed, it will be securely deleted or anonymized.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          8. Your Rights and Choices
        </Typography>
        <Typography paragraph>
          As a user, you have the following rights regarding your personal data:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Access: You have the right to request a copy of the personal data we hold about you." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Correction: You can request that we correct or update any inaccurate or incomplete information." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Deletion: You can request that we delete your personal data, subject to applicable legal obligations." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Objection: You can object to certain processing activities, such as direct marketing." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Data Portability: You can request your personal data in a structured, machine-readable format." />
          </ListItem>
        </List>
        <Typography paragraph>
          To exercise these rights, please contact us at the contact details provided below.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          9. Cookies and Tracking Technologies
        </Typography>
        <Typography paragraph>
          We may use cookies and other tracking technologies to enhance your experience with our Services. These technologies help us:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Remember your preferences." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Track usage statistics and analytics to improve the Services." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Provide relevant content or advertisements." />
          </ListItem>
        </List>
        <Typography paragraph>
          You can manage your cookie preferences through your browser settings, but please note that disabling cookies may affect the functionality of certain features of our Services.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          10. Third-Party Links
        </Typography>
        <Typography paragraph>
          Our Services may contain links to third-party websites or services that are not operated by us. We are not responsible for the content, privacy practices, or security of these third-party websites. We encourage you to review their privacy policies before providing any personal information.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          11. Changes to This Agreement
        </Typography>
        <Typography paragraph>
          We may update these Privacy Terms and Conditions from time to time to reflect changes in our practices, legal requirements, or new features of our Services. When we update this Agreement, we will revise the "Effective Date" at the top of this document. We will notify you of any significant changes by posting an updated version of this Agreement or by other means as appropriate.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          12. Governing Law and Dispute Resolution
        </Typography>
        <Typography paragraph>
          The courts of Bengaluru, India shall have the sole and exclusive jurisdiction in respect of any matters arising from the use of the Services offered by Parkmywheels or the Terms of Use or any arrangement between Parkmywheels and the User.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          13. Contact Us
        </Typography>
        <Typography paragraph>
          If you have any questions or concerns regarding this Privacy Terms and Conditions Agreement, or if you wish to exercise your data rights, please contact us at:
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          14. USER ELIGIBILITY AND AGREEMENT
        </Typography>
        <Typography paragraph>
          User means any individual or business entity/organization that legally operates in India or in other countries, and uses and has the right to use the Services provided by Parkmywheels. Our Services are available only to those individuals or entities who can execute legally binding contracts under the applicable law. Therefore, a User must not be a minor as per Indian Law; i.e. User(s) must be at least 18 years of age to be eligible to use our Services.
        </Typography>
        <Typography paragraph>
          Parkmywheels advises its Users that while accessing the Website/Application, they must follow/abide by the applicable laws. Parkmywheels may, in its sole discretion, refuse the Service to anyone at any time.
        </Typography>
        <Typography paragraph>
          This Agreement applies to all Services offered on the Website/Application, collectively with any additional terms and condition that may be applicable.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          15. REPRESENTATIONS AND WARRANTIES
        </Typography>
        <Typography paragraph>
          As a precondition to your use of the Services, you represent and warrant that:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="The information you provide to Parkmywheels is accurate and complete. Parkmywheels service is only available for private cars for non-commercial purposes within the city limits as designated on our Website. Private cars for non-commercial purposes bear license plates with black lettering over white colored background (Commercial vehicles have license plates with black lettering over yellow colored background). You will ensure that Parkmywheels service is being utilized only for non-commercial purposes in a private car. Parkmywheels is entitled, at all times, to verify the information that you have provided and to refuse the Service or use of the Application / Website without providing reasons." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You will only access the Service using authorized means. You are responsible to check and ensure you download the correct Application for your device or the correct Website in your computer. Parkmywheels shall not be liable if you do not have a compatible mobile device or if you download the wrong version of the Application for your mobile device or Website for the computer. Parkmywheels reserves the right to terminate the Service and the use of the Application/ Website should you use the Service or Application with an incompatible or unauthorized device." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You have the legal right and authority to possess and operate the vehicle when engaging our Services and you confirm, represent and warrant that the said vehicle is in good operating condition and meets the industry safety standards and all applicable statutory requirements for a motor vehicle of its kind." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You will be solely responsible for any and all liability which results from or is alleged as a result of the condition of your vehicle, legal compliance, etc., including, but not limited to, personal injuries, death and property damages." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You will be solely responsible for the full functionality of your vehicle. If your vehicle fails to function (electrical, mechanical or other) in any way while the Services are being availed of by you, you will be responsible for all storage fees, roadside assistance, alternate transportation and repair of any kind and neither Vayusutha Technologies/ Parkmywheels shall be responsible in any manner whatsoever." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You are named or scheduled on the insurance policy covering the vehicle you use when engaging our Services. You have a valid policy of liability insurance (in coverage amounts consistent with all applicable legal requirements) for the operation of your vehicle to cover any anticipated losses related to your participation in the Services or the operation of your vehicle. In the event of a motor vehicle accident you will be solely responsible for compliance with any applicable statutory or department of motor vehicles requirements and for all necessary contacts with your insurance provider. You will be solely responsible for all consequences arising out of the use of the Service. In any event Parkmywheels shall have no responsibility or liability on this account whatsoever." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You specifically authorize us to use, store or otherwise process your 'Sensitive personal data or information' (as such term is defined in Information Technology (Reasonable security practices and procedures and sensitive personal data or information) Rules, 2011) in order to provide the Services to you. Subject to applicable law all information provided to us by you shall be deemed to be our information to use as we desire." />
          </ListItem>
          <ListItem>
            <ListItemText primary="You will obey all applicable laws related to the matters set forth herein and will be solely responsible for any violations of the same." />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          16. LIMITATION OF LIABILITY:
        </Typography>
        <Typography paragraph>
          The information, recommendations and/or Services provided to you on or through the Website/Application are for general information purposes only and do not constitute advice. Parkmywheels will take reasonable steps to keep the Website/Application and its contents correct and up to date but does not guarantee that the contents of the Website/Application are free of errors, defects, malware and viruses or that the Website/Application are correct, up to date and accurate.
        </Typography>
        <Typography paragraph>
          Parkmywheels shall not be liable for any damages resulting from the use of, or inability to use, the Website/Application, including damages caused by malware, viruses or any incorrectness or incompleteness of the information on the Website/Application.
        </Typography>
        <Typography paragraph>
          Parkmywheels shall further not be liable for damages resulting from the use of, or the inability to use, electronic means of communication with the Website/Application, including — but not limited to — damages resulting from failure or delay in delivery of electronic communications, interception or manipulation of electronic communications by third parties or by computer programs used for electronic communications and transmission of viruses.
        </Typography>
        <Typography paragraph>
          Without prejudice to the foregoing, and insofar as allowed under mandatory applicable law, Parkmywheels's aggregate liability shall in no event exceed the equivalent of the amount for the payment of the Services.
        </Typography>
        <Typography paragraph>
          The quality of the Services requested through the use of the Application is entirely the responsibility of the Owner who ultimately provides such transportation services to you. Parkmywheels under no circumstance accepts liability in connection with and/or arising from the Services provided or any acts, actions, behaviour, conduct, and/or negligence on the part of the User.
        </Typography>
        <Typography paragraph>
          We shall not be held liable for any failure or delay in performing Services where such failure arises as a result of any act or omission, which is outside our reasonable control such as unprecedented circumstances, overwhelming and unpreventable events caused directly and exclusively by forces of nature that can be neither anticipated, nor controlled, nor prevented by the exercise of prudence, diligence, and care, including but not limited to: war, riot, civil commotion; compliance with any law or governmental order, rule, regulation or direction and acts of third parties ( "Force Majeure" ).
        </Typography>
        <Typography paragraph>
          If we have contracted to provide identical or similar Service to more than one User and are prevented from fully meeting our obligations to you by reason of an event of Force Majeure, we may decide at our absolute discretion which booking we will fulfill by providing the Service, and to what extent.
        </Typography>
        <Typography paragraph>
          We have taken all reasonable steps to prevent internet fraud and ensure any data collected from you is stored as securely and safely as possible. However, we shall not be held liable in the unlikely event of a breach in our secure computer servers or those of third parties other than as required under applicable law.
        </Typography>
        <Typography paragraph>
          In the event we have a reasonable belief that there exists an abuse of vouchers and/or discount codes or suspect an instance of fraud, we may cause the User to be blocked immediately and reserve the right to refuse future Service. Additionally, should there exist an abuse of vouchers or discount codes, Parkmywheels reserves the right to seek compensation from any and all such Users.
        </Typography>
        <Typography paragraph>
          Parkmywheels does not represent or endorse the accuracy or reliability of any information, or advertisements (collectively, the "Content") contained on, distributed through, or linked, downloaded or accessed from or contained on the Website/Application, or the quality of any products, information or other materials displayed, or obtained by you as a result of an advertisement or any other information or offer in or in connection with the Service.
        </Typography>
        <Typography paragraph>
          Offers are subject to Parkmywheels's discretion and may be withdrawn at any time and without notice.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          17. INTELLECTUAL PROPERTY RIGHTS:
        </Typography>
        <Typography paragraph>
          Parkmywheels is the sole owner or lawful licensee of all the rights to the Website/Application and its content. Website/Application content means its design, layout, text, images, graphics, sound, video etc. The Website/Application content embodies trade secrets and intellectual property rights protected under worldwide copyright and other laws. All title, ownership and intellectual property rights in the Website/Application and its content shall remain with Parkmywheels.
        </Typography>
        <Typography paragraph>
          All rights, not otherwise claimed under this Agreement or in the Website /Application, are hereby reserved. The information contained in this Website/Application is intended, solely to provide general information for the personal use of the reader, who accepts full responsibility for its use.
        </Typography>
        <Typography paragraph>
          You may access the Website/Application, avail of the features, facilities and Services for your personal or internal requirements only. You are not entitled to duplicate, distribute, create derivative works of, display, or commercially exploit the Website/Application Content, features or facilities, directly or indirectly, without our prior written permission of Parkmywheels.
        </Typography>
        <Typography paragraph>
          Copyright
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          18. TERMINATION:
        </Typography>
        <Typography paragraph>
          Parkmywheels reserves the right to deny access to particular Users to any/all of its Services without any prior notice/explanation in order to protect the interests of Parkmywheels and/or other Users to the Website/Application. Parkmywheels reserves the right to limit, deny or create different access to the Website/Application and its features with respect to different Users.
        </Typography>
        <Typography paragraph>
          We reserve the right to terminate your account or your access to the Website/Application immediately, with or without notice to you, and without liability: (i) if you have violated any of the Terms of Use; (ii) if you have furnished us with false or misleading information; (iii) pursuant to requests by law enforcement or other government agencies; (iv) in case of unexpected technical or security issues or problems; (v) in case of discontinuance or material modification to the Services (or any part thereof); and / or (vi) in case of interference with use of our Website/Application by others.
        </Typography>
        <Typography paragraph>
          In the event of termination by you or us, your account will be disabled and you will not be granted access to your account or any information or content contained in your account. You will not and not attempt to create another account for accessing and using the Website/Application without the written consent of Parkmywheels.
        </Typography>
        <Typography paragraph>
          This Terms of Use shall remain in full force and effect while you have an account with us. Even after termination of your account with us, certain provisions of this Terms of Use will remain in effect, including but not limited to, Intellectual Property Rights, Prohibited Uses and Indemnification. You agree that we will not be liable to you or any third party for taking any of these actions.
        </Typography>
        <Typography paragraph>
          Notwithstanding the termination of this Agreement, you shall continue to be bound by the terms of this Agreement in respect of your prior use of this Website/Application and all matters connected with, relating to or arising from such use.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          19. TERMS & CONDITIONS FOR USE OF SERVICES:
        </Typography>
        <Typography paragraph>
          The following terms & conditions shall apply to Users utilising the Services offered by Parkmywheels:
        </Typography>
        <Typography paragraph>
          The Owner shall pay the parking fare (as displayed in the Parkmywheels App) or as agreed to in the terms of use as listed on the Application / Website, parking charges, additional night surcharge (where applicable), one way trips, toll charges and any fee or levy presently payable or hereinafter imposed by the law or required to be paid for availing of the Services.
        </Typography>
        <Typography paragraph>
          The User agrees and accepts that the use of the Services provided by Parkmywheels is at the sole risk of the User, and further acknowledges that Parkmywheels disclaims all representations and warranties of any kind, whether express or implied. All Services are provided "AS IS".
        </Typography>
        <Typography paragraph>
          The Parkmywheels or the User has the right to refuse the Service in the following circumstances:
        </Typography>
        <Typography paragraph>
          if the User is found to be in an intoxicated state or is found misbehaving or is causing a nuisance;
        </Typography>
        <Typography paragraph>
          Without prejudice to the above, Parkmywheels makes no representation or warranty that:
        </Typography>
        <Typography paragraph>
          the Services will meet the User's requirements; and the Services will be uninterrupted, timely, secure, or error-free.
        </Typography>
        <Typography paragraph>
          The information on this Website/Application is provided "AS IS" with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose. Nothing herein shall to any extent substitute for the independent investigations and the sound technical and business judgment of the Users. In no event shall Parkmywheels be liable for any direct, indirect, incidental, punitive, or consequential damages of any kind whatsoever with respect to the Service. Users of this site must hereby acknowledge that any reliance upon any content shall be at their sole risk.
        </Typography>
        <Typography paragraph>
          Parkmywheels is hereby authorized to use the location-based information provided by any of the telecommunication companies when the User uses the mobile phone to make a booking.
        </Typography>
        <Typography paragraph>
          The location-based information will be used only to facilitate and improve the probability of locating a parking place for the User.
        </Typography>
        <Typography paragraph>
          Parkmywheels shall be entitled to disclose to any government body the particulars of the User in the possession, in its absolute discretion.
        </Typography>
        <Typography paragraph>
          Parkmywheels shall be entitled at any time without giving any reason to terminate the booking of Parking done by the User.
        </Typography>
        <Typography paragraph>
          If the User has any complaints in respect of the Services, the User has to inform Parkmywheels of the same in writing within 24 hours of using the Services.
        </Typography>
        <Typography paragraph>
          Parkmywheels shall not be liable for any conduct of the users.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          20. INDEMNITY
        </Typography>
        <Typography paragraph>
          The User shall defend, indemnify and hold, Parkmywheels, its affiliates, its licensors, and each of their officers, directors, other users, employees, attorneys and agents, harmless, from and against any and all claims, costs, damages, losses, liabilities and expenses (including attorneys' fees and costs) arising out of or in connection with the:
        </Typography>
        <Typography paragraph>
          violation or breach of the Terms of Use or any applicable law or regulation, whether or not referenced herein; violation of any rights of any third party, including the user via the Application and or the Website; and use or misuse of the Application/Website or Service.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
          21. MISCELLANEOUS
        </Typography>
        <Typography paragraph>
          The information contained in the Website/Application is for general information purposes only. The information is provided by Parkmywheels and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the Website/Application or the information, products, services, or related graphics contained on the Website/Application for any purpose. Any reliance you place on such information is, therefore, strictly at your own risk.
        </Typography>
        <Typography paragraph>
          In no event will we be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this Website/Application or Service.
        </Typography>
        <Typography paragraph>
          Every effort is made to keep the Website/Application up and running smoothly. However, Parkmywheels takes no responsibility for, and will not be liable for, the Website/Application being unavailable due to technical issues beyond our control.
        </Typography>
        <Typography paragraph>
          The above mentioned Terms of Use and the Privacy Policy constitute the entire agreement between the User and Parkmywheels with respect to access to and use of the Website/ Application and the Services offered by Parkmywheels, superseding any prior written or oral agreements in relation to the same subject matter herein.
        </Typography>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Vayusutha Technologies LLP
          </Typography>
          <Typography paragraph>
            No142 Sai lotus layout Channasandra Bangalore-560098
          </Typography>
          <Typography paragraph>
            Parkmywheels3@gmail.com
          </Typography>
          <Typography paragraph>
            Attn: Data Protection Officer
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleBack}
            sx={{ px: 4 }}
          >
            Back to Registration
          </Button>
        </Box> */}
      </Paper>
    </Container>
  );
};

export default TermsAndConditionsPage;
