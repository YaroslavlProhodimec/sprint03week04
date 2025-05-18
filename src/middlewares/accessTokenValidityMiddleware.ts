import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {jwtService} from "../application/jwt-service";

export const accessTokenValidityMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  let accessTokenValue = req.headers.authorization;
  if (!accessTokenValue || accessTokenValue.split(" ")[0].toLowerCase() !== "bearer") {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  const token = accessTokenValue.split(" ")[1];
  const accessTokenJWTPayloadResult = await jwtService.getJwtPayloadResult(
    token,
    process.env.ACCESS_TOKEN_SECRET as string
  );
  // console.log(accessTokenJWTPayloadResult,'accessTokenJWTPayloadResult')
  if (!accessTokenJWTPayloadResult) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  } else {
    req.userId = accessTokenJWTPayloadResult.userId;
    next();
  }
};
