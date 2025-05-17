import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import * as dotenv from "dotenv";
import { JwtPayloadResult } from "../dto/common/jwt/JwtPayloadResult";
type JwtPayload = {
  userId: string;
  deviceId?: string;
};
dotenv.config();

export const jwtService = {
  async  createJWT(
      payload: JwtPayload,
      secret: string,
    expiresIn: number
  ): Promise<string> {
    const token = jwt.sign({ ...payload}, secret, {
      expiresIn,
    });
    return token;
  },
  async getJwtPayloadResult(
    token: string,
    secret: string
  ): Promise<JwtPayloadResult | null> {
    try {
      console.log(token,'token')
      const result = jwt.verify(token, secret);
      console.log(result,'result jwt.verify(token, secret);')
      return result as JwtPayloadResult;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log({
          name: error.name,
          message: error.message,
          expiredAt: error.expiredAt,
        });
        return null;
      } else if (error instanceof JsonWebTokenError) {
        console.log({
          name: error.name,
          message: error.message,
        });
        return null;
      } else if (error instanceof NotBeforeError) {
        console.log({
          name: error.name,
          message: error.message,
        });
        return null;
      } else return null;
    }
  },
};
