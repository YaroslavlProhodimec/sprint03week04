import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";

describe("Devices API", () => {
    let refreshToken: string;
    let accessToken: string;

    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("User SHOULD be logged in and device SHOULD be created", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratowww@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся
        const loginResult = await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "string" })
            .expect(StatusCodes.OK);

        console.log('loginResult:',loginResult,'loginResult')
        accessToken = loginResult.body.accessToken;
        const setCookie = loginResult.headers["set-cookie"];
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));


        // 3. Проверяем, что устройство появилось
        const devicesResult = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`) // <-- вот так/**/!
            .expect(StatusCodes.OK);

        console.log('devicesResult:',devicesResult)


        expect(Array.isArray(devicesResult.body)).toBe(true);
        expect(devicesResult.body.length).toBe(1);
        expect(devicesResult.body[0]).toEqual({
            ip: expect.any(String),
            title: expect.any(String),
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
        });
    }, 20000);
    it("User SHOULD be logged in and  device deleted", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratowww@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся
        const loginResult = await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "string" })
            .expect(StatusCodes.OK);

        accessToken = loginResult.body.accessToken;
        const setCookie = loginResult.headers["set-cookie"];
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));

        // 3. Проверяем, что устройство появилось
        const devicesResult = await request(app)
            .delete("/security/devices")
            .set("Cookie", refreshToken)

            // .set("Authorization", `Bearer ${accessToken}`) // <-- вот так!
            .expect(StatusCodes.NO_CONTENT);

        console.log('devicesResult:',devicesResult)


    });
    it("User SHOULD be logged in and device deleted by id", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratowww@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся
        const loginResult = await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "string" })
            .expect(StatusCodes.OK);

        const accessToken = loginResult.body.accessToken;
        const setCookie = loginResult.headers["set-cookie"];
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));

        // 3. Получаем список устройств
        const devicesResult = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // Проверяем, что хотя бы одно устройство есть
        expect(Array.isArray(devicesResult.body)).toBe(true);
        expect(devicesResult.body.length).toBeGreaterThan(0);

        // Берём deviceId первого устройства
        const deviceId = devicesResult.body[0].deviceId;
        console.log('deviceId:', deviceId);

        // 4. Удаляем устройство по deviceId
        await request(app)
            .delete(`/security/devices/${deviceId}`)
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.NO_CONTENT);

        // 5. Проверяем, что устройство удалено
        const afterDeleteDevices = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // Теперь устройств должно быть меньше (или 0, если было одно)
        expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeUndefined();
    });





    it("User dont SHOULD be logged in and device deleted by id", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratowww@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся
        const loginResult = await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "string" })
            .expect(StatusCodes.OK);

        const setCookie = loginResult.headers["set-cookie"];
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const refreshToken = cookies.find((c: string) => c.startsWith("refreshToken"));

        // 3. Получаем список устройств
        const devicesResult = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // Проверяем, что хотя бы одно устройство есть
        expect(Array.isArray(devicesResult.body)).toBe(true);
        expect(devicesResult.body.length).toBeGreaterThan(0);

        // Берём deviceId первого устройства
        const deviceId = devicesResult.body[0].deviceId;
        console.log('deviceId:', deviceId);

        // 4. Удаляем устройство по deviceId
        await request(app)
            .delete(`/security/devices/1`)
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            // .expect(StatusCodes.NO_CONTENT);
            .expect(StatusCodes.NOT_FOUND);

        // 5. Проверяем, что устройство удалено
        const afterDeleteDevices = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            // .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // Теперь устройств должно быть меньше (или 0, если было одно)
        expect(afterDeleteDevices.body.length).toBe(devicesResult.body.length);
        // expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeDefined();
    },20000);

    it("should not change deviceId after refresh, but should update lastActiveDate", async () => {
        // 1. Создаём пользователя
        const userCredentials = {
            login: "alex4",
            password: "string",
            email: "yar.muratowww@gmail.com",
        };
        await request(app)
            .post("/users")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(userCredentials)
            .expect(StatusCodes.CREATED);

        // 2. Логинимся
        const loginResult = await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "string" })
            .expect(StatusCodes.OK);

        const setCookie = loginResult.headers["set-cookie"];
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const refreshToken = cookies.find((c) => c.startsWith("refreshToken"));

        // 3. Получаем список устройств до refresh
        const devicesBefore = await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            .expect(StatusCodes.OK);

        expect(Array.isArray(devicesBefore.body)).toBe(true);
        expect(devicesBefore.body.length).toBeGreaterThan(0);

        const deviceBefore = devicesBefore.body[0];
        const deviceIdBefore = deviceBefore.deviceId;
        const lastActiveDateBefore = deviceBefore.lastActiveDate;

        // 4. Делаем refresh токена
        const refreshResult = await request(app)
            .post("/auth/refresh-token")
            .set("Cookie", refreshToken)
            .expect(StatusCodes.OK);


        const cookiesRefresh = Array.isArray(refreshResult.headers["set-cookie"]) ? refreshResult.headers["set-cookie"] : [refreshResult.headers["set-cookie"]];

        const newRefreshToken = cookiesRefresh.find((c) =>
            c.startsWith("refreshToken")
        );

        // 5. Получаем список устройств после refresh
        const devicesAfter = await request(app)
            .get("/security/devices")
            .set("Cookie", newRefreshToken)
            .expect(StatusCodes.OK);


        const deviceAfter = devicesAfter.body.find((d:any) => d.deviceId === deviceIdBefore);

        // Проверяем, что deviceId не изменился
        expect(deviceAfter.deviceId).toBe(deviceIdBefore);

        // Проверяем, что lastActiveDate обновился
        expect(deviceAfter.lastActiveDate).not.toBe(lastActiveDateBefore);
    }, 20000);


});