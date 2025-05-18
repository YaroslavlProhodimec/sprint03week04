import { ObjectId, WithId } from "mongodb";
import {refreshTokensBlacklistedCollection} from "../../db";
// import { refreshTokensBlacklistedCollection } from "../../db";
export const authQueryRepository = {
  async findBlacklistedUserRefreshTokenById(
    userId: ObjectId,
    refreshToken: string
  ): Promise<undefined | string> {
    const foundRefreshToken = await refreshTokensBlacklistedCollection.findOne({
      _id: userId,
    });
    console.log(foundRefreshToken,'foundRefreshToken await refreshTokensBlacklistedCollection.findOne')
    if(!foundRefreshToken){
      return undefined
    }
    console.log(foundRefreshToken?.refreshTokensArray.find((el:any)=> el === refreshToken ),'foundRefreshToken')

    return foundRefreshToken?.refreshTokensArray.find((el:any)=> el === refreshToken );
  },
};