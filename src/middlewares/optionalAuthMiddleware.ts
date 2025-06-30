import {NextFunction} from "express";
import {jwtService} from "../application/jwt-service";

export const optionalAuthMiddleware = async (
    req: any,
    res: any,
    next: any
) => {
    let accessTokenValue = req.headers.authorization;
    if (!accessTokenValue || accessTokenValue.split(" ")[0].toLowerCase() !== "bearer") {
        req.userId = undefined; // пользователь не авторизован
        return next();
    }

    const token = accessTokenValue.split(" ")[1];
    const accessTokenJWTPayloadResult = await jwtService.getJwtPayloadResult(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
    );
    if (!accessTokenJWTPayloadResult) {
        req.userId = undefined;
    } else {
        req.userId = accessTokenJWTPayloadResult.userId;
    }
    next();
};