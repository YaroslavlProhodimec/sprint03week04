// Класс
import {commentLikesCollection} from "../db";

export class LikesRepository {
    static async upsertLike(commentId: string, userId: string, likeStatus: string) {
        await commentLikesCollection.updateOne(
            { commentId, userId },
            { $set: { likeStatus, addedAt: new Date().toISOString() } },
            { upsert: true }
        );
    }

    static async deleteLike(commentId: string, userId: string) {
        await commentLikesCollection.deleteOne({ commentId, userId });
    }
}