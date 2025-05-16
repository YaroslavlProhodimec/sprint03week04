import { Request, Response } from "express";
import {authService} from "../service/authService";
import {StatusCodes} from "http-status-codes";
import {create_access_refresh_tokens} from "../utils/auth-utils/create_Access_Refresh_Tokens";
import {LoginInputModel, MeViewModel} from "../dto/authDTO/authDTO";
import {usersCommandsRepository} from "../repositories/commands-repository/usersCommandsRepository";
import {getCurrentUserInfo} from "../utils/auth-utils/getCurrentUserInfo";

import dotenv from "dotenv";

dotenv.config();
//
import {RequestBodyModel} from "../dto/common/RequestModels";
import {usersService} from "../domain/users-service";

export const logIn = async (
  req: RequestBodyModel<LoginInputModel>,
  res: Response
) => {
  const user = await usersService.checkCredentials(
    req.body.loginOrEmail,
    req.body.password
  );
  if (!user) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  const { accessToken, refreshToken } = await create_access_refresh_tokens(
    user._id.toString()
  );
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
  });
  return res.status(StatusCodes.OK).send({ accessToken });
};


export const getInfoAboutUser = async (
  req: Request,
  res: Response<MeViewModel>
) => {
  const foundUser = await usersCommandsRepository.findUserById(req.userId);
  if (foundUser) {
    const currentUser = getCurrentUserInfo(foundUser);
    res.status(StatusCodes.OK).send(currentUser);
    return
  } else {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
      return

  }
};
//
// export const registerUser = async (
//   req: RequestBodyModel<UserInputModel>,
//   res: Response<TApiErrorResultObject>
// ) => {
//   const createUser = await authService.registerNewUser(req.body);
//   if (createUser instanceof UserAlreadyExistsError) {
//     res
//       .status(StatusCodes.BAD_REQUEST)
//       .send(responseErrorFunction([createUser]));
//     return;
//   }
//   if (createUser instanceof RegistrationError) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(responseErrorFunction([createUser]));
//     return;
//   }
//   res.sendStatus(StatusCodes.NO_CONTENT);
// };
//
// export const confirmRegistration = async (
//   req: RequestBodyModel<RegistrationConfirmationCodeModel>,
//   res: Response<TApiErrorResultObject>
// ) => {
//   const confirmCodeResult = await authService.confirmCode(req.body.code);
//   if (
//     confirmCodeResult instanceof IncorrectConfirmationCodeError ||
//     confirmCodeResult instanceof UserIsConfirmedError ||
//     confirmCodeResult instanceof ConfirmationCodeExpiredError
//   ) {
//     res
//       .status(StatusCodes.BAD_REQUEST)
//       .send(responseErrorFunction([confirmCodeResult]));
//     return;
//   }
//   if (confirmCodeResult instanceof UpdateUserError) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(responseErrorFunction([confirmCodeResult]));
//     return;
//   }
//   res.sendStatus(StatusCodes.NO_CONTENT);
// };
//
// export const resendRegistrationEmail = async (
//   req: RequestBodyModel<RegistrationEmailResending>,
//   res: Response<TApiErrorResultObject>
// ) => {
//   const resendEmailResult = await authService.resendEmail(req.body.email);
//   if (
//     resendEmailResult instanceof WrongEmailError ||
//     resendEmailResult instanceof EmailAlreadyConfirmedError
//   ) {
//     res
//       .status(StatusCodes.BAD_REQUEST)
//       .send(responseErrorFunction([resendEmailResult]));
//     return;
//   }
//   if (resendEmailResult instanceof UpdateUserError) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(responseErrorFunction([resendEmailResult]));
//     return;
//   }
//   res.sendStatus(StatusCodes.NO_CONTENT);
// };
//
// //@desc Generate new pair of access and refresh tokens (in cookie client must send correct refresh token that will be revoked after refreshing)

export const refreshToken = async (req: Request, res: Response) => {
    const refreshTokenFromClient = req.cookies.refreshToken;
    await authService.placeRefreshTokenToBlacklist(
        refreshTokenFromClient,
        req.userId
    );
    const { accessToken, refreshToken } = await create_access_refresh_tokens(
        req.userId
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
    });
    res.status(StatusCodes.OK).send({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
    // @ts-ignore
  await authService.placeRefreshTokenToBlacklist(refreshToken, req.userId);
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    // console.log( res.clearCookie("refreshToken", { httpOnly: true, secure: true }),' res.clearCookie("refreshToken", { httpOnly: true, secure: true });')
  res.sendStatus(StatusCodes.NO_CONTENT);
};

