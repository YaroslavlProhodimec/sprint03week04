export const commentsMapper = (
    comment: any,
    myStatus: "Like" | "Dislike" | "None" | string = "None",
    likesCount: number = 0,
    dislikesCount: number = 0
): any => {
    return {
        id: comment._id.toString(),
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