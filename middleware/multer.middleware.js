import multer from "multer";
import path from "path";

// Configure storage (saving temporarily)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Temporary storage before Cloudinary
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// File filter (allow only images and videos)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image and video files are allowed!"), false);
    }
};

const upload = multer({ storage, fileFilter });

export { upload };
