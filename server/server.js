const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");

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
    version: "1.0.0",
    endpoints: {
      events: "/events",
      eventById: "/events/:id"
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  });
});

server.use((req, res, next) => {
  // Добавя createdAt и updatedAt автоматично
  if (req.method === "POST") {
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
  }
  if (req.method === "PUT") {
    req.body.updatedAt = new Date().toISOString();
  }
  next();
});

server.use(router);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("✅ JSON Server is running on http://localhost:" + PORT);
  console.log("✅ Try: http://localhost:" + PORT + "/events");
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});
