import React from 'react';

export default function Gallery() {
  const gallery = [
    { id: 1, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_1.jpg' },
    { id: 2, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_2.jpg' },
    { id: 3, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_3.jpg' },
    { id: 4, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_4.jpg' },
    { id: 5, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_5.jpg' },
    { id: 6, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_6.jpg' },
    { id: 7, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_7.jpg' },
    { id: 8, image: 'https://tourm-react.netlify.app/assets/img/gallery/gallery_1_1.jpg' },
  ];

  return (
    <div className="gallery-page section gallery-section">
      <div className="container">
        <div className="section-header">
          <h2>Explore beauty of the whole world</h2>
          <h3>Our Gallery</h3>
        </div>
        <div className="gallery-grid">
          {gallery.map(img => (
            <div key={img.id} className="gallery-item">
              <img src={img.image} alt="gallery" />
              <div className="gallery-overlay">
                <a href={img.image} className="gallery-link">+</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
