# EventHub 🎉

EventHub is a modern web application for discovering, managing, and sharing events. The application allows users to browse events, filter them by various criteria, search, and manage their own events.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Features](#features)
- [API](#api)
- [Future Tasks](#future-tasks)

## ✨ Key Features

- 🏠 **Home Page** with an attractive hero section and statistics
- 📅 **Events List** with full management functionality
- 🔍 **Search and Filtering** by city, category, and price
- 📊 **Sorting** by date, title, and location
- 📄 **Pagination** for convenient browsing
- ➕ **Event Creation** with validation
- ✏️ **Event Editing**
- 🗑️ **Event Deletion** with confirmation
- 📱 **Responsive Design** for all devices
- 🎨 **Modern UI** with Tailwind CSS and animations

## 🛠️ Technologies

### Frontend
- **React 19.1.1** - JavaScript library for building user interfaces
- **React Router DOM 6.28.0** - Routing and navigation
- **Vite 7.1.7** - Modern build tool and dev server
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Lucide React** - Icons
- **Radix UI** - UI components

### Backend
- **JSON Server** - REST API server for development
- **Node.js** - Runtime environment

### Development Tools
- **ESLint** - Code quality linter
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefix addition

## 📁 Project Structure

```
EventHub/
├── eventhub/                 # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/       # Common components (Modal, Toast, Pagination, etc.)
│   │   │   ├── events/       # Event components
│   │   │   ├── home/         # Home page components
│   │   │   ├── layout/       # Layout components (Navbar, Layout)
│   │   │   └── ui/           # UI components (Button, Card, Input)
│   │   ├── pages/            # Pages (HomePage, EventsPage, EventDetails)
│   │   ├── hooks/            # Custom React hooks (useEvents)
│   │   ├── utils/            # Helper functions
│   │   ├── data/             # Initial data
│   │   └── lib/              # Libraries and utilities
│   ├── public/               # Static files
│   └── package.json
├── server/                   # Backend server
│   ├── server.js             # JSON Server configuration
│   └── db.json               # Database (JSON)
└── package.json              # Root package.json
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventHub
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd eventhub
   npm install
   ```

3. **Start the backend server**
   ```bash
   # From root directory
   npm run server
   ```
   The server will start on `http://localhost:5000`

4. **Start the frontend application**
   ```bash
   # From eventhub directory
   cd eventhub
   npm run dev
   ```
   The application will start on `http://localhost:5173`

### Build for production
```bash
cd eventhub
npm run build
```

## 🎯 Features

### Home Page
- Hero section with attractive design
- Statistics for events and locations
- Features section with key characteristics

### Events Page
- **Search**: Search by title and location
- **Filtering**:
  - By city (dynamically from available events)
  - By category (Children, Culture, Sports, Workshops, Seasonal, Charitable)
  - By price (Free)
- **Sorting**: By date, title, or location (ascending/descending)
- **Pagination**: Configure number of items per page
- **CRUD Operations**:
  - Create new event
  - Edit existing event
  - Delete event with confirmation

### Event Details Page
- Complete event information
- Image (if available)
- Date, category, city, location
- Price and organizer
- Description

### UI/UX Characteristics
- Toast notifications for successful operations and errors
- Loading spinners during loading
- Error handling with retry capability
- Optimistic updates for better UX
- Responsive design for mobile devices
- Modern animations and transitions

## 🔌 API

The application uses JSON Server for REST API. The main endpoints are:

- `GET /events` - Get all events
- `GET /events/:id` - Get a specific event
- `POST /events` - Create a new event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event

### Example Event Structure
```json
{
  "id": "1",
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-12-01",
  "city": "Sofia",
  "location": "Event address",
  "category": "Culture",
  "price": "Free",
  "imageUrl": "https://example.com/image.jpg",
  "organizer": "Organizer Name",
  "organizerUrl": "https://example.com",
  "createdAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-11-01T00:00:00.000Z"
}
```

## 📝 Future Tasks

### Functional Improvements
- [ ] **User System and Authentication**
  - Registration and login
  - User profiles
  - Management of own events

- [ ] **Advanced Filters**
  - Date filter (today, tomorrow, this week, this month)
  - Price range filter
  - Combined filters

- [ ] **Map Integration**
  - Google Maps or OpenStreetMap integration
  - Display locations on map
  - Proximity search

- [ ] **Notifications and Reminders**
  - Email notifications for new events
  - Push notifications
  - Calendar for saving events

- [ ] **Social Features**
  - Share events on social networks
  - Comments and reviews
  - Rating system
  - Favorite events

- [ ] **Advanced Search**
  - Search by organizer
  - Search by description
  - Autocomplete in search

### Technical Improvements
- [ ] **Tests**
  - Unit tests (Jest, React Testing Library)
  - Integration tests
  - E2E tests (Playwright or Cypress)

- [ ] **State Management**
  - Redux or Zustand integration
  - Improved global state management

- [ ] **Backend Improvements**
  - Migration to real backend (Node.js/Express, Python/Django, etc.)
  - Database (PostgreSQL, MongoDB)
  - Authentication (JWT, OAuth)
  - File upload for images

- [ ] **Performance Optimizations**
  - Code splitting
  - Lazy loading of components
  - Image optimization
  - Caching strategies

- [ ] **SEO Optimizations**
  - Meta tags
  - Open Graph tags
  - Sitemap
  - Server-side rendering (SSR) or Static Site Generation (SSG)

### UI/UX Improvements
- [ ] **Accessibility**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Contrast and color schemes

- [ ] **Internationalization (i18n)**
  - English and other languages

- [ ] **Animations and Micro-interactions**
  - Richer animations
  - Skeleton loaders
  - Smooth transitions

### DevOps and Deployment
- [ ] **CI/CD Pipeline**
  - GitHub Actions or GitLab CI
  - Automated testing
  - Automated deployment

- [ ] **Deployment**
  - Frontend: Vercel, Netlify, or AWS
  - Backend: Heroku, Railway, or AWS
  - Database hosting

- [ ] **Monitoring and Analytics**
  - Error tracking (Sentry)
  - Analytics (Google Analytics)
  - Performance monitoring

### Additional Features
- [ ] **Calendar View**
  - Monthly event view
  - Weekly view

- [ ] **Export and Sharing**
  - Export to calendar (iCal)
  - PDF generation

- [ ] **Admin Panel**
  - Statistics dashboard
  - User management
  - Event moderation

## 🤝 Contributing

Contributions are welcome! Please create an issue or pull request for any suggestions or improvements.

## 📄 License

This project is open source and available under the MIT license.
