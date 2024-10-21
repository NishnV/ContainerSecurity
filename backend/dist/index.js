"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUploader_1 = require("./fileUploader"); // Multer setup to handle file uploads
const cors_1 = __importDefault(require("cors"));
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const util_1 = __importDefault(require("util"));
const runSyft_1 = require("./runSyft");
const execPromise = util_1.default.promisify(child_process_1.exec); // Promisify exec for easier async/await handling
const app = (0, express_1.default)();
const port = 3000;
// Database setup
const pool = new pg_1.Pool({
    user: 'nishantv',
    database: 'ContainerSecurity',
    password: 'nishant123'
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Set up file upload )
// Route for file upload and Docker build
app.post('/upload', fileUploader_1.upload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Type assertion to specify the expected structure
        const files = req.files;
        // Access Dockerfile and packageJson safely
        const dockerfile = files['Dockerfile'] ? files['Dockerfile'][0] : undefined;
        const packageJson = files['packageJson'] ? files['packageJson'][0] : undefined;
        if (!dockerfile || !packageJson) {
            return res.status(400).send('Both Dockerfile and package.json are required.');
        }
        // Now you can use your SyftRunner class
        const syftRunner = new runSyft_1.runSyft(dockerfile.filename);
        const result = yield syftRunner.getDependencies();
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
// Other routes remain unchanged...
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
