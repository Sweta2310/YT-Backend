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
import videoRouter from './routes/video.routes.js';
import commentsRouter from './routes/comment.routes.js';
import likeRouter from './routes/likes.routes.js';
import tweetRouter from './routes/tweet.routes.js';

// Using routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use('/api/v1/comments', commentsRouter);
app.use("/api/v1/likes", likeRouter); 
app.use("/api/v1/tweets", tweetRouter);

// Example route: http://localhost:8000/api/v1/users/register

export { app };
