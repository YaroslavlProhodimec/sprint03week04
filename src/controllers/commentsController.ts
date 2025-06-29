import { Response } from "express";
import {
  CommentInputModel,
  CommentViewModel,
} from "../dto/commentsDTO/commentsDTO";
import {
  RequestWithURIParam,
  RequestWithURIParamsAndBody,
} from "../dto/common/RequestModels";
import { URIParamsRequest } from "../dto/common/URIParamsRequest";
import { commentsQueryRepository } from "../repositories/query-repository/commentsQueryRepository";
import { StatusCodes } from "http-status-codes";
import { commentsService } from "../domain/comments-service";
import {CommentsRepository} from "../repositories/comments-repository";
import {commentsCommandsRepository} from "../repositories/commands-repository/commentsCommandsRepository";
import {LikesRepository} from "../repositories/likes-repository";

export const getCommentById = async (
  req: RequestWithURIParam<URIParamsRequest>,
  res: Response<CommentViewModel>
) => {
  const foundComment = await commentsQueryRepository.findComment(req.params.id);
  if (!foundComment) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else {
    res.status(StatusCodes.OK).send(foundComment);
  }
};

export const deleteComment = async (
  req: RequestWithURIParam<URIParamsRequest>,
  res: Response
) => {
  const deletedComment = commentsService.deleteCommentById(req.params.id);
  // console.log(deletedComment,'deletedComment')
  if (!deletedComment) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else {
    res.sendStatus(StatusCodes.NO_CONTENT);
  }
};

export const updateComment = async (
  req: RequestWithURIParamsAndBody<URIParamsRequest, CommentInputModel>,
  res: Response
) => {
  const { content } = req.body;
  const updatedComment = await commentsService.updateCommentById(
    req.params.id,
    content
  );
  // console.log(updatedComment,'updatedComment await commentsService.updateCommentById')

  if (!updatedComment) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else {
    res.sendStatus(StatusCodes.NO_CONTENT);
  }
};

export const likeStatusController = async (
  req: RequestWithURIParamsAndBody<URIParamsRequest, any>,
  res: Response
) => {

  const commentId = req.params.id;
  const userId = req.userId; // из мидлвеера
  const { likeStatus } = req.body;

  // 1. Проверить, существует ли комментарий
  const comment = await  commentsCommandsRepository.findCommentById(commentId);
  if (!comment) return res.status(404).send();

  // 2. Обновить/удалить/создать лайк
  if (likeStatus === 'None') {
    await LikesRepository.deleteLike(commentId, userId);
  } else {
    await LikesRepository.upsertLike(commentId, userId, likeStatus);
  }

  return res.sendStatus(204);
};
