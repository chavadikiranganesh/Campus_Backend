const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Storage configuration for study materials
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "study-marketplace",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Storage configuration for lost & found items
const lostFoundStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lost-found",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Storage configuration for accommodation photos
const accommodationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "accommodations",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
};

// Multer middleware for study materials
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multer middleware for lost & found
const uploadLostFound = multer({
  storage: lostFoundStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multer middleware for accommodation (multiple images, max 5)
const uploadAccommodation = multer({
  storage: accommodationStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  }
});

module.exports = { upload, uploadLostFound, uploadAccommodation };
