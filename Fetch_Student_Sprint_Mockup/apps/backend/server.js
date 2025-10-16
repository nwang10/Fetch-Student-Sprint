const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'posts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    posts: [
      {
        id: '1',
        avatar: 'https://i.pravatar.cc/100?img=1',
        name: 'Emily S.',
        subline: 'Completed 8 receipts this week',
        caption: 'Check out my latest grocery haul! 🥑',
        imageSource: { uri: '' },
        initialLikes: 24,
        initialComments: 5,
        points: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        avatar: 'https://i.pravatar.cc/100?img=5',
        name: 'Marcus T.',
        subline: 'Top earner this month',
        caption: 'Just hit 500 points! Who else is crushing it? 🎯',
        imageSource: { uri: 'https://picsum.photos/seed/groceries2/800/600' },
        initialLikes: 42,
        initialComments: 12,
        points: 25,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        avatar: 'https://i.pravatar.cc/100?img=9',
        name: 'Sarah L.',
        subline: 'Completed 3 receipts today',
        caption: 'Healthy shopping spree! Meal prep Sunday 🥗',
        imageSource: { uri: 'https://picsum.photos/seed/groceries3/800/600' },
        initialLikes: 18,
        initialComments: 3,
        points: 12,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        avatar: 'https://i.pravatar.cc/100?img=12',
        name: 'David K.',
        subline: 'Completed 15 receipts this week',
        caption: "Stocked up for the week! Let's go Fetch fam 💪",
        imageSource: { uri: 'https://picsum.photos/seed/groceries4/800/600' },
        initialLikes: 31,
        initialComments: 8,
        points: 20,
        createdAt: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
const readDB = () => {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Routes

// GET all posts
app.get('/api/posts', (req, res) => {
  try {
    const db = readDB();
    res.json({ success: true, posts: db.posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single post by ID
app.get('/api/posts/:id', (req, res) => {
  try {
    const db = readDB();
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      res.json({ success: true, post });
    } else {
      res.status(404).json({ success: false, error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE new post
app.post('/api/posts', (req, res) => {
  try {
    const db = readDB();
    const newPost = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    db.posts.unshift(newPost); // Add to beginning of array
    writeDB(db);
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE post
app.put('/api/posts/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      db.posts[index] = { ...db.posts[index], ...req.body };
      writeDB(db);
      res.json({ success: true, post: db.posts[index] });
    } else {
      res.status(404).json({ success: false, error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const db = readDB();
    const index = db.posts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      const deletedPost = db.posts.splice(index, 1)[0];
      writeDB(db);
      res.json({ success: true, post: deletedPost });
    } else {
      res.status(404).json({ success: false, error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fetch Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${DB_FILE}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/posts       - Get all posts`);
  console.log(`  GET    /api/posts/:id   - Get single post`);
  console.log(`  POST   /api/posts       - Create new post`);
  console.log(`  PUT    /api/posts/:id   - Update post`);
  console.log(`  DELETE /api/posts/:id   - Delete post`);
  console.log(`  GET    /health          - Health check\n`);
});
