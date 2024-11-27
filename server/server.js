const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env vars - must be loaded before other modules that might use env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const confirmationRoutes = require("./routes/confirmationRoutes");

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/confirm-order", confirmationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

app.get("/", (req, res) => {
  res.send("Le serveur fonctionne !");
});

// Autres routes de ton application
app.get("/api", (req, res) => {
  res.json({ message: "Bienvenue dans l’API" });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port http://localhost:${PORT}`);
});

// Validate required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

// Start server with error handling
const server = app
  .listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log("Environment variables loaded:", {
      mongoUri: process.env.MONGO_URI ? "✓ Connected" : "✗ Not Connected",
      emailUser: process.env.EMAIL_USER ? "✓ Set" : "✗ Not Set",
      adminEmail: process.env.ADMIN_EMAIL ? "✓ Set" : "✗ Not Set",
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
    });
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
      server.close();
      // Try the next port
      app.listen(PORT + 1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
