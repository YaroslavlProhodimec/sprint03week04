import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongodb";
import { authQueryRepository } from "../repositories/query-repository/authQueryRepository";
import {jwtService} from "../application/jwt-service";

export const refreshTokenValidityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  const refreshTokenFromClient = req.cookies.refreshToken;
  // console.log(refreshTokenFromClient,'refreshTokenFromClient')
  if (!refreshTokenFromClient || !refreshTokenFromClient.trim()) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }
  const refreshTokenJWTPayloadResult = await jwtService.getJwtPayloadResult(
      refreshTokenFromClient,
      process.env.REFRESH_TOKEN_SECRET as string
  );
  // console.log(refreshTokenJWTPayloadResult,'refreshTokenJWTPayloadResult')
  if (!refreshTokenJWTPayloadResult) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  } else {
    const checkRefreshTokenIsBlacklisted =
        await authQueryRepository.findBlacklistedUserRefreshTokenById(
            new ObjectId(refreshTokenJWTPayloadResult.userId),
            refreshTokenFromClient
        );
    if (checkRefreshTokenIsBlacklisted) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    } else {
      // @ts-ignore
      req.userId = refreshTokenJWTPayloadResult.userId;
      req.deviceId = refreshTokenJWTPayloadResult.deviceId;
      next();
    }
  }
};
