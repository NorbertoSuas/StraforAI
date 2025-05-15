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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment
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
  Search as SearchIcon,
  FileText as FileTextIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import './Candidates.css';

function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    education: '',
    currentPosition: '',
    experience: '',
    skills: '',
    vacancy: '',
    notes: ''
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      setError('Error fetching candidates');
      setSnackbar({
        open: true,
        message: 'Error loading candidates',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (resumeFile) {
        data.append('resume', resumeFile);
      }
      await axios.post('/api/candidates', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        education: '',
        currentPosition: '',
        experience: '',
        skills: '',
        vacancy: '',
        notes: ''
      });
      setResumeFile(null);
      fetchCandidates();
      setSnackbar({
        open: true,
        message: 'Candidate added successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding candidate',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (candidateId, newStatus) => {
    try {
      await axios.put(`/api/candidates/${candidateId}/status`, { status: newStatus });
      fetchCandidates();
      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error'
      });
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.firstName.toLowerCase().includes(searchLower) ||
      candidate.lastName.toLowerCase().includes(searchLower) ||
      candidate.skills.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box className="candidates-container">
      <Box className="sidebar">
        <Box className="sidebar-logo">
          <img src="/assets/tech-mahindra-logo.svg" alt="Tech Mahindra" />
        </Box>
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/vacancies')}>
            <ListItemIcon><WorkIcon /></ListItemIcon>
            <ListItemText primary="Vacancies" />
          </ListItem>
          <ListItem button onClick={() => navigate('/candidates')} selected>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Candidates
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowForm(true)}
          >
            Add Candidate
          </Button>
        </Box>

        {showForm && (
          <Card className="form-card" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Candidate
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="">Select Country</MenuItem>
                        {/* Add country options */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>City</InputLabel>
                      <Select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="">Select City</MenuItem>
                        {/* Add city options */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Education"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current Position"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Experience (Years)"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Skills (comma-separated)"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      component="label"
                      color={resumeFile ? 'success' : 'primary'}
                      sx={{ mb: 2 }}
                    >
                      {resumeFile ? `File: ${resumeFile.name}` : 'Upload Resume (PDF, DOC, DOCX)'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Save Candidate
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowForm(false)}
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
          <CardContent>
            <Box mb={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name or skills..."
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
            </Box>
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
                      <TableCell>Position</TableCell>
                      <TableCell>Experience</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{`${candidate.firstName} ${candidate.lastName}`}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.currentPosition}</TableCell>
                        <TableCell>{candidate.experience} years</TableCell>
                        <TableCell>
                          <Select
                            value={candidate.status}
                            onChange={(e) => handleStatusUpdate(candidate.id, e.target.value)}
                            size="small"
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Interviewed">Interviewed</MenuItem>
                            <MenuItem value="Accepted">Accepted</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => setSelectedCandidate(candidate)}>
                            <EditIcon />
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

      <Dialog
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedCandidate && (
          <>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Typography><strong>Name:</strong> {`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}</Typography>
                  <Typography><strong>Email:</strong> {selectedCandidate.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedCandidate.phone}</Typography>
                  <Typography><strong>Location:</strong> {`${selectedCandidate.city}, ${selectedCandidate.country}`}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Professional Information</Typography>
                  <Typography><strong>Current Position:</strong> {selectedCandidate.currentPosition}</Typography>
                  <Typography><strong>Experience:</strong> {selectedCandidate.experience} years</Typography>
                  <Typography><strong>Education:</strong> {selectedCandidate.education}</Typography>
                  <Typography><strong>Applied For:</strong> {selectedCandidate.vacancy}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Skills</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {selectedCandidate.skills.split(',').map((skill, index) => (
                      <Chip key={index} label={skill.trim()} />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography>{selectedCandidate.notes}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
            </DialogActions>
          </>
        )}
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
    </Box>
  );
}

export default Candidates; 