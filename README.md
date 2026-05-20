<<<<<<< HEAD
<<<<<<< HEAD
SkillTrack – Employee Skill Tracking System

## Overview

SkillTrack is a full-stack employee skill management platform designed to help organizations monitor and improve employee learning and development.

The system allows employees to track their skill progress while administrators can manage employees and monitor learning activity across the organization.

SkillTrack helps companies build a learning-driven culture by tracking skill development, learning consistency, and progress analytics.

The current version of the project is more topic-driven and structured than the original starter implementation. Skills are now managed from an admin-controlled catalog and from curated roadmap pages, and employee progress is tied to completed topics instead of a manual percentage boost.

## Project Status

- Backend : In Progress
- Frontend : In Progress

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Hibernate / JPA
- MySQL

### Frontend

- React.js
- Tailwind CSS
- Axios

### Tools

- Maven
- Git & GitHub
- Postman
- MySQL Workbench

## Key Features

### Authentication & Security

- JWT based login system
- Secure API endpoints
- Role-based authorization
- Forgot password with OTP verification

### Skill Catalog and Roadmaps

- Admin can create, edit, and delete the official skill list
- Employees can only add skills from admin-approved catalog entries or roadmap entries
- Topic-level study links can be attached to each skill
- Admin skill changes flow into employee views like My Skills, Skill Details, Progress Tracker, and Skill Analytics

### Topic Based Learning

- Each skill can have topics and subtopics
- Progress is calculated from topic completion
- Skill details can show topics, study links, and learning breakdown in a compact form
- Daily study activity is tracked through the consistency tracker

### Role Based Access Control

SkillTrack supports two user roles.

#### ADMIN

- Manage employees
- View employee learning analytics
- Monitor skill development across the organization

#### EMPLOYEE

- Track personal skills
- Update skill progress through topic completion
- Maintain learning consistency
- Add only admin-approved or roadmap-approved skills

## Core Modules

### Employee Management

Administrators can manage employees within the system.

**Features:**

- Add employees
- View employees
- Delete employees

**Endpoints:**

- GET /api/employee
- POST /api/employee
- DELETE /api/employee/{id}

### Skill Management

Employees can track and update their learning progress.

**Features:**

- Add skills from the admin catalog or roadmap pages
- View topics, subtopics, and study links
- Update progress automatically when topics are completed
- Track completed, in-progress, and roadmap-added skills
- Open detailed skill pages for each skill

### Admin Skill Catalog

The admin dashboard includes a skill catalog module for managing the official learning list.

**Features:**

- Add new skills
- Edit existing skills
- Add or update topic links
- Remove skills from the dropdown when they are deleted
- Browse the skill list using pagination

**Endpoints:**

- GET /api/skills
- POST /api/skills
- PUT /api/skills/progress/{id}

### Consistency Tracker

The consistency tracker monitors daily learning activity.

**Features:**

- Record daily learning updates by topic
- Track consistency streak
- Link study activity to the selected skill topic
- Avoid random progress boosts and keep the data consistent

### Employee Profile and Dashboard

The employee profile now shows live employee information such as designation, department, skill counts, and related learning data. The dashboard sidebar has also been organized so Roadmaps, My Skills, Progress Tracker, Consistency Tracker, Skill Analytics, and Completed Skills appear in a cleaner order.

**Endpoint:**

- POST /api/consistency

### Authentication APIs

- POST /api/auth/login
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/reset-password

### Employee Skill APIs

- GET /api/employee/skills/options
- GET /api/employee/skills/catalog
- GET /api/employee/skills/overview/{employeeId}
- POST /api/employee/skills/add
- PUT /api/employee/skills/topics/{id}
- PUT /api/employee/skills/progress/{id}
- DELETE /api/employee/skills/{id}

### Roadmap Modules

SkillTrack includes curated roadmap pages for Frontend, Backend, and DevOps. These roadmap pages do not just show a learning path. They also allow employees to start a roadmap skill, see the topics for that skill, and open study links for each topic. This makes the roadmap a learning entry point instead of a static reference page.

## API Request / Response Examples

### Authentication

#### POST /api/auth/login

**Request body**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response body**

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "user@example.com",
  "role": "ROLE_EMPLOYEE"
}
```

#### POST /api/auth/send-otp

**Request body**

```json
{
  "email": "user@example.com"
}
```

**Response body**

```json
"OTP sent successfully"
```

#### POST /api/auth/verify-otp

**Request body**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response body**

```json
"OTP verified"
```

#### POST /api/auth/reset-password

**Request body**

```json
{
  "email": "user@example.com",
  "newPassword": "NewStrongP@ssw0rd"
}
```

**Response body**

```json
"Password updated successfully"
```

### Employee Management

#### POST /api/employee

**Request body**

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "department": "Engineering",
  "role": "ROLE_EMPLOYEE",
  "password": "SecureP@ss123"
}
```

**Response body**

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "department": "Engineering",
  "role": "ROLE_EMPLOYEE",
  "password": "SecureP@ss123"
}
```

> ⚠️ Current implementation returns the `password` field as part of the response. Consider hiding it in production.

#### GET /api/employee

**Response body**

```json
[
  {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "department": "Engineering",
    "role": "ROLE_EMPLOYEE",
    "password": "SecureP@ss123"
  }
]
```

#### GET /api/employee/{id}

**Response body**

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "department": "Engineering",
  "role": "ROLE_EMPLOYEE",
  "password": "SecureP@ss123"
}
```

#### DELETE /api/employee/{id}

**Response:** `204 No Content` (no body)

#### GET /api/employee/dashboard/total-employees

**Response body**

```json
42
```

### Skill Management

#### POST /api/employee/skills/add

**Request body**

```json
{
  "employeeId": 1,
  "skillName": "React",
  "category": "Frontend",
  "level": "Intermediate",
  "progressPercentage": 0,
  "targetDurationDays": 30
}
```

**Response body**

```json
{
  "id": 10,
  "employeeId": 1,
  "skillName": "React",
  "category": "Frontend",
  "level": "Intermediate",
  "progressPercentage": 0,
  "startDate": "2026-03-16",
  "endDate": null,
  "status": "IN_PROGRESS",
  "targetDurationDays": 30
}
```

#### GET /api/employee/skills/{employeeId}

**Response body**

```json
[
  {
    "id": 10,
    "employeeId": 1,
    "skillName": "React",
    "category": "Frontend",
    "level": "Intermediate",
    "progressPercentage": 0,
    "startDate": "2026-03-16",
    "endDate": null,
    "status": "IN_PROGRESS",
    "targetDurationDays": 30
  }
]
```

#### PUT /api/employee/skills/progress/{id}

**Request body**

```json
{
  "progressPercentage": 60
}
```

**Response body**

```json
{
  "id": 10,
  "employeeId": 1,
  "skillName": "React",
  "category": "Frontend",
  "level": "Intermediate",
  "progressPercentage": 60,
  "startDate": "2026-03-16",
  "endDate": null,
  "status": "IN_PROGRESS",
  "targetDurationDays": 30
}
```

#### DELETE /api/employee/skills/{id}

**Response:** `204 No Content` (no body)

#### Dashboard Skill APIs

##### GET /api/employee/skills/dashboard/in-progress

**Response body**

```json
[
  {
    "id": 10,
    "employeeId": 1,
    "skillName": "React",
    "category": "Frontend",
    "level": "Intermediate",
    "progressPercentage": 60,
    "startDate": "2026-03-16",
    "endDate": null,
    "status": "IN_PROGRESS",
    "targetDurationDays": 30
  }
]
```

##### GET /api/employee/skills/dashboard/completed

**Response body**

```json
[
  {
    "id": 11,
    "employeeId": 1,
    "skillName": "Java",
    "category": "Backend",
    "level": "Advanced",
    "progressPercentage": 100,
    "startDate": "2026-02-01",
    "endDate": "2026-03-01",
    "status": "COMPLETED",
    "targetDurationDays": 30
  }
]
```

##### GET /api/employee/skills/dashboard/total-skills

**Response body**

```json
17
```

##### GET /api/employee/skills/remaining-days/{id}

**Response body**

```json
12
```

### Consistency Tracker

#### POST /api/consistency/mark

**Request body**

```json
{
  "employeeSkillId": 10,
  "date": "2026-03-16",
  "studied": true
}
```

**Response body**

```json
{
  "id": 5,
  "employeeSkillId": 10,
  "date": "2026-03-16",
  "studied": true
}
```

#### GET /api/consistency/{employeeSkillId}

**Response body**

```json
[
  {
    "id": 5,
    "employeeSkillId": 10,
    "date": "2026-03-16",
    "studied": true
  }
]
```

#### DELETE /api/consistency/{id}

**Response:** `204 No Content` (no body)

#### GET /api/consistency/streak/{employeeSkillId}

**Response body**

```json
4
```

## Database Design

SkillTrack uses a relational database built with MySQL.

### Tables

| Table                   | Description                    |
| ----------------------- | ------------------------------ |
| `employee_entity`       | Stores employee information, designation, department, and profile image data |
| `skill_entity`          | Stores admin-managed skills, topics, and topic links |
| `employee_skill_entity` | Maps employees to skills and stores progress, completed topics, and learning links |
| `consistency_tracker`   | Tracks daily learning activity and topic-based consistency logs |

## System Architecture

SkillTrack follows a layered Spring Boot architecture.

```
Controller Layer
        ↓
Service Layer
        ↓
Repository Layer
        ↓
Database
```

### Components

- **Controller** – Handles API requests and responses.
- **Service** – Contains business logic and application workflow.
- **Repository** – Handles database operations using Spring Data JPA.
- **Entity** – Maps Java classes to database tables.

## Project Structure

```
skilltrack
│
├── skilltrack-backend
│   └── src/main/java/com/LearnTrack/skilltrack_backend
│       ├── config
│       ├── controller
│       ├── dto
│       ├── entity
│       ├── repository
│       ├── security
│       └── service
│
└── skilltrack-frontend
    └── src
        ├── pages
        ├── components
        ├── layouts
        ├── services
        └── routes
```

## End-to-End Application Flow

### Login Flow

```
User → Login Page
      ↓
Frontend sends request
POST /api/auth/login
      ↓
Spring Security validates credentials
      ↓
JWT token generated
      ↓
Token returned to frontend
      ↓
Frontend stores token
      ↓
Authenticated API requests
```

## Dashboards

### Employee Dashboard

The Employee Dashboard allows users to:

- View skills in progress
- Track learning percentage
- Add new skills
- Monitor daily learning streak

### Admin Dashboard

The Admin Dashboard provides:

- Employee management
- Skill analytics
- Organization learning statistics
- Consistency tracker reports

## How to Run the Project

### Backend

1. Navigate to the backend folder.

```
cd skilltrack-backend
```

2. Run the Spring Boot application.

```
mvn spring-boot:run
```

Server will start at:

```
http://localhost:8080
```

### Frontend

1. Navigate to the frontend folder.

```
cd skilltrack-frontend
```

2. Install dependencies.

```
npm install
```

3. Run the development server.

```
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

## Planned Improvements

- Admin Dashboard Creation
- Employee Profile Management

## Future Improvements

Planned enhancements include:

- Skill recommendation using AI
- Learning Resource Integration
- Gamification Features
- mobile application support



=======
# Stack_Trace
>>>>>>> d214683865c5a794d9c104a7a6d190defb9b821f
=======
# Stack_Trace
>>>>>>> d214683865c5a794d9c104a7a6d190defb9b821f
