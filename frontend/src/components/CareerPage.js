import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import './CareerPage.css';

function CareerPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await fetch('/api/vacancies');
      if (!response.ok) {
        throw new Error('Failed to fetch vacancies');
      }
      const data = await response.json();
      setVacancies(data.filter(v => v.status === 'Active'));
    } catch (err) {
      setError('Error loading vacancies. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = vacancies.filter(vacancy =>
    vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vacancy.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vacancy.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const VacancyCard = ({ vacancy }) => (
    <Card className="vacancy-card">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {vacancy.title}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {vacancy.department}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <LocationIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {vacancy.location}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <WorkIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {vacancy.type}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {vacancy.salary_range.currency} {vacancy.salary_range.min} - {vacancy.salary_range.max}
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          {vacancy.description.substring(0, 150)}...
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {vacancy.skills_required.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              className="skill-chip"
            />
          ))}
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => window.location.href = `/apply/${vacancy._id}`}
        >
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="career-page">
      <Box className="career-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Career Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join our team and be part of something extraordinary
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by job title, department, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, mb: 4 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredVacancies.length > 0 ? (
          filteredVacancies.map((vacancy) => (
            <Grid item xs={12} md={6} lg={4} key={vacancy._id}>
              <VacancyCard vacancy={vacancy} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No vacancies found matching your search criteria.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default CareerPage; 