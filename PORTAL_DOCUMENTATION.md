# Travel Axis - Complete Travel Portal (Yatra Clone)

## 🌍 Project Overview

Travel Axis is a comprehensive travel booking portal similar to Yatra.com, built with React. It provides a complete travel solution including tour packages, hotel bookings, flight searches, and destination exploration.

## ✨ Features

### 1. **Home Page**
- Multi-tab search widget (Tours, Flights, Hotels)
- Featured destinations carousel
- Special offers section
- Quick action buttons
- Modern, responsive design

### 2. **Tours Page**
- 8+ Tour packages with detailed information
- Advanced filtering system:
  - Search by name or destination
  - Price range filter
  - Duration filter
  - Category filter
- Tour highlights and inclusions
- Star ratings and reviews
- Starting prices per person
- Direct booking links

### 3. **Destinations Page**
- 10+ Popular destinations worldwide
- Comprehensive destination information:
  - Best time to visit
  - Starting prices
  - Top attractions
  - Tour package count
- Multiple filter options:
  - Type (Beach, Adventure, Culture, Nature)
  - Duration
  - Category
  - Search by keyword
- Beautiful cards with hover effects

### 4. **Hotels Page** (NEW)
- Hotel listings with:
  - Star ratings
  - Guest reviews
  - Amenities
  - Pricing per night
  - High-quality images
- Filter by:
  - Price range (Budget, Moderate, Luxury)
  - Star ratings
  - Search by name or location

### 5. **Flights Page** (NEW)
- Flight search with:
  - From/To cities
  - Departure/Return dates
  - Number of passengers
  - Class selection (Economy, Premium, Business, First)
- Flight results showing:
  - Airline details
  - Flight duration
  - Departure/Arrival times
  - Non-stop/connections
  - Competitive pricing

### 6. **Tour Details Page**
- Complete tour information
- Day-by-day itinerary
- What's included section
- Guest reviews and ratings
- Booking sidebar with:
  - Date selection
  - Traveler count
  - Price calculation
  - Instant booking
  - Wishlist option

### 7. **Additional Pages**
- About Us
- Services
- Gallery
- Blog
- FAQ
- Contact
- Login/Register
- Customer Dashboard
- Operator Dashboard

## 🎨 Design Features

- **Modern UI/UX**: Clean, professional design inspired by leading travel portals
- **Responsive**: Fully responsive across all device sizes
- **Smooth Animations**: AOS (Animate On Scroll) library integration
- **Gradient Accents**: Teal/turquoise color scheme
- **Card-based Layouts**: Modern card designs with hover effects
- **Icon Integration**: Font Awesome icons throughout

## 🛠️ Technologies Used

- **React 19**: Latest React version
- **React Router DOM**: Client-side routing
- **AOS**: Scroll animations
- **Firebase**: Authentication and database
- **Bootstrap**: UI components
- **Font Awesome**: Icon library
- **EmailJS**: Contact form integration

## 📦 Installation & Setup

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
\`\`\`

## 🚀 Available Routes

- `/` - Home page with search widgets
- `/tour` - All tour packages
- `/destination` - All destinations
- `/hotels` - Hotel listings
- `/flights` - Flight search
- `/tour-details/:id` - Individual tour details
- `/about` - About us
- `/service` - Services offered
- `/gallery` - Photo gallery
- `/blog` - Travel blog
- `/faq` - Frequently asked questions
- `/contact` - Contact form
- `/login` - User login
- `/register` - User registration
- `/customer` - Customer dashboard
- `/operator` - Operator dashboard

## 🎯 Key Components

### Navigation
- Top info bar with contact details
- Main navigation with all pages
- Responsive mobile menu
- User authentication status
- Dynamic dashboard links

### Search Widgets
- **Tours**: Destination, dates, travelers
- **Flights**: From/To, dates, passengers, class
- **Hotels**: City, check-in/out, guests, rooms

### Cards & Listings
- Destination cards with images and info
- Tour cards with pricing and details
- Hotel cards with ratings and amenities
- Flight cards with airline details
- Blog post cards
- Service cards

### Forms
- Booking forms
- Contact forms
- Login/Register forms
- Search filters

## 📱 Responsive Design

- **Desktop**: Full layout with sidebars
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stack layouts, hamburger menu

## 🔐 Authentication

- Firebase authentication integration
- Role-based access (Customer/Operator)
- Protected routes
- Dashboard redirects based on role

## 💳 Booking Flow

1. Browse tours/hotels/flights
2. View detailed information
3. Select dates and travelers
4. Fill booking form
5. Contact/confirmation page

## 🎨 Color Scheme

- **Primary**: #1CA8CB (Teal)
- **Secondary**: #0A9BA8 (Dark Teal)
- **Accent**: #E9F6F9 (Light Teal)
- **Text**: #113D48 (Dark Blue)
- **Grey**: #6E7070

## 📊 Tour Data Structure

\`\`\`javascript
{
  id: Number,
  name: String,
  location: String,
  price: Number,
  duration: String,
  rating: Number,
  reviews: Number,
  image: String,
  category: String,
  highlights: Array,
  included: Array,
  itinerary: Array
}
\`\`\`

## 🏨 Hotel Data Structure

\`\`\`javascript
{
  id: Number,
  name: String,
  location: String,
  price: Number,
  rating: Number,
  reviews: Number,
  image: String,
  amenities: Array,
  type: String,
  stars: Number
}
\`\`\`

## ✈️ Flight Data Structure

\`\`\`javascript
{
  id: Number,
  airline: String,
  flightNo: String,
  from: String,
  to: String,
  departure: String,
  arrival: String,
  duration: String,
  price: Number,
  stops: String,
  class: String
}
\`\`\`

## 📈 Future Enhancements

- [ ] Payment gateway integration
- [ ] User reviews and ratings
- [ ] Booking history
- [ ] Email notifications
- [ ] Social media integration
- [ ] Multi-currency support
- [ ] Multi-language support
- [ ] Real-time availability
- [ ] Price comparison
- [ ] Travel insurance
- [ ] Visa assistance
- [ ] Car rentals
- [ ] Activities and experiences

## 🤝 Contributing

This is a complete travel portal template ready for customization and deployment.

## 📄 License

This project is created for educational and commercial purposes.

## 📞 Support

For support and queries, visit the contact page or reach out through the provided channels.

---

**Built with ❤️ using React and modern web technologies**

**Travel Axis - Your Gateway to World Exploration** 🌎✈️🏨
