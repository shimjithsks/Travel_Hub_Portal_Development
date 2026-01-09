import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/gallery.css';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const filters = ['All', 'Beaches', 'Mountains', 'Cities', 'Nature', 'Heritage'];

  const gallery = [
    { 
      id: 1, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_1.jpg',
      title: 'Sunset Paradise',
      location: 'Maldives',
      category: 'Beaches',
      size: 'tall'
    },
    { 
      id: 2, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_2.jpg',
      title: 'Alpine Serenity',
      location: 'Swiss Alps',
      category: 'Mountains',
      size: 'normal'
    },
    { 
      id: 3, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_3.jpg',
      title: 'Urban Lights',
      location: 'Tokyo, Japan',
      category: 'Cities',
      size: 'normal'
    },
    { 
      id: 4, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_4.jpg',
      title: 'Tropical Haven',
      location: 'Bali, Indonesia',
      category: 'Nature',
      size: 'wide'
    },
    { 
      id: 5, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_5.jpg',
      title: 'Ancient Wonders',
      location: 'Petra, Jordan',
      category: 'Heritage',
      size: 'normal'
    },
    { 
      id: 6, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_6.jpg',
      title: 'Coastal Dreams',
      location: 'Santorini, Greece',
      category: 'Beaches',
      size: 'tall'
    },
    { 
      id: 7, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_7.jpg',
      title: 'Mountain Majesty',
      location: 'Himalayas, Nepal',
      category: 'Mountains',
      size: 'normal'
    },
    { 
      id: 8, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_1.jpg',
      title: 'Island Paradise',
      location: 'Phuket, Thailand',
      category: 'Beaches',
      size: 'normal'
    },
    { 
      id: 9, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_3.jpg',
      title: 'City Skyline',
      location: 'Dubai, UAE',
      category: 'Cities',
      size: 'wide'
    },
    { 
      id: 10, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_5.jpg',
      title: 'Rainforest Magic',
      location: 'Amazon, Brazil',
      category: 'Nature',
      size: 'normal'
    },
    { 
      id: 11, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_2.jpg',
      title: 'Historic Palace',
      location: 'Rajasthan, India',
      category: 'Heritage',
      size: 'normal'
    },
    { 
      id: 12, 
      image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_4.jpg',
      title: 'Desert Dunes',
      location: 'Sahara, Morocco',
      category: 'Nature',
      size: 'normal'
    },
  ];

  const filteredGallery = activeFilter === 'All' 
    ? gallery 
    : gallery.filter(item => item.category === activeFilter);

  const openLightbox = (index) => {
    setLightbox({ open: true, index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox({ open: false, index: 0 });
    document.body.style.overflow = 'auto';
  };

  const navigateLightbox = (direction) => {
    const newIndex = direction === 'next' 
      ? (lightbox.index + 1) % filteredGallery.length
      : (lightbox.index - 1 + filteredGallery.length) % filteredGallery.length;
    setLightbox({ ...lightbox, index: newIndex });
  };

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-hero-content" data-aos="fade-up">
          <span className="gallery-hero-badge">
            <i className="fas fa-images"></i>
            Visual Stories
          </span>
          <h1>Travel Gallery</h1>
          <p className="gallery-hero-subtitle">
            Explore stunning destinations through our curated collection of breathtaking travel photography
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="gallery-filters">
        {filters.map(filter => (
          <button 
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-section-header" data-aos="fade-up">
            <h2>Explore Our Collection</h2>
            <p>Showing {filteredGallery.length} stunning destinations</p>
          </div>

          <div className="gallery-masonry">
            {filteredGallery.map((item, index) => (
              <div 
                key={item.id} 
                className={`gallery-item ${item.size}`}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                onClick={() => openLightbox(index)}
              >
                <img src={item.image} alt={item.title} />
                
                <div className="gallery-actions">
                  <button className="gallery-action-btn" title="View">
                    <i className="fas fa-expand"></i>
                  </button>
                  <button className="gallery-action-btn" title="Like">
                    <i className="fas fa-heart"></i>
                  </button>
                </div>

                <div className="gallery-overlay">
                  <div className="gallery-overlay-content">
                    <span className="gallery-category">
                      <i className="fas fa-tag"></i>
                      {item.category}
                    </span>
                    <h3 className="gallery-title">{item.title}</h3>
                    <p className="gallery-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="gallery-stats">
        <div className="stats-container">
          <div className="stats-header" data-aos="fade-up">
            <span className="stats-badge">
              <i className="fas fa-chart-bar"></i>
              Our Achievements
            </span>
            <h2>Numbers That Speak</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="0">
              <div className="stat-card-inner">
                <div className="stat-icon-wrap">
                  <i className="fas fa-camera"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">500<span className="stat-plus">+</span></span>
                  <span className="stat-label">Photos Captured</span>
                </div>
                <div className="stat-glow"></div>
              </div>
            </div>
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="100">
              <div className="stat-card-inner">
                <div className="stat-icon-wrap">
                  <i className="fas fa-globe-asia"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">50<span className="stat-plus">+</span></span>
                  <span className="stat-label">Destinations</span>
                </div>
                <div className="stat-glow"></div>
              </div>
            </div>
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="stat-card-inner">
                <div className="stat-icon-wrap">
                  <i className="fas fa-heart"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">10K<span className="stat-plus">+</span></span>
                  <span className="stat-label">Happy Travelers</span>
                </div>
                <div className="stat-glow"></div>
              </div>
            </div>
            <div className="stat-card" data-aos="zoom-in" data-aos-delay="300">
              <div className="stat-card-inner">
                <div className="stat-icon-wrap">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-number">25<span className="stat-plus">+</span></span>
                  <span className="stat-label">Awards Won</span>
                </div>
                <div className="stat-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gallery-cta" data-aos="fade-up">
        <h2>Ready to Create Your Own Memories?</h2>
        <p>Book your next adventure and capture breathtaking moments across the world</p>
        <Link to="/tours" className="gallery-cta-btn">
          Explore Tours <i className="fas fa-arrow-right"></i>
        </Link>
      </section>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
            
            <button 
              className="lightbox-nav prev" 
              onClick={() => navigateLightbox('prev')}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <img 
              src={filteredGallery[lightbox.index].image} 
              alt={filteredGallery[lightbox.index].title} 
            />
            
            <button 
              className="lightbox-nav next" 
              onClick={() => navigateLightbox('next')}
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            <div className="lightbox-info">
              <h3>{filteredGallery[lightbox.index].title}</h3>
              <p><i className="fas fa-map-marker-alt"></i> {filteredGallery[lightbox.index].location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
