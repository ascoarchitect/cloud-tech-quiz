import React from 'react';
import { Box, Typography, Link, Container, Divider } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AWS Cloud Skills Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test your knowledge of AWS services and prepare for certification exams
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="https://aws.amazon.com/certification/" color="inherit" target="_blank" rel="noopener">
              AWS Certification
            </Link>
            <Link href="https://aws.amazon.com/training/" color="inherit" target="_blank" rel="noopener">
              AWS Training
            </Link>
            <Link href="https://aws.amazon.com/whitepapers/" color="inherit" target="_blank" rel="noopener">
              AWS Whitepapers
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Exams
            </Typography>
            <Link href="https://aws.amazon.com/certification/certified-cloud-practitioner/" color="inherit" target="_blank" rel="noopener">
              Cloud Practitioner
            </Link>
            <Link href="https://aws.amazon.com/certification/certified-solutions-architect-associate/" color="inherit" target="_blank" rel="noopener">
              Solutions Architect Associate
            </Link>
            <Link href="https://aws.amazon.com/certification/certified-developer-associate/" color="inherit" target="_blank" rel="noopener">
              Developer Associate
            </Link>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' AWS Cloud Skills Assessment. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;