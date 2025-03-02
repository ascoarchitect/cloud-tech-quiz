import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionIcon,
} from '@mui/icons-material';

interface HeaderProps {
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Handle user menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      handleMenuClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Mobile drawer toggle
  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  
  // Navigation items
  const navItems = [
    { label: 'Home', path: '/', icon: <AssessmentIcon /> },
  ];
  
  const adminItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { label: 'Question Management', path: '/admin/questions', icon: <QuestionIcon /> },
  ];
  
  const userMenuItems = [
    { label: 'Profile', icon: <PersonIcon />, action: () => navigate('/profile') },
    { label: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { label: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];
  
  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileDrawer}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ mb: 1, bgcolor: 'primary.main' }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="subtitle1">User Name</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            component={RouterLink} 
            to={item.path} 
            key={item.label}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        
        {isAdmin && (
          <>
            <Divider />
            <ListItem sx={{ pl: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Admin
              </Typography>
            </ListItem>
            {adminItems.map((item) => (
              <ListItem 
                component={RouterLink} 
                to={item.path} 
                key={item.label}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </>
        )}
      </List>
      <Divider />
      <List>
        {userMenuItems.map((item) => (
          <ListItem 
            onClick={item.action} 
            key={item.label}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component={RouterLink}
              to="/" 
              sx={{ 
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              AWS Skills Assessment
            </Typography>
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={toggleMobileDrawer}
            >
              {drawerContent}
            </Drawer>
          </>
        ) : (
          <>
            <Typography 
              variant="h6" 
              component={RouterLink}
              to="/" 
              sx={{ 
                mr: 4,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              AWS Skills Assessment
            </Typography>
            
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  {item.label}
                </Button>
              ))}
              
              {isAdmin && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    sx={{ mx: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                </>
              )}
            </Box>
            
            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {userMenuItems.map((item) => (
                  <MenuItem key={item.label} onClick={item.action}>
                    {item.icon}
                    <Typography sx={{ ml: 2 }}>{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;