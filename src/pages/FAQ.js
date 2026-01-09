import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/faq.css';

export default function FAQ() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [openFAQ, setOpenFAQ] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Questions', icon: 'fa-layer-group' },
    { id: 'booking', name: 'Booking', icon: 'fa-calendar-check' },
    { id: 'payment', name: 'Payment', icon: 'fa-credit-card' },
    { id: 'travel', name: 'Travel', icon: 'fa-plane' },
    { id: 'support', name: 'Support', icon: 'fa-headset' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a tour with Travel Axis?',
      answer: 'Booking a tour is easy! Browse our available destinations and tour packages, select your preferred dates, add it to your cart, and proceed to checkout. You can also contact our support team for personalized assistance.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'What is your cancellation policy?',
      answer: 'We offer flexible cancellation policies. Tours cancelled 30 days before the start date will receive a full refund. Cancellations between 14-30 days get 50% refund, and within 14 days no refund is applicable. Travel insurance is recommended.'
    },
    {
      id: 3,
      category: 'travel',
      question: 'Are travel insurance and visas included?',
      answer: 'Travel insurance is not included in our packages but is highly recommended. Visa assistance is provided, but travelers are responsible for obtaining their own visas. We provide guidance and support throughout the visa application process.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe. A deposit of 30% is required at booking, with the remaining balance due 14 days before departure.'
    },
    {
      id: 5,
      category: 'travel',
      question: 'What is included in the tour package?',
      answer: 'Most packages include accommodation, daily breakfast, guided tours, entrance fees to major attractions, and transportation during the tour. Flights and travel insurance are typically not included but can be added for an additional cost.'
    },
    {
      id: 6,
      category: 'booking',
      question: 'Can I customize my tour itinerary?',
      answer: 'Absolutely! We offer custom tour packages tailored to your preferences. Contact our team with your requirements, and we\'ll create a personalized itinerary that matches your interests and budget.'
    },
    {
      id: 7,
      category: 'travel',
      question: 'What if I have dietary restrictions?',
      answer: 'We accommodate various dietary restrictions including vegetarian, vegan, and religious diets. Please inform us at the time of booking so we can make appropriate arrangements with hotels and restaurants.'
    },
    {
      id: 8,
      category: 'support',
      question: 'How do I contact customer support?',
      answer: 'You can reach our 24/7 customer support team via email, phone (+91 90354 61093), WhatsApp, or through our website contact form. We\'re here to help with any questions or concerns.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Is my payment secure?',
      answer: 'Yes, all transactions are encrypted with SSL technology. We use industry-standard security protocols and never store your complete payment details. Your financial information is always protected.'
    },
    {
      id: 10,
      category: 'support',
      question: 'What are your response times?',
      answer: 'We typically respond within 2-4 hours during business hours. For urgent matters, call our 24/7 support line. Email queries are usually answered within 24 hours.'
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickHelpItems = [
    {
      icon: 'fa-phone-alt',
      color: '#14b8a6',
      title: 'Call Us',
      description: 'Speak directly with our travel experts for instant help.',
      linkText: '+91 90354 61093',
      link: 'tel:+919035461093'
    },
    {
      icon: 'fa-envelope',
      color: '#f97316',
      title: 'Email Us',
      description: 'Send us your queries and we\'ll respond within 24 hours.',
      linkText: 'Send Email',
      link: '/contact'
    },
    {
      icon: 'fa-comments',
      color: '#8b5cf6',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time for quick answers.',
      linkText: 'Start Chat',
      link: '/contact'
    }
  ];

  return (
    <div className="faq-page-new">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="container">
          <div className="faq-hero-content" data-aos="fade-up">
            <span className="faq-hero-badge">Help Center</span>
            <h1>Frequently Asked Questions</h1>
            <p className="faq-hero-subtitle">
              Find quick answers to common questions about bookings, payments, and travel arrangements.
            </p>
            <div className="faq-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="faq-categories-section">
        <div className="container">
          <div className="category-tabs" data-aos="fade-up">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <i className={`fas ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="faq-content-section">
        <div className="container">
          <div className="faq-section-header" data-aos="fade-up">
            <span className="faq-section-badge">
              {activeCategory === 'all' ? 'All Questions' : categories.find(c => c.id === activeCategory)?.name}
            </span>
            <h2>We're Here to Help</h2>
            <p>Click on any question to reveal the answer</p>
          </div>

          <div className="faq-list">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className={`faq-item ${openFAQ === faq.id ? 'active' : ''}`}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="faq-question" onClick={() => toggleFAQ(faq.id)}>
                  <div className="faq-question-content">
                    <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                    <h3>{faq.question}</h3>
                  </div>
                  <div className="faq-toggle">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
                {openFAQ === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}></i>
              <p>No questions found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="faq-quick-help">
        <div className="container">
          <div className="quick-help-header" data-aos="fade-up">
            <span className="faq-section-badge">Quick Help</span>
            <h2>Need More Assistance?</h2>
            <p>Our team is always ready to help you</p>
          </div>
          <div className="quick-help-grid">
            {quickHelpItems.map((item, index) => (
              <div key={index} className="quick-help-card" data-aos="fade-up" data-aos-delay={index * 100}>
                <div
                  className="quick-help-icon"
                  style={{ background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)` }}
                >
                  <i className={`fas ${item.icon}`} style={{ color: item.color }}></i>
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <Link to={item.link} className="quick-help-link">
                  {item.linkText} <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="faq-cta-section">
        <div className="container">
          <div className="faq-cta-box" data-aos="fade-up">
            <div className="faq-cta-content">
              <h3>Still Have Questions?</h3>
              <p>Can't find what you're looking for? Our dedicated support team is ready to assist you 24/7.</p>
              <div className="faq-cta-buttons">
                <Link to="/contact" className="faq-cta-btn primary">
                  <i className="fas fa-envelope"></i> Contact Us
                </Link>
                <a href="tel:+919035461093" className="faq-cta-btn secondary">
                  <i className="fas fa-phone-alt"></i> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
