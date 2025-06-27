import { jwtService } from "../../application/jwt-service";

export const create_access_refresh_tokens = async (userId: string,deviceId?:string) => {
  const accessToken = await jwtService.createJWT(
      {userId},
    process.env.ACCESS_TOKEN_SECRET as string,
    60
  );
  const refreshToken = await jwtService.createJWT(
      { userId, deviceId },
      process.env.REFRESH_TOKEN_SECRET as string,
    20
  );
  return {
    accessToken,
    refreshToken,
  };
};
