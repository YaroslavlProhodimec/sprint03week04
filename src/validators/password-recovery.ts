import {body} from "express-validator";
import {inputModelValidation} from "../middlewares/input-model-validation/input-model-validation";


const passwordValidation = body('newPassword')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Invalid password')



export const passwordRecoveryValidation = () => [passwordValidation,inputModelValidation]
