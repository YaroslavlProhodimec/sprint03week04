import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";

describe("Devices API", () => {
    let refreshToken: string;
    let accessToken: string;

    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("should create user and login 4 times with different user-agents", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratof@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся 4 раза с разными user-agent
        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
            "Mozilla/5.0 (Linux; Android 11; SM-G991B)"
        ];

        const devices = [];

        for (const userAgent of userAgents) {
            const loginResult = await request(app)
                .post("/auth/login")
                .set("User-Agent", userAgent)
                .send({ loginOrEmail: "alex4", password: "string" })
                .expect(StatusCodes.OK);

            const setCookie = loginResult.headers["set-cookie"];
            const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
            const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));

            devices.push({
                refreshToken,
                userAgent
            });
        }

        // 3. Проверяем, что у нас 4 разных устройства
        const devicesResult = await request(app)
            .get("/security/devices")
            .set("Cookie", devices[0].refreshToken)
            .expect(StatusCodes.OK);

        expect(Array.isArray(devicesResult.body)).toBe(true);
        expect(devicesResult.body.length).toBe(4);

        // 4. Проверяем, что у каждого устройства свой user-agent
        const deviceTitles = devicesResult.body.map((d: any) => d.title);
        expect(deviceTitles).toEqual(userAgents);

        return devices; // Возвращаем устройства для следующих тестов
    });
    // it("should handle errors 404, 401, 403", async () => {
    //     // 1. Создаём первого пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первым пользователем
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Проверяем 401 - нет токена
    //     await request(app)
    //         .get("/security/devices")
    //         .expect(StatusCodes.UNAUTHORIZED);
    //
    //     // 4. Проверяем 404 - несуществующий deviceId
    //     await request(app)
    //         .delete("/security/devices/non-existent-device-id")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.NOT_FOUND);
    //
    //     // 5. Проверяем 403 - попытка удалить чужое устройство
    //     // Создаем второго пользователя с другим email
    //     const secondUserCredentials = {
    //         login: "alex5",
    //         password: "string",
    //         email: "yar.muratowww2@gmail.com", // Изменили email
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(secondUserCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // Логинимся вторым пользователем
    //     const secondLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex5", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const secondSetCookie = secondLoginResult.headers["set-cookie"];
    //     const secondCookies = Array.isArray(secondSetCookie) ? secondSetCookie : [secondSetCookie];
    //     const secondRefreshToken = secondCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // Получаем deviceId первого пользователя
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     const firstUserDeviceId = devicesResult.body[0].deviceId;
    //
    //     // Пытаемся удалить устройство первого пользователя, используя токен второго
    //     await request(app)
    //         .delete(`/security/devices/${firstUserDeviceId}`)
    //         .set("Cookie", secondRefreshToken)
    //         .expect(StatusCodes.FORBIDDEN);
    // });    // it("User SHOULD be logged in and device SHOULD be created", async () => {
    // it("should update refreshToken for device 1", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первый раз
    //     const firstLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const firstSetCookie = firstLoginResult.headers["set-cookie"];
    //     const firstCookies = Array.isArray(firstSetCookie) ? firstSetCookie : [firstSetCookie];
    //     const firstRefreshToken = firstCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", firstRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     // 4. Обновляем refreshToken
    //     const refreshResult = await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", firstRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     const newSetCookie = refreshResult.headers["set-cookie"];
    //     const newCookies = Array.isArray(newSetCookie) ? newSetCookie : [newSetCookie];
    //     const newRefreshToken = newCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 5. Проверяем, что список устройств не изменился
    //     const afterRefreshDevices = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", newRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем количество устройств
    //     expect(afterRefreshDevices.body.length).toBe(devicesResult.body.length);
    //
    //     // Проверяем, что deviceId не изменились
    //     const originalDeviceIds = devicesResult.body.map((d: any) => d.deviceId);
    //     const newDeviceIds = afterRefreshDevices.body.map((d: any) => d.deviceId);
    //     expect(newDeviceIds).toEqual(originalDeviceIds);
    //
    //     // Проверяем, что lastActiveDate обновился
    //     const device1 = afterRefreshDevices.body.find((d: any) => d.deviceId === originalDeviceIds[0]);
    //     const originalDate = new Date(devicesResult.body[0].lastActiveDate);
    //     const newDate = new Date(device1.lastActiveDate);
    //     expect(newDate.getTime()).toBeGreaterThan(originalDate.getTime());
    //
    //     return {
    //         originalDevices: devicesResult.body,
    //         newDevices: afterRefreshDevices.body,
    //         newRefreshToken
    //     };
    // });
    // it("should keep devices list unchanged after token refresh", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первый раз
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const initialRefreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств до обновления токена
    //     const devicesBeforeRefresh = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", initialRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     // Сохраняем начальную дату
    //     const initialDate = new Date(devicesBeforeRefresh.body[0].lastActiveDate);
    //
    //     // 4. Обновляем refreshToken
    //     const refreshResult = await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", initialRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     const newSetCookie = refreshResult.headers["set-cookie"];
    //     const newCookies = Array.isArray(newSetCookie) ? newSetCookie : [newSetCookie];
    //     const newRefreshToken = newCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 5. Получаем список устройств после обновления токена
    //     const devicesAfterRefresh = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", newRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что количество устройств не изменилось
    //     expect(devicesAfterRefresh.body.length).toBe(devicesBeforeRefresh.body.length);
    //
    //     // Проверяем, что deviceId не изменились
    //     const beforeDeviceIds = devicesBeforeRefresh.body.map((d: any) => d.deviceId);
    //     const afterDeviceIds = devicesAfterRefresh.body.map((d: any) => d.deviceId);
    //     expect(afterDeviceIds).toEqual(beforeDeviceIds);
    //
    //     // Проверяем, что lastActiveDate обновился
    //     const device1After = devicesAfterRefresh.body[0];
    //     const afterDate = new Date(device1After.lastActiveDate);
    //
    //     // Проверяем, что дата не меньше начальной
    //     expect(afterDate.getTime()).toBeGreaterThanOrEqual(initialDate.getTime());
    //
    //     return {
    //         devicesBefore: devicesBeforeRefresh.body,
    //         devicesAfter: devicesAfterRefresh.body,
    //         newRefreshToken
    //     };
    // });
    // it("should delete device 2 using device 1 token", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первый раз (девайс 1)
    //     const firstLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const firstSetCookie = firstLoginResult.headers["set-cookie"];
    //     const firstCookies = Array.isArray(firstSetCookie) ? firstSetCookie : [firstSetCookie];
    //     const device1Token = firstCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Логинимся второй раз (девайс 2)
    //     const secondLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const secondSetCookie = secondLoginResult.headers["set-cookie"];
    //     const secondCookies = Array.isArray(secondSetCookie) ? secondSetCookie : [secondSetCookie];
    //     const device2Token = secondCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 4. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Находим deviceId второго устройства
    //     const device2 = devicesResult.body.find((d: any) => d.deviceId !== devicesResult.body[0].deviceId);
    //     const device2Id = device2.deviceId;
    //
    //     // 5. Удаляем второе устройство, используя токен первого
    //     await request(app)
    //         .delete(`/security/devices/${device2Id}`)
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 6. Проверяем, что второе устройство удалено
    //     const afterDeleteDevices = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что осталось только одно устройство
    //     expect(afterDeleteDevices.body.length).toBe(1);
    //
    //     // Проверяем, что это именно первое устройство
    //     expect(afterDeleteDevices.body[0].deviceId).toBe(devicesResult.body[0].deviceId);
    //
    //     // Проверяем, что второго устройства нет в списке
    //     const device2StillExists = afterDeleteDevices.body.some((d: any) => d.deviceId === device2Id);
    //     expect(device2StillExists).toBe(false);
    //
    //     return {
    //         device1Token,
    //         device2Token,
    //         device2Id
    //     };
    // });
    // it("should logout device 3 and check it's not in the list", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первый раз (девайс 1)
    //     const firstLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const firstSetCookie = firstLoginResult.headers["set-cookie"];
    //     const firstCookies = Array.isArray(firstSetCookie) ? firstSetCookie : [firstSetCookie];
    //     const device1Token = firstCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Логинимся второй раз (девайс 2)
    //     const secondLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const secondSetCookie = secondLoginResult.headers["set-cookie"];
    //     const secondCookies = Array.isArray(secondSetCookie) ? secondSetCookie : [secondSetCookie];
    //     const device2Token = secondCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 4. Логинимся третий раз (девайс 3)
    //     const thirdLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const thirdSetCookie = thirdLoginResult.headers["set-cookie"];
    //     const thirdCookies = Array.isArray(thirdSetCookie) ? thirdSetCookie : [thirdSetCookie];
    //     const device3Token = thirdCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 5. Получаем список устройств до logout
    //     const devicesBeforeLogout = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Находим deviceId третьего устройства
    //     const device3 = devicesBeforeLogout.body.find((d: any) =>
    //         d.deviceId !== devicesBeforeLogout.body[0].deviceId &&
    //         d.deviceId !== devicesBeforeLogout.body[1].deviceId
    //     );
    //     const device3Id = device3.deviceId;
    //
    //     // 6. Делаем logout третьим устройством
    //     await request(app)
    //         .post("/auth/logout")
    //         .set("Cookie", device3Token)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 7. Проверяем список устройств через первое устройство
    //     const devicesAfterLogout = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что осталось два устройства
    //     expect(devicesAfterLogout.body.length).toBe(2);
    //
    //     // Проверяем, что третьего устройства нет в списке
    //     const device3StillExists = devicesAfterLogout.body.some((d: any) => d.deviceId === device3Id);
    //     expect(device3StillExists).toBe(false);
    //
    //     // Проверяем, что первое и второе устройства остались
    //     const device1StillExists = devicesAfterLogout.body.some((d: any) => d.deviceId === devicesBeforeLogout.body[0].deviceId);
    //     const device2StillExists = devicesAfterLogout.body.some((d: any) => d.deviceId === devicesBeforeLogout.body[1].deviceId);
    //
    //     expect(device1StillExists).toBe(true);
    //     expect(device2StillExists).toBe(true);
    //
    //     return {
    //         device1Token,
    //         device2Token,
    //         device3Token,
    //         device3Id
    //     };
    // });
    // it("should delete all other devices and keep only current one", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся первый раз (девайс 1)
    //     const firstLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const firstSetCookie = firstLoginResult.headers["set-cookie"];
    //     const firstCookies = Array.isArray(firstSetCookie) ? firstSetCookie : [firstSetCookie];
    //     const device1Token = firstCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Логинимся второй раз (девайс 2)
    //     const secondLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const secondSetCookie = secondLoginResult.headers["set-cookie"];
    //     const secondCookies = Array.isArray(secondSetCookie) ? secondSetCookie : [secondSetCookie];
    //     const device2Token = secondCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 4. Логинимся третий раз (девайс 3)
    //     const thirdLoginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const thirdSetCookie = thirdLoginResult.headers["set-cookie"];
    //     const thirdCookies = Array.isArray(thirdSetCookie) ? thirdSetCookie : [thirdSetCookie];
    //     const device3Token = thirdCookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 5. Получаем список устройств до удаления
    //     const devicesBeforeDelete = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Сохраняем deviceId первого устройства
    //     const device1Id = devicesBeforeDelete.body[0].deviceId;
    //
    //     // 6. Удаляем все остальные устройства
    //     await request(app)
    //         .delete("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 7. Проверяем список устройств
    //     const devicesAfterDelete = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", device1Token)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что осталось только одно устройство
    //     expect(devicesAfterDelete.body.length).toBe(1);
    //
    //     // Проверяем, что это именно первое устройство
    //     expect(devicesAfterDelete.body[0].deviceId).toBe(device1Id);
    //
    //     // Проверяем, что других устройств нет
    //     const otherDevicesExist = devicesAfterDelete.body.some((d: any) => d.deviceId !== device1Id);
    //     expect(otherDevicesExist).toBe(false);
    //
    //     return {
    //         device1Token,
    //         device2Token,
    //         device3Token,
    //         device1Id
    //     };
    // });
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     // console.log('loginResult:',loginResult,'loginResult')
    //     accessToken = loginResult.body.accessToken;
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //
    //     // 3. Проверяем, что устройство появилось
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`) // <-- вот так/**/!
    //         .expect(StatusCodes.OK);
    //
    //     // console.log('devicesResult:',devicesResult)
    //
    //
    //     expect(Array.isArray(devicesResult.body)).toBe(true);
    //     expect(devicesResult.body.length).toBe(1);
    //     expect(devicesResult.body[0]).toEqual({
    //         ip: expect.any(String),
    //         title: expect.any(String),
    //         lastActiveDate: expect.any(String),
    //         deviceId: expect.any(String),
    //     });
    // }, 20000);
    // it("User SHOULD be logged in and  device deleted", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     accessToken = loginResult.body.accessToken;
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Проверяем, что устройство появилось
    //     const devicesResult = await request(app)
    //         .delete("/security/devices")
    //         .set("Cookie", refreshToken)
    //
    //         // .set("Authorization", `Bearer ${accessToken}`) // <-- вот так!
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     console.log('devicesResult:',devicesResult)
    //
    //
    // });
    // it("User SHOULD be logged in and device deleted by id", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const accessToken = loginResult.body.accessToken;
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что хотя бы одно устройство есть
    //     expect(Array.isArray(devicesResult.body)).toBe(true);
    //     expect(devicesResult.body.length).toBeGreaterThan(0);
    //
    //     // Берём deviceId первого устройства
    //     const deviceId = devicesResult.body[0].deviceId;
    //     console.log('deviceId:', deviceId);
    //
    //     // 4. Удаляем устройство по deviceId
    //     await request(app)
    //         .delete(`/security/devices/${deviceId}`)
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 5. Проверяем, что устройство удалено
    //     const afterDeleteDevices = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Теперь устройств должно быть меньше (или 0, если было одно)
    //     expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeUndefined();
    // });





    // it("User dont SHOULD be logged in and device deleted by id", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что хотя бы одно устройство есть
    //     expect(Array.isArray(devicesResult.body)).toBe(true);
    //     expect(devicesResult.body.length).toBeGreaterThan(0);
    //
    //     // Берём deviceId первого устройства
    //     const deviceId = devicesResult.body[0].deviceId;
    //     console.log('deviceId:', deviceId);
    //
    //     // 4. Удаляем устройство по deviceId
    //     await request(app)
    //         .delete(`/security/devices/1`)
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         // .expect(StatusCodes.NO_CONTENT);
    //         .expect(StatusCodes.NOT_FOUND);
    //
    //     // 5. Проверяем, что устройство удалено
    //     const afterDeleteDevices = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Теперь устройств должно быть меньше (или 0, если было одно)
    //     expect(afterDeleteDevices.body.length).toBe(devicesResult.body.length);
    //     // expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeDefined();
    // },20000);
    //
    // it("should not change deviceId after refresh, but should update lastActiveDate", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств до refresh
    //     const devicesBefore = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     expect(Array.isArray(devicesBefore.body)).toBe(true);
    //     expect(devicesBefore.body.length).toBeGreaterThan(0);
    //
    //     const deviceBefore = devicesBefore.body[0];
    //     const deviceIdBefore = deviceBefore.deviceId;
    //     const lastActiveDateBefore = deviceBefore.lastActiveDate;
    //
    //     // 4. Делаем refresh токена
    //     const refreshResult = await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.OK);
    //
    //
    //     const cookiesRefresh = Array.isArray(refreshResult.headers["set-cookie"]) ? refreshResult.headers["set-cookie"] : [refreshResult.headers["set-cookie"]];
    //
    //     const newRefreshToken = cookiesRefresh.find((c) =>
    //         c.startsWith("refreshToken")
    //     );
    //
    //     // 5. Получаем список устройств после refresh
    //     const devicesAfter = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", newRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //
    //     const deviceAfter = devicesAfter.body.find((d:any) => d.deviceId === deviceIdBefore);
    //
    //     // Проверяем, что deviceId не изменился
    //     expect(deviceAfter.deviceId).toBe(deviceIdBefore);
    //
    //     // Проверяем, что lastActiveDate обновился
    //     expect(deviceAfter.lastActiveDate).not.toBe(lastActiveDateBefore);
    // }, 20000);
    //
    // it("User SHOULD be logged in and device deleted by id", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const accessToken = loginResult.body.accessToken;
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что хотя бы одно устройство есть
    //     expect(Array.isArray(devicesResult.body)).toBe(true);
    //     expect(devicesResult.body.length).toBeGreaterThan(0);
    //
    //     // Берём deviceId первого устройства
    //     const deviceId = devicesResult.body[0].deviceId;
    //     console.log('deviceId:', deviceId);
    //
    //     // 4. Удаляем устройство по deviceId
    //     await request(app)
    //         .delete(`/security/devices/${deviceId}`)
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 5. Проверяем, что устройство удалено
    //     const afterDeleteDevices = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Теперь устройств должно быть меньше (или 0, если было одно)
    //     expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeUndefined();
    // });
    // it("User SHOULD be logged in and device deleted by id", async () => {
    //     // 1. Создаём пользователя
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //
    //     // 2. Логинимся
    //     const loginResult = await request(app)
    //         .post("/auth/login")
    //         .send({ loginOrEmail: "alex4", password: "string" })
    //         .expect(StatusCodes.OK);
    //
    //     const accessToken = loginResult.body.accessToken;
    //     const setCookie = loginResult.headers["set-cookie"];
    //     const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    //     const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));
    //
    //     // 3. Получаем список устройств
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.OK);
    //
    //     // Проверяем, что хотя бы одно устройство есть
    //     expect(Array.isArray(devicesResult.body)).toBe(true);
    //     expect(devicesResult.body.length).toBeGreaterThan(0);
    //
    //     // Берём deviceId первого устройства
    //     const deviceId = devicesResult.body[0].deviceId;
    //     console.log('deviceId:', deviceId);
    //
    //     // 4. Удаляем устройство по deviceId
    //     await request(app)
    //         .delete(`/security/devices/${deviceId}`)
    //         .set("Cookie", refreshToken)
    //         // .set("Authorization", `Bearer ${accessToken}`)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 4. Делаем refresh токена
    //     const refreshResult = await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.UNAUTHORIZED);
    //
    //     // 7. Пробуем получить список устройств со старым токеном
    //     // await request(app)
    //     //     .get("/security/devices")
    //     //     .set("Cookie", refreshToken)
    //     //     .expect(StatusCodes.UNAUTHORIZED);
    //
    // });
});