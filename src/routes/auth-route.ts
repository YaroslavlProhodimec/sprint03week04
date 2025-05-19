import {Router, Response} from "express";
import {accessTokenValidityMiddleware} from "../middlewares/auth/auth-middleware";
import {userValidation} from "../validators/users-validator";
import {authService} from "../service/authService";
import {confirmationCodeValidator} from "../validators/code-validator";
import {emailValidation} from "../utils/usersUtils/emailValidator";
import {UserAlreadyExistsError} from "../utils/errors-utils/registration-errors/UserAlreadyExistsError";
import {StatusCodes} from "http-status-codes";
import {responseErrorFunction} from "../utils/common-utils/responseErrorFunction";
import {RegistrationError} from "../utils/errors-utils/registration-errors/RegistrationError";
import {UpdateUserError} from "../utils/errors-utils/registration-confirmation-errors/UpdateUserError";
import {
    ConfirmationCodeExpiredError
} from "../utils/errors-utils/registration-confirmation-errors/ConfirmationCodeExpiredError";
import {UserIsConfirmedError} from "../utils/errors-utils/registration-confirmation-errors/UserIsConfirmedError";
import {
    IncorrectConfirmationCodeError
} from "../utils/errors-utils/registration-confirmation-errors/IncorrectConfirmationCodeError";
import {WrongEmailError} from "../utils/errors-utils/resend-email-errors/WrongEmailError";
import {EmailAlreadyConfirmedError} from "../utils/errors-utils/resend-email-errors/EmailAlreadyConfirmedError";
import {authValidator} from "../utils/auth-utils/auth-validator";
import {getInfoAboutUser, logIn, logout, refreshToken} from "../controllers/authController";
import {refreshTokenValidityMiddleware} from "../middlewares/refreshTokenValidityMiddleware";
import {responseErrorValidationMiddleware} from "../middlewares/responseErrorValidationMiddleware";
import {rateLimitMiddleware} from "../middlewares/rate-limit-middleware";


export const authRouter = Router({})

authRouter.post('/registration',
    rateLimitMiddleware(5),
    userValidation(),
    async (req: any, res: Response) => {
        const user = await authService.createUser(req.body.login, req.body.email, req.body.password)
        if (user instanceof UserAlreadyExistsError) {
            res.status(StatusCodes.BAD_REQUEST).send(responseErrorFunction([user]))
            return
        }
        if (user instanceof RegistrationError) {
            res.status(StatusCodes.BAD_REQUEST).send(responseErrorFunction([user]))
            return
        }
        if (user) {
            res.sendStatus(StatusCodes.NO_CONTENT);
            return
        } else {
            res.status(400).send({})
            return
        }
    })

authRouter.post('/registration-confirmation',
    rateLimitMiddleware(5),
    confirmationCodeValidator(),
    async (req: any, res: Response) => {
        const confirmCodeResult = await authService.confirmCode(req.body.code);
        if (
            confirmCodeResult instanceof IncorrectConfirmationCodeError ||
            confirmCodeResult instanceof UserIsConfirmedError ||
            confirmCodeResult instanceof ConfirmationCodeExpiredError
        ) {
            res
                .status(StatusCodes.BAD_REQUEST)
                .send(responseErrorFunction([confirmCodeResult]));
            return;
        }
        if (confirmCodeResult instanceof UpdateUserError) {
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(responseErrorFunction([confirmCodeResult]));
            return;
        }
        res.sendStatus(StatusCodes.NO_CONTENT);
    })


authRouter.post('/registration-email-resending',
    rateLimitMiddleware(5),
    emailValidation(),
    async (req: any, res: Response) => {
        const resendEmailResult = await authService.resendEmail(req.body.email);
        if (
            resendEmailResult instanceof WrongEmailError ||
            resendEmailResult instanceof EmailAlreadyConfirmedError
        ) {
            res
                .status(StatusCodes.BAD_REQUEST)
                .send(responseErrorFunction([resendEmailResult]));
            return;
        }
        if (resendEmailResult instanceof UpdateUserError) {
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(responseErrorFunction([resendEmailResult]));
            return;
        }
        res.sendStatus(StatusCodes.NO_CONTENT);
    }
)

authRouter.post(
    "/login",
    rateLimitMiddleware(5),
    authValidator,
    responseErrorValidationMiddleware,
    logIn
);

authRouter.get(
    "/me",
    rateLimitMiddleware(5),
    accessTokenValidityMiddleware,
    getInfoAboutUser
);

authRouter.post("/refresh-token",   rateLimitMiddleware(5), refreshTokenValidityMiddleware, refreshToken);
authRouter.post("/logout",   rateLimitMiddleware(5), refreshTokenValidityMiddleware, logout);
