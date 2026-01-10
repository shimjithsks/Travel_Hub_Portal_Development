import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPartner } from '../../services/partnerService';
import '../../styles/agentSignup.css';

export default function AgentSignup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    address1: '',
    title: 'Mr',
    address2: '',
    contactFirstName: '',
    contactLastName: '',
    country: '',
    state: '',
    landline: '',
    city: '',
    email: '',
    pincode: '',
    mobile: '',
    referredBy: '',
    addressProofType: '',
    addressProofScan: null,
    panNumber: '',
    monthlySalesVolume: '',
    panCardHolderName: '',
    iata: '',
    panCardScan: null,
    captchaText: '',
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Prepare files for upload
      const files = {
        addressProofScan: formData.addressProofScan,
        panCardScan: formData.panCardScan
      };

      // Register partner in database
      const result = await registerPartner(formData, files);
      
      if (result.success) {
        alert('🎉 Registration Successful!\n\nThank you for registering as a Travel Axis Partner.\nOur team will review your application and contact you soon.\n\nYou can now login with your registered email.');
        navigate('/agent-login');
      }
    } catch (err) {
      console.error('Registration error details:', err);
      const errorMessage = err.message || 'Failed to register. Please try again.';
      setError(errorMessage);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agent-signup-page">
      <div className="signup-content">
        <div className="container">
          <div className="signup-card">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            <div className="signup-header">
              <h1>Partner Registration</h1>
              <div className="partner-login-link">
                Already a partner? <span onClick={() => navigate('/agent-login')} className="login-link">Partner Login</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="signup-form">
              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Address 1 *</label>
                    <input type="text" name="address1" value={formData.address1} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Title *</label>
                    <select name="title" value={formData.title} onChange={handleChange} required>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Address 2</label>
                    <input type="text" name="address2" value={formData.address2} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Contact First Name *</label>
                    <input type="text" name="contactFirstName" value={formData.contactFirstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Contact Last Name *</label>
                    <input type="text" name="contactLastName" value={formData.contactLastName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Landline</label>
                    <input type="text" name="landline" value={formData.landline} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>E-mail ID *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Pin Code *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Mobile *</label>
                    <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Referred By</label>
                    <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="e.g.= abc@yatra.com" />
                  </div>
                  <div className="form-group">
                    <label>Address proof Type</label>
                    <select name="addressProofType" value={formData.addressProofType} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Address Proof Scan Copy</label>
                    <input type="file" name="addressProofScan" onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* PAN Card Information */}
              <div className="form-section">
                <h3>PAN CARD Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Pan Number *</label>
                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Monthly Sales Volume *</label>
                    <input type="text" name="monthlySalesVolume" value={formData.monthlySalesVolume} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Pan Card Holder Name *</label>
                    <input type="text" name="panCardHolderName" value={formData.panCardHolderName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>IATA</label>
                    <select name="iata" value={formData.iata} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Upload Pan Card Scan Copy</label>
                    <input type="file" name="panCardScan" onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Captcha Information - Temporarily Disabled
              <div className="form-section">
                <h3>Captcha Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Captcha Image</label>
                    <img src="/captchaimg" alt="captchaimg" style={{ marginBottom: '10px' }} />
                    <button type="button" style={{ marginBottom: '10px' }}>click here for new image</button>
                  </div>
                  <div className="form-group">
                    <label>Enter Text from Image *</label>
                    <input type="text" name="captchaText" value={formData.captchaText} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              */}

              {/* Terms & Submit */}
              <div className="form-section">
                <label className="checkbox-label">
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} required />
                  <span>I have read and accepted the <a href="/terms">Terms of Use</a></span>
                </label>
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => navigate('/travel-agents')} disabled={isSubmitting}>Cancel</button>
                </div>
              </div>
            </form>
            <div className="signup-footer">
              <p>Contact Us | FAQs<br />Your IP is: 2405:201:d04f:c054:84db:ffa3:2022:7991</p>
            </div>
          </div>
        </div>
      </div>
      <div className="signup-page-footer">
        <div className="container">
          <p>© 2026 Travel Axis Online Limited, India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
