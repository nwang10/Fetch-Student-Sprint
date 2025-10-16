# Fetch Student Sprint - Backend API

A simple Express.js backend server for managing posts in the Fetch Student Sprint application.

## Features

- RESTful API for posts management
- JSON file-based database for persistence
- CORS enabled for mobile app integration
- Full CRUD operations (Create, Read, Update, Delete)

## Installation

```bash
cd apps/backend
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Get All Posts
```
GET /api/posts
```

### Get Single Post
```
GET /api/posts/:id
```

### Create Post
```
POST /api/posts
Content-Type: application/json

{
  "avatar": "https://i.pravatar.cc/100?img=50",
  "name": "John Doe",
  "subline": "Just posted",
  "caption": "My awesome post!",
  "imageSource": { "uri": "https://example.com/image.jpg" },
  "initialLikes": 0,
  "initialComments": 0,
  "points": 25
}
```

### Update Post
```
PUT /api/posts/:id
Content-Type: application/json

{
  "caption": "Updated caption"
}
```

### Delete Post
```
DELETE /api/posts/:id
```

### Health Check
```
GET /health
```

## Database

Posts are stored in `posts.json` file which is automatically created on first run with sample data. The file is git-ignored to prevent conflicts.

## CORS

CORS is enabled for all origins to allow the mobile app to connect to the backend.

## Development

The server uses:
- Express.js for routing
- body-parser for JSON parsing
- CORS for cross-origin requests
- Node.js fs module for file operations
