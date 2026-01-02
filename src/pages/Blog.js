import React, { useEffect } from 'react';
import AOS from 'aos';

export default function Blog() {
  useEffect(() => {
    AOS.refresh();
  }, []);

  const blogs = [
    {
      id: 1,
      title: '10 Reasons why you should visit New Jersey',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      date: 'July 06 2024',
      readTime: '7 Min Read',
      excerpt: 'Discover the hidden gems of New Jersey with our comprehensive guide to the best attractions and destinations.'
    },
    {
      id: 2,
      title: 'The best time to visit Japan & enjoy the cherry blossoms',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg',
      date: 'July 07 2024',
      readTime: '8 Min Read',
      excerpt: 'Plan your perfect Japanese getaway during cherry blossom season with our expert tips and recommendations.'
    },
    {
      id: 3,
      title: 'The 7 amazing destinations for adventure seekers',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg',
      date: 'July 09 2024',
      readTime: '9 Min Read',
      excerpt: 'Explore the most thrilling adventure destinations across the globe for adrenaline seekers.'
    },
    {
      id: 4,
      title: 'Budget Travel Tips for Backpackers',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      date: 'July 10 2024',
      readTime: '10 Min Read',
      excerpt: 'Learn how to travel the world without breaking the bank with our practical budget travel tips.'
    },
    {
      id: 5,
      title: 'Top 10 Beach Destinations in Southeast Asia',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg',
      date: 'July 12 2024',
      readTime: '11 Min Read',
      excerpt: 'Discover the most beautiful and pristine beaches across Southeast Asia for your next vacation.'
    },
    {
      id: 6,
      title: 'Winter Wonderland: Skiing in the Alps',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg',
      date: 'July 15 2024',
      readTime: '6 Min Read',
      excerpt: 'Experience world-class skiing and breathtaking mountain views in the majestic Alpine region.'
    },
  ];

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
          <h1 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: '700' }}>Travel Blog</h1>
          <p style={{ color: '#f39c12', fontSize: '1.1rem' }}>Insights, Tips & Inspiring Stories</p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {blogs.map((blog) => (
              <article key={blog.id}
                       data-aos="fade-up"
                       style={{
                         backgroundColor: '#fff',
                         borderRadius: '12px',
                         overflow: 'hidden',
                         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                         transition: 'all 0.3s ease',
                         display: 'flex',
                         flexDirection: 'column'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(243, 156, 18, 0.15)';
                         e.currentTarget.style.transform = 'translateY(-10px)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                         e.currentTarget.style.transform = 'translateY(0)';
                       }}>
                {/* Featured Image */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  height: '220px',
                  backgroundColor: '#f0f0f0'
                }}>
                  <img src={blog.image} alt={blog.title} style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }} />
                </div>

                {/* Content */}
                <div style={{ padding: '30px', flex: '1', display: 'flex', flexDirection: 'column' }}>
                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '0.85rem',
                    color: '#999',
                    marginBottom: '15px'
                  }}>
                    <span>📅 {blog.date}</span>
                    <span>⏱️ {blog.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.4rem',
                    color: '#222',
                    marginBottom: '15px',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    flex: '1'
                  }}>
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    flex: '1'
                  }}>
                    {blog.excerpt}
                  </p>

                  {/* Read More Link */}
                  <a href={`/blog/${blog.id}`}
                     style={{
                       display: 'inline-block',
                       color: '#f39c12',
                       textDecoration: 'none',
                       fontWeight: '600',
                       transition: 'color 0.3s'
                     }}
                     onMouseEnter={(e) => e.target.style.color = '#e67e22'}
                     onMouseLeave={(e) => e.target.style.color = '#f39c12'}>
                    Read More →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
