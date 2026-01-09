import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: 'fa-phone-alt',
      title: 'Call Us',
      details: ['+91 90354 61093'],
      color: '#14b8a6'
    },
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      details: ['info@travelaxis.com', 'support@travelaxis.com'],
      color: '#f97316'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      details: ['123 Travel Street, Business Hub', 'Mumbai, Maharashtra 400001'],
      color: '#8b5cf6'
    },
    {
      icon: 'fa-clock',
      title: 'Working Hours',
      details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
      color: '#ec4899'
    }
  ];

  return (
    <div className="contact-page-new">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content" data-aos="fade-up">
              <span className="hero-badge">Get in Touch</span>
              <h1>We'd Love to Hear From You</h1>
              <p className="hero-subtitle">
                Have questions about your next adventure? Our travel experts are here to help you plan the perfect trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="info-cards-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="info-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="info-icon" style={{ background: `linear-gradient(135deg, ${info.color}20 0%, ${info.color}10 100%)` }}>
                  <i className={`fas ${info.icon}`} style={{ color: info.color }}></i>
                </div>
                <h3>{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i}>{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="form-container" data-aos="fade-right">
              <div className="form-header">
                <span className="section-badge">Send Message</span>
                <h2>Drop Us a Line</h2>
                <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Your Message</label>
                  <textarea
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i>
                  Send Message
                </button>
              </form>
            </div>

            {/* Map / Image */}
            <div className="map-container" data-aos="fade-left">
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1704825600000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
              <div className="quick-contact">
                <h4>Quick Contact</h4>
                <div className="quick-item">
                  <i className="fas fa-headset"></i>
                  <div>
                    <span>24/7 Support Line</span>
                    <strong>+91 90354 61093</strong>
                  </div>
                </div>
                <div className="quick-item">
                  <i className="fab fa-whatsapp"></i>
                  <div>
                    <span>WhatsApp</span>
                    <strong>+91 90354 61093</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <div className="faq-icon"><i className="fas fa-clock"></i></div>
              <h4>What are your response times?</h4>
              <p>We typically respond within 2-4 hours during business hours. For urgent matters, call our 24/7 support line.</p>
            </div>
            <div className="faq-item">
              <div className="faq-icon"><i className="fas fa-credit-card"></i></div>
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe.</p>
            </div>
            <div className="faq-item">
              <div className="faq-icon"><i className="fas fa-undo"></i></div>
              <h4>What is your cancellation policy?</h4>
              <p>Cancellation policies vary by booking. Full details are provided at the time of booking confirmation.</p>
            </div>
            <div className="faq-item">
              <div className="faq-icon"><i className="fas fa-shield-alt"></i></div>
              <h4>Is my payment secure?</h4>
              <p>Yes, all transactions are encrypted with SSL technology. We never store your complete payment details.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
