import {Router} from "express";
import {accessTokenValidityMiddleware} from "../middlewares/accessTokenValidityMiddleware";
import {
    deleteDeviceByIdController,
    deleteDevicesController,
    getDevicesController
} from "../controllers/devicesController";

export const securityDevicesRouter = Router({})

securityDevicesRouter.get(
    "/",
    accessTokenValidityMiddleware,
    getDevicesController
);
securityDevicesRouter.delete(
    "/",
    accessTokenValidityMiddleware,
    deleteDevicesController
);
securityDevicesRouter.delete(
    "/:id",
    accessTokenValidityMiddleware,
    deleteDeviceByIdController
);