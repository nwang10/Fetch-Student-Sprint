const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
        createdAt: new Date().toISOString(),
        comments: []
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
        createdAt: new Date().toISOString(),
        comments: []
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
        createdAt: new Date().toISOString(),
        comments: []
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
        createdAt: new Date().toISOString(),
        comments: []
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

// ADD comment to post
app.post('/api/posts/:id/comments', (req, res) => {
  try {
    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const newComment = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      replies: req.body.replies || []
    };

    if (!db.posts[postIndex].comments) {
      db.posts[postIndex].comments = [];
    }

    const { parentId } = req.body;

    if (parentId) {
      // Add as reply to parent comment at any nesting level
      const addReplyToComment = (comments) => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          // Recursively check nested replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
            };
          }
          return comment;
        });
      };

      db.posts[postIndex].comments = addReplyToComment(db.posts[postIndex].comments);
    } else {
      // Add as top-level comment
      db.posts[postIndex].comments.unshift(newComment);
    }

    writeDB(db);

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE comment from post
app.delete('/api/posts/:postId/comments/:commentId', (req, res) => {
  try {
    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === req.params.postId);

    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (!db.posts[postIndex].comments) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Helper function to recursively delete comment and its replies
    const deleteCommentById = (comments) => {
      return comments
        .filter(c => c.id !== req.params.commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? deleteCommentById(comment.replies) : []
        }));
    };

    db.posts[postIndex].comments = deleteCommentById(db.posts[postIndex].comments);
    writeDB(db);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LIKE/UNLIKE comment
app.put('/api/posts/:postId/comments/:commentId/like', (req, res) => {
  try {
    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === req.params.postId);

    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (!db.posts[postIndex].comments) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Helper function to recursively update likes
    const toggleLikeById = (comments) => {
      return comments.map(comment => {
        if (comment.id === req.params.commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? (comment.likes || 1) - 1 : (comment.likes || 0) + 1
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleLikeById(comment.replies)
          };
        }
        return comment;
      });
    };

    db.posts[postIndex].comments = toggleLikeById(db.posts[postIndex].comments);
    writeDB(db);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate AI Roast Video
app.post('/api/generate-roast-video', async (req, res) => {
  try {
    const { roastText, receiptItems } = req.body;

    if (!roastText) {
      return res.status(400).json({ success: false, error: 'Roast text is required' });
    }

    // For demo purposes, we'll use OpenAI's TTS API to generate speech
    // You would need an OpenAI API key for this to work
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

    if (!OPENAI_API_KEY) {
      // If no API key, return a placeholder video URL
      console.log('No OpenAI API key found. Using placeholder video.');
      return res.json({
        success: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        message: 'Using placeholder video. Set OPENAI_API_KEY environment variable for AI-generated videos.'
      });
    }

    // Prepare the roast script for TTS
    const roastScript = `Hey there! Let me roast this receipt for you. ${roastText}`;

    // Call OpenAI TTS API to generate audio
    const postData = JSON.stringify({
      model: 'tts-1',
      voice: 'alloy', // or 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      input: roastScript,
      speed: 1.0
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Make request to OpenAI
    const openaiRequest = https.request(options, (openaiRes) => {
      const audioChunks = [];

      openaiRes.on('data', (chunk) => {
        audioChunks.push(chunk);
      });

      openaiRes.on('end', () => {
        if (openaiRes.statusCode === 200) {
          const audioBuffer = Buffer.concat(audioChunks);

          // Save audio file temporarily
          const audioFileName = `roast_${Date.now()}.mp3`;
          const audioPath = path.join(__dirname, 'temp', audioFileName);

          // Create temp directory if it doesn't exist
          if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
          }

          fs.writeFileSync(audioPath, audioBuffer);

          // For now, we'll just return the audio URL
          // In a full implementation, you would use FFmpeg to create a video with the audio
          // and animated text/visuals
          res.json({
            success: true,
            audioUrl: `/api/temp/${audioFileName}`,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            message: 'AI audio generated successfully. Video generation would require FFmpeg integration.'
          });
        } else {
          console.error('OpenAI API error:', openaiRes.statusCode);
          res.status(500).json({
            success: false,
            error: 'Failed to generate AI audio',
            details: openaiRes.statusCode
          });
        }
      });
    });

    openaiRequest.on('error', (error) => {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ success: false, error: 'Failed to generate AI video' });
    });

    openaiRequest.write(postData);
    openaiRequest.end();

  } catch (error) {
    console.error('Error generating roast video:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve temp files (for audio/video)
app.use('/api/temp', express.static(path.join(__dirname, 'temp')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server - Listen on 0.0.0.0 to accept connections from mobile devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fetch Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 Mobile devices can connect via your computer's IP address`);
  console.log(`📊 Database: ${DB_FILE}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/posts                              - Get all posts`);
  console.log(`  GET    /api/posts/:id                          - Get single post`);
  console.log(`  POST   /api/posts                              - Create new post`);
  console.log(`  PUT    /api/posts/:id                          - Update post`);
  console.log(`  DELETE /api/posts/:id                          - Delete post`);
  console.log(`  POST   /api/posts/:id/comments                 - Add comment to post`);
  console.log(`  DELETE /api/posts/:postId/comments/:commentId  - Delete comment`);
  console.log(`  PUT    /api/posts/:postId/comments/:commentId/like - Like/unlike comment`);
  console.log(`  POST   /api/generate-roast-video               - Generate AI roast video`);
  console.log(`  GET    /health                                 - Health check\n`);
});
