import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  SwapHoriz as ChangeIcon,
  Book as KnowledgeIcon,
  Engineering as SolutionIcon,
  People as UserIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isMobile }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({
    admin: false,
  });

  const handleMenuToggle = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      exact: true,
    },
    {
      text: 'Tickets',
      icon: <TicketIcon />,
      path: '/dashboard/tickets',
    },
    {
      text: 'Changes',
      icon: <ChangeIcon />,
      path: '/dashboard/changes',
    },
    {
      text: 'Knowledge Base',
      icon: <KnowledgeIcon />,
      path: '/dashboard/knowledge',
    },
  ];

  // Add Solutions menu item for users with view_solutions permission
  if (hasPermission(user, 'view_solutions')) {
    menuItems.push({
      text: 'Solutions',
      icon: <SolutionIcon />,
      path: '/dashboard/solutions',
    });
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          {import.meta.env.VITE_APP_NAME || 'ITSM Solution'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={
                item.exact
                  ? location.pathname === item.path
                  : isActive(item.path)
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Admin Menu */}
        {hasPermission(user, 'manage_users') && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleMenuToggle('admin')}>
                <ListItemIcon>
                  <UserIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {openMenus.admin ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openMenus.admin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/dashboard/admin/users"
                  selected={isActive('/dashboard/admin/users')}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary="Users" />
                </ListItemButton>
                {hasPermission(user, 'manage_settings') && (
                  <ListItemButton
                    component={RouterLink}
                    to="/dashboard/admin/settings"
                    selected={isActive('/dashboard/admin/settings')}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

