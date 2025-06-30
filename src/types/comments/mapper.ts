    export const commentsMapper = (
        comment: any,
        myStatus: "Like" | "Dislike" | "None" | string = "None",
        likesCount: number = 0,
        dislikesCount: number = 0
    ): any => {
        console.log(comment._id,'comment._id')
        console.log(comment.id,'comment.id')
        return {
            // id: comment._id.toString(),
            id: comment._id ? comment._id.toString() : comment.id?.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount,
                dislikesCount,
                myStatus
            }
        }
    }