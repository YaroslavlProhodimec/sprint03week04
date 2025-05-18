import {ObjectId} from "mongodb";
import {refreshTokensBlacklistedCollection} from "../../db";

export const authCommandsRepository = {
    async createUserRefreshTokensBlacklist(userId: ObjectId): Promise<string> {
        const createRefreshTokensBlacklistForUser =
            await refreshTokensBlacklistedCollection.insertOne({
                _id: userId,
                refreshTokensArray: [],
            });
        return createRefreshTokensBlacklistForUser.insertedId.toString();
    },
    async putRefreshTokenToBlacklist(
        refreshToken: string,
        userId: string
    ): Promise<boolean> {
        const addRefreshTokenToBlacklist =
            await refreshTokensBlacklistedCollection.updateOne(
                {_id: new ObjectId(userId)},
                {$push: {refreshTokensArray: refreshToken}}
            );

        // refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTlkZTMzODU1MTc2YmFjNWRhMzVjYzUiLCJpYXQiOjE3MDQ4NDYxMzYsImV4cCI6MTcwNDg0ODEzNn0.75KHSa7CvEctvjf-9POk_FJtvtSZacSp_ov9sN52pY4
        // console.log(refreshTokensBlacklistedCollection, 'refreshTokensBlacklistedCollection updateOne')
        const resultFind = await refreshTokensBlacklistedCollection.findOne({_id: new ObjectId(userId)})

        console.log(resultFind, 'resultFinds  refreshTokensBlacklistedCollection.findOne')
        return addRefreshTokenToBlacklist.modifiedCount === 1 ? true : false;
    },
};

