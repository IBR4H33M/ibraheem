import React, { useState } from 'react';
import axios from 'axios';
import useScrollTitle from '../hooks/useScrollTitle';
import './StudentPerformancePredictor.css';

const StudentPerformancePredictor = () => {
    const titleVisible = useScrollTitle();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([]);

    const defaultForm = {
        // Numeric fields
        age: 20,
        study_hours: 3,
        class_attendance: 80,
        sleep_hours: 7,

        // Categorical fields
        gender: 'male',
        course: 'b.sc',
        internet_access: 'yes',
        sleep_quality: 'average',
        study_method: 'self-study',
        facility_rating: 'medium',
        exam_difficulty: 'moderate',
    };

    const [formData, setFormData] = useState(defaultForm);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const logMessage = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);
        setLogs([]);

        try {
            logMessage('Fetching Flask server endpoints...');
            const response = await axios.post('/api/student-performance/predict', formData, {
                onUploadProgress: () => {
                    logMessage('Sending prediction parameters to model endpoints...');
                }
            });

            logMessage('Received response from server');

            if (response.data.success) {
                setResult(response.data);

                const timing = response.data.timing || {};
                logMessage(`Model runtime: ${timing.total_ms ?? 'N/A'} ms (knn ${timing.knn_ms ?? 'N/A'} ms, linear ${timing.linear_ms ?? 'N/A'} ms)`);
                logMessage('Prediction complete: values returned');
            } else {
                setError(response.data.error || 'Prediction failed');
                logMessage('Prediction failed with non-success response');
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Failed to connect to prediction service';
            setError(errMsg);
            logMessage(`Error: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData(defaultForm);
        setResult(null);
        setError('');
    };

    const getGradeColor = (grade) => {
        const colors = { A: '#4ade80', B: '#86efac', C: '#facc15', D: '#fb923c', E: '#f87171', F: '#ef4444' };
        return colors[grade] || '#ffffff';
    };

    return (
        <div className="spp-page">
            <h1 className="spp-page-title" style={{ opacity: titleVisible ? 1 : 0 }}>
                STUDENT PERFORMANCE PREDICTOR
            </h1>

            <div className="spp-container">
                <div className="spp-inner">
                    <h2 className="spp-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        ENTER STUDENT DATA
                    </h2>

                    <form onSubmit={handleSubmit} className="spp-form-section">
                        <div className="spp-form-grid">

                            {/* ── Numeric Inputs ── */}
                            <div className="spp-form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="17"
                                    max="24"
                                    required
                                />
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="study_hours">Study Hours (per day)</label>
                                <input
                                    type="number"
                                    id="study_hours"
                                    name="study_hours"
                                    value={formData.study_hours}
                                    onChange={handleChange}
                                    min="0"
                                    max="8"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="class_attendance">Class Attendance (%)</label>
                                <input
                                    type="number"
                                    id="class_attendance"
                                    name="class_attendance"
                                    value={formData.class_attendance}
                                    onChange={handleChange}
                                    min="40"
                                    max="100"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="sleep_hours">Sleep Hours (per night)</label>
                                <input
                                    type="number"
                                    id="sleep_hours"
                                    name="sleep_hours"
                                    value={formData.sleep_hours}
                                    onChange={handleChange}
                                    min="4"
                                    max="10"
                                    step="0.1"
                                    required
                                />
                            </div>

                            {/* ── Categorical Selects ── */}
                            <div className="spp-form-group">
                                <label htmlFor="gender">Gender</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="course">Course</label>
                                <select id="course" name="course" value={formData.course} onChange={handleChange}>
                                    <option value="b.com">B.Com</option>
                                    <option value="b.sc">B.Sc</option>
                                    <option value="b.tech">B.Tech</option>
                                    <option value="ba">BA</option>
                                    <option value="bba">BBA</option>
                                    <option value="bca">BCA</option>
                                    <option value="diploma">Diploma</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="internet_access">Internet Access</label>
                                <select id="internet_access" name="internet_access" value={formData.internet_access} onChange={handleChange}>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="sleep_quality">Sleep Quality</label>
                                <select id="sleep_quality" name="sleep_quality" value={formData.sleep_quality} onChange={handleChange}>
                                    <option value="poor">Poor</option>
                                    <option value="average">Average</option>
                                    <option value="good">Good</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="study_method">Study Method</label>
                                <select id="study_method" name="study_method" value={formData.study_method} onChange={handleChange}>
                                    <option value="self-study">Self Study</option>
                                    <option value="group study">Group Study</option>
                                    <option value="online videos">Online Videos</option>
                                    <option value="coaching">Coaching</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="facility_rating">Facility Rating</label>
                                <select id="facility_rating" name="facility_rating" value={formData.facility_rating} onChange={handleChange}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="spp-form-group">
                                <label htmlFor="exam_difficulty">Exam Difficulty</label>
                                <select id="exam_difficulty" name="exam_difficulty" value={formData.exam_difficulty} onChange={handleChange}>
                                    <option value="easy">Easy</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                        </div>

                        <div className="spp-form-actions-layout">
                            <div className="spp-form-actions">
                                <button type="submit" className="spp-submit-btn" disabled={loading}>
                                    {loading ? 'PREDICTING...' : 'PREDICT SCORE'}
                                </button>
                                <button type="button" className="spp-reset-btn" onClick={handleReset}>
                                    RESET
                                </button>
                            </div>

                            <div className="spp-log-console">
                                <h3>Execution Log</h3>
                                <div className="spp-log-lines">
                                    {logs.length === 0 ? <p>No logs yet. Click Predict Score.</p> : logs.map((line, idx) => (
                                        <div key={idx} className="spp-log-line">{line}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="spp-error">
                            <span className="spp-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="spp-result-section">
                            <h2 className="spp-section-title">
                                PREDICTION RESULTS
                            </h2>

                            <div className="spp-result-cards">
                                <div className="spp-score-card spp-card-main">
                                    <span className="spp-card-title">Average Score</span>
                                    <span className="spp-card-value spp-card-value-large">
                                        {result.predictions.average}
                                    </span>
                                    <span
                                        className="spp-card-value"
                                        style={{ color: getGradeColor(result.grade), fontSize: '1.4rem', marginTop: '4px' }}
                                    >
                                        Grade: {result.grade}
                                    </span>
                                </div>
                                <div className="spp-score-card">
                                    <span className="spp-card-title">Linear Regression</span>
                                    <span className="spp-card-value">{result.predictions.linear_regression}</span>
                                </div>
                                <div className="spp-score-card">
                                    <span className="spp-card-title">KNN</span>
                                    <span className="spp-card-value">{result.predictions.knn}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPerformancePredictor;
