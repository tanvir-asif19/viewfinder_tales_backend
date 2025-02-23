import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] }, // For sorting by tags
    type: { type: String, enum: ["image", "video"], required: true } // Distinguish images and videos
}, { timestamps: true });

const Image = mongoose.model("Image", imageSchema);

export default Image;
