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
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from './routes/dashboard.routes.js';
import healthcheckRouter from './routes/healthcheck.routes.js';
import shareRouter from './routes/share.routes.js';

// Using routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use('/api/v1/comments', commentsRouter);
app.use("/api/v1/likes", likeRouter); 
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/share", shareRouter);


// Example route: http://localhost:8000/api/v1/users/register

export { app };
