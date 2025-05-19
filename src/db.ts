import {  MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { RefreshTokensBlacklistDB } from "./dto/authDTO/authDTO";
import {BlogType} from "./types/blog/output";
import {PostType} from "./types/post/output";
import { CallToAPIType } from "./features/apiCallHistory/types";
dotenv.config();
export const mongoURI = process.env.MONGO_URL

export const client = new MongoClient(mongoURI as string);

const dbName = "blogs-posts";
export const dbBlogs = client.db('node-blogs')

export const apiLogsCollection = dbBlogs.collection('api-logs');
export const devicesCollection = dbBlogs.collection('devices');
export const blogCollection = dbBlogs.collection<BlogType>('blogs')
export const postCollection = dbBlogs.collection<PostType>('post')
export const commentsCollection = dbBlogs.collection('comments')
export const usersCollection = dbBlogs.collection<any>('users')
export const refreshTokensBlacklistedCollection =
    dbBlogs.collection<RefreshTokensBlacklistDB>("refresh-tokens-blacklisted");
// export const APICallHistoryModelClass = mongoose.model<CallToAPIType>("APICallHistory",APICallHistorySchema);

export const runDB = async () => {
    try {
        await client.connect();
        // console.log("Connected successfully to mongo server");
        await dbBlogs.command({ ping: 1 });
        // console.log("Client connected");
    } catch (e) {
        // console.log("Can't connect to DB: ", e);
        await client.close();
    }
};
