import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AOS from 'aos';

export default function BlogDetail() {
  const { id } = useParams();

  useEffect(() => {
    AOS.refresh();
  }, []);

  const blogs = {
    1: {
      title: '10 Reasons why you should visit New Jersey',
      author: 'Sarah Anderson',
      date: 'July 06 2024',
      readTime: '7 Min Read',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      category: 'Travel Guide',
      content: `
        New Jersey, often overlooked by travelers, is a hidden gem that offers incredible experiences for every type of traveler. From pristine beaches to world-class museums, vibrant food scenes to stunning natural landscapes, there are countless reasons to add New Jersey to your travel bucket list.
        
        The state boasts one of the most iconic boardwalks in America, featuring amusement parks, restaurants, and entertainment venues. Beyond the boardwalk, visitors can explore charming coastal towns, historic sites, and beautiful state parks.
        
        Whether you're looking for a relaxing beach getaway, an adventure-filled trip, or a cultural exploration, New Jersey delivers unforgettable memories. The accessibility from major cities makes it an ideal destination for weekend trips or extended vacations.
      `,
      relatedPosts: [
        { id: 2, title: 'The best time to visit Japan & enjoy the cherry blossoms', author: 'John Smith' },
        { id: 3, title: 'The 7 amazing destinations for adventure seekers', author: 'Mike Johnson' }
      ]
    }
  };

  const blog = blogs[id] || blogs[1];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundImage: `url(${blog.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px 20px',
          color: '#fff'
        }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: '#f39c12',
            color: '#fff',
            padding: '8px 15px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            {blog.category}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '15px' }}>
            {blog.title}
          </h1>
        </div>
      </section>

      {/* Blog Content */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Meta Info */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e0e0e0',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#f39c12',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              {blog.author.charAt(0)}
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', fontWeight: '700', color: '#222' }}>
                {blog.author}
              </p>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666' }}>
                <span>📅 {blog.date}</span>
                <span>⏱️ {blog.readTime}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article data-aos="fade-up">
            {blog.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} style={{
                  color: '#666',
                  lineHeight: '1.8',
                  fontSize: '1.05rem',
                  marginBottom: '25px',
                  textAlign: 'justify'
                }}>
                  {paragraph.trim()}
                </p>
              )
            ))}
          </article>

          {/* Share Section */}
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '30px',
            borderRadius: '12px',
            marginTop: '60px',
            marginBottom: '60px'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              color: '#222',
              fontWeight: '700',
              marginBottom: '20px'
            }}>
              Share This Article
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              {['Facebook', 'Twitter', 'LinkedIn', 'Email'].map((platform, idx) => (
                <button key={idx} style={{
                  padding: '10px 20px',
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}>
                  Share on {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Related Posts */}
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#222',
              fontWeight: '700',
              marginBottom: '30px'
            }}>
              Related Articles
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px'
            }}>
              {blog.relatedPosts.map((post) => (
                <div key={post.id} data-aos="fade-up" style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(243, 156, 18, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    backgroundColor: '#e0e0e0',
                    height: '150px',
                    backgroundImage: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}>
                    [Image]
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '10px' }}>
                      By {post.author}
                    </p>
                    <h4 style={{
                      color: '#222',
                      fontWeight: '700',
                      marginBottom: '15px',
                      fontSize: '1.1rem',
                      lineHeight: '1.4'
                    }}>
                      {post.title}
                    </h4>
                    <a href={`/blog/${post.id}`} style={{
                      color: '#f39c12',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#e67e22'}
                    onMouseLeave={(e) => e.target.style.color = '#f39c12'}>
                      Read Article →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
