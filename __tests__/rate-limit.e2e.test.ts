import request from "supertest";
import { StatusCodes } from "http-status-codes";

describe("Rate Limit API", () => {
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    });

    it("should limit login attempts", async () => {
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

        // 2. Делаем 5 попыток входа с неверным паролем
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/auth/login")
                .send({ loginOrEmail: "alex4", password: "wrong_password" })
                .expect(StatusCodes.UNAUTHORIZED);
        }

        // 3. Шестая попытка должна вернуть 429
        await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "wrong_password" })
            .expect(StatusCodes.TOO_MANY_REQUESTS);

        // 4. Ждем 10 секунд
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 5. После ожидания должны снова получить 401
        await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "wrong_password" })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it("should limit registration attempts", async () => {
        // 1. Делаем 5 попыток регистрации с неверными данными
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/registration")
                .send({
                    login: "a", // слишком короткий логин
                    password: "b", // слишком короткий пароль
                    email: "invalid-email" // неверный формат email
                })
                .expect(StatusCodes.BAD_REQUEST);
        }

        // 2. Шестая попытка должна вернуть 429
        await request(app)
            .post("/registration")
            .send({
                login: "a",
                password: "b",
                email: "invalid-email"
            })
            .expect(StatusCodes.TOO_MANY_REQUESTS);

        // 3. Ждем 10 секунд
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 4. После ожидания должны снова получить 400
        await request(app)
            .post("/registration")
            .send({
                login: "a",
                password: "b",
                email: "invalid-email"
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("should have separate limits for different endpoints", async () => {
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

        // 2. Делаем 5 попыток входа
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post("/auth/login")
                .send({ loginOrEmail: "alex4", password: "wrong_password" })
                .expect(StatusCodes.UNAUTHORIZED);
        }

        // 3. Шестая попытка входа должна вернуть 429
        await request(app)
            .post("/auth/login")
            .send({ loginOrEmail: "alex4", password: "wrong_password" })
            .expect(StatusCodes.TOO_MANY_REQUESTS);

        // 4. Но при этом мы все еще можем делать попытки регистрации
        await request(app)
            .post("/registration")
            .send({
                login: "a",
                password: "b",
                email: "invalid-email"
            })
            .expect(StatusCodes.BAD_REQUEST);
    });

    it("should limit security devices endpoints", async () => {
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

        // 3. Делаем 5 попыток получить список устройств с неверным токеном
        for (let i = 0; i < 5; i++) {
            await request(app)
                .get("/security/devices")
                .set("Cookie", "refreshToken=invalid_token")
                .expect(StatusCodes.UNAUTHORIZED);
        }

        // 4. Шестая попытка должна вернуть 429
        await request(app)
            .get("/security/devices")
            .set("Cookie", "refreshToken=invalid_token")
            .expect(StatusCodes.TOO_MANY_REQUESTS);

        // 5. Но при этом мы все еще можем делать запросы с правильным токеном
        await request(app)
            .get("/security/devices")
            .set("Cookie", refreshToken)
            .expect(StatusCodes.OK);
    });
});