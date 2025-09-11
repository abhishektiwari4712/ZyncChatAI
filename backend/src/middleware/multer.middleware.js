import multer from "multer";
import fs from "fs";
import path from "path";

// Absolute uploads folder path
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads folder at ${uploadDir}`);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// File filter (only audio files allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

// File size limit (25 MB)
const limits = {
  fileSize: 25 * 1024 * 1024,
};

// Final Multer middleware
const upload = multer({ storage, fileFilter, limits });

export default upload;
