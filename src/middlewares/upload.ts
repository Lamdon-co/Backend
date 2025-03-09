import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  storage,
});

export default upload;
