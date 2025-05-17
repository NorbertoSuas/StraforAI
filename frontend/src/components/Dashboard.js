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
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeVacancies: 0,
    totalCandidates: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    applicationRate: 0,
    interviewRate: 0,
    hireRate: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationTrends, setApplicationTrends] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activitiesResponse, trendsResponse, deptResponse] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/activity'),
          axios.get('/api/dashboard/application-trends'),
          axios.get('/api/dashboard/department-stats')
        ]);

        setStats(statsResponse.data);
        setActivities(activitiesResponse.data);
        setApplicationTrends(trendsResponse.data);
        setDepartmentStats(deptResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, icon, subtitle }) => (
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
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
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

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/api/dashboard/generate-report', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'recruitment-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

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
          <ListItem button onClick={() => navigate('/careers')}>
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="Career Page" />
          </ListItem>
          <ListItem button onClick={() => navigate('/settings')}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>

      <Box className="main-content">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </Box>

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
              subtitle={`${stats.applicationRate}% application rate`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              icon={<EventIcon color="primary" />}
              subtitle={`${stats.interviewRate}% interview rate`}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Trends
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#8884d8" />
                      <Line type="monotone" dataKey="interviews" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Applications by Department
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {departmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
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