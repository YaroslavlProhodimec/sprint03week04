export interface JwtPayloadResult {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}