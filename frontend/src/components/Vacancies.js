import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import './Vacancies.css';

const Vacancies = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    country: '',
    city: '',
    employmentType: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
    experienceLevel: '',
    currency: 'USD',
    salaryMin: '',
    salaryMax: '',
    benefits: '',
    deadline: '',
    remoteWork: false,
    postToLinkedIn: false,
    postToOCC: false
  });

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await axios.get('/api/vacancies');
      setVacancies(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch vacancies');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVacancy) {
        await axios.put(`/api/vacancies/${selectedVacancy.id}`, formData);
        setSnackbar({ open: true, message: 'Vacancy updated successfully', severity: 'success' });
      } else {
        await axios.post('/api/vacancies', formData);
        setSnackbar({ open: true, message: 'Vacancy created successfully', severity: 'success' });
      }
      setShowForm(false);
      setSelectedVacancy(null);
      setFormData({
        title: '',
        department: '',
        country: '',
        city: '',
        employmentType: '',
        description: '',
        requirements: '',
        responsibilities: '',
        skills: '',
        experienceLevel: '',
        currency: 'USD',
        salaryMin: '',
        salaryMax: '',
        benefits: '',
        deadline: '',
        remoteWork: false,
        postToLinkedIn: false,
        postToOCC: false
      });
      fetchVacancies();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving vacancy', severity: 'error' });
    }
  };

  const handleEdit = (vacancy) => {
    setSelectedVacancy(vacancy);
    setFormData({
      ...vacancy,
      skills: vacancy.skills.join(', '),
      benefits: vacancy.benefits.join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vacancy?')) {
      try {
        await axios.delete(`/api/vacancies/${id}`);
        setSnackbar({ open: true, message: 'Vacancy deleted successfully', severity: 'success' });
        fetchVacancies();
      } catch (err) {
        setSnackbar({ open: true, message: 'Error deleting vacancy', severity: 'error' });
      }
    }
  };

  const handleViewCandidates = (vacancy) => {
    setSelectedVacancy(vacancy);
  };

  const filteredVacancies = vacancies.filter(vacancy =>
    vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vacancy.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="vacancies-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/assets/tech-mahindra-logo.svg" alt="Tech Mahindra" />
        </div>
        <ul className="sidebar-nav">
          <li>
            <a href="/dashboard">
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </a>
          </li>
          <li className="active">
            <a href="/vacancies">
              <i className="bi bi-briefcase"></i>
              Vacancies
            </a>
          </li>
          <li>
            <a href="/candidates">
              <i className="bi bi-people"></i>
              Candidates
            </a>
          </li>
          <li>
            <a href="/settings">
              <i className="bi bi-gear"></i>
              Settings
            </a>
          </li>
          <li>
            <a href="#" onClick={() => navigate('/login')}>
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Job Vacancies
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Post New Vacancy
          </Button>
        </Box>

        {showForm && (
          <Card className="form-card" sx={{ mb: 4 }}>
            <CardHeader
              title={
                <Typography variant="h6">
                  {selectedVacancy ? 'Edit Vacancy' : 'Post New Vacancy'}
                </Typography>
              }
            />
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <Select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="">Select Country</MenuItem>
                        {/* Add countries here */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <Select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="">Select City</MenuItem>
                        {/* Add cities here */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <Select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        <MenuItem value="Full-time">Full-time</MenuItem>
                        <MenuItem value="Part-time">Part-time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                        <MenuItem value="Temporary">Temporary</MenuItem>
                        <MenuItem value="Internship">Internship</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Job Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Responsibilities"
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Required Skills (comma-separated)"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <Select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="">Select Level</MenuItem>
                        <MenuItem value="Entry Level">Entry Level</MenuItem>
                        <MenuItem value="Mid Level">Mid Level</MenuItem>
                        <MenuItem value="Senior Level">Senior Level</MenuItem>
                        <MenuItem value="Executive">Executive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl sx={{ minWidth: 120 }}>
                        <Select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                          <MenuItem value="GBP">GBP (£)</MenuItem>
                          {/* Add more currencies */}
                        </Select>
                      </FormControl>
                      <TextField
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleInputChange}
                        placeholder="Min"
                        required
                      />
                      <TextField
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleInputChange}
                        placeholder="Max"
                        required
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Benefits (comma-separated)"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Application Deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="remoteWork"
                          checked={formData.remoteWork}
                          onChange={handleInputChange}
                        />
                      }
                      label="Remote Work Available"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="postToLinkedIn"
                          checked={formData.postToLinkedIn}
                          onChange={handleInputChange}
                        />
                      }
                      label="Post to LinkedIn"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="postToOCC"
                          checked={formData.postToOCC}
                          onChange={handleInputChange}
                        />
                      }
                      label="Post to OCC Mundial"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SendIcon />}
                      >
                        {selectedVacancy ? 'Update Vacancy' : 'Post Vacancy'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setShowForm(false);
                          setSelectedVacancy(null);
                          setFormData({
                            title: '',
                            department: '',
                            country: '',
                            city: '',
                            employmentType: '',
                            description: '',
                            requirements: '',
                            responsibilities: '',
                            skills: '',
                            experienceLevel: '',
                            currency: 'USD',
                            salaryMin: '',
                            salaryMax: '',
                            benefits: '',
                            deadline: '',
                            remoteWork: false,
                            postToLinkedIn: false,
                            postToOCC: false
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader
            title="Active Vacancies"
            action={
              <TextField
                size="small"
                placeholder="Search vacancies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Deadline</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVacancies.map((vacancy) => (
                    <TableRow key={vacancy.id}>
                      <TableCell>{vacancy.title}</TableCell>
                      <TableCell>{vacancy.department}</TableCell>
                      <TableCell>
                        {vacancy.city}, {vacancy.country}
                        {vacancy.remoteWork && (
                          <Chip
                            size="small"
                            label="Remote"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{vacancy.employmentType}</TableCell>
                      <TableCell>{vacancy.experienceLevel}</TableCell>
                      <TableCell>
                        {vacancy.currency} {vacancy.salaryMin} - {vacancy.salaryMax}
                      </TableCell>
                      <TableCell>{new Date(vacancy.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewCandidates(vacancy)}
                          title="View Candidates"
                        >
                          <PeopleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(vacancy)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(vacancy.id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Dialog
          open={selectedVacancy !== null}
          onClose={() => setSelectedVacancy(null)}
          maxWidth="xl"
          fullWidth
        >
          <DialogTitle>
            Candidates for {selectedVacancy?.title}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              placeholder="Search candidates..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Add candidate rows here */}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedVacancy(null)}>Close</Button>
          </DialogActions>
        </Dialog>

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
      </div>
    </div>
  );
};

export default Vacancies; 