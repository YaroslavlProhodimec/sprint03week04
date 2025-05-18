import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongodb"; // Возможно, этот импорт не нужен, если userId хранится как строка
import { authQueryRepository } from "../repositories/query-repository/authQueryRepository";
import { jwtService } from "../application/jwt-service";
import { devicesService } from "../domain/devices-service";

// Опционально: расширь глобальный тип Request в файле index.d.ts или src/types/index.d.ts
// declare global { namespace Express { interface Request { userId?: string; deviceId?: string; } } }
// Это уберет @ts-ignore

export const refreshTokenValidityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshTokenFromClient = req.cookies.refreshToken;

    // 1. Проверка наличия рефреш токена в куках
    if (!refreshTokenFromClient || !refreshTokenFromClient.trim()) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return; // Завершаем выполнение middleware
    }

    // 2. Валидируем рефреш токен и достаем payload (Делаем это в начале)
    const refreshTokenJWTPayloadResult = await jwtService.getJwtPayloadResult(
        refreshTokenFromClient,
        process.env.REFRESH_TOKEN_SECRET as string
    );
    console.log(refreshTokenJWTPayloadResult, 'refreshTokenJWTPayloadResult');

    // 3. Проверяем, что payload получен (токен валиден с точки зрения подписи и срока жизни)
    if (!refreshTokenJWTPayloadResult) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return; // Завершаем выполнение middleware
    }

    // Теперь payload гарантированно не null, можем безопасно достать userId и deviceId
    const userId = refreshTokenJWTPayloadResult.userId;
    const deviceId = refreshTokenJWTPayloadResult.deviceId; // Убедись, что deviceId есть в payload!

    // 4. Проверяем, что device (сессия) с таким userId и deviceId существует в базе
    // Используем метод сервиса для поиска
    const device = await devicesService.findDevice(userId, deviceId); // Используем userId и deviceId после проверки payload

    // Если устройство не найдено в базе - сессия невалидна (например, была удалена)
    if (!device) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return; // Завершаем выполнение middleware
    }

    // 5. Проверяем, не в блэклисте ли токен (опционально, если используешь блэклист для токенов)
    // Убедись, что findBlacklistedUserRefreshTokenById принимает правильный тип userId (string или ObjectId)
    const checkRefreshTokenIsBlacklisted =
        await authQueryRepository.findBlacklistedUserRefreshTokenById(
            // Если в блэклисте userId хранится как ObjectId, конвертируй: new ObjectId(userId),
            new ObjectId(userId), // Иначе передай строку
            refreshTokenFromClient
        );

    if (checkRefreshTokenIsBlacklisted) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return; // Завершаем выполнение middleware
    }

    // 6. Если все проверки пройдены - прокидываем userId (и deviceId) в req и идем дальше
    // Используй расширение глобального типа Express Request, чтобы не использовать @ts-ignore
    // @ts-ignore
    req.userId = userId;
    // @ts-ignore
    req.deviceId = deviceId; // Прокидываем deviceId

    return next(); // Возвращаем next() для ясности, хотя обычно просто next() тоже работает
};