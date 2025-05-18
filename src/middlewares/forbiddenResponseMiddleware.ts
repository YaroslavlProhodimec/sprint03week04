import { NextFunction, Request, Response } from "express";

import { commentsCommandsRepository } from "../repositories/commands-repository/commentsCommandsRepository";
import { StatusCodes } from "http-status-codes";
import {validateObjectIdMiddleware} from "./validateObjectIdMiddleware";

export const forbiddenResponseMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const comment = await commentsCommandsRepository.findCommentById(
    req.params.id
  );
  // const newComment: any = {
  //   // id: postId,
  //   postId:postId,
  //   content,
  //   commentatorInfo: {
  //     userId: id,
  //     userLogin: foundUser.accountData.login,
  //   },
  //   createdAt: createdAt.toISOString()
  // }
  // console.log(comment,'comment')
  // console.log(req.userId,'req.userId')
  // console.log(comment!.commentatorInfo.userId.toString(),'comment!.commentatorInfo.userId.toString()')
  // console.log(typeof comment,'comment')
  // console.log(typeof comment!.commentatorInfo.userId,'commentcommentatorInfo.userId')
  // console.log( comment!.commentatorInfo.userId.toString() === req.userId,'commentcommentatorInfo.userId .toString() === req.userId' )
  // console.log(typeof req.userId,'req.userId')

  if (!comment) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else if (comment && comment.commentatorInfo.userId.toString() !== req.userId) {
    res.sendStatus(StatusCodes.FORBIDDEN);
  } else {
    next();
  }
};
