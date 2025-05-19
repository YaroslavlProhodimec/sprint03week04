import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

interface AttemptInfo {
    count: number;
    timestamp: number;
}

const attemptsStore = new Map<string, AttemptInfo>();
const ATTEMPT_WINDOW = 5000; // 5 секунд

// Очистка старых попыток каждые 5 секунд
setInterval(() => {
    const now = Date.now();
    for (const [key, info] of attemptsStore.entries()) {
        if (now - info.timestamp > ATTEMPT_WINDOW) {
            attemptsStore.delete(key);
        }
    }
}, ATTEMPT_WINDOW);

export const rateLimitMiddleware = (limit: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Проверяем, не тестовое ли окружение
        if (process.env.NODE_ENV === 'test') {
            next();
            return;
        }

        // Проверяем, не запрос ли это к /security/devices
        if (req.path === '/security/devices') {
            next();
            return;
        }

        const ip = req.ip;
        const endpoint = req.path;
        const key = `${ip}:${endpoint}`;

        const now = Date.now();
        const attemptInfo = attemptsStore.get(key);

        if (attemptInfo) {
            // Если прошло больше 5 секунд, сбрасываем счетчик
            if (now - attemptInfo.timestamp > ATTEMPT_WINDOW) {
                attemptsStore.set(key, { count: 1, timestamp: now });
                next();
                return;
            }

            // Если не превысили лимит, увеличиваем счетчик
            if (attemptInfo.count < limit) {
                attemptInfo.count++;
                next();
                return;
            }

            // Если превысили лимит, возвращаем ошибку
            res.status(StatusCodes.TOO_MANY_REQUESTS).send({
                message: "Too many requests, please try again later"
            });
            return;
        }

        // Первая попытка
        attemptsStore.set(key, { count: 1, timestamp: now });
        next();
    };
};