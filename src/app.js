import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // fallback for dev
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('public'));
app.use(cookieParser());

// Importing routes
import userRouter from './routes/user.routes.js';

// Using routes
app.use("/api/v1/users", userRouter);

// Example route: http://localhost:8000/api/v1/users/register

export { app };
