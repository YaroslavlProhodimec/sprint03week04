import {Router} from "express";
import {accessTokenValidityMiddleware} from "../middlewares/accessTokenValidityMiddleware";
import {
    deleteAllOtherDevicesController,
    deleteDeviceByIdController,
    deleteDevicesController,
    getDevicesController
} from "../controllers/devicesController";
import {refreshTokenValidityMiddleware} from "../middlewares/refreshTokenValidityMiddleware";

export const securityDevicesRouter = Router({})

securityDevicesRouter.get(
    "/",

    // accessTokenValidityMiddleware,
    refreshTokenValidityMiddleware,
    getDevicesController
);
securityDevicesRouter.delete(
    "/",
    // accessTokenValidityMiddleware,
    refreshTokenValidityMiddleware,
    // deleteDevicesController
    deleteAllOtherDevicesController
);
securityDevicesRouter.delete(
    "/:id",
    refreshTokenValidityMiddleware,
    deleteDeviceByIdController
);