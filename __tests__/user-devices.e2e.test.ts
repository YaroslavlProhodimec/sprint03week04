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
            .set("Authorization", `Bearer ${accessToken}`) // <-- вот так!
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
    });
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

        // 3. Проверяем, что устройство появилось
        const devicesResult = await request(app)
            .delete("/security/devices")
            .set("Authorization", `Bearer ${accessToken}`) // <-- вот так!
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

        // 3. Получаем список устройств
        const devicesResult = await request(app)
            .get("/security/devices")
            .set("Authorization", `Bearer ${accessToken}`)
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
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.NO_CONTENT);

        // 5. Проверяем, что устройство удалено
        const afterDeleteDevices = await request(app)
            .get("/security/devices")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // Теперь устройств должно быть меньше (или 0, если было одно)
        expect(afterDeleteDevices.body.find((d: any) => d.deviceId === deviceId)).toBeUndefined();
    });
    // it("Device lastActiveDate SHOULD be updated after refresh", async () => {
    //     1. Получаем устройства до refresh
        // const before = await request(app)
        //     .get("/security/devices")
        //     .set("Cookie", refreshToken)
        //     .expect(StatusCodes.OK);
        //
        // const oldDate = before.body[0].lastActiveDate;

    //     // 2. Делаем refresh токена
    //     const refreshResult = await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     const newRefreshToken = refreshResult.headers["set-cookie"].find((c: string) =>
    //         c.startsWith("refreshToken")
    //     );
    //
    //     // 3. Получаем устройства после refresh
    //     const after = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", newRefreshToken)
    //         .expect(StatusCodes.OK);
    //
    //     const newDate = after.body[0].lastActiveDate;
    //
    //     expect(new Date(newDate).getTime()).toBeGreaterThan(new Date(oldDate).getTime());
    // });

    // it("Device SHOULD be deleted after logout", async () => {
    //     // 1. Делаем logout
    //     await request(app)
    //         .post("/auth/logout")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 2. Проверяем, что устройств больше нет
    //     const devicesResult = await request(app)
    //         .get("/security/devices")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.UNAUTHORIZED); // или 200 и пустой массив, зависит от реализации
    // });
});