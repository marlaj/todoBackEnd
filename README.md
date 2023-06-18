# TodoApp Backend

This is the backend repository for the TodoApp project. It provides the server-side functionality for managing and storing tasks using Prisma and SQLite.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and authentication
- Task creation, retrieval, completion and deletition 
- Error handling and validation
- RESTful API endpoints
- Integration with a SQLite database using Prisma

## Technologies Used

- Node.js
- Express.js
- Prisma
- SQLite

## Getting Started

To get started with the TodoApp backend, follow these steps:

1. Clone this repository to your local machine.
2. Install Node.js (if not already installed).
3. Install project dependencies by running `npm install`.
4. Create `.env` file and insert the following in it { DATABASE_URL="file:./dev.db" }.
5. Set up a SQLite database and configure the connection URL in the `.env` file based on the provided `.env.example` file.
6. Run database migrations by executing `npx prisma migrate dev`.
7. Start the server by running `npm start`.

## API Endpoints

The backend provides the following API endpoints:

- `POST /register`: User registration
- `POST /login`: User login
- `POST /tasks`: Add a new task
- `GET /tasks`: Retrieve user tasks
- `POST /tasks/complete`: Mark a task as completed

## Database

The backend uses a SQLite database to store user information and tasks. The database connection URL should be configured in the `.env` file.

Create `.env` file and insert the following in it { DATABASE_URL="file:./dev.db" }.

## Schema
model User {
  id       Int      @id @default(autoincrement())
  name     String
  email    String   @unique
  password String
  tasks    Task[]
}

model Task {
  id        Int     @id @default(autoincrement())
  title     String
  completed Boolean @default(false)
  userId    Int
  user      User    @relation(fields: [userId], references: [id])
}
