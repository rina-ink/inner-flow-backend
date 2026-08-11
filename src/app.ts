import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db.js";
import {
  CLIENT_BASE_URL,
  PORT,
} from "./config.js";

const app = express();

app.set("trust proxy", 1);

// -------------------------
// GLOBAL MIDDLEWARE
// -------------------------

app.use(helmet());

app.use(
  cors({
    origin: CLIENT_BASE_URL,
    credentials: true,
    exposedHeaders: ["WWW-Authenticate"],
  }),
);

app.use(express.json());

app.use(cookieParser());

// -------------------------
// HEALTH CHECK
// -------------------------

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "inner-flow-backend",
  });
});

// -------------------------
// START SERVER
// -------------------------

const start = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(
            `Inner Flow server listening on port ${PORT}`,
        );
    });
};

start();