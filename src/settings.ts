import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { httpMethodsCheckMiddleware } from "./middlewares/httpMethodsCheckMiddleware";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";
import {blogRoute} from "./routes/blog-route";
import {postRoute} from "./routes/post-route";
import {testingRouter} from "./testing-router";
import {authRouter} from "./routes/auth-route";
import {usersRouter} from "./routes/users-route";
import {commentsRoute} from "./routes/comments-route";
import {emailRouter} from "./routes/email-router";
import {securityDevicesRouter} from "./routes/security-devices-route";

export const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpMethodsCheckMiddleware);
app.use(cookieParser());

// Обработка favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
    res.status(204).end();
});

// Корневой маршрут
app.get('/', (req, res) => {
    res.status(200).send('API is working!');
});

// API маршруты
app.use('/security/devices', securityDevicesRouter);
app.use('/blogs', blogRoute);
app.use('/posts', postRoute);
app.use('/testing', testingRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRoute);
app.use('/email', emailRouter);

// Обработка 404
app.use((req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).send('Not Found');
});

// Обработка ошибок
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Something broke!');
});
