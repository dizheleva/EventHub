import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3030;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Authorization'],
    exposedHeaders: ['Content-Type']
}));

app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Helper functions
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { events: {}, comments: {}, users: {}, sessions: {} };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Auth middleware
function authenticate(req, res, next) {
    const token = req.headers['x-authorization'];
    if (!token) {
        return next();
    }

    const db = readDB();
    const session = Object.values(db.sessions || {}).find(s => s.accessToken === token);
    
    if (session) {
        const user = db.users[session.userId];
        if (user) {
            req.user = { ...user };
            delete req.user.hashedPassword;
        }
    }
    
    next();
}

// Routes

// Users
app.post('/users/register', (req, res) => {
    const { email, password, username, avatarUrl } = req.body;
    const db = readDB();

    if (!email || !password) {
        return res.status(400).json({ message: 'Имейл и парола са задължителни' });
    }

    const existingUser = Object.values(db.users).find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Потребител с този имейл вече съществува' });
    }

    const userId = generateId();
    const newUser = {
        _id: userId,
        email,
        hashedPassword: hashPassword(password),
        username: username || '',
        avatarUrl: avatarUrl || '',
        _createdOn: Date.now()
    };

    db.users[userId] = newUser;
    
    // Create session
    const sessionId = generateId();
    const accessToken = crypto.randomBytes(32).toString('hex');
    db.sessions[sessionId] = {
        _id: sessionId,
        userId,
        accessToken
    };

    writeDB(db);

    const userResponse = { 
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username || '',
        avatarUrl: newUser.avatarUrl || '',
        _createdOn: newUser._createdOn || Date.now(),
        accessToken: accessToken
    };

    res.json(userResponse);
});

app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = Object.values(db.users).find(u => u.email === email);
    if (!user || user.hashedPassword !== hashPassword(password)) {
        return res.status(401).json({ message: 'Невалиден имейл или парола' });
    }

    // Create session
    const sessionId = generateId();
    const accessToken = crypto.randomBytes(32).toString('hex');
    db.sessions[sessionId] = {
        _id: sessionId,
        userId: user._id,
        accessToken
    };

    writeDB(db);

    const userResponse = { 
        _id: user._id,
        email: user.email,
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
        _createdOn: user._createdOn || Date.now(),
        accessToken: accessToken
    };

    res.json(userResponse);
});

app.get('/users/logout', authenticate, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const token = req.headers['x-authorization'];
    
    const sessionId = Object.keys(db.sessions).find(
        id => db.sessions[id].accessToken === token
    );
    
    if (sessionId) {
        delete db.sessions[sessionId];
        writeDB(db);
    }

    res.status(204).send();
});

// GET /data/users (for loading user data - public)
app.get('/data/users', (req, res) => {
    const db = readDB();
    const users = Object.values(db.users || {}).map(user => ({
        _id: user._id,
        email: user.email,
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
        _createdOn: user._createdOn || Date.now()
    }));
    res.json(users);
});

// GET /users/:id (for loading specific user - public)
app.get('/users/:id', (req, res) => {
    const db = readDB();
    const user = db.users[req.params.id];
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
        _createdOn: user._createdOn || Date.now()
    };
    
    res.json(userResponse);
});

// PUT /users/:id (for updating user - requires auth)
app.put('/users/:id', authenticate, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const user = db.users[req.params.id];
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to update their own profile
    if (user._id !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Update user data
    if (req.body.email) {
        // Check if email is already taken by another user
        const existingUser = Object.values(db.users).find(
            u => u.email === req.body.email && u._id !== req.params.id
        );
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        user.email = req.body.email;
    }

    if (req.body.username !== undefined) {
        user.username = req.body.username || '';
    }

    if (req.body.avatarUrl !== undefined) {
        user.avatarUrl = req.body.avatarUrl || '';
    }

    if (req.body.password) {
        user.hashedPassword = hashPassword(req.body.password);
    }

    db.users[req.params.id] = user;
    writeDB(db);

    const userResponse = {
        _id: user._id,
        email: user.email,
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
        _createdOn: user._createdOn || Date.now()
    };

    res.json(userResponse);
});

// Data routes
app.use('/data', authenticate);

// GET /data/events
app.get('/data/events', (req, res) => {
    const db = readDB();
    const events = Object.values(db.events || {});
    
    // Handle query parameters
    let result = events;
    
    if (req.query.where) {
        // Simple where clause parsing (eventId="...")
        const match = req.query.where.match(/eventId="([^"]+)"/);
        if (match) {
            // This is for comments, not events
            return res.json([]);
        }
    }
    
    res.json(result);
});

// GET /data/events/:id
app.get('/data/events/:id', (req, res) => {
    const db = readDB();
    const event = db.events[req.params.id];
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
});

// POST /data/events
app.post('/data/events', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const eventId = generateId();
    const newEvent = {
        _id: eventId,
        _ownerId: req.user._id,
        _createdOn: Date.now(),
        ...req.body
    };

    db.events[eventId] = newEvent;
    writeDB(db);

    res.json(newEvent);
});

// PUT /data/events/:id
app.put('/data/events/:id', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const event = db.events[req.params.id];
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event._ownerId !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEvent = {
        ...event,
        ...req.body,
        _id: event._id,
        _ownerId: event._ownerId,
        _createdOn: event._createdOn
    };

    db.events[req.params.id] = updatedEvent;
    writeDB(db);

    res.json(updatedEvent);
});

// DELETE /data/events/:id
app.delete('/data/events/:id', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const event = db.events[req.params.id];
    
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event._ownerId !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    delete db.events[req.params.id];
    writeDB(db);

    res.status(204).send();
});

// GET /data/comments
app.get('/data/comments', (req, res) => {
    const db = readDB();
    let comments = Object.values(db.comments || {});
    
    // Handle where clause
    if (req.query.where) {
        const match = req.query.where.match(/eventId="([^"]+)"/);
        if (match) {
            comments = comments.filter(c => c.eventId === match[1]);
        }
    }
    
    // Handle load parameter (author=_ownerId:users)
    if (req.query.load) {
        const loadMatch = req.query.load.match(/author=_ownerId:users/);
        if (loadMatch) {
            comments = comments.map(comment => {
                const user = db.users[comment._ownerId];
                return {
                    ...comment,
                    author: user ? { email: user.email, _id: user._id } : null
                };
            });
        }
    }
    
    res.json(comments);
});

// POST /data/comments
app.post('/data/comments', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const db = readDB();
    const commentId = generateId();
    const newComment = {
        _id: commentId,
        _ownerId: req.user._id,
        _createdOn: Date.now(),
        ...req.body
    };

    db.comments[commentId] = newComment;
    writeDB(db);

    res.json(newComment);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

