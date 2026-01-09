import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AOS from 'aos';
import '../styles/blogDetail.css';

export default function BlogDetail() {
  const { id } = useParams();

  useEffect(() => {
    AOS.init({ duration: 800 });
    window.scrollTo(0, 0);
  }, [id]);

  const blogs = {
    1: {
      title: '10 Reasons why you should visit New Jersey',
      author: 'Sarah Anderson',
      date: 'July 06, 2024',
      readTime: '7 Min Read',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg',
      category: 'Travel Guide',
      tags: ['Travel', 'USA', 'Beach', 'Adventure'],
      content: `
        New Jersey, often overlooked by travelers, is a hidden gem that offers incredible experiences for every type of traveler. From pristine beaches to world-class museums, vibrant food scenes to stunning natural landscapes, there are countless reasons to add New Jersey to your travel bucket list.
        
        The state boasts one of the most iconic boardwalks in America, featuring amusement parks, restaurants, and entertainment venues. Beyond the boardwalk, visitors can explore charming coastal towns, historic sites, and beautiful state parks.
        
        Whether you're looking for a relaxing beach getaway, an adventure-filled trip, or a cultural exploration, New Jersey delivers unforgettable memories. The accessibility from major cities makes it an ideal destination for weekend trips or extended vacations.

        From the stunning views at Cape May to the excitement of Atlantic City, every corner of this state has something unique to offer. The diverse culinary scene reflects the multicultural heritage, with amazing Italian, Indian, and fusion restaurants.

        Nature lovers will appreciate the Delaware Water Gap, Pine Barrens, and numerous hiking trails. History buffs can explore Revolutionary War sites and Victorian architecture. Whatever your interests, New Jersey welcomes you with open arms.
      `,
      relatedPosts: [
        { id: 2, title: 'The best time to visit Japan & enjoy the cherry blossoms', author: 'John Smith', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg' },
        { id: 3, title: 'The 7 amazing destinations for adventure seekers', author: 'Mike Johnson', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg' }
      ]
    },
    2: {
      title: 'The best time to visit Japan & enjoy the cherry blossoms',
      author: 'Priya Sharma',
      date: 'July 07, 2024',
      readTime: '8 Min Read',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg',
      category: 'Culture',
      tags: ['Japan', 'Cherry Blossoms', 'Culture', 'Spring'],
      content: `
        Japan's cherry blossom season, known as "Sakura," is one of the most magical times to visit this incredible country. The delicate pink and white flowers transform the landscape into a breathtaking wonderland that attracts millions of visitors each year.
        
        The best time to witness cherry blossoms varies by region, typically occurring between late March and early May. Tokyo and Kyoto usually see peak blooms in late March to early April, while northern regions like Hokkaido bloom later in May.
        
        Planning your trip requires attention to bloom forecasts, as the flowers only last about two weeks. Popular spots include Ueno Park in Tokyo, Maruyama Park in Kyoto, and Hirosaki Castle in Aomori. The Japanese tradition of "hanami" or flower viewing involves picnicking under the blossoms with friends and family.

        Beyond the blossoms, spring in Japan offers pleasant weather, fewer crowds than summer, and the opportunity to experience traditional festivals. Consider visiting lesser-known spots for a more intimate experience with nature's beauty.
      `,
      relatedPosts: [
        { id: 1, title: '10 Reasons why you should visit New Jersey', author: 'Sarah Anderson', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg' },
        { id: 3, title: 'The 7 amazing destinations for adventure seekers', author: 'Mike Johnson', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg' }
      ]
    },
    3: {
      title: 'The 7 amazing destinations for adventure seekers',
      author: 'Amit Kumar',
      date: 'July 09, 2024',
      readTime: '9 Min Read',
      image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg',
      category: 'Adventure',
      tags: ['Adventure', 'Trekking', 'Extreme Sports', 'Travel'],
      content: `
        For those who crave adrenaline and extraordinary experiences, these seven destinations offer the ultimate adventure playground. From mountain peaks to ocean depths, prepare to push your limits and create unforgettable memories.
        
        New Zealand tops the list with bungee jumping, skydiving, and glacier hiking. The country's diverse landscapes provide endless opportunities for thrill-seekers. Costa Rica offers zip-lining through rainforest canopies and world-class white water rafting.
        
        Nepal beckons trekkers with the Himalayas, including the legendary Everest Base Camp trek. Iceland's unique geology creates opportunities for ice cave exploration, glacier walks, and diving between tectonic plates.

        For underwater adventures, Australia's Great Barrier Reef and Indonesia's Raja Ampat offer spectacular diving experiences. South Africa provides the chance to cage dive with great white sharks and safari through wildlife reserves.

        Each destination requires proper preparation and respect for nature. Working with experienced guides ensures safety while maximizing the adventure experience. Whether you're a seasoned adventurer or trying something new, these destinations deliver unforgettable thrills.
      `,
      relatedPosts: [
        { id: 1, title: '10 Reasons why you should visit New Jersey', author: 'Sarah Anderson', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_2.jpg' },
        { id: 2, title: 'The best time to visit Japan & enjoy the cherry blossoms', author: 'Priya Sharma', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg' }
      ]
    },
    7: {
      title: 'Ultimate Guide to Exploring Kerala Backwaters',
      author: 'Travel Axis Team',
      date: 'July 20, 2024',
      readTime: '12 Min Read',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
      category: 'Culture',
      tags: ['Kerala', 'India', 'Backwaters', 'Nature', 'Houseboat'],
      content: `
        Kerala's backwaters are a mesmerizing network of interconnected canals, rivers, lakes, and inlets that stretch along the Malabar Coast. This unique ecosystem offers one of the most serene and beautiful travel experiences in India.
        
        The backwaters span over 900 kilometers, with Alleppey (Alappuzha) being the most popular starting point. Here, you can board a traditional houseboat called a "kettuvallam" and drift through palm-fringed waterways, passing by villages where life has remained unchanged for centuries.
        
        The best time to visit is from September to March when the weather is pleasant and the monsoon has refreshed the landscape. During this period, the waters are calm, and the lush greenery is at its most vibrant.

        A typical houseboat experience includes comfortable accommodations, freshly prepared Kerala cuisine featuring local seafood and coconut-based dishes, and the chance to witness spectacular sunsets over the water. Many houseboats offer overnight stays, allowing you to wake up to the sounds of nature and local fishermen beginning their day.

        Beyond houseboats, explore the region through canoe rides that take you into narrower waterways inaccessible to larger boats. Visit coir-making villages, toddy shops, and ancient temples along the banks. The Kumarakom Bird Sanctuary is a must-visit for birdwatchers.

        Kerala's backwaters offer a perfect blend of relaxation and cultural immersion. Whether you're seeking romance, family bonding, or solo reflection, this destination delivers an experience that stays with you forever.
      `,
      relatedPosts: [
        { id: 2, title: 'The best time to visit Japan & enjoy the cherry blossoms', author: 'Priya Sharma', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_3.jpg' },
        { id: 3, title: 'The 7 amazing destinations for adventure seekers', author: 'Amit Kumar', image: 'https://tourm-react.netlify.app/assets/img/blog/blog_1_1.jpg' }
      ]
    }
  };

  const blog = blogs[id] || blogs[1];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="blog-detail-page">
      {/* Hero Section */}
      <section 
        className="blog-detail-hero"
        style={{ backgroundImage: `url(${blog.image})` }}
      >
        <div className="blog-detail-hero-content" data-aos="fade-up">
          <span className="blog-detail-category">
            <i className="fas fa-tag"></i>
            {blog.category}
          </span>
          <h1>{blog.title}</h1>
          <div className="blog-detail-hero-meta">
            <span><i className="fas fa-calendar-alt"></i> {blog.date}</span>
            <span><i className="fas fa-clock"></i> {blog.readTime}</span>
            <span><i className="fas fa-user"></i> {blog.author}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="blog-detail-content">
        <div className="blog-detail-container">
          {/* Author Card */}
          <div className="blog-author-card" data-aos="fade-up">
            <div className="author-avatar-large">
              {blog.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="author-info">
              <h4>{blog.author}</h4>
              <p>Travel Writer & Explorer</p>
              <div className="author-meta">
                <span><i className="fas fa-calendar-alt"></i> {blog.date}</span>
                <span><i className="fas fa-clock"></i> {blog.readTime}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article className="blog-article" data-aos="fade-up">
            {blog.content.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx}>{paragraph.trim()}</p>
              )
            ))}

            {/* Tags */}
            <div className="blog-tags">
              <span className="blog-tags-label">
                <i className="fas fa-tags"></i> Tags:
              </span>
              {blog.tags.map((tag, idx) => (
                <span key={idx} className="blog-tag">{tag}</span>
              ))}
            </div>
          </article>

          {/* Share Section */}
          <div className="blog-share-section" data-aos="fade-up">
            <h3><i className="fas fa-share-alt"></i> Share This Article</h3>
            <div className="share-buttons">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="share-btn facebook">
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="share-btn twitter">
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${blog.title}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="share-btn linkedin">
                <i className="fab fa-linkedin-in"></i> LinkedIn
              </a>
              <a href={`https://wa.me/?text=${blog.title} ${window.location.href}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="share-btn whatsapp">
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
              <button onClick={copyToClipboard} className="share-btn copy-link">
                <i className="fas fa-link"></i> Copy Link
              </button>
            </div>
          </div>

          {/* Related Articles */}
          <div className="related-articles" data-aos="fade-up">
            <div className="related-articles-header">
              <h2><i className="fas fa-newspaper"></i> Related Articles</h2>
            </div>

            <div className="related-articles-grid">
              {blog.relatedPosts.map((post) => (
                <div key={post.id} className="related-article-card">
                  <div className="related-article-image">
                    {post.image ? (
                      <img src={post.image} alt={post.title} />
                    ) : (
                      <i className="fas fa-image placeholder-icon"></i>
                    )}
                  </div>
                  <div className="related-article-content">
                    <div className="related-article-meta">
                      <span><i className="fas fa-user"></i> {post.author}</span>
                    </div>
                    <h4>{post.title}</h4>
                    <Link to={`/blog/${post.id}`} className="related-article-link">
                      Read Article <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="blog-navigation">
            <Link to="/blog" className="nav-link-prev">
              <div className="nav-link-icon">
                <i className="fas fa-arrow-left"></i>
              </div>
              <div className="nav-link-content">
                <span>Go Back</span>
                <strong>All Articles</strong>
              </div>
            </Link>
            <Link to={`/blog/${parseInt(id) < 7 ? parseInt(id) + 1 : 1}`} className="nav-link-next">
              <div className="nav-link-icon">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="nav-link-content">
                <span>Next Article</span>
                <strong>Continue Reading</strong>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
