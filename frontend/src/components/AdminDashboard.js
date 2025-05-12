import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVacancies: 0,
    totalApplications: 0,
    pendingReviews: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users')
        ]);

        setStats(statsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        setError('Error fetching admin data');
        setSnackbar({
          open: true,
          message: 'Error loading admin data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting user',
        severity: 'error'
      });
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <Card className="stat-card">
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h4" component="div" sx={{ ml: 2 }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box className="admin-dashboard-container">
      <Box className="sidebar">
        <Box className="sidebar-logo">
          <img src="/assets/tech-mahindra-logo.svg" alt="Tech Mahindra" />
        </Box>
        <List>
          <ListItem button onClick={() => navigate('/admin-dashboard')} selected>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/vacancies')}>
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Vacancies" />
          </ListItem>
          <ListItem button onClick={() => navigate('/candidates')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Candidates" />
          </ListItem>
          <ListItem button onClick={() => navigate('/settings')}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <Box className="theme-toggle">
          <Button
            onClick={handleThemeToggle}
            startIcon={theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </Box>
      </Box>

      <Box className="main-content">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<PeopleIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Vacancies"
              value={stats.activeVacancies}
              icon={<WorkIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              icon={<AssignmentIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews}
              icon={<EventIcon color="primary" />}
            />
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => navigate(`/edit-user/${user.id}`)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard; 