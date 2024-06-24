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
const fileUploader_1 = require("./fileUploader");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const runSyft_1 = require("./runSyft");
const app = (0, express_1.default)();
const port = 3000;
const uploadNew = fileUploader_1.upload;
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '/public/index.html'));
});
app.post('/upload', uploadNew.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(req);
        const fileName = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
        const syftRunner = new runSyft_1.runSyft(fileName);
        const result = yield syftRunner.getDependencies();
        res.send(result);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
app.listen(port, () => {
    console.log(`Listening bhaiyaaa`);
});
