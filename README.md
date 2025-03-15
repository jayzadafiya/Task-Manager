# Task Management API

## Overview

The Task Management API is a secure and scalable backend service for managing tasks with authentication, role-based access control, notifications, and logging. Users can create, update, and manage tasks, while admins have full control over all tasks. Real-time notifications and scheduled reminders are also implemented.

## Features

### 1. User Authentication & Authorization

- JWT-based authentication.
- Users can register, log in, and manage their account.
- Role-based access control (Admin & User):
  - **Admin**: Full access to all tasks.
  - **User**: Can manage only their own tasks.

### 2. Task Management

- Users can create, update, and delete tasks.
- Task attributes:
  - Title
  - Description
  - Status (Pending, In Progress, Completed)
  - Due Date
- Tasks can be assigned to other users by the task creator or an admin.

### 3. Task Status Management

- Users can update the status of their own tasks.
- Admins can update the status of any task.

### 4. Notifications System

- Real-time notifications using WebSockets when:
  - A task is assigned to a user.
  - A task is updated.
- Automated reminders via a cron job for tasks approaching their due date.

### 5. Logging & Auditing

- Logs all task actions (creation, updates, deletions).
- Tracks the user who performed each action.
- Endpoint to fetch audit logs of a specific task.

### 6. Performance & Security

- Optimized for handling concurrent requests.
- Implemented:
  - Rate limiting to prevent abuse.
  - Input validation for secure API requests.

## Installation & Setup

### Prerequisites

- **Node.js** (v16+ recommended)
- **MongoDB** (Ensure MongoDB is running locally or provide a remote connection string)

### 1. Clone the Repository

```sh
git clone https://github.com/jayzadafiya/Task-Manager.git
cd Task-Manager
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=1
```

### 4. Start the Server

```sh
npm run dev  # For development (nodemon)
npm start    # For production
```

## API Endpoints

### Authentication

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| POST   | /api/v1/auth/signup | Register a new user   |
| POST   | /api/v1/auth/login  | Login and get a token |

### Task Management

| Method | Endpoint                     | Description                 |
| ------ | ---------------------------- | --------------------------- |
| POST   | /api/v1/tasks                | Create a new task           |
| GET    | /api/v1/tasks                | Get all tasks (Admin only)  |
| GET    | /api/v1/tasks/:id            | Get a specific task         |
| PATCH  | /api/v1/tasks/:id/assign     | Assign a task to a user     |
| PATCH  | /api/v1/tasks/:id/status     | Update task status          |
| PUT    | /api/v1/tasks/:id            | Update a task               |
| DELETE | /api/v1/tasks/:id            | Delete a task (Owner/Admin) |
| GET    | /api/v1/tasks/:id/audit-logs | Get audit logs for a task   |

### Notifications (WebSockets)

- Clients should listen for `notification` events on WebSocket connection.

## Cron Job for Task Reminders

- Runs **at the start of each day** to notify users about approaching due dates.
