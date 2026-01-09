import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/blog.css';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const categories = ['All', 'Adventure', 'Beach', 'Culture', 'Tips', 'Food'];

  const blogs = [
    {
      id: 1,
      title: '10 Reasons why you should visit New Jersey',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      date: 'July 06, 2024',
      readTime: '7 Min Read',
      category: 'Adventure',
      author: 'Rahul M',
      excerpt: 'Discover the hidden gems of New Jersey with our comprehensive guide to the best attractions and destinations that will make your trip unforgettable.'
    },
    {
      id: 2,
      title: 'The best time to visit Japan & enjoy the cherry blossoms',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg',
      date: 'July 07, 2024',
      readTime: '8 Min Read',
      category: 'Culture',
      author: 'Priya S',
      excerpt: 'Plan your perfect Japanese getaway during cherry blossom season with our expert tips and recommendations for the best viewing spots.'
    },
    {
      id: 3,
      title: 'The 7 amazing destinations for adventure seekers',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg',
      date: 'July 09, 2024',
      readTime: '9 Min Read',
      category: 'Adventure',
      author: 'Amit K',
      excerpt: 'Explore the most thrilling adventure destinations across the globe for adrenaline seekers looking for their next big challenge.'
    },
    {
      id: 4,
      title: 'Budget Travel Tips for Backpackers',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      date: 'July 10, 2024',
      readTime: '10 Min Read',
      category: 'Tips',
      author: 'Sneha R',
      excerpt: 'Learn how to travel the world without breaking the bank with our practical budget travel tips and money-saving strategies.'
    },
    {
      id: 5,
      title: 'Top 10 Beach Destinations in Southeast Asia',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg',
      date: 'July 12, 2024',
      readTime: '11 Min Read',
      category: 'Beach',
      author: 'Vikram P',
      excerpt: 'Discover the most beautiful and pristine beaches across Southeast Asia for your next vacation paradise escape.'
    },
    {
      id: 6,
      title: 'Winter Wonderland: Skiing in the Alps',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg',
      date: 'July 15, 2024',
      readTime: '6 Min Read',
      category: 'Adventure',
      author: 'Neha G',
      excerpt: 'Experience world-class skiing and breathtaking mountain views in the majestic Alpine region of Europe.'
    },
  ];

  const featuredPost = {
    id: 7,
    title: 'Ultimate Guide to Exploring Kerala Backwaters',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    date: 'July 20, 2024',
    readTime: '12 Min Read',
    category: 'Culture',
    author: 'Travel Axis Team',
    excerpt: 'Embark on a serene journey through the enchanting backwaters of Kerala. From traditional houseboats to lush green landscapes, discover why Kerala is truly God\'s Own Country.'
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content" data-aos="fade-up">
            <span className="blog-hero-badge">
              <i className="fas fa-pen-fancy"></i>
              Travel Stories & Tips
            </span>
            <h1>Travel Blog</h1>
            <p className="blog-hero-subtitle">
              Insights, tips, and inspiring stories from around the world to fuel your wanderlust
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="container">
        <div className="blog-filters" data-aos="fade-up">
          <div className="blog-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="blog-category-filter">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="container">
          {/* Featured Post */}
          <div className="featured-post" data-aos="fade-up">
            <div className="featured-post-image">
              <img src={featuredPost.image} alt={featuredPost.title} />
              <span className="featured-badge">
                <i className="fas fa-star"></i> Featured
              </span>
            </div>
            <div className="featured-post-content">
              <span className="featured-post-category">
                <i className="fas fa-tag"></i> {featuredPost.category}
              </span>
              <h2 className="featured-post-title">{featuredPost.title}</h2>
              <p className="featured-post-excerpt">{featuredPost.excerpt}</p>
              <div className="featured-post-meta">
                <span><i className="fas fa-calendar-alt"></i> {featuredPost.date}</span>
                <span><i className="fas fa-clock"></i> {featuredPost.readTime}</span>
                <span><i className="fas fa-user"></i> {featuredPost.author}</span>
              </div>
              <Link to={`/blog/${featuredPost.id}`} className="featured-read-btn">
                Read Article <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Section Header */}
          <div className="blog-section-header">
            <h2 className="blog-section-title">
              <i className="fas fa-newspaper"></i>
              Latest Articles
            </h2>
            <span className="blog-count">{filteredBlogs.length} articles found</span>
          </div>

          {/* Blog Grid */}
          <div className="blog-grid">
            {filteredBlogs.map((blog, index) => (
              <article 
                key={blog.id} 
                className="blog-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="blog-card-image">
                  <img src={blog.image} alt={blog.title} />
                  <span className="blog-card-category">{blog.category}</span>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span><i className="fas fa-calendar-alt"></i> {blog.date}</span>
                    <span><i className="fas fa-clock"></i> {blog.readTime}</span>
                  </div>
                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-excerpt">{blog.excerpt}</p>
                  <div className="blog-card-footer">
                    <div className="blog-card-author">
                      <div className="author-avatar">
                        {blog.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="author-name">{blog.author}</span>
                    </div>
                    <Link to={`/blog/${blog.id}`} className="blog-read-more">
                      Read <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="blog-newsletter" data-aos="fade-up">
            <h3>Stay Updated with Travel Tips</h3>
            <p>Subscribe to our newsletter and never miss a travel story or insider tip.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
