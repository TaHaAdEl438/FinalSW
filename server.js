const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "config.env" });

const ApiError = require("./utils/apiError");
const dbConnection = require("./config/database");
const globalError = require("./middlewares/errorMiddleware");

// Routes
const categoryRoute = require("./routes/categoryRoute");
const authRoute = require("./routes/authRoute");

// Connect to DB
dbConnection().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

// Express app
const app = express();

// Security Middleware
app.use(helmet()); // حماية من بعض الهجمات الشائعة
app.use(xss()); // منع هجمات XSS
app.use(cookieParser()); // تحليل الـ cookies
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // 100 طلب لكل IP
    message: "Too many requests from this IP, please try again later.",
  })
);

// CORS Middleware
app.use(cors());

// Body Parser
app.use(express.json());

// Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/auth", authRoute);

// Handle 404 Errors
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global Error Handling Middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down...`);
    process.exit(1);
  });
});