const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
const productDir = path.join(uploadsDir, 'products');
const avatarDir = path.join(uploadsDir, 'avatars');
const categoryDir = path.join(uploadsDir, 'categories');

[uploadsDir, productDir, avatarDir, categoryDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = uploadsDir;
    if (req.uploadType === 'product') dest = productDir;
    else if (req.uploadType === 'avatar') dest = avatarDir;
    else if (req.uploadType === 'category') dest = categoryDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
};

const uploadProduct = (req, res, next) => {
  req.uploadType = 'product';
  next();
};

const uploadAvatar = (req, res, next) => {
  req.uploadType = 'avatar';
  next();
};

const uploadCategory = (req, res, next) => {
  req.uploadType = 'category';
  next();
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = { upload, uploadProduct, uploadAvatar, uploadCategory };
