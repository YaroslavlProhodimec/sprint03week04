import { devicesService } from "../domain/devices-service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export interface RequestWithDeviceId extends Request {
    deviceId: string;
}

export const getDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const devices = await devicesService.getDevices(userId);
    console.log('devices:', devices)
    res.status(StatusCodes.OK).json(devices);
};

export const deleteDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const result = await devicesService.deleteDevices(userId);

    if (result === null) {
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (result.deletedCount === 0) {
        return res.sendStatus(StatusCodes.NOT_FOUND);
    }

    return res.sendStatus(StatusCodes.NO_CONTENT);
};

export const deleteDeviceByIdController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const deviceId = req.params.id;

    const result = await devicesService.deleteDeviceById(userId, deviceId);

    if (result === "not_found") {
        return res.sendStatus(StatusCodes.NOT_FOUND);
    }
    if (result === "forbidden") {
        return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    // Только если удаляем текущую сессию
    if (req.deviceId && req.deviceId === deviceId) {
        const refreshToken = req.cookies.refreshToken;
        // @ts-ignore
        await authService.placeRefreshTokenToBlacklist(refreshToken, req.userId);
        res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    }

    return res.sendStatus(StatusCodes.NO_CONTENT);
};
export const deleteAllOtherDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const currentDeviceId: string = req.deviceId;

    const result = await devicesService.deleteAllOtherDevices(userId, currentDeviceId);

    return res.sendStatus(StatusCodes.NO_CONTENT);
};