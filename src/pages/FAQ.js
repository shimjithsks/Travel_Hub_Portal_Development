import React, { useEffect, useState } from 'react';
import AOS from 'aos';

export default function FAQ() {
  useEffect(() => {
    AOS.refresh();
  }, []);

  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I book a tour with Tourm?',
      answer: 'Booking a tour is easy! Browse our available destinations and tour packages, select your preferred dates, add it to your cart, and proceed to checkout. You can also contact our support team for personalized assistance.'
    },
    {
      id: 2,
      question: 'What is your cancellation policy?',
      answer: 'We offer flexible cancellation policies. Tours cancelled 30 days before the start date will receive a full refund. Cancellations between 14-30 days get 50% refund, and within 14 days no refund is applicable. Travel insurance is recommended.'
    },
    {
      id: 3,
      question: 'Are travel insurance and visas included?',
      answer: 'Travel insurance is not included in our packages but is highly recommended. Visa assistance is provided, but travelers are responsible for obtaining their own visas. We provide guidance and support throughout the visa application process.'
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. A deposit of 30% is required at booking, with the remaining balance due 14 days before departure.'
    },
    {
      id: 5,
      question: 'What is included in the tour package?',
      answer: 'Most packages include accommodation, daily breakfast, guided tours, entrance fees to major attractions, and transportation during the tour. Flights and travel insurance are typically not included but can be added for an additional cost.'
    },
    {
      id: 6,
      question: 'Can I customize my tour itinerary?',
      answer: 'Absolutely! We offer custom tour packages tailored to your preferences. Contact our team with your requirements, and we\'ll create a personalized itinerary that matches your interests and budget.'
    },
    {
      id: 7,
      question: 'What if I have dietary restrictions?',
      answer: 'We accommodate various dietary restrictions including vegetarian, vegan, and religious diets. Please inform us at the time of booking so we can make appropriate arrangements with hotels and restaurants.'
    },
    {
      id: 8,
      question: 'How do I contact customer support?',
      answer: 'You can reach our 24/7 customer support team via email (support24@tourm.com), phone (+01 234 567 890), or through our website contact form. We\'re here to help with any questions or concerns.'
    },
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundImage: 'url(https://tourm-react.netlify.app/assets/img/bg/1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '40px 20px',
          borderRadius: '8px'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: '700' }}>Frequently Asked Questions</h1>
          <p style={{ color: '#f39c12', fontSize: '1.1rem' }}>Find answers to common questions</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            color: '#222',
            marginBottom: '60px',
            fontWeight: '700'
          }}>
            We're Here to Help
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, index) => (
              <div key={faq.id}
                   data-aos="fade-up"
                   style={{
                     backgroundColor: '#fff',
                     border: '1px solid #e0e0e0',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     transition: 'all 0.3s ease'
                   }}>
                {/* Question Header */}
                <div
                  onClick={() => toggleFAQ(faq.id)}
                  style={{
                    padding: '25px',
                    cursor: 'pointer',
                    backgroundColor: openFAQ === faq.id ? '#f39c1215' : '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: openFAQ === faq.id ? '4px solid #f39c12' : '4px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (openFAQ !== faq.id) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (openFAQ !== faq.id) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    color: '#222',
                    fontWeight: '600',
                    margin: '0',
                    flex: '1'
                  }}>
                    {faq.question}
                  </h3>
                  <span style={{
                    fontSize: '1.5rem',
                    color: '#f39c12',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s ease',
                    transform: openFAQ === faq.id ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </span>
                </div>

                {/* Answer */}
                {openFAQ === faq.id && (
                  <div style={{
                    padding: '25px',
                    paddingTop: '15px',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa'
                  }}>
                    <p style={{
                      color: '#666',
                      lineHeight: '1.8',
                      margin: '0',
                      fontSize: '1rem'
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div style={{
            backgroundColor: '#f39c1215',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            marginTop: '60px'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#222',
              marginBottom: '15px',
              fontWeight: '700'
            }}>
              Didn't find your answer?
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '25px',
              fontSize: '1rem'
            }}>
              Our customer support team is ready to assist you 24/7
            </p>
            <a href="/contact"
               style={{
                 display: 'inline-block',
                 padding: '15px 40px',
                 backgroundColor: '#f39c12',
                 color: '#fff',
                 textDecoration: 'none',
                 borderRadius: '50px',
                 fontWeight: '600',
                 transition: 'all 0.3s ease',
                 border: 'none',
                 cursor: 'pointer'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.backgroundColor = '#e67e22';
                 e.currentTarget.style.transform = 'scale(1.05)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.backgroundColor = '#f39c12';
                 e.currentTarget.style.transform = 'scale(1)';
               }}>
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
