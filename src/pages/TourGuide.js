import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AOS from 'aos';

export default function TourGuide() {
  const { id } = useParams();

  useEffect(() => {
    AOS.refresh();
  }, []);

  const guides = {
    1: {
      name: 'Jacob Jones',
      title: 'Senior Tour Guide',
      image: 'https://tourm-react.netlify.app/assets/img/team/team_1_1.jpg',
      experience: '12 Years',
      languages: ['English', 'French', 'Spanish'],
      bio: 'Jacob is an experienced tour guide with over 12 years of expertise in European and Asian tours. He specializes in cultural heritage sites and has guided thousands of travelers to unforgettable experiences.',
      specialization: ['Cultural Tours', 'Heritage Sites', 'Adventure Expeditions'],
      tours: [
        { name: 'Greece Tour Package', price: '$980/Person' },
        { name: 'Italy Tour Package', price: '$980/Person' },
        { name: 'France Tour Package', price: '$1,050/Person' }
      ],
      social: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com'
      }
    }
  };

  const guide = guides[id] || guides[1];

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
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '8px'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: '700' }}>Tour Guide Profile</h1>
        </div>
      </section>

      {/* Guide Profile */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '50px',
            alignItems: 'start'
          }}>
            {/* Profile Card */}
            <div data-aos="fade-right" style={{
              textAlign: 'center'
            }}>
              <div style={{
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 30px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }}>
                <img src={guide.image} alt={guide.name} style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
              </div>

              <h2 style={{
                fontSize: '1.8rem',
                color: '#222',
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                {guide.name}
              </h2>
              <p style={{
                color: '#f39c12',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '25px'
              }}>
                {guide.title}
              </p>

              {/* Experience Badge */}
              <div style={{
                backgroundColor: '#f39c1215',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px'
              }}>
                <p style={{ color: '#666', marginBottom: '8px' }}>Professional Experience</p>
                <h3 style={{ fontSize: '2rem', color: '#f39c12', fontWeight: 'bold', margin: '0' }}>
                  {guide.experience}
                </h3>
              </div>

              {/* Social Links */}
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                marginBottom: '25px',
                flexWrap: 'wrap'
              }}>
                <a href={guide.social.facebook} target="_blank" rel="noopener noreferrer" style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1.2rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  f
                </a>
                <a href={guide.social.twitter} target="_blank" rel="noopener noreferrer" style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1.2rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  𝕏
                </a>
                <a href={guide.social.instagram} target="_blank" rel="noopener noreferrer" style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1.2rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  📷
                </a>
                <a href={guide.social.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontSize: '1.2rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                  in
                </a>
              </div>

              {/* Contact Button */}
              <a href="/contact"
                 style={{
                   display: 'block',
                   padding: '12px 30px',
                   backgroundColor: '#f39c12',
                   color: '#fff',
                   textDecoration: 'none',
                   borderRadius: '50px',
                   fontWeight: '600',
                   transition: 'all 0.3s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.target.style.backgroundColor = '#e67e22';
                   e.target.style.transform = 'scale(1.05)';
                 }}
                 onMouseLeave={(e) => {
                   e.target.style.backgroundColor = '#f39c12';
                   e.target.style.transform = 'scale(1)';
                 }}>
                Contact Guide
              </a>
            </div>

            {/* Guide Info */}
            <div data-aos="fade-left">
              {/* Bio */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#222',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  About {guide.name}
                </h3>
                <p style={{
                  color: '#666',
                  lineHeight: '1.8',
                  fontSize: '1rem'
                }}>
                  {guide.bio}
                </p>
              </div>

              {/* Languages */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#222',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  Languages
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {guide.languages.map((lang, idx) => (
                    <span key={idx} style={{
                      backgroundColor: '#f39c1215',
                      color: '#222',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#222',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  Specialization
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {guide.specialization.map((spec, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: '#f39c12', fontSize: '1.2rem' }}>✓</span>
                      <span style={{ color: '#222' }}>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tours */}
              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#222',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>
                  Available Tours
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  {guide.tours.map((tour, idx) => (
                    <div key={idx} style={{
                      padding: '15px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: '4px solid #f39c12'
                    }}>
                      <span style={{ color: '#222', fontWeight: '500' }}>
                        {tour.name}
                      </span>
                      <span style={{
                        color: '#f39c12',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        {tour.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
