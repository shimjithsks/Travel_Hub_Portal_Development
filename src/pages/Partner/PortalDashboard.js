import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getAllPartners, approvePartner, rejectPartner, deletePartner } from '../../services/partnerService';
import { sendApprovalEmail, sendRejectionEmail } from '../../services/emailService';
import '../../styles/portalDashboard.css';

const PortalDashboard = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentToView, setDocumentToView] = useState({ title: '', data: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('company');

  // Add/remove modal-open class on body when any modal is open
  useEffect(() => {
    if (showModal || showRejectModal || showDocumentModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showModal, showRejectModal, showDocumentModal]);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPartners();
      setPartners(data);
      setFilteredPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
      showNotification('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    let result = partners;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.companyName?.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.mobile?.includes(search) ||
        p.contactFirstName?.toLowerCase().includes(search) ||
        p.contactLastName?.toLowerCase().includes(search)
      );
    }

    setFilteredPartners(result);
  }, [statusFilter, searchTerm, partners]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
    setActiveTab('company');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPartner(null);
    setShowModal(false);
    setActiveTab('company');
  };

  const handleViewDocument = (title, data) => {
    setDocumentToView({ title, data });
    setShowDocumentModal(true);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setDocumentToView({ title: '', data: '' });
  };

  const handleApprove = async (partner) => {
    setActionLoading(true);
    try {
      const result = await approvePartner(partner.id, 'admin');
      if (result && result.success) {
        // Send approval email with partner ID
        const updatedPartner = { ...partner, partnerId: result.partnerId };
        const emailResult = await sendApprovalEmail(updatedPartner);
        
        if (emailResult.success) {
          if (emailResult.demo) {
            showNotification(`Partner "${partner.companyName}" approved! Partner ID: ${result.partnerId}`, 'success');
          } else {
            showNotification(`Partner "${partner.companyName}" approved! Email sent to ${partner.email}`, 'success');
          }
        } else {
          showNotification(`Partner "${partner.companyName}" approved! Partner ID: ${result.partnerId} (Email failed to send)`, 'warning');
        }
        
        fetchPartners();
        handleCloseModal();
      } else {
        showNotification('Failed to approve partner', 'error');
      }
    } catch (error) {
      showNotification('Error approving partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (partner) => {
    setSelectedPartner(partner);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const success = await rejectPartner(selectedPartner.id, rejectReason);
      if (success) {
        // Send rejection email with reason
        const emailResult = await sendRejectionEmail(selectedPartner, rejectReason);
        
        if (emailResult.success) {
          if (emailResult.demo) {
            showNotification(`Partner "${selectedPartner.companyName}" rejected. (Email logged in console)`, 'warning');
          } else {
            showNotification(`Partner "${selectedPartner.companyName}" rejected. Email sent to ${selectedPartner.email}`, 'warning');
          }
        } else {
          showNotification(`Partner "${selectedPartner.companyName}" rejected. (Email failed to send)`, 'warning');
        }
        
        fetchPartners();
        setShowRejectModal(false);
        handleCloseModal();
      } else {
        showNotification('Failed to reject partner', 'error');
      }
    } catch (error) {
      showNotification('Error rejecting partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (partner) => {
    if (!window.confirm(`Are you sure you want to delete "${partner.companyName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const success = await deletePartner(partner.id);
      if (success) {
        showNotification(`Partner "${partner.companyName}" deleted`, 'success');
        fetchPartners();
        handleCloseModal();
      } else {
        showNotification('Failed to delete partner', 'error');
      }
    } catch (error) {
      showNotification('Error deleting partner', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      suspended: 'status-suspended'
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status?.toUpperCase()}</span>;
  };

  const getStats = () => {
    return {
      total: partners.length,
      pending: partners.filter(p => p.status === 'pending').length,
      approved: partners.filter(p => p.status === 'approved').length,
      rejected: partners.filter(p => p.status === 'rejected').length
    };
  };

  const stats = getStats();

  return (
    <div className="portal-dashboard">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Partner Management Portal</h1>
          <p>Review and manage partner registration requests</p>
        </div>
        <button className="refresh-btn" onClick={fetchPartners} disabled={loading}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => setStatusFilter('all')}>
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Partners</p>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => setStatusFilter('pending')}>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card approved" onClick={() => setStatusFilter('approved')}>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card rejected" onClick={() => setStatusFilter('rejected')}>
          <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search by company, email, mobile, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={statusFilter === 'all' ? 'active' : ''} 
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={statusFilter === 'pending' ? 'active' : ''} 
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={statusFilter === 'approved' ? 'active' : ''} 
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={statusFilter === 'rejected' ? 'active' : ''} 
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Partners Table */}
      <div className="partners-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <p>No partners found</p>
            <span>Try adjusting your filters or search term</span>
          </div>
        ) : (
          <table className="partners-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map(partner => (
                <tr key={partner.id}>
                  <td>
                    <strong>{partner.companyName}</strong>
                    <small>{partner.city}, {partner.state}</small>
                  </td>
                  <td>{partner.title} {partner.contactFirstName} {partner.contactLastName}</td>
                  <td>{partner.email}</td>
                  <td>{partner.mobile}</td>
                  <td>{formatDate(partner.registrationDate)}</td>
                  <td>{getStatusBadge(partner.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewDetails(partner)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {partner.status === 'pending' && (
                        <>
                          <button 
                            className="btn-approve" 
                            onClick={() => handleApprove(partner)}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            className="btn-reject" 
                            onClick={() => handleRejectClick(partner)}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(partner)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Partner Detail Modal - Modern Tabbed Design */}
      {showModal && selectedPartner && createPortal(
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="partner-detail-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header with Partner Info */}
            <div className="partner-modal-header">
              <div className="partner-header-content">
                <div className="partner-avatar">
                  <i className="fas fa-building"></i>
                </div>
                <div className="partner-header-info">
                  <h2>{selectedPartner.companyName}</h2>
                  <p><i className="fas fa-map-marker-alt"></i> {selectedPartner.city}, {selectedPartner.state}</p>
                  <div className="partner-header-badges">
                    {getStatusBadge(selectedPartner.status)}
                    {selectedPartner.partnerId && (
                      <span className="partner-id-badge">ID: {selectedPartner.partnerId}</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="partner-modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                <i className="fas fa-building"></i>
                <span>Company</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                <i className="fas fa-user"></i>
                <span>Contact</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                <i className="fas fa-briefcase"></i>
                <span>Business</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <i className="fas fa-file-alt"></i>
                <span>Documents</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="partner-modal-body">
              {/* Company Tab */}
              {activeTab === 'company' && (
                <div className="tab-content">
                  <div className="info-cards-grid">
                    <div className="info-card">
                      <div className="info-card-icon">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="info-card-content">
                        <label>Company Name</label>
                        <span>{selectedPartner.companyName}</span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-icon">
                        <i className="fas fa-globe"></i>
                      </div>
                      <div className="info-card-content">
                        <label>Country</label>
                        <span>{selectedPartner.country}</span>
                      </div>
                    </div>
                    <div className="info-card full-width">
                      <div className="info-card-icon">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <div className="info-card-content">
                        <label>Full Address</label>
                        <span>
                          {selectedPartner.address1}
                          {selectedPartner.address2 && `, ${selectedPartner.address2}`}
                          <br />
                          {selectedPartner.city}, {selectedPartner.state} - {selectedPartner.pincode}
                        </span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <div className="info-card-content">
                        <label>Registration Date</label>
                        <span>{formatDate(selectedPartner.registrationDate)}</span>
                      </div>
                    </div>
                    <div className="info-card">
                      <div className="info-card-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="info-card-content">
                        <label>Last Updated</label>
                        <span>{formatDate(selectedPartner.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPartner.rejectionReason && (
                    <div className="rejection-alert">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div>
                        <strong>Rejection Reason</strong>
                        <p>{selectedPartner.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="tab-content">
                  <div className="contact-profile">
                    <div className="contact-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <h3>{selectedPartner.title} {selectedPartner.contactFirstName} {selectedPartner.contactLastName}</h3>
                    <p>Primary Contact Person</p>
                  </div>
                  <div className="contact-details-grid">
                    <div className="contact-detail-card">
                      <div className="contact-icon email">
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div className="contact-info">
                        <label>Email Address</label>
                        <a href={`mailto:${selectedPartner.email}`}>{selectedPartner.email}</a>
                      </div>
                    </div>
                    <div className="contact-detail-card">
                      <div className="contact-icon phone">
                        <i className="fas fa-mobile-alt"></i>
                      </div>
                      <div className="contact-info">
                        <label>Mobile Number</label>
                        <a href={`tel:${selectedPartner.mobile}`}>{selectedPartner.mobile}</a>
                      </div>
                    </div>
                    <div className="contact-detail-card">
                      <div className="contact-icon landline">
                        <i className="fas fa-phone"></i>
                      </div>
                      <div className="contact-info">
                        <label>Landline</label>
                        <span>{selectedPartner.landline || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="tab-content">
                  <div className="business-stats-grid">
                    <div className="business-stat-card">
                      <div className="stat-visual">
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.monthlySalesVolume}</span>
                        <span className="stat-label">Monthly Sales Volume</span>
                      </div>
                    </div>
                    <div className="business-stat-card">
                      <div className="stat-visual iata">
                        <i className="fas fa-plane"></i>
                      </div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.iata || 'N/A'}</span>
                        <span className="stat-label">IATA Code</span>
                      </div>
                    </div>
                    <div className="business-stat-card">
                      <div className="stat-visual referral">
                        <i className="fas fa-user-friends"></i>
                      </div>
                      <div className="stat-data">
                        <span className="stat-value">{selectedPartner.referredBy || 'Direct'}</span>
                        <span className="stat-label">Referred By</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="tab-content">
                  <div className="documents-grid">
                    {/* Address Proof Document */}
                    <div className="document-card">
                      <div className="document-header">
                        <div className="document-icon address">
                          <i className="fas fa-id-card"></i>
                        </div>
                        <div className="document-title">
                          <h4>Address Proof</h4>
                          <span>{selectedPartner.addressProofType || 'Not specified'}</span>
                        </div>
                      </div>
                      {selectedPartner.addressProofData ? (
                        <div className="document-preview">
                          <img 
                            src={selectedPartner.addressProofData} 
                            alt="Address Proof"
                            onClick={() => handleViewDocument('Address Proof', selectedPartner.addressProofData)}
                          />
                          <div className="document-actions">
                            <button 
                              className="view-doc-btn"
                              onClick={() => handleViewDocument('Address Proof', selectedPartner.addressProofData)}
                            >
                              <i className="fas fa-expand"></i> View Full Size
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="no-document">
                          <i className="fas fa-file-times"></i>
                          <p>No document uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* PAN Card Document */}
                    <div className="document-card">
                      <div className="document-header">
                        <div className="document-icon pan">
                          <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="document-title">
                          <h4>PAN Card</h4>
                          <span>{selectedPartner.panNumber}</span>
                        </div>
                      </div>
                      <div className="pan-holder-info">
                        <label>Card Holder Name</label>
                        <span>{selectedPartner.panCardHolderName}</span>
                      </div>
                      {selectedPartner.panCardData ? (
                        <div className="document-preview">
                          <img 
                            src={selectedPartner.panCardData} 
                            alt="PAN Card"
                            onClick={() => handleViewDocument('PAN Card', selectedPartner.panCardData)}
                          />
                          <div className="document-actions">
                            <button 
                              className="view-doc-btn"
                              onClick={() => handleViewDocument('PAN Card', selectedPartner.panCardData)}
                            >
                              <i className="fas fa-expand"></i> View Full Size
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="no-document">
                          <i className="fas fa-file-times"></i>
                          <p>No document uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="partner-modal-footer">
              {selectedPartner.status === 'pending' && (
                <div className="action-buttons-group">
                  <button 
                    className="action-btn approve" 
                    onClick={() => handleApprove(selectedPartner)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                    Approve Partner
                  </button>
                  <button 
                    className="action-btn reject" 
                    onClick={() => handleRejectClick(selectedPartner)}
                    disabled={actionLoading}
                  >
                    <i className="fas fa-times-circle"></i> Reject Partner
                  </button>
                </div>
              )}
              <button className="action-btn close" onClick={handleCloseModal}>
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && documentToView.data && createPortal(
        <div className="document-viewer-overlay" onClick={handleCloseDocumentModal}>
          <div className="document-viewer" onClick={e => e.stopPropagation()}>
            <div className="document-viewer-header">
              <h3><i className="fas fa-file-image"></i> {documentToView.title}</h3>
              <button className="close-viewer-btn" onClick={handleCloseDocumentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="document-viewer-body">
              <img src={documentToView.data} alt={documentToView.title} />
            </div>
            <div className="document-viewer-footer">
              <a 
                href={documentToView.data} 
                download={`${documentToView.title}.jpg`}
                className="download-doc-btn"
              >
                <i className="fas fa-download"></i> Download
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {showRejectModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="reject-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-exclamation-triangle"></i> Reject Partner</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="reject-warning">
                <p>You are about to reject <strong>{selectedPartner?.companyName}</strong>.</p>
                <p>Please provide a detailed reason for rejection:</p>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (e.g., Invalid documents, Incomplete information, etc.)"
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-reject-lg" 
                onClick={handleRejectConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-times"></i>}
                Confirm Rejection
              </button>
              <button className="btn btn-close" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PortalDashboard;
