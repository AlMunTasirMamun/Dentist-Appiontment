# Dentist Appointment Booking Platform

A full-stack MVP for a Dentist Appointment Booking Platform where patients can view doctors and book appointments using a calendar-based system.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Node.js + Express.js (JavaScript)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + localStorage

## Features

### For Patients (Clients)
- ✅ Register and create a profile
- ✅ Login / Logout
- ✅ View list of doctors
- ✅ View doctor details
- ✅ Book appointments using a calendar-based UI
- ✅ Book appointment without registration (Guest booking)
- ✅ View booking confirmation
- ✅ View appointment history (registered users)

### For Admin
- ✅ Admin login
- ✅ Create, update, delete doctors
- ✅ Assign doctors' availability schedules
- ✅ View all appointments
- ✅ Manage users (list & roles)

### Appointment System
- ✅ Calendar-based booking
- ✅ Double-booking prevention
- ✅ Status management (pending, confirmed, cancelled, completed)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd Dentist_Appointment
```

2. **Setup the Backend**
```bash
cd server
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dentist_appointment
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. **Start the backend server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

5. **Setup the Frontend**

Open a new terminal:
```bash
cd client
npm install
```

6. **Configure frontend environment**

Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

7. **Start the frontend**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Dentist_Appointment/
├── client/                    # Next.js frontend
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js           # Landing page
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── doctors/          # Doctor listing & details
│   │   ├── appointments/     # User appointments
│   │   ├── profile/          # User profile
│   │   └── admin/            # Admin dashboard
│   ├── components/
│   │   ├── layout/           # Navbar, Footer
│   │   ├── ui/               # Button, Input, Modal, Calendar
│   │   ├── doctors/          # DoctorCard, DoctorList
│   │   └── appointments/     # BookingForm, TimeSlotPicker
│   ├── context/              # AuthContext
│   ├── services/             # API services
│   └── utils/                # Helper functions
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Auth & role middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   └── utils/            # Helper functions
│   ├── app.js                # Express app
│   └── server.js             # Entry point
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| POST | `/api/auth/logout` | User logout | Protected |

### Doctors
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/doctors` | List all doctors | Public |
| GET | `/api/doctors/:id` | Get doctor details | Public |
| GET | `/api/doctors/:id/availability` | Get available slots | Public |
| POST | `/api/doctors` | Create doctor | Admin |
| PUT | `/api/doctors/:id` | Update doctor | Admin |
| DELETE | `/api/doctors/:id` | Delete doctor | Admin |

### Appointments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/appointments` | List appointments | Protected |
| GET | `/api/appointments/:id` | Get appointment | Protected |
| POST | `/api/appointments` | Create appointment | Public |
| PUT | `/api/appointments/:id` | Update appointment | Protected |
| DELETE | `/api/appointments/:id` | Cancel appointment | Protected |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user details | Admin/Owner |
| PUT | `/api/users/:id` | Update user | Admin/Owner |
| DELETE | `/api/users/:id` | Delete user | Admin |

## Creating an Admin User

To create an admin user, you can use the following steps:

1. Register a new user through the application
2. Connect to your MongoDB database
3. Update the user's role to 'admin':

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'admin' | 'client'
}
```

### Doctor
```javascript
{
  name: String,
  email: String,
  phone: String,
  specialty: String,
  bio: String,
  image: String,
  availability: [{
    day: String,
    startTime: String,
    endTime: String,
    slotDuration: Number
  }],
  status: 'active' | 'inactive'
}
```

### Appointment
```javascript
{
  doctor: ObjectId,
  patient: ObjectId (optional),
  guestInfo: { name, email, phone },
  date: Date,
  timeSlot: { start, end },
  reason: String,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}
```

## License

MIT
