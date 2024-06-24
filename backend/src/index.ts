import express, { Request, Response } from 'express';
import { upload } from "./fileUploader";
import path from 'path';
import cors from 'cors';
import { runSyft } from './runSyft';

const app = express();
const port = 3000;
const uploadNew = upload;

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(express.json());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  });

app.post('/upload', uploadNew.single('file'), async (req, res) => {
    
    try{
        console.log(req);
        const fileName = req.file?.filename as string
        const syftRunner = new runSyft(fileName);

        const result = await syftRunner.getDependencies();

        res.send(result)
    }
    catch(error : any){
        res.status(500).send(error.message);
    }
    
});

app.listen(port, () => {
    console.log(`Listening bhaiyaaa`);
});
