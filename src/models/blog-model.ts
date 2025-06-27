import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import {BlogType} from "../types/blog/output";

export const BlogSchema = new mongoose.Schema<WithId<BlogType>>({
    id: { type: String, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true }
})
export const BlogModel = mongoose.model<BlogType>('blogs', BlogSchema)