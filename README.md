# Real-Time College Bus Tracking System - Frontend

A modern React-based frontend application for tracking college buses in real-time. Built with React.js, Tailwind CSS, and ES6+ JavaScript.

## Features

### Public Pages
- **Landing Page**: Beautiful homepage with project description and navigation buttons
- **Signup Page**: Responsive signup form with client-side validation and password hashing
- **Login Page**: Secure login with role-based authentication and session management
- **Track Bus Demo**: Limited demo page for bus tracking

### Student Dashboard
- View assigned bus number and route details
- Real-time bus location tracking on interactive map
- Estimated arrival time (ETA) with delay detection
- Live bus status updates
- Alert notifications for delays
- View delay reasons
- Responsive design for mobile and desktop

### Driver Dashboard
- Start/End trip functionality
- Real-time GPS location sharing
- Auto-update location every 10 seconds
- Report delays with reason
- View current location on map
- Location accuracy display

### Admin Dashboard
- Add/Update buses
- Assign drivers to buses
- View all buses with live locations
- Monitor bus status and capacity
- View delay reports
- Send announcements to users (all, students, parents, or drivers)
- Interactive map view for selected buses

### Real-Time Features
- Live bus location updates using Fetch API
- Map integration (Google Maps API or OpenStreetMap/Leaflet)
- Delay detection and alert system
- Real-time notifications (Push, SMS, Email)
- Auto-refresh location data

## Technologies Used

- **React.js** (v18.2.0) - UI library
- **React Router DOM** (v6.20.0) - Routing
- **Tailwind CSS** (v3.3.6) - Styling
- **Crypto-JS** (v4.2.0) - Password hashing
- **Vite** (v5.0.8) - Build tool and dev server

## Project Structure

```
bus/
├── index.html                    # Main HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Main app component with routing
│   ├── index.css                 # Global styles with Tailwind
│   ├── components/
│   │   ├── MapComponent.jsx      # Map component (Google Maps/Leaflet)
│   │   ├── NotificationPopup.jsx # Notification popup component
│   │   └── ProtectedRoute.jsx    # Protected route wrapper
│   ├── pages/
│   │   ├── LandingPage.jsx       # Landing page component
│   │   ├── SignupPage.jsx        # Signup page component
│   │   ├── LoginPage.jsx         # Login page component
│   │   ├── TrackBusPage.jsx      # Track bus demo page
│   │   ├── StudentDashboard.jsx  # Student dashboard
│   │   ├── DriverDashboard.jsx   # Driver dashboard
│   │   └── AdminDashboard.jsx   # Admin dashboard
│   └── utils/
│       ├── auth.js               # Authentication utilities
│       ├── validation.js         # Form validation utilities
│       ├── delayDetection.js     # Delay detection and alerts
│       ├── realtimeUpdates.js    # Real-time location updates
│       └── notifications.js      # Notification system (Push/SMS/Email)
└── README.md                     # This file
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Pages

### Public Pages

#### 1. Landing Page (`/`)
- Displays project name and description
- Features three main action buttons:
  - **Login**: Redirects to `/login`
  - **Sign Up**: Redirects to `/signup`
  - **Track Bus (Demo)**: Redirects to `/track-bus`

#### 2. Signup Page (`/signup`)
- Form fields:
  - Name (with validation)
  - Email (with email format validation)
  - Mobile Number (10-digit validation)
  - Role selection (Student/Parent/Driver/Admin)
  - Password (with strength validation)
  - Confirm Password (with match validation)
- Client-side validation for all fields
- Password hashing using SHA-256 before submission
- Redirects to login page on successful signup

#### 3. Login Page (`/login`)
- Form fields:
  - Email
  - Password
  - Role selection (Student/Parent/Driver/Admin)
- Password hashing before sending to backend
- Session/token management using localStorage
- Role-based redirects after successful login:
  - Student → `/student/dashboard`
  - Parent → `/parent/dashboard`
  - Driver → `/driver/dashboard`
  - Admin → `/admin/dashboard`

#### 4. Track Bus Page (`/track-bus`)
- Demo/Limited version
- Shows placeholder for map view
- Displays demo bus information
- Prompts users to sign up or login for full access

### Protected Dashboards

#### 5. Student Dashboard (`/student/dashboard`)
**Features:**
- **Assigned Bus Information**: Display bus number, driver name, and status
- **Route Details**: View complete route with stops
- **Live Bus Location**: Real-time tracking on interactive map
- **Estimated Arrival Time**: ETA with delay detection
- **Alert Notifications**: Real-time alerts for delays
- **Delay Reasons**: View reasons for bus delays
- **Auto-refresh**: Location updates every 5 seconds

**Components:**
- Map integration for live tracking
- Notification popups for alerts
- Delay detection system
- Real-time location updates

#### 6. Driver Dashboard (`/driver/dashboard`)
**Features:**
- **Trip Management**: Start/End trip functionality
- **GPS Location Sharing**: Share current location manually or automatically
- **Auto-update Location**: Updates every 10 seconds when trip is active
- **Delay Reporting**: Report delays with reason
- **Location Display**: View current location on map
- **Location Accuracy**: Display GPS accuracy information

**Components:**
- GPS location access
- Real-time location updates
- Delay reporting form
- Map display with current location

#### 7. Admin Dashboard (`/admin/dashboard`)
**Features:**
- **Bus Management**: Add new buses with details
- **Driver Assignment**: Assign drivers to buses
- **Live Monitoring**: View all buses with real-time locations
- **Delay Reports**: View and manage delay reports
- **Announcements**: Send announcements to users
- **Bus Status**: Monitor bus capacity and status

**Components:**
- Bus management modals
- Driver assignment interface
- Announcement system
- Multi-bus map view

## Form Validation

### Signup Form Validation
- **Name**: Minimum 2 characters, letters only
- **Email**: Valid email format
- **Mobile**: Exactly 10 digits
- **Password**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Confirm Password**: Must match password

### Login Form Validation
- **Email**: Valid email format
- **Password**: Required field
- **Role**: Must be selected

## Authentication

- Passwords are hashed using SHA-256 (CryptoJS) before sending to backend
- Session tokens are stored in localStorage
- User data (including role) is stored in localStorage
- Utility functions available in `src/utils/auth.js`:
  - `hashPassword()` - Hash password
  - `setSession()` - Store session token and user data
  - `getToken()` - Get current token
  - `getUserData()` - Get current user data
  - `clearSession()` - Clear session
  - `isAuthenticated()` - Check authentication status
  - `getRoleRedirect()` - Get redirect path based on role

## Real-Time Bus Tracking

### Map Integration

The system supports two map providers:

1. **Google Maps API** (Recommended)
   - Add your API key in `index.html`:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
   ```

2. **OpenStreetMap with Leaflet** (Free Alternative)
   - Uncomment in `index.html`:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   ```

### Real-Time Updates

- **Student Dashboard**: Updates bus location every 5 seconds
- **Driver Dashboard**: Updates location every 10 seconds when trip is active
- **Admin Dashboard**: Can view all buses with live locations

## Delay Detection & Alert System

### Features
- Automatic delay calculation based on expected vs actual arrival times
- Severity levels: None, Medium, High, Critical
- Real-time notifications for delays
- Delay reason tracking and display

### Notification Channels
- **Push Notifications**: Browser notifications (requires permission)
- **SMS**: Via backend API integration
- **Email**: Via backend API integration
- **In-App**: Notification popups

### Implementation
- Delay detection utilities in `src/utils/delayDetection.js`
- Notification system in `src/utils/notifications.js`
- Real-time updates in `src/utils/realtimeUpdates.js`

## Backend Integration

The frontend is ready for backend integration. You'll need to:

1. **Update API endpoints** in:
   - `src/pages/SignupPage.jsx` - Replace mock signup with actual API call
   - `src/pages/LoginPage.jsx` - Replace mock login with actual API call
   - `src/pages/StudentDashboard.jsx` - Bus assignment and location endpoints
   - `src/pages/DriverDashboard.jsx` - Trip management and location update endpoints
   - `src/pages/AdminDashboard.jsx` - Bus management, driver assignment, announcements
   - `src/utils/realtimeUpdates.js` - Real-time location fetching
   - `src/utils/notifications.js` - SMS and Email notification endpoints

2. **Example API integration** (commented in code):
   ```javascript
   const response = await fetch('/api/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(loginData)
   })
   const data = await response.json()
   ```

3. **Required API Endpoints:**
   - `POST /api/signup` - User registration
   - `POST /api/login` - User authentication
   - `GET /api/student/bus-assignment` - Get student's assigned bus
   - `GET /api/bus/:busNumber/location` - Get bus location
   - `POST /api/bus/:busNumber/location` - Update driver location
   - `POST /api/driver/start-trip` - Start trip
   - `POST /api/driver/end-trip` - End trip
   - `POST /api/driver/report-delay` - Report delay
   - `GET /api/admin/buses` - Get all buses
   - `POST /api/admin/buses` - Add new bus
   - `POST /api/admin/assign-driver` - Assign driver to bus
   - `POST /api/admin/announcements` - Send announcement
   - `POST /api/notifications/sms` - Send SMS
   - `POST /api/notifications/email` - Send Email

## Styling

The project uses Tailwind CSS for styling:
- Responsive design (mobile-first)
- Modern gradient backgrounds
- Smooth transitions and hover effects
- Consistent color scheme (blue/indigo theme)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- All components are functional components using React Hooks
- Form validation is performed client-side before submission
- Password hashing is done client-side (additional server-side hashing recommended)
- Session management uses localStorage (consider httpOnly cookies for production)
- Protected routes automatically redirect based on user role
- Real-time updates use Fetch API with polling (consider WebSockets for production)
- Map component supports both Google Maps and OpenStreetMap
- Notifications support multiple channels (Push, SMS, Email)
- All dashboards are fully responsive and mobile-friendly

## Security Considerations

1. **API Keys**: Never commit API keys to version control. Use environment variables.
2. **Authentication**: Implement proper JWT token validation on backend
3. **HTTPS**: Always use HTTPS in production for GPS location sharing
4. **Input Validation**: Backend should validate all inputs, not just frontend
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **CORS**: Configure CORS properly on backend

## Performance Optimization

- Real-time updates use efficient polling intervals
- Map components lazy load when needed
- Notifications are debounced to prevent spam
- Components use React.memo where appropriate
- Images and assets should be optimized for production

## License

This project is part of a college bus tracking system.

