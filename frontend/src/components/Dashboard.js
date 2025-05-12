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
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeVacancies: 0,
    totalCandidates: 0,
    newApplications: 0,
    interviewsScheduled: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activitiesResponse] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/activity')
        ]);

        setStats(statsResponse.data);
        setActivities(activitiesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const ActivityItem = ({ activity }) => (
    <ListItem>
      <ListItemIcon>
        {activity.type === 'application' && <PersonAddIcon />}
        {activity.type === 'interview' && <EventIcon />}
        {activity.type === 'vacancy' && <WorkIcon />}
      </ListItemIcon>
      <ListItemText
        primary={activity.description}
        secondary={new Date(activity.timestamp).toLocaleString()}
      />
    </ListItem>
  );

  return (
    <Box className="dashboard-container">
      <Box className="sidebar">
        <Box className="sidebar-logo">
          <img src="/assets/tech-mahindra-logo.svg" alt="Tech Mahindra" />
        </Box>
        <List>
          <ListItem button onClick={() => navigate('/dashboard')} selected>
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
      </Box>

      <Box className="main-content">
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Vacancies"
              value={stats.activeVacancies}
              icon={<WorkIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates}
              icon={<PeopleIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New Applications"
              value={stats.newApplications}
              icon={<PersonAddIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              icon={<EventIcon color="primary" />}
            />
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : activities.length > 0 ? (
              <List>
                {activities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ActivityItem activity={activity} />
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No recent activity
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard; 