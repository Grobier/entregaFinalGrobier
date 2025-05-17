import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../../public/img')); 
    },
    filename: (req, file, callback) => {
        const newFileName = Date.now() + "-" + file.originalname;
        callback(null, newFileName);
    },
});

const uploader = multer({ storage });

export default uploader;
