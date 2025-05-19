import {Router} from "express";
import {accessTokenValidityMiddleware} from "../middlewares/accessTokenValidityMiddleware";
import {
    deleteAllOtherDevicesController,
    deleteDeviceByIdController,
    deleteDevicesController,
    getDevicesController
} from "../controllers/devicesController";
import {refreshTokenValidityMiddleware} from "../middlewares/refreshTokenValidityMiddleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit-middleware";

export const securityDevicesRouter = Router({})

securityDevicesRouter.get(
    "/",
    rateLimitMiddleware(5),
    // accessTokenValidityMiddleware,
    refreshTokenValidityMiddleware,
    getDevicesController
);
securityDevicesRouter.delete(
    "/",
    rateLimitMiddleware(5),
    // accessTokenValidityMiddleware,
    refreshTokenValidityMiddleware,
    // deleteDevicesController
    deleteAllOtherDevicesController
);
securityDevicesRouter.delete(
    "/:id",
    rateLimitMiddleware(5),
    refreshTokenValidityMiddleware,
    deleteDeviceByIdController
);