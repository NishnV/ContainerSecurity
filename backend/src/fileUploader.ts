import multer from 'multer';

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

// Configure Multer to accept specific fields
export const upload = multer({ storage }).fields([
    { name: 'Dockerfile', maxCount: 1 },
    { name: 'package.json', maxCount: 1 }
]);