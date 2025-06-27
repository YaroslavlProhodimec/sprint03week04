import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import {BlogType} from "../types/blog/output";

export const BlogSchema = new mongoose.Schema<BlogType>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: String, required: true },
    isMembership: { type: Boolean, required: true }
});

export const BlogModel = mongoose.model<BlogType>('blogs', BlogSchema);