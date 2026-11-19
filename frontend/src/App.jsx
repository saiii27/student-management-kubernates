import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Server, 
  Database, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  X, 
  GraduationCap,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    branch: 'Computer Science & Engineering',
    semester: 6,
    email: ''
  });

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Health check state
  const [backendHealth, setBackendHealth] = useState({ status: 'CHECKING', uptime: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Students
  const fetchStudents = async (search = '') => {
    setLoading(true);
    try {
      const url = search 
        ? `/api/students?search=${encodeURIComponent(search)}` 
        : '/api/students';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      } else {
        showToast(data.message || 'Error fetching students', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend service', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check Backend Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: 'ERROR' });
      }
    } catch {
      setBackendHealth({ status: 'UNREACHABLE' });
    }
  };

  useEffect(() => {
    fetchStudents();
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      usn: '',
      branch: 'Computer Science & Engineering',
      semester: 6,
      email: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setModalMode('edit');
    setCurrentStudentId(student.id);
    setFormData({
      name: student.name,
      usn: student.usn,
      branch: student.branch,
      semester: student.semester,
      email: student.email
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Student ${formData.name} registered successfully!`);
          setIsModalOpen(false);
          fetchStudents();
        } else {
          showToast(data.message || 'Failed to add student', 'error');
        }
      } else {
        const res = await fetch(`/api/students/${currentStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Student information updated successfully!');
          setIsModalOpen(false);
          fetchStudents();
        } else {
          showToast(data.message || 'Failed to update student', 'error');
        }
      }
    } catch {
      showToast('Error communicating with backend API', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Student record deleted successfully.');
        setDeleteConfirmId(null);
        fetchStudents();
      } else {
        showToast(data.message || 'Failed to delete student', 'error');
      }
    } catch {
      showToast('Error connecting to backend API', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="brand-text">
            <h2>EduCloud K8s</h2>
            <p>Student Management System</p>
          </div>
        </div>

        <ul className="nav-menu">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={18} />
            <span>Dashboard Overview</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={18} />
            <span>Student Directory</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="k8s-badge">
            <div className="k8s-badge-title">
              <ShieldCheck size={14} /> Kubernetes 3-Tier
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
              Frontend: NodePort 30080<br/>
              Backend: ClusterIP 3000<br/>
              Database: MySQL 3306
            </p>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="header">
          <div className="header-title">
            <h1>{activeTab === 'dashboard' ? 'Cloud Lab Evaluation Dashboard' : 'Student Records Management'}</h1>
            <p>Multi-Tier Web Application Orchestrated with Kubernetes</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => { fetchStudents(); checkHealth(); }}>
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <UserPlus size={16} />
              Add Student
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          {/* Architecture Banner */}
          <div className="arch-card">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Active Kubernetes Topology
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                Service DNS resolution enables decoupled tier-to-tier communication.
              </p>
            </div>
            <div className="arch-steps">
              <div className="arch-pill">
                <Users size={14} /> Browser: NodePort :30080
              </div>
              <span>&rarr;</span>
              <div className="arch-pill">
                <Server size={14} /> backend-service:3000
              </div>
              <span>&rarr;</span>
              <div className="arch-pill">
                <Database size={14} /> mysql-service:3306
              </div>
            </div>
          </div>

          {/* Metrics / Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Students</h3>
                <div className="stat-value">{students.length}</div>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Backend Status</h3>
                <div className="stat-value" style={{ fontSize: '1.25rem', color: backendHealth.status === 'UP' ? '#10b981' : '#f59e0b', marginTop: '0.6rem' }}>
                  {backendHealth.status === 'UP' ? 'Healthy (ClusterIP)' : backendHealth.status}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <Activity size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Persistent Volume</h3>
                <div className="stat-value" style={{ fontSize: '1.25rem', color: '#0284c7', marginTop: '0.6rem' }}>
                  1Gi Bound (PVC)
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <Database size={24} />
              </div>
            </div>
          </div>

          {/* Students Table Card */}
          <div className="card">
            <div className="card-header">
              <h2>Enrolled Students ({students.length})</h2>
              <div className="controls-bar">
                <form onSubmit={handleSearch} className="search-input-group">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or USN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                {searchQuery && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); fetchStudents(''); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="empty-state">
                  <RefreshCw size={32} className="spinner" style={{ margin: '0 auto 1rem', color: '#4f46e5' }} />
                  <p>Loading student records from MySQL database...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="empty-state">
                  <Users size={40} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
                  <h3>No student records found</h3>
                  <p>Click "Add Student" above to insert a new record into the database.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>USN</th>
                      <th>Branch</th>
                      <th>Semester</th>
                      <th>Email Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>#{student.id}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{student.name}</td>
                        <td>
                          <span className="usn-badge">{student.usn}</span>
                        </td>
                        <td>{student.branch}</td>
                        <td>
                          <span className="semester-badge">Sem {student.semester}</span>
                        </td>
                        <td style={{ color: '#64748b' }}>{student.email}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn edit"
                              title="Edit Student"
                              onClick={() => handleOpenEditModal(student)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete Student"
                              onClick={() => setDeleteConfirmId(student.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Register New Student' : 'Edit Student Details'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">USN (University Seat Number)</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. 1MS21CS001"
                      value={formData.usn}
                      onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      className="form-select"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Branch / Department</label>
                  <select
                    className="form-select"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Science & Engineering">Information Science & Engineering</option>
                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="student@example.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Save Record' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                Are you sure you want to delete student record #{deleteConfirmId}? This operation will remove the student permanently from MySQL database.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId)}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
