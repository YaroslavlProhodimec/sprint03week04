import {v4 as uuidv4} from "uuid";
import {devicesCollection, refreshTokensBlacklistedCollection} from "../db";
import {UserDBType} from "../dto/usersDTO/usersDTO";
import {InferIdType, ObjectId} from "mongodb";
import {authQueryRepository} from "../repositories/query-repository/authQueryRepository";

export const devicesService = {
    async createDevice(userId: InferIdType<UserDBType>, deviceId: string, ip: string | undefined, userAgent: string, refreshToken: string) {
        console.log('=== Начало createDevice ===');
        console.log('Входные параметры:', { userId, deviceId, ip, userAgent, refreshToken });

        const device = {
            userId,
            deviceId,
            ip,
            title: userAgent,
            lastActiveDate: new Date(),
            refreshToken
        };

        const result = await devicesCollection.insertOne(device);
        console.log('Результат создания устройства:', result);

        if (!result.acknowledged || !result.insertedId) {
            console.log('Ошибка создания устройства');
            throw new Error("Устройство не было сохранено в базу данных");
        }

        console.log('=== Конец createDevice ===');
        return deviceId;
    },
    async getDevices(userId: string,) {
        // Находим все устройства пользователя
        // console.log('userId111', userId,)
        const devices = await devicesCollection.find({ userId: new ObjectId(userId) }).toArray();
        // console.log("devices1:", devices)
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
            // console.error("Ошибка при удалении устройств:", error);
            return null;
        }
    },
// // В сервисе:
//     async deleteDeviceById(userId: string, deviceId: string, refreshToken:string) {
//
//         const device = await devicesCollection.findOne({deviceId});
//
//         if (!device) return "not_found";
//
//         if (device.userId !== userId) return "forbidden";
//
//         await devicesCollection.deleteOne({deviceId, userId});
//         return "deleted";
//     },
//     async deleteDeviceById(userId: string, deviceId: string, refreshToken: string) {
//         console.log('=== Начало deleteDeviceById ===');
//         console.log('Входные параметры:', { userId, deviceId, refreshToken });
//
//         const device = await devicesCollection.findOne({
//             userId: new ObjectId(userId),
//             deviceId: deviceId
//         });
//         console.log('Найденное устройство:', device);
//
//         if (!device) {
//             console.log('Устройство не найдено');
//             return "not_found";
//         }
//
//         if (device.userId.toString() !== userId) {
//             console.log('Доступ запрещен');
//             return "forbidden";
//         }
//
//         // Добавляем refresh token устройства в черный список
//         console.log('Добавляем в черный список...');
//         const updateResult = await refreshTokensBlacklistedCollection.updateOne(
//             { _id: new ObjectId(userId) },
//             {
//                 $push: {
//                     refreshTokensArray: device.refreshToken  // Используем токен устройства
//                 }
//             },
//             { upsert: true }
//         );
//         console.log('Результат updateOne:', updateResult);
//
//         // Удаляем устройство
//         await devicesCollection.deleteOne({
//             userId: new ObjectId(userId),
//             deviceId: deviceId
//         });
//         console.log('Устройство удалено');
//         console.log('=== Конец deleteDeviceById ===');
//
//         return "deleted";
//     },
    async deleteDeviceById(userId: string, deviceId: string, refreshToken: string) {
        console.log('=== Начало deleteDeviceById ===');
        console.log('Входные параметры:', { userId, deviceId, refreshToken });

        const device = await devicesCollection.findOne({
            deviceId: deviceId  // Ищем только по deviceId
        });
        console.log('Найденное устройство:', device);

        if (!device) {
            console.log('Устройство не найдено');
            return "not_found";
        }

        // Проверяем принадлежность устройства
        if (device.userId.toString() !== userId) {
            console.log('Доступ запрещен');
            return "forbidden";
        }

        // Добавляем refresh token устройства в черный список
        console.log('Добавляем в черный список...');
        const updateResult = await refreshTokensBlacklistedCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $push: {
                    refreshTokensArray: device.refreshToken
                }
            },
            { upsert: true }
        );
        console.log('Результат updateOne:', updateResult);

        // Удаляем устройство
        await devicesCollection.deleteOne({
            userId: new ObjectId(userId),
            deviceId: deviceId
        });
        console.log('Устройство удалено');
        console.log('=== Конец deleteDeviceById ===');

        return "deleted";
    },
    async deleteAllOtherDevices(userId: string, currentDeviceId: string) {
        try {
            const result = await devicesCollection.deleteMany({
                userId: new ObjectId(userId),  // Преобразуем в ObjectId
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
    async updateDevice(userId: string, deviceId: string, newRefreshToken: string) {
        console.log('=== Начало updateDevice ===');
        console.log('Входные параметры:', { userId, deviceId, newRefreshToken });

        const result = await devicesCollection.updateOne(
            {
                userId: new ObjectId(userId),
                deviceId: deviceId
            },
            {
                $set: {
                    lastActiveDate: new Date(),
                    refreshToken: newRefreshToken
                }
            }
        );

        console.log('Результат обновления:', result);
        console.log('=== Конец updateDevice ===');

        return result;
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