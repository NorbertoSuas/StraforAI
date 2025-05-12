import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Badge } from 'react-bootstrap';
import { Card } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { FaUserTie, FaMapMarkerAlt, FaBriefcase, FaClock, FaGraduationCap, FaTools } from 'react-icons/fa';

interface Candidate {
    _id: string;
    first_name: string;
    last_name: string;
    experience: number;
    skills: string;
    status: string;
    resume?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    current_position?: string;
    education?: string;
    match_score?: number;
    linkedin?: string;
}

interface VacancyCardProps {
    vacancy: {
        _id: string;
        title: string;
        department: string;
        location: string;
        experience_level: string;
        description: string;
        requirements: string[];
        skills_required: string[];
        benefits: string[];
    };
}

const VacancyCard: React.FC<VacancyCardProps> = ({ vacancy }) => {
    const [showModal, setShowModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/vacancies/${vacancy._id}/candidates`);
            if (!response.ok) {
                throw new Error('Failed to fetch candidates');
            }
            const data = await response.json();
            setCandidates(data);
        } catch (err) {
            setError('Error fetching candidates');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCandidates = () => {
        setShowModal(true);
        fetchCandidates();
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <>
            <Card className="mb-4 vacancy-card">
                <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center mb-4">
                        <span className="d-flex align-items-center">
                            <FaUserTie className="me-2 text-primary" />
                            <span className="h5 mb-0">{vacancy.title}</span>
                        </span>
                    </Card.Title>
                    <div className="vacancy-details">
                        <div className="detail-item mb-3">
                            <FaBriefcase className="me-2 text-muted" />
                            <span>{vacancy.department}</span>
                        </div>
                        <div className="detail-item mb-3">
                            <FaMapMarkerAlt className="me-2 text-muted" />
                            <span>{vacancy.location}</span>
                        </div>
                        <div className="detail-item mb-3">
                            <FaClock className="me-2 text-muted" />
                            <span>{vacancy.experience_level}</span>
                        </div>
                        <div className="skills-section mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <FaTools className="me-2 text-muted" />
                                <span className="text-muted">Required Skills:</span>
                            </div>
                            <div className="skills-container">
                                {vacancy.skills_required.map((skill, index) => (
                                    <span className="skill-badge" key={index}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-primary" 
                            className="flex-grow-1" 
                            onClick={handleViewCandidates}
                        >
                            <i className="bi bi-people me-2"></i>
                            View Candidates
                        </Button>
                        <Button 
                            variant="primary" 
                            className="flex-grow-1"
                        >
                            <i className="bi bi-eye me-2"></i>
                            View Details
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <i className="bi bi-people me-2 text-primary"></i>
                        Candidates for {vacancy.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading && (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    )}
                    
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {!loading && !error && candidates.length === 0 && (
                        <div className="text-center py-4">
                            <p className="text-muted">No candidates have applied for this position yet.</p>
                        </div>
                    )}

                    {!loading && !error && candidates.length > 0 && (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Experience</th>
                                        <th>Skills</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((candidate) => (
                                        <tr key={candidate._id}>
                                            <td>
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-decoration-none"
                                                    onClick={() => {
                                                        setSelectedCandidate(candidate);
                                                        setShowCandidateModal(true);
                                                    }}
                                                >
                                                    {`${candidate.first_name} ${candidate.last_name}`}
                                                </Button>
                                            </td>
                                            <td>{candidate.experience} years</td>
                                            <td>
                                                <div className="skills-container">
                                                    {candidate.skills.split(', ').map((skill, index) => (
                                                        <span className="skill-badge" key={index}>
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${candidate.status.toLowerCase()}`}>
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => window.open(`/candidates/${candidate._id}`, '_blank')}
                                                    >
                                                        <i className="bi bi-person me-1"></i>
                                                        Profile
                                                    </Button>
                                                    {candidate.resume && (
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => window.open(candidate.resume, '_blank')}
                                                        >
                                                            <i className="bi bi-file-earmark-text me-1"></i>
                                                            Resume
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showCandidateModal} onHide={() => setShowCandidateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <i className="bi bi-person-badge me-2 text-primary"></i>
                        Candidate Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCandidate && (
                        <div className="row">
                            <div className="col-md-6">
                                <div className="candidate-details-section">
                                    <h6>Personal Information</h6>
                                    <p><strong>Name:</strong> {`${selectedCandidate.first_name} ${selectedCandidate.last_name}`}</p>
                                    <p><strong>Email:</strong> {selectedCandidate.email || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedCandidate.phone || 'N/A'}</p>
                                    <p><strong>Location:</strong> {`${selectedCandidate.city || 'N/A'}, ${selectedCandidate.country || 'N/A'}`}</p>
                                    <p><strong>LinkedIn:</strong> 
                                        {selectedCandidate.linkedin ? (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                href={selectedCandidate.linkedin}
                                                target="_blank"
                                                className="ms-2"
                                            >
                                                <i className="bi bi-linkedin me-1"></i>
                                                View Profile
                                            </Button>
                                        ) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="candidate-details-section">
                                    <h6>Professional Information</h6>
                                    <p><strong>Current Position:</strong> {selectedCandidate.current_position || 'N/A'}</p>
                                    <p><strong>Experience:</strong> {selectedCandidate.experience} years</p>
                                    <p><strong>Education:</strong> {selectedCandidate.education || 'N/A'}</p>
                                    <p><strong>Skills:</strong></p>
                                    <div className="skills-container">
                                        {selectedCandidate.skills.split(', ').map((skill, index) => (
                                            <span className="skill-badge" key={index}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="candidate-details-section">
                                    <h6>Additional Information</h6>
                                    <p><strong>Status:</strong> 
                                        <span className={`status-badge ${selectedCandidate.status.toLowerCase()} ms-2`}>
                                            {selectedCandidate.status}
                                        </span>
                                    </p>
                                    <p><strong>Match Score:</strong> 
                                        <span className="ms-2">
                                            {selectedCandidate.match_score ? `${selectedCandidate.match_score}%` : 'N/A'}
                                        </span>
                                    </p>
                                    {selectedCandidate.resume && (
                                        <div className="mt-3">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => window.open(selectedCandidate.resume, '_blank')}
                                            >
                                                <i className="bi bi-file-earmark-text me-1"></i>
                                                View Resume
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default VacancyCard; 