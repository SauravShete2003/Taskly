# Taskly Backend

A full-stack task management application backend built with Node.js, Express.js, and MongoDB.

## 🏗️ Project Structure

```
server/
├── config/                 # Configuration files
│   ├── database.js        # Database connection setup
│   └── socket.js          # WebSocket configuration
├── controllers/           # Route controllers
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management
│   ├── projectController.js # Project management
│   ├── boardController.js # Board management
│   └── taskController.js  # Task management
├── middleware/            # Custom middleware
│   └── auth.js           # JWT authentication
├── models/               # Database models
│   ├── User.js          # User schema
│   ├── Project.js       # Project schema
│   ├── Board.js         # Board schema
│   └── Task.js          # Task schema
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User routes
│   ├── projects.js      # Project routes
│   ├── boards.js        # Board routes
│   └── tasks.js         # Task routes
├── utils/                # Utility functions
│   ├── constants.js     # Application constants
│   ├── responseHandler.js # Standardized response handlers
│   └── validation.js    # Input validation schemas
├── index.js             # Main server file
├── package.json         # Dependencies
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskly
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Project Endpoints

- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Board Endpoints

- `GET /api/projects/:projectId/boards` - Get project boards
- `POST /api/projects/:projectId/boards` - Create new board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Task Endpoints

- `GET /api/boards/:boardId/tasks` - Get board tasks
- `POST /api/boards/:boardId/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔧 Key Features

### Organized Structure
- **Config**: Database and WebSocket configurations
- **Controllers**: Business logic separated from routes
- **Middleware**: Authentication and custom middleware
- **Models**: MongoDB schemas with methods
- **Routes**: API endpoint definitions
- **Utils**: Common utilities and constants

### Utilities
- **Constants**: Centralized application constants
- **Response Handler**: Standardized API responses
- **Validation**: Input validation schemas

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### Real-time Features
- WebSocket integration for live updates
- Project-based room management
- Real-time task updates

## 🛠️ Development

### Adding New Features

1. **Models**: Create schema in `models/` directory
2. **Controllers**: Add business logic in `controllers/` directory
3. **Routes**: Define endpoints in `routes/` directory
4. **Validation**: Add validation schemas in `utils/validation.js`
5. **Constants**: Add new constants in `utils/constants.js`

### Error Handling

The application uses standardized error responses:
- `successResponse()` - For successful operations
- `errorResponse()` - For general errors
- `validationErrorResponse()` - For validation errors
- `notFoundResponse()` - For 404 errors
- `unauthorizedResponse()` - For 401 errors

### Validation

Input validation is handled using express-validator with centralized schemas in `utils/validation.js`.

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable management

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **socket.io**: WebSocket support
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables 