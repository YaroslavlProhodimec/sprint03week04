jest.setTimeout(20000);
import request from "supertest";
import {app} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils/common";
import {StatusCodes} from "http-status-codes";

describe('test for /posts', () => {
    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })
    it("should create user, blog and post (full flow)", async () => {
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
        expect(accessToken).toBeDefined();

        // 3. Создаём блог
        const blogData = {
            name: "Test Blog",
            description: "Описание блога",
            websiteUrl: "https://testblog.com"
        };
        const blogResult = await request(app)
            .post("/blogs")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(blogData)
            .expect(StatusCodes.CREATED);

        const blogId = blogResult.body.id;
        expect(blogId).toBeDefined();

        // 4. Создаём пост в блоге
        const postData = {
            title: "Test Post",
            shortDescription: "Кратко о посте",
            content: "Полный текст поста",
            blogId: blogId
        };
        const postResult = await request(app)
            .post("/posts")
            .set("Authorization", `Basic YWRtaW46cXdlcnR5`)
            .send(postData)
            .expect(StatusCodes.CREATED);

        const postId = postResult.body.id;
        expect(postId).toBeDefined();

        // 5. (опционально) Проверяем, что пост появился в списке
        const postsList = await request(app)
            .get("/posts")
            .expect(StatusCodes.OK);
        const commentData = {
            content: "Это мой первый комментарий!"
        };
        const commentResult = await request(app)
            .post(`/posts/${postId}/comments`)
            .set("Authorization", `Bearer ${accessToken}`) // если accessToken нужен
            .send(commentData)
            .expect(StatusCodes.CREATED);

        // Проверяем, что комментарий создан и содержит likesInfo
        expect(commentResult.body).toMatchObject({
            id: expect.any(String),
            content: commentData.content,
            commentatorInfo: {
                userId: expect.any(String),
                userLogin: expect.any(String)
            },
            createdAt: expect.any(String),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            }
        });

        // 7. (опционально) Получаем комментарий по id и проверяем likesInfo
        const commentId = commentResult.body.id;
        const getComment = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        // 8. Ставим лайк комментарию
        const likeData = {
            likeStatus: "Like"
        };
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(likeData)
            .expect(StatusCodes.NO_CONTENT);

        // 9. Получаем комментарий и проверяем, что лайк появился
        const getCommentAfterLike = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        expect(getCommentAfterLike.body.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like"
        });

        // 10. Меняем лайк на дизлайк
        const dislikeData = {
            likeStatus: "Dislike"
        };
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(dislikeData)
            .expect(StatusCodes.NO_CONTENT);

        // 11. Проверяем, что дизлайк появился
        const getCommentAfterDislike = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        expect(getCommentAfterDislike.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "Dislike"
        });

        // 12. Убираем лайк/дизлайк (ставим None)
        const noneData = {
            likeStatus: "None"
        };
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(noneData)
            .expect(StatusCodes.NO_CONTENT);

        // 13. Проверяем, что лайки/дизлайки убрались
        const getCommentAfterNone = await request(app)
            .get(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(StatusCodes.OK);

        expect(getCommentAfterNone.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None"
        });

        // 14. (опционально) Проверяем без авторизации
        const getCommentUnauthorized = await request(app)
            .get(`/comments/${commentId}`)
            .expect(StatusCodes.OK);

        expect(getCommentUnauthorized.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None"
        });
        // expect(postsList.body.items.some((p: any) => p.id === postId)).toBe(true);
    });
    // it('should return 200 and empty array', async () => {
    //     await request(app)
    //         .get(RouterPaths.posts)
    //         .expect(HTTP_STATUSES.OK_200, {
    //             pagesCount: 0,
    //             page: 1,
    //             pageSize: 10,
    //             totalCount: 0,
    //             items: [] })
    // });
    //
    // it('should return 404 for not existing post', async () => {
    //     await request(app)
    //         .get(`${RouterPaths.posts}/123`)
    //         .expect(HTTP_STATUSES.NOT_FOUND_404)
    // });
    //
    // it(`shouldn't create post with incorrect input data`, async () => {
    //     const data: CreatePostInputModel = {
    //         title: "string",
    //         shortDescription: "string",
    //         content: "",
    //         blogId: "string",
    //     }
    //
    //     await postsTestManager.createPost(data, HTTP_STATUSES.BAD_REQUEST_400)
    //
    //
    //     await request(app)
    //         .get(RouterPaths.posts)
    //         .expect(HTTP_STATUSES.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    // });
    //
    // let createdPost: any = null;
    // it('should create post with correct input data', async () => {
    //     const blogExist: CreateBlogInputModel = {
    //         name: 'Title name',
    //         description: 'description test',
    //         websiteUrl: 'https://website.com'
    //     }
    //     const {createdBlogManager} = await blogsTestManager.createBlog(blogExist, HTTP_STATUSES.CREATED_201)
    //
    //     const data: CreatePostInputModel = {
    //         title: "string",
    //         shortDescription: "string",
    //         content: "string",
    //         blogId: createdBlogManager.id,
    //     }
    //
    //     const {createdPostManager} = await postsTestManager.createPost(data, HTTP_STATUSES.CREATED_201)
    //     createdPost = createdPostManager
    //
    //     const res = await request(app)
    //         .get(RouterPaths.posts)
    //         expect(res.body).toEqual({
    //             pagesCount: expect.any(Number),
    //             page: expect.any(Number),
    //             pageSize: expect.any(Number),
    //             totalCount: expect.any(Number),
    //             items: [createdPost]})
    //
    //
    // });
    //
    // it(`shouldn't update post with incorrect input data`, async () => {
    //     const data: UpdatePostModel = {
    //         title: "",
    //         shortDescription: "string",
    //         content: "string",
    //         blogId: "",
    //     }
    //
    //     await request(app)
    //         .put(`${RouterPaths.blogs}/${createdPost.id}`)
    //         .auth('admin', 'qwerty')
    //         .send(data)
    //         .expect(HTTP_STATUSES.BAD_REQUEST_400)
    //
    //
    //     // await request(app)
    //     //     .get(`${RouterPaths.blogs}/${createdPost.Id}`)
    //     //     .expect(HTTP_STATUSES.OK_200, createdPost)
    //
    // });
    //
    //     it('shouldnt update blog that not exist', async () => {
    //         const data: UpdatePostModel = {
    //             title: "string",
    //             shortDescription: "string",
    //             content: "string",
    //             blogId: "string",
    //         }
    //
    //         await request(app)
    //             .put(`${RouterPaths.posts}/-1`)
    //             .auth('admin', 'qwerty')
    //             .send(data)
    //             .expect(HTTP_STATUSES.NOT_FOUND_404)
    //     });
    //
    //     it(`shouldn update blog with correct input data`, async () => {
    //         const data: UpdatePostModel = {
    //             title: "string",
    //             shortDescription: "string",
    //             content: "string",
    //             blogId: createdPost.blogId,
    //         }
    //
    //         // await request(app)
    //         //     .put(`${RouterPaths.posts}/${createdPost.id}`)
    //         //     .auth('admin', 'qwerty')
    //         //     .send(data)
    //         //     .expect(HTTP_STATUSES.OK_200)
    //
    //
    //         await request(app)
    //             .get(`${RouterPaths.posts}/${createdPost.id}`)
    //             .expect(HTTP_STATUSES.OK_200, {
    //                 ...createdPost,
    //                 title: data.title,
    //                 shortDescription: data.shortDescription,
    //                 content: data.content,
    //                 blogId: data.blogId,
    //             })
    //
    //     });
    //
    //     it('should delete both post', async () => {
    //         await request(app)
    //             .delete(`${RouterPaths.posts}/${createdPost.id}`)
    //             .auth('admin', 'qwerty')
    //             .expect(HTTP_STATUSES.NO_CONTENT_204)
    //
    //         await request(app)
    //             .delete(`${RouterPaths.posts}/${createdPost.id}`)
    //             .auth('admin', 'qwerty')
    //             .expect(HTTP_STATUSES.NOT_FOUND_404)
    //
    //         await request(app)
    //             .get(RouterPaths.posts)
    //             .expect(HTTP_STATUSES.OK_200,  {
    //                 pagesCount: 0,
    //                 page: 1,
    //                 pageSize: 10,
    //                 totalCount: 0,
    //                 items: []
    //             })
    //
    //
    //     })

    afterAll(done => {
        done()
    })
})
