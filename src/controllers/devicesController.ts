import {devicesService} from "../domain/devices-service";
import {Request, Response} from "express";

export const getDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;

    const devices = await devicesService.getDevices(userId);
    console.log('devices:', devices)
    res.status(200).json(devices);
};
export const deleteDevicesController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const result = await devicesService.deleteDevices(userId);

    if (result === null) {
        return res.status(500);
    }

    if (result.deletedCount === 0) {
        return res.status(404);
    }

    return res.status(204).send();
};
export const deleteDeviceIdController = async (req: Request, res: Response) => {
    const userId = req.userId;
    const deviceId = req.params.id;

    const result = await devicesService.deleteDeviceById(userId, deviceId);

    if (result === "not_found") {
        return res.status(404);
    }
    if (result === "forbidden") {
        return res.status(403);
    }
    return res.status(204).send();
};