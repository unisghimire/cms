# Consultancy Management System (CMS)

A comprehensive management system for consultancy businesses, built with modern technologies and best practices.

## Project Structure

```
CMS/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── index.tsx       # Entry point
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── backend/                 # Node.js backend application
│   ├── src/                # Source code
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
└── package.json           # Root package.json
```

## Features

- Client Management
- Project Management
- Team Management
- Financial Management
- Document Management
- Reporting and Analytics

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: Supabase
- Authentication: JWT
- UI Framework: Material-UI

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your configuration

4. Start the development servers:
   ```bash
   npm start
   ```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 