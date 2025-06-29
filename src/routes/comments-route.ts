import {Response, Router} from "express";
import {CommentsRepository} from "../repositories/comments-repository";
import {HTTP_STATUSES} from "../utils/common";
import {commentsValidation} from "../validators/comments-validator";
import {forbiddenResponseMiddleware} from "../middlewares/forbiddenResponseMiddleware";
import {validateObjectIdMiddleware} from "../middlewares/validateObjectIdMiddleware";
import {accessTokenValidityMiddleware} from "../middlewares/accessTokenValidityMiddleware";
import {responseErrorValidationMiddleware} from "../middlewares/responseErrorValidationMiddleware";
import {deleteComment, likeStatusController, updateComment} from "../controllers/commentsController";
import {commentLikesCollection} from "../db";
import {commentsMapper} from "../types/comments/mapper";


export const commentsRoute = Router({})

commentsRoute.get('/:id',

    async (req: any, res: Response) => {
        const commentId = req.params.id;
        const currentUserId = req.userId

        const comment = await CommentsRepository.getCommentById(req.params.id)

        // Считаем лайки и дизлайки
        const likesCount = await commentLikesCollection.countDocuments({ commentId, likeStatus: "Like" });
        const dislikesCount = await commentLikesCollection.countDocuments({ commentId, likeStatus: "Dislike" });

        // Определяем статус пользователя
        let myStatus = "None";
        if (currentUserId) {
            const myLike = await commentLikesCollection.findOne({ commentId, userId: currentUserId });
            if (myLike) myStatus = myLike.likeStatus;
        }

        // Маппим комментарий с лайками
        const mappedComment = commentsMapper(comment, myStatus, likesCount, dislikesCount);



        if (comment) {
            res.status(HTTP_STATUSES.OK_200).json(mappedComment)
            return;
        }
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    })


// commentsRoute.put('/:id',
//     bearerAuth,
//     validateObjectIdMiddleware,
//     forbiddenResponseMiddleware,
//     commentsValidation(),
//
//     async (req: any, res: Response) => {
//         const {content} = req.body;
//         console.log(content,'content')
//         const updatedComment = await commentsService.updateCommentById(
//             req.params.id,
//             content
//         );
//         if (!updatedComment) {
//             res.sendStatus(StatusCodes.NOT_FOUND);
//         } else {
//             res.sendStatus(StatusCodes.NO_CONTENT);
//         }
//     })

commentsRoute.put(
    "/:id",
    accessTokenValidityMiddleware,
    validateObjectIdMiddleware,
    forbiddenResponseMiddleware,
    commentsValidation(),
    responseErrorValidationMiddleware,
    updateComment
);

commentsRoute.put(
    "/:id/like-status",
    accessTokenValidityMiddleware,
    validateObjectIdMiddleware,
    forbiddenResponseMiddleware,
    responseErrorValidationMiddleware,
    likeStatusController
);

commentsRoute.delete(
    "/:id",
    accessTokenValidityMiddleware,
    validateObjectIdMiddleware,
    forbiddenResponseMiddleware,
    deleteComment
);

//
// commentsRoute.delete('/:id',
//     bearerAuth,
//     validateObjectIdMiddleware,
//     forbiddenResponseMiddleware,
//     async (req: any, res: Response) => {
//         const deletedComment = commentsService.deleteCommentById(req.params.id);
//         if (!deletedComment) {
//             res.sendStatus(StatusCodes.NOT_FOUND);
//         } else {
//             res.sendStatus(StatusCodes.NO_CONTENT);
//         }
//     })
//
