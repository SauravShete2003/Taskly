// server/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, '../uploads/avatars');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(avatarsDir, { recursive: true });
      cb(null, avatarsDir);
    } catch (error) {
      cb(new Error('Failed to create upload directory'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // userId-timestamp.ext
    const userId = req.user?._id?.toString() || 'anonymous';
    const filename = `${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
function fileFilter(req, file, cb) {
  if (!allowed.has(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP, GIF images are allowed'));
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');
