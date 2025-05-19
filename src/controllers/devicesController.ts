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
    const refreshToken = req.cookies.refreshToken;

    console.log('=== Начало deleteDeviceByIdController ===');
    console.log('Входные параметры:', { userId, deviceId, refreshToken });

    const result = await devicesService.deleteDeviceById(userId, deviceId, refreshToken);

    if (result === "not_found") {
        console.log('Устройство не найдено');
        return res.sendStatus(StatusCodes.NOT_FOUND);
    }
    if (result === "forbidden") {
        console.log('Доступ запрещен');
        return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    // Только если удаляем текущую сессию
    if (req.deviceId && req.deviceId === deviceId) {
        console.log('Удаляем текущую сессию, очищаем куки');
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
    }

    console.log('=== Конец deleteDeviceByIdController ===');
    return res.sendStatus(StatusCodes.NO_CONTENT);
};
export const deleteAllOtherDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const currentDeviceId: string = req.deviceId;

    const result = await devicesService.deleteAllOtherDevices(userId, currentDeviceId);

    return res.sendStatus(StatusCodes.NO_CONTENT);
};