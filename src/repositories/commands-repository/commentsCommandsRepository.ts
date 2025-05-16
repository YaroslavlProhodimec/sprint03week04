import {ObjectId} from "mongodb";
import {commentsCollection} from "../../db";

export const commentsCommandsRepository = {
    // async createComment(newComment: any): Promise<any> {
    //   const result = await commentsCollection.insertOne(newComment);
    //   const findCreatedComment = await commentsCollection.findOne({
    //     _id: result.insertedId,
    //   });
    //
    //   return transformCommentsResponse(findCreatedComment!);
    // },
    async findCommentById(id: string) {
        const comments = await commentsCollection.findOne({
            _id: new ObjectId(id),
        });
        return comments;
    },
    async deleteComment(commentId: string): Promise<boolean> {
        // const deletedComment = await commentsCollection.findOneAndDelete({
        //     _id: new ObjectId(commentId),
        // });
        const deletedComment = await commentsCollection.findOne({_id: new ObjectId(commentId)})

        const deleteOne = await commentsCollection.deleteOne({_id: deletedComment!._id})

        console.log(deletedComment, 'deletedComment')
        console.log(deleteOne, 'deleteOne deleteOne')

        // return !!deletedComment!.ok;
        return deleteOne.deletedCount > 0
    },
    async updateComment(commentId: string, content: string): Promise<boolean> {
        console.log(commentId, 'commentId')
        // const newUpdatedComment = await commentsCollection.findOneAndUpdate(
        //   { _id: new ObjectId(commentId) },
        //   { $set: { content } }
        // );
        const foundedComment = await commentsCollection.findOne({_id: new ObjectId(commentId)})
        console.log(foundedComment, 'foundedComment')
        const updateOneComment = await commentsCollection.updateOne(
            {_id: foundedComment!._id},
            {$set: {content: content}}
        );
        console.log(updateOneComment, 'updateOneComment')
        // console.log(newUpdatedComment, 'newUpdatedComment')
        // return !!newUpdatedComment.ok;
        return updateOneComment.modifiedCount > 0
    },
};
