const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");
const { scrapeVarnaEvents } = require("./scraper");
const {
  getCachedEvents,
  refreshIfNeeded,
  forceRefreshCache,
} = require("./externalEventsService");

const dbPath = path.join(__dirname, "db.json");
console.log("📁 Loading database from:", dbPath);

// Проверка дали файлът съществува
if (!fs.existsSync(dbPath)) {
  console.error("❌ Database file not found at:", dbPath);
  process.exit(1);
}

console.log("✅ Database file found");

const server = jsonServer.create();
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults({
  // Запазва CORS и други важни middleware-и
  noCors: false,
  readOnly: false
});

server.use(middlewares);

// Custom root route - показва информация за API-то
server.get('/', (req, res) => {
  res.json({
    message: "EventHub API",
    version: "2.0.0",
    endpoints: {
      events: "/events",
      eventById: "/events/:id",
      users: "/users",
      userById: "/users/:id",
      allEvents: "/all-events",
      externalEvents: "/external-events",
      refreshExternal: "POST /refresh-external",
      scrapeVarna: "/api/scrape/varna (deprecated)"
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  });
});

// ============================================
// External Events Endpoints
// ============================================

// GET /external-events - Get cached external events
server.get("/external-events", async (req, res) => {
  try {
    console.log("GET /external-events - Returning cached events");
    const events = await getCachedEvents();
    res.json({
      success: true,
      count: events.length,
      events: events,
      cached: true,
    });
  } catch (error) {
    console.error("Error getting cached external events:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      events: [],
    });
  }
});

// POST /refresh-external - Force refresh external events cache
server.post("/refresh-external", async (req, res) => {
  try {
    console.log("POST /refresh-external - Force refreshing cache");
    const events = await forceRefreshCache();
    res.json({
      success: true,
      count: events.length,
      events: events,
      message: "Cache refreshed successfully",
    });
  } catch (error) {
    console.error("Error force refreshing cache:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /all-events - Get both local and external events
server.get("/all-events", async (req, res) => {
  try {
    console.log("GET /all-events - Fetching local and external events");
    
    // Get local events from db.json
    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    const localEvents = (dbData.events || []).map(event => ({
      ...event,
      source: "local",
    }));
    
    // Get cached external events
    const externalEvents = await getCachedEvents();
    const externalEventsWithSource = externalEvents.map(event => ({
      ...event,
      source: "external",
    }));
    
    res.json({
      success: true,
      localEvents: localEvents,
      externalEvents: externalEventsWithSource,
      counts: {
        local: localEvents.length,
        external: externalEvents.length,
        total: localEvents.length + externalEvents.length,
      },
    });
  } catch (error) {
    console.error("Error getting all events:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      localEvents: [],
      externalEvents: [],
    });
  }
});

// Legacy endpoint - keep for backward compatibility but mark as deprecated
server.get("/api/scrape/varna", async (req, res) => {
  try {
    console.log("⚠️  /api/scrape/varna called (deprecated, use /external-events instead)");
    const events = await getCachedEvents();
    res.json({
      success: true,
      count: events.length,
      events: events,
      deprecated: true,
      message: "This endpoint is deprecated. Use /external-events instead.",
    });
  } catch (error) {
    console.error("Error in legacy scrape endpoint:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// Favorites Endpoints with Query Support
// ============================================

// GET /favorites - Support query parameters (userId, eventId)
server.get("/favorites", (req, res, next) => {
  const { userId, eventId } = req.query;
  
  // If no query params, use default JSON Server behavior
  if (!userId && !eventId) {
    return next();
  }
  
  // Read database
  const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  let favorites = dbData.favorites || [];
  
  // Filter by userId if provided
  if (userId) {
    favorites = favorites.filter(fav => fav.userId === Number(userId));
  }
  
  // Filter by eventId if provided
  if (eventId) {
    favorites = favorites.filter(fav => fav.eventId === String(eventId));
  }
  
  res.json(favorites);
});

// ============================================
// Interests Endpoints with Query Support
// ============================================

// GET /interests - Support query parameters (eventId, userId)
server.get("/interests", (req, res, next) => {
  const { eventId, userId } = req.query;
  
  // If no query params, use default JSON Server behavior
  if (!eventId && !userId) {
    return next();
  }
  
  // Read database
  const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  let interests = dbData.interests || [];
  
  // Filter by eventId if provided
  if (eventId) {
    interests = interests.filter(int => int.eventId === String(eventId));
  }
  
  // Filter by userId if provided
  if (userId) {
    interests = interests.filter(int => int.userId === Number(userId));
  }
  
  res.json(interests);
});

// Middleware за добавяне на createdAt и updatedAt
// За POST заявки добавяме createdAt и updatedAt
// За PUT/PATCH заявки, updatedAt се добавя от клиента
server.use((req, res, next) => {
  if (req.method === "POST" && req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    if (!req.body.createdAt) {
      req.body.createdAt = new Date().toISOString();
    }
    if (!req.body.updatedAt) {
      req.body.updatedAt = new Date().toISOString();
    }
  }
  // PUT/PATCH заявките вече имат updatedAt от клиента, няма нужда да го добавяме тук
  next();
});

server.use(router);

const PORT = process.env.PORT || 5000;

// Initialize external events cache on startup
async function initializeExternalEvents() {
  try {
    console.log("🔄 Initializing external events cache...");
    await refreshIfNeeded();
    console.log("✅ External events cache initialized");
  } catch (error) {
    console.error("❌ Error initializing external events cache:", error);
    // Don't exit - server can still run with empty cache
  }
}

// Auto-refresh cache every hour
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

function startAutoRefresh() {
  console.log(`⏰ Auto-refresh scheduled every ${REFRESH_INTERVAL_MS / 1000 / 60} minutes`);
  
  setInterval(async () => {
    try {
      console.log("🔄 Auto-refresh: Checking if cache needs update...");
      await refreshIfNeeded();
    } catch (error) {
      console.error("❌ Error in auto-refresh:", error);
      // Continue running even if refresh fails
    }
  }, REFRESH_INTERVAL_MS);
}

server.listen(PORT, async () => {
  console.log("✅ JSON Server is running on http://localhost:" + PORT);
  console.log("✅ Try: http://localhost:" + PORT + "/events");
  console.log("✅ Try: http://localhost:" + PORT + "/users");
  console.log("✅ Try: http://localhost:" + PORT + "/all-events");
  console.log("✅ Try: http://localhost:" + PORT + "/external-events");
  
  // Initialize cache on startup
  await initializeExternalEvents();
  
  // Start auto-refresh
  startAutoRefresh();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});
