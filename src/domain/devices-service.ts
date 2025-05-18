import {v4 as uuidv4} from "uuid";
import {devicesCollection} from "../db";
import {UserDBType} from "../dto/usersDTO/usersDTO";
import {InferIdType} from "mongodb";

export const devicesService = {
    async createDevice(userId: InferIdType<UserDBType>, ip: string | undefined, userAgent: string) {
        const deviceId = uuidv4();
        const now = new Date();
        console.log('Что здесь', userId)
        const result = await devicesCollection.insertOne({
            userId: userId.toString(),
            deviceId,
            ip,
            title: userAgent,
            lastActiveDate: now,
        });

        console.log("@result:", result)

        if (!result.acknowledged || !result.insertedId) {
            throw new Error("Устройство не было сохранено в базу данных");
        }

        return deviceId;
    },
    async getDevices(userId: string,) {
        // Находим все устройства пользователя
        console.log('userId111', userId,)
        const devices = await devicesCollection.find({userId}).toArray();
        console.log("devices1:", devices)
        // Приводим к нужному формату

        return devices.map(device => ({
            ip: device.ip,
            title: device.title,
            lastActiveDate: device.lastActiveDate,
            deviceId: device.deviceId,
        }));
    },
    async deleteDevices(userId: string) {
        try {
            const result = await devicesCollection.deleteMany({userId});
            return {deletedCount: result.deletedCount};
        } catch (error) {
            console.error("Ошибка при удалении устройств:", error);
            return null;
        }
    },
// В сервисе:
    async deleteDeviceById(userId: string, deviceId: string) {

        const device = await devicesCollection.findOne({deviceId});

        if (!device) return "not_found";

        if (device.userId !== userId) return "forbidden";

        await devicesCollection.deleteOne({deviceId, userId});
        return "deleted";
    },
    async deleteAllOtherDevices(userId: string, currentDeviceId: string) {
        try {
            const result = await devicesCollection.deleteMany({
                userId,
                deviceId: {$ne: currentDeviceId}
            });
            return result.deletedCount; // возвращаем количество удалённых устройств
        } catch (error) {
            console.error("Ошибка при удалении устройств:", error);
            return null;
        }
    },
    async updateDeviceLastActiveDate(deviceId: string, date: Date) {
        await devicesCollection.updateOne(
            {deviceId},
            {$set: {lastActiveDate: date}}
        );
    },
    async findDevice(userId: string, deviceId: string) {
        // Ищем одно устройство по userId и deviceId
        const device = await devicesCollection.findOne({
            userId: userId,
            deviceId: deviceId
        });
        return device; // Возвращаем найденный документ или null
    }
};