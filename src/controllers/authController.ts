import {Request, Response} from "express";
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
import {devicesCollection, usersCollection} from "../db";
import {v4 as uuidv4} from "uuid";
import {devicesService} from "../domain/devices-service";
import {ObjectId} from "mongodb";
import {usersQueryRepository} from "../repositories/query-repository/usersQueryRepository";
import {createConfirmationCode} from "../utils/auth-utils/create-user-confirmation-code";
import {createCodeExpirationDate} from "../utils/auth-utils/create-code-expiration-date";
import {emailManager} from "../managers/email-manager";
import bcrypt from "bcrypt";

export const logIn = async (
    req: RequestBodyModel<LoginInputModel>,
    res: Response
) => {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown device';

    const user = await usersService.checkCredentials(
        req.body.loginOrEmail,
        req.body.password
    );

    if (!user) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }

    // Генерируем deviceId
    const deviceId = uuidv4();

    // Создаем токены
    const {accessToken, refreshToken} = await create_access_refresh_tokens(
        user._id.toString(),
        deviceId
    );

    // Создаем устройство с refreshToken
    await devicesService.createDevice(
        user._id,
        deviceId,
        ip,
        userAgent,
        refreshToken
    );

    // Устанавливаем куки
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
    });

    return res.status(StatusCodes.OK).send({accessToken});
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

// export const refreshToken = async (req: Request, res: Response) => {
//     const refreshTokenFromClient = req.cookies.refreshToken;
//     await authService.placeRefreshTokenToBlacklist(
//         refreshTokenFromClient,
//         req.userId
//     );
//     const deviceId = req.deviceId;
//     const now = new Date();
//     await devicesService.updateDeviceLastActiveDate(deviceId, now);
//
//     const {accessToken, refreshToken} = await create_access_refresh_tokens(
//         req.userId
//     );
//
//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: true,
//     });
//     res.status(StatusCodes.OK).send({accessToken});
// };
// export const refreshToken = async (req: Request, res: Response) => {
//     const refreshTokenFromClient = req.cookies.refreshToken;
//     const deviceId = req.deviceId;
//     const userId = req.userId;
//
//     // Находим устройство
//     const device = await devicesCollection.findOne({
//         userId: userId,
//         deviceId: deviceId
//     });
//
//     if (!device) {
//         return res.sendStatus(StatusCodes.UNAUTHORIZED);
//     }
//
//     // Добавляем старый токен в черный список
//     await authService.placeRefreshTokenToBlacklist(
//         device.refreshToken,  // Используем токен из базы
//         userId
//     );
//
//     // Создаем новые токены
//     const {accessToken, refreshToken} = await create_access_refresh_tokens(
//         userId,
//         deviceId
//     );
//
//     // Обновляем устройство с новым токеном
//     await devicesCollection.updateOne(
//         { userId, deviceId },
//         {
//             $set: {
//                 refreshToken: refreshToken,
//                 lastActiveDate: new Date()
//             }
//         }
//     );
//
//     // Устанавливаем новый токен в куки
//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: true,
//     });
//
//     res.status(StatusCodes.OK).send({accessToken});
// };
export const refreshToken = async (req: Request, res: Response) => {
    const refreshTokenFromClient = req.cookies.refreshToken;
    const deviceId = req.deviceId;
    const userId = req.userId;

    // Находим устройство
    const device = await devicesCollection.findOne({
        userId: new ObjectId(userId),  // Преобразуем в ObjectId
        deviceId: deviceId
    });

    if (!device) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    // Добавляем старый токен в черный список
    await authService.placeRefreshTokenToBlacklist(
        device.refreshToken,
        userId
    );

    // Создаем новые токены
    const {accessToken, refreshToken} = await create_access_refresh_tokens(
        userId,
        deviceId
    );

    // Обновляем устройство с новым токеном
    await devicesCollection.updateOne(
        {
            userId: new ObjectId(userId),  // Преобразуем в ObjectId
            deviceId
        },
        {
            $set: {
                refreshToken: refreshToken,
                lastActiveDate: new Date()
            }
        }
    );

    // Устанавливаем новый токен в куки
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
    });

    return res.status(StatusCodes.OK).send({accessToken});
};
// export const logout = async (req: Request, res: Response) => {
//     const refreshToken = req.cookies.refreshToken;
//     // @ts-ignore
//     await authService.placeRefreshTokenToBlacklist(refreshToken, req.userId);
//     res.clearCookie("refreshToken", {httpOnly: true, secure: true});
//     // console.log( res.clearCookie("refreshToken", { httpOnly: true, secure: true }),' res.clearCookie("refreshToken", { httpOnly: true, secure: true });')
//     res.sendStatus(StatusCodes.NO_CONTENT);
// };
export const logout = async (req: Request, res: Response) => {
    const deviceId = req.deviceId;
    const userId = req.userId;

    // Находим устройство
    const device = await devicesCollection.findOne({
        userId: new ObjectId(userId),  // Преобразуем в ObjectId
        deviceId: deviceId
    });

    if (device) {
        // Добавляем токен из базы в черный список
        await authService.placeRefreshTokenToBlacklist(
            device.refreshToken,  // Используем токен из базы
            userId
        );

        // Удаляем устройство из базы
        await devicesCollection.deleteOne({
            userId: new ObjectId(userId),  // Преобразуем в ObjectId
            deviceId: deviceId
        });
    }

    // Очищаем куки
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });

    res.sendStatus(StatusCodes.NO_CONTENT);
};

export const passwordRecovery = async (req: Request, res: Response) => {

    const {email} = req.body;

    const user = await usersQueryRepository.findByLoginOrEmail(email);

    console.log(user,'user')
    if (user) {
        // Генерируем recoveryCode
        const recoveryCode = createConfirmationCode();

        const expirationDate  = createCodeExpirationDate()

        // Сохраняем recoveryCode в базе (например, в поле user.recoveryCode)
        // await usersService.setRecoveryCode(userId._id, recoveryCode, expirationDate);
        await usersService.setRecoveryCode(user._id.toString(), recoveryCode, expirationDate);
        // Формируем ссылку для письма
        const recoveryLink = `https://somesite.com/password-recovery?recoveryCode=${recoveryCode}`;

        // Отправляем письмо
        await emailManager.sendPasswordRecoveryEmail(email, recoveryLink);
    }

    res.sendStatus(StatusCodes.NO_CONTENT);
};
// "email": "yar.muratof@gmail.com"
export const newPassword= async (req: Request, res: Response) => {
    const { newPassword, recoveryCode } = req.body;

    const user = await usersQueryRepository.findByCodeRecovery(recoveryCode);
    console.log(user,'user')

    if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            errorsMessages: [{ message: "Recovery code is incorrect", field: "recoveryCode" }]
        });
    }

    if (user.recoveryCodeExpiration < new Date()) {
        return res.status(StatusCodes.BAD_REQUEST).send({
            errorsMessages: [{ message: "Recovery code expired", field: "recoveryCode" }]
        });
    }

    // Хешируем новый пароль
    // const passwordHash = await bcrypt.hash(newPassword, 10);
    const passwordHash = await authService._generateHash(newPassword);

    // Обновляем пользователя
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: { "accountData.passwordHash": passwordHash },
            $unset: { recoveryCode: "", recoveryCodeExpiration: "" }
        }
    );

    res.sendStatus(StatusCodes.NO_CONTENT);
};