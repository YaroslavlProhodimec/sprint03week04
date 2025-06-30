import { body } from "express-validator";
import { inputModelValidation } from "../middlewares/input-model-validation/input-model-validation";

export const likeStatusFieldValidation = body('likeStatus')
    .isString()
    .custom((value) => ["Like", "Dislike", "None"].includes(value))
    .withMessage("likeStatus must be 'Like', 'Dislike' or 'None'");

export const likeStatusValidation = () => [
    likeStatusFieldValidation,
    inputModelValidation
];