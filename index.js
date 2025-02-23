import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { uploadOnCloudinary } from "./utils/cloudinary.js";
import { upload } from "./middleware/multer.middleware.js";
import Admin from "./Models/admin.model.js";
import Image from "./Models/image.model.js";
import Visitor from "./Models/visitor.model.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Failed", err));

// Visitor Tracking Middleware
app.use(async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (ip) {
        await Visitor.findOneAndUpdate({ ip }, {}, { upsert: true });
    }
    next();
});

// Upload Image/Video Route
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedFile = await uploadOnCloudinary(req.file.path);
    if (!uploadedFile) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    const { title, tags, type } = req.body;
    const newFile = await Image.create({ 
        title, 
        imageUrl: uploadedFile.url, 
        tags: tags ? tags.split(",") : [], 
        type 
    });

    res.status(201).json(newFile);
});

// Get All Files (Images & Videos)
app.get("/files", async (req, res) => {
    const files = await Image.find().sort({ createdAt: -1 });
    res.status(200).json(files);
});

// Get Files by Tag
app.get("/files/tag/:tag", async (req, res) => {
    const tag = req.params.tag;
    const files = await Image.find({ tags: tag }).sort({ createdAt: -1 });
    res.status(200).json(files);
});

// Update Image Details (Title & Tags)
app.put("/files/:id", async (req, res) => {
    const { title, tags } = req.body;
    const file = await Image.findByIdAndUpdate(req.params.id, { title, tags }, { new: true });
    if (!file) return res.status(404).json({ message: "File not found" });

    res.status(200).json(file);
});

// Delete Image/Video
app.delete("/files/:id", async (req, res) => {
    const file = await Image.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "File deleted successfully" });
});

// Update Admin Details
app.get("/admins", async (req, res) => {
    const files = await Admin.findOne({email:"tanvirasif1902@gmail.com"})
    res.status(200).json(files);
});

app.put("/admin/:id", async (req, res) => {
    const { name, email, contactNumber, socialMedia, description } = req.body;
    const admin = await Admin.findByIdAndUpdate(req.params.id, { name, email, contactNumber, socialMedia, description }, { new: true });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
});

// Get Visitor Count
app.get("/visitors", async (req, res) => {
    const totalVisitors = await Visitor.countDocuments();
    res.status(200).json({ totalVisitors });
});

app.post("/visitor", async (req, res) => {
    try {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const visit = new Visitor({ ip, timestamp: new Date() });
      await visit.save();
      res.status(201).json({ success: true, message: "Visitor recorded" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error recording visitor" });
    }
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
