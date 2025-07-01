import {ObjectId, WithId} from "mongodb";
import {BlogRepository} from "./blog-repository";
import {OutputPostType, PostType} from "../types/post/output";
import {postMapper} from "../types/post/mapper";
import {CreatePostDto, UpdatePostDto} from "../types/post/input";
import {postCollection} from "../db";

export class PostRepository {
    static async getAllPostsQueryParam(sortData: any,userId?: string) {

        const sortDirection = sortData.sortDirection ?? 'desc'
        const sortBy = sortData.sortBy ?? 'createdAt'
        const searchNameTerm = sortData.searchNameTerm ?? null
        const pageSize = sortData.pageSize ?? 10
        const pageNumber = sortData.pageNumber ?? 1

        let filter = {}

        if (searchNameTerm) {
            filter = {
                name: {
                    $regex: searchNameTerm,
                    $options: 'i'
                }
            }
        }

        const post: any = await postCollection.find(
            // {
            filter
    // }
    )
            .sort(sortBy, sortDirection)
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray()

        const totalCount = await postCollection
            .countDocuments(filter)

        const pageCount = Math.ceil(totalCount / +pageSize)

        const items =
            await Promise.all(
            post.map((p:any) => postMapper(p, userId)) // userId бери из запроса, если есть
        );

        return {
            pagesCount: pageCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items
        };

    }
    static async getAllPosts() {

        const post: any = await postCollection.find({}).toArray()

        return post.map(postMapper)

    }

    static async getPostById(id: any,userId?:string): Promise<OutputPostType | null> {
        try {
            const post: any = await postCollection.findOne({_id: new ObjectId(id),
                // createdAt:new Date()
            })
            if (!post) {
                return null
            }
            return postMapper(post,userId)
        } catch (e) {
            return null
        }

    }


    static async createPost(data: CreatePostDto) {
        const createdAt = new Date()

        const blogName = await BlogRepository.getBlogById(data.blogId)

        if (blogName) {
            const newPost: PostType = {
                ...data,
                blogName: blogName.name,
                createdAt: createdAt.toISOString()
            }
            const result = await postCollection.insertOne(newPost)
            return result.insertedId.toString()
        } else {
            return null
        }

    }


    static async deletePost(id: string) {
        try {
            const result = await postCollection.deleteOne({_id: new ObjectId(id)})
            return result.deletedCount === 1
        } catch (e) {
            return false
        }
    }

    static async updatePost(id: string, data: UpdatePostDto) {
        const blog = await BlogRepository.getBlogById(data.blogId)

        let result = await postCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {
                title: data.title,
                shortDescription: data.shortDescription,
                content: data.content,
                blogId: data.blogId,
                blogName: blog!.name
            }
        })

        return result.matchedCount === 1
    }


}

