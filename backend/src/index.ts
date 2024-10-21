import express, { Request, Response } from 'express';
import { upload } from './fileUploader'; // Multer setup to handle file uploads
import path from 'path';
import cors from 'cors';
import { exec } from 'child_process';
import { Pool } from 'pg';
import util from 'util';
import { runSyft } from './runSyft';

const execPromise = util.promisify(exec); // Promisify exec for easier async/await handling

const app = express();
const port = 3000;

// Database setup
const pool = new Pool({
    user: 'nishantv',
    database: 'ContainerSecurity',
    password: 'nishant123'
});

app.use(cors());
app.use(express.json());

// Set up file upload )
// Route for file upload and Docker build
app.post('/upload', upload, async (req, res) => {
    try {
        // Type assertion to specify the expected structure
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Access Dockerfile and packageJson safely
        const dockerfile = files['Dockerfile'] ? files['Dockerfile'][0] : undefined;
        const packageJson = files['packageJson'] ? files['packageJson'][0] : undefined;

        if (!dockerfile || !packageJson) {
            return res.status(400).send('Both Dockerfile and package.json are required.');
        }

        // Now you can use your SyftRunner class
        const syftRunner = new runSyft(dockerfile.filename);
        const result = await syftRunner.getDependencies();

        res.send(result);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// Other routes remain unchanged...

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});