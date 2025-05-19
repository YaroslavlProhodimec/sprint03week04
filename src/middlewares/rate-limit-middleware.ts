import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Интерфейс для хранения информации о попытках
interface AttemptInfo {
    count: number;
    timestamp: number;
}

// Хранилище попыток (в реальном приложении лучше использовать Redis)
const attemptsStore = new Map<string, AttemptInfo>();

// Очистка старых попыток каждые 10 секунд
setInterval(() => {
    const now = Date.now();
    for (const [key, info] of attemptsStore.entries()) {
        if (now - info.timestamp > 10000) { // 10 секунд
            attemptsStore.delete(key);
        }
    }
}, 10000);

export const rateLimitMiddleware = (limit: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip;
        const endpoint = req.path;
        const key = `${ip}:${endpoint}`;

        const now = Date.now();
        const attemptInfo = attemptsStore.get(key);

        if (attemptInfo) {
            // Если прошло больше 10 секунд, сбрасываем счетчик
            if (now - attemptInfo.timestamp > 10000) {
                attemptsStore.set(key, { count: 1, timestamp: now });
                next();
                return;
            }

            // Если превышен лимит
            if (attemptInfo.count >= limit) {
                res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                    message: 'Too many requests, please try again later'
                });
                return;
            }

            // Увеличиваем счетчик
            attemptsStore.set(key, {
                count: attemptInfo.count + 1,
                timestamp: attemptInfo.timestamp
            });
        } else {
            // Первая попытка
            attemptsStore.set(key, { count: 1, timestamp: now });
        }

        next();
    };
};