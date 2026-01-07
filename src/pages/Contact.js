import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page section">
      <div className="contact-header-container">
        <div className="contact-header">
          <div className="contact-header-background">
            <div className="contact-bubble contact-bubble-1"></div>
            <div className="contact-bubble contact-bubble-2"></div>
            <div className="contact-bubble contact-bubble-3"></div>
            <div className="contact-message-icon">
              <i className="fas fa-envelope"></i>
            </div>
          </div>
          <div className="contact-header-content">
            <div className="contact-header-left">
              <div className="contact-icon-badge">
                <i className="fas fa-comments"></i>
              </div>
              <div className="contact-header-text">
                <h1>Contact Us</h1>
                <p>We're here to help and answer any question you might have</p>
              </div>
            </div>
            <div className="contact-response-info">
              <div className="response-item">
                <span className="response-time">24/7</span>
                <span className="response-label">Support</span>
              </div>
              <div className="response-divider"></div>
              <div className="response-item">
                <span className="response-time">2H</span>
                <span className="response-label">Response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2>Explore beauty of the whole world</h2>
          <h3>Contact Us</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Contact Form */}
          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Send us a Message</h4>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Get in Touch</h4>
            <div style={{ lineHeight: '2' }}>
              <p><strong>📞 Phone:</strong></p>
              <p><a href="tel:+01234567890" style={{ color: '#f39c12', textDecoration: 'none' }}>+01 234 567 890</a></p>
              <p><a href="tel:+09876543210" style={{ color: '#f39c12', textDecoration: 'none' }}>+09 876 543 210</a></p>
              
              <p style={{ marginTop: '1.5rem' }}><strong>✉️ Email:</strong></p>
              <p><a href="mailto:mailinfo00@tourm.com" style={{ color: '#f39c12', textDecoration: 'none' }}>mailinfo00@tourm.com</a></p>
              <p><a href="mailto:support24@tourm.com" style={{ color: '#f39c12', textDecoration: 'none' }}>support24@tourm.com</a></p>
              
              <p style={{ marginTop: '1.5rem' }}><strong>📍 Address:</strong></p>
              <p>789 Inner Lane, Holy park, California, USA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
