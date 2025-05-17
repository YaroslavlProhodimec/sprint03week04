import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {apiLogsCollection} from "../../db";

export const apiLogsCountValidationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const url = req.originalUrl || req.baseUrl;
        const now = new Date();
        const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);

        // Сохраняем обращение
        await apiLogsCollection.insertOne({
            IP: ip,
            URL: url,
            date: now
        });

        // Считаем количество обращений за последние 10 секунд
        const count = await apiLogsCollection.countDocuments({
            IP: ip,
            URL: url,
            date: { $gte: tenSecondsAgo }
        });

        // Можно добавить лимит, например, не больше 5 запросов за 10 секунд
        // if (count > 5) {
        //     return res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: "Слишком много запросов" });
        // }

        // Просто выводим в консоль для проверки
        console.log(`IP: ${ip}, URL: ${url}, count за 10 сек: ${count}`);

        next();
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ошибка логирования" });
    }
};