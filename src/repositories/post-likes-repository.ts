import { postLikesCollection } from "../db";

export class PostLikesRepository {
    static async upsertLike(postId: string, userId: string, likeStatus: string) {
        await postLikesCollection.updateOne(
            { postId, userId },
            { $set: { likeStatus, addedAt: new Date().toISOString() } },
            { upsert: true }
        );
    }

    static async deleteLike(postId: string, userId: string) {
        await postLikesCollection.deleteOne({ postId, userId });
    }
}