import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    socialMedia: { type: Map, of: String }, // Example: { "instagram": "url", "facebook": "url" }
    description: { type: String, required: true },
    password: {type: String, required: true}
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
