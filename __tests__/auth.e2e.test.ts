// @ts-ignore
import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";
import { expect, test } from "@jest/globals";

const correctAuthToken = "YWRtaW46cXdlcnR5";
const incorrectAuthToken = "YWRtaW46c864XdlcnR5=5";

describe("API for auth", () => {
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    });
    // it("should return 401 after device deletion when trying to use refresh token", async () => {
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
    //         .expect(StatusCodes.OK);
    //
    //     // 4. Удаляем устройство
    //     await request(app)
    //         .delete("/security/devices")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.NO_CONTENT);
    //
    //     // 5. Пробуем использовать refresh token после удаления устройства
    //     await request(app)
    //         .post("/auth/refresh-token")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.UNAUTHORIZED);
    //
    //     // 6. Пробуем использовать refresh token для logout
    //     await request(app)
    //         .post("/auth/logout")
    //         .set("Cookie", refreshToken)
    //         .expect(StatusCodes.UNAUTHORIZED);
    // });

    // it("User SHOULDN'T be logged in to the system", async () => {
    //     const userCredentials = {
    //         login: "alex4",
    //         password: "string",
    //         email: "yar.muratowww@gmail.com",
    //     };
    //     const createdUser = await request(app)
    //         .post("/users")
    //         .set("Authorization", `Basic ${correctAuthToken}`)
    //         .send(userCredentials)
    //         .expect(StatusCodes.CREATED);
    //     expect(createdUser.body).toEqual({
    //         id: expect.any(String),
    //         login: "alex4",
    //         email: "yar.muratowww@gmail.com",
    //         createdAt: expect.any(String),
    //     });
    //     // console.log(createdUser, 'createdUser')
    //         const userLogin = {
    //             loginOrEmail: "alex4",
    //             password: "string",
    //         };
    //         const loginResult = await request(app)
    //             .post("/auth/login")
    //             .send(userLogin)
    //             .expect(StatusCodes.OK);
    //
    //         const accessToken = loginResult.body.accessToken;
    //         const refreshToken = loginResult.headers["set-cookie"];
    //
    //         // console.log("accessToken: ", accessToken);
    //         // console.log("refreshToken: ", refreshToken);
    //
    //         const refreshTokenResult = await request(app)
    //             .post("/auth/refresh-token")
    //             .set("Cookie", refreshToken)
    //             .expect(StatusCodes.OK);
    //
    //         const refreshTokenResult2 = await request(app)
    //             .post("/auth/refresh-token")
    //             .set("Cookie", refreshToken)
    //             .expect(StatusCodes.UNAUTHORIZED);
    //     });

    // it("User SHOULDN'T be logged in to the system", async () => {
    //
    // })
        /*test("User SHOULDN'T be logged in to the system", async () => {
          await request(app)
            .post("/api/auth/login")
            .send({ loginOrEmail: "Dima", password: "13121110A" })
            .expect(StatusCodes.UNAUTHORIZED);
        });
        /*test("User SHOULD be created", async () => {
          const response = await request(app)
            .post("/api/users")
            .set("Authorization", `Basic ${correctAuthToken}`)
            .send({
              login: "Nansy",
              password: "NansyIsTheBest",
              email: "nansy@mainModule.org",
            })
            .expect(StatusCodes.CREATED);
          expect(response.body.login).toEqual("Nansy");
          expect(response.body.email).toBe("nansy@mainModule.org");
        });
        test("User SHOULD be logged in to the system and SHOULD GET JWT token", async () => {
          const response = await request(app)
            .post("/api/auth/login")
            .send({ loginOrEmail: "Nansy", password: "NansyIsTheBest" })
            .expect(StatusCodes.OK);
            console.log("received: ", response.body)
          expect(response.body.accessToken).toEqual(expect.any(String));
        });*/

});
