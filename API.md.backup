# HR ESS API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password",
  "email": "john@company.ae",
  "role": "employee"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "username": "john_doe"
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe",
  "role": "employee"
}
```

## Employee Management

### List All Employees
**GET** `/api/employees`

**Response:**
```json
{
  "count": 2,
  "employees": [
    {
      "id": "EMP001",
      "name": "Ahmed Al-Mansoori",
      "email": "ahmed@company.ae",
      "position": "Software Engineer",
      "department": "IT",
      "joinDate": "2023-01-15"
    }
  ]
}
```

### Get Employee by ID
**GET** `/api/employees/:id`

**Response:**
```json
{
  "id": "EMP001",
  "name": "Ahmed Al-Mansoori",
  "email": "ahmed@company.ae",
  "position": "Software Engineer",
  "department": "IT",
  "joinDate": "2023-01-15"
}
```

### Create Employee
**POST** `/api/employees`

**Request Body:**
```json
{
  "id": "EMP003",
  "name": "Sara Al-Nahyan",
  "email": "sara@company.ae",
  "position": "Product Manager",
  "department": "Product",
  "joinDate": "2024-01-01"
}
```

**Response:** Returns created employee object

### Update Employee
**PUT** `/api/employees/:id`

**Request Body:**
```json
{
  "position": "Senior Software Engineer",
  "department": "Engineering"
}
```

**Response:** Returns updated employee object

### Delete Employee
**DELETE** `/api/employees/:id`

**Response:** 204 No Content

## Health Check

### System Health
**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "service": "HR ESS API",
  "version": "0.1.0",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "error": "Employee not found"
}
```

**409 Conflict:**
```json
{
  "error": "Employee ID already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Error details (only in development)"
}
```
