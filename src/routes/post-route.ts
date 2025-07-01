import {Router, Request, Response} from "express";
import {PostRepository} from "../repositories/post-repository";
import {BlogParams} from "../types/blog/input";
import {postValidation} from "../validators/post-validator";
import {accessTokenValidityMiddleware, authMiddleware} from "../middlewares/auth/auth-middleware";
import {HTTP_STATUSES} from "../utils/common";
import {commentsValidation} from "../validators/comments-validator";
import {CommentsRepository} from "../repositories/comments-repository";
import {optionalAuthMiddleware} from "../middlewares/optionalAuthMiddleware";
import {validateObjectIdMiddleware} from "../middlewares/validateObjectIdMiddleware";
import {likeStatusValidation} from "../validators/like-status";
import {responseErrorValidationMiddleware} from "../middlewares/responseErrorValidationMiddleware";
import {likeStatusController} from "../controllers/commentsController";
import {commentsRoute} from "./comments-route";
import {postLikeStatusController} from "../controllers/postsController";


export const postRoute = Router({})
// старый вариант без пагинации
// postRoute.get('/', async (req: Request, res: Response) => {
//     const posts = await PostRepository.getAllPosts()
//     res.status(HTTP_STATUSES.OK_200).json(posts)
// })
// new variants  with pagination
postRoute.get('/',  optionalAuthMiddleware, async (req: Request, res: Response) => {
    const sortData = {
        searchNameTerm: req.query.searchNameTerm,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
    }

    const posts = await PostRepository.getAllPostsQueryParam(sortData,req.userId)
    res.status(HTTP_STATUSES.OK_200).json(posts)
})
postRoute.get('/:id', async (req: Request<BlogParams>, res: Response) => {

    const post = await PostRepository.getPostById(req.params.id)

    if (post) {
        res.status(HTTP_STATUSES.OK_200).json(post)
        return;
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
})
postRoute.post('/', authMiddleware, postValidation(), async (req: Request, res: Response) => {
    const creatData = req.body
    const postID = await PostRepository.createPost(creatData)
    if (postID) {
        const newPost = await PostRepository.getPostById(postID)
        if (newPost) {
            res.status(HTTP_STATUSES.CREATED_201).json(newPost)
            return;
        }
    }
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

postRoute.put('/:id', authMiddleware, postValidation(), async (req: Request<BlogParams>, res: Response) => {
    const updateData = req.body
    const isUpdated = await PostRepository.updatePost(req.params.id, updateData)
    if (isUpdated) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        return;
    }
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

postRoute.delete('/:id', authMiddleware, async (req: Request<BlogParams>, res: Response) => {

    let idDeleted = await PostRepository.deletePost(req.params.id)
    if (idDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})


// postRoute.post('/:postId/comments', accessTokenValidityMiddleware,
//     commentsValidation(),
//     async (req: any, res: Response) => {
//         const content = req.body.content
//         const postId  = req.params.postId
//
//         const post = await PostRepository.getPostById(postId)
//         if(!post){
//             res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
//             return;
//         }
//         const newComment = await CommentsRepository.createComments(content, req.userId,postId)
//
//         if (newComment) {
//             res.status(HTTP_STATUSES.CREATED_201).json(newComment)
//             return;
//         }
//
//         res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
//     })
postRoute.post('/:postId/comments', accessTokenValidityMiddleware,
    commentsValidation(),
    async (req: any, res: Response) => {
        console.log('POST /posts/:postId/comments — старт');
        const content = req.body.content
        const postId  = req.params.postId

        const post = await PostRepository.getPostById(postId)
        console.log('Пост найден:', !!post);
        if(!post){
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return;
        }
        const newComment = await CommentsRepository.createComments(content, req.userId,postId)
        console.log('Комментарий создан:', !!newComment);

        if (newComment) {
            res.status(HTTP_STATUSES.CREATED_201).json(newComment)
            return;
        }

        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    })

postRoute.get('/:postId/comments',
    // commentsValidation(),
    // commentsIdValidation(),
    optionalAuthMiddleware,

    async (req: any, res: Response) => {
        const currentUserId = req.userId;
        const sortData = {
            searchNameTerm: req.query.searchNameTerm,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
        }
        const postId  = req.params.postId
        const post = await PostRepository.getPostById(postId)
        if(!post){
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return;
        }

        const comments = await CommentsRepository.getAllCommentsQueryParam(sortData,postId,currentUserId)

        if (comments) {
            res.status(HTTP_STATUSES.OK_200).json(comments)
            return;
        }
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    })

postRoute.put(
    "/:id/like-status",
    accessTokenValidityMiddleware,
    validateObjectIdMiddleware,
    likeStatusValidation(),
    responseErrorValidationMiddleware,
    postLikeStatusController
);

