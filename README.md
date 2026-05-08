# Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control.

## Live Demo
🌐 [https://web-production-b707.up.railway.app/index.html](https://web-production-b707.up.railway.app/index.html)

## GitHub Repository
📦 [https://github.com/John-PaulX/task-manager](https://github.com/John-PaulX/task-manager)

---

## Features

- **Authentication** — Signup and Login with JWT tokens
- **Project Management** — Create projects, add team members
- **Task Management** — Create tasks, assign to members, set priority and due date
- **Task Status Tracking** — Move tasks between Todo, In Progress, and Done
- **Dashboard** — View all projects, stats, completed and overdue tasks
- **Role Based Access** — Project Admin can add members, all members can manage tasks

---

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.3.4
- Spring Security + JWT Authentication
- Spring Data JPA + Hibernate
- MySQL Database
- Maven

### Frontend
- Plain HTML5
- CSS3
- Vanilla JavaScript (Fetch API)

### Deployment
- Railway (Backend + MySQL Database)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login and get JWT token |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Get all my projects |
| POST | /api/projects | Create new project |
| GET | /api/projects/{id} | Get project by ID |
| POST | /api/projects/{id}/members | Add member to project |
| DELETE | /api/projects/{id} | Delete project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects/{id}/tasks | Get tasks in project |
| POST | /api/projects/{id}/tasks | Create task in project |
| PUT | /api/tasks/{id} | Update task |
| PATCH | /api/tasks/{id}/status | Update task status |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/tasks/my | Get my assigned tasks |
| GET | /api/tasks/overdue | Get overdue tasks |

---

## Database Schema

### Tables
- **users** — Stores user accounts and roles (ADMIN/MEMBER)
- **projects** — Stores project details
- **project_members** — Links users to projects with roles
- **tasks** — Stores tasks with status, priority, due date

---

## How to Run Locally

### Prerequisites
- Java 17 or higher
- Maven
- MySQL

### Steps

1. Clone the repository
```bash
git clone https://github.com/John-PaulX/task-manager.git
cd task-manager
```

2. Create MySQL database
```sql
CREATE DATABASE task_manager_db;
CREATE USER 'taskuser'@'localhost' IDENTIFIED BY 'taskpass123';
GRANT ALL PRIVILEGES ON task_manager_db.* TO 'taskuser'@'localhost';
```

3. Update application.properties with your local DB credentials

4. Run the backend
```bash
mvn spring-boot:run
```

5. Open the app
http://localhost:8080/index.html

---

## Project Structure
backend/
├── src/main/java/com/taskmanager/backend/
│   ├── controller/       # REST API endpoints
│   ├── service/          # Business logic
│   ├── repository/       # Database access
│   ├── entity/           # Database models
│   ├── dto/              # Request/Response objects
│   ├── security/         # JWT + Spring Security
│   └── config/           # Security configuration
└── src/main/resources/
├── static/           # Frontend files
│   ├── index.html
│   ├── dashboard.html
│   ├── project.html
│   ├── css/style.css
│   └── js/
└── application.properties

---

## Test Credentials

You can create your own account on the live app or use:
Email:    test@gmail.com
Password: 123456

---

## Screenshots

### Login Page
- Clean login and signup form
- JWT token stored in browser

### Dashboard
- Project cards with progress bars
- Stats showing total tasks, completed, overdue

### Project View
- Kanban style task board
- 3 columns — Todo, In Progress, Done
- Add members, create tasks, change status
