import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
      tagline: 'Discover trips you will remember',
      title: "Plan your next escape with Travel Axis",
      buttons: [
        { label: 'Explore Trips', link: '/tour', primary: true },
        { label: 'View Destinations', link: '/destination', primary: false }
      ]
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
      tagline: 'Handpicked places, flexible plans',
      title: 'Find stays, tours, and experiences',
      buttons: [
        { label: 'Explore Trips', link: '/tour', primary: true },
        { label: 'Our Services', link: '/service', primary: false }
      ]
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      tagline: 'Built for weekend breaks and big journeys',
      title: 'From ideas to itineraries in minutes',
      buttons: [
        { label: 'Explore Trips', link: '/tour', primary: true },
        { label: 'Get Support', link: '/contact', primary: false }
      ]
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop',
      tagline: 'Smart suggestions. Clear pricing.',
      title: 'Travel Axis helps you book confidently',
      buttons: [
        { label: 'Explore Trips', link: '/tour', primary: true },
        { label: 'About Us', link: '/about', primary: false }
      ]
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=600&fit=crop',
      tagline: 'Exclusive deals for members',
      title: 'Save more on curated travel bundles',
      buttons: [
        { label: 'See Offers', link: '/tour', primary: true },
        { label: 'Contact Us', link: '/contact', primary: false }
      ]
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const handleAutoPlayToggle = () => {
    setAutoPlay(!autoPlay);
  };

  return (
    <div className="hero-slider">
      {/* Slides Container */}
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%), url(${slide.image})`
            }}
          >
            <div className="slide-content">
              <p className="slide-tagline">{slide.tagline}</p>
              <h1 className="slide-title">{slide.title}</h1>
              <div className="slide-buttons">
                {slide.buttons.map((btn, idx) => (
                  <Link
                    key={idx}
                    to={btn.link}
                    className={`slide-btn ${btn.primary ? 'primary' : 'secondary'}`}
                  >
                    {btn.label}
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="slider-nav prev" onClick={prevSlide} aria-label="Previous slide">
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="slider-nav next" onClick={nextSlide} aria-label="Next slide">
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <button className="scroll-btn up" onClick={prevSlide} title="Previous">
          <i className="fa-solid fa-chevron-up"></i>
        </button>
        <div className="scroll-line"></div>
        <button className="scroll-btn down" onClick={nextSlide} title="Next">
          <i className="fa-solid fa-chevron-down"></i>
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="slide-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto Play Control */}
      <button 
        className="autoplay-toggle" 
        onClick={handleAutoPlayToggle}
        title={autoPlay ? 'Pause' : 'Play'}
      >
        <i className={`fa-solid fa-${autoPlay ? 'pause' : 'play'}`}></i>
      </button>
    </div>
  );
}
