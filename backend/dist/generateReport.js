"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const JSON_PATH = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs';
const generateReport = (res, req) => {
    const id = '1721108537781_zoo.tar.json';
    const JSON_FILE = path_1.default.join(JSON_PATH, id);
    let obj = '';
    fs_1.default.readFile(JSON_FILE, 'utf8', function (err, data) {
        if (err)
            throw err;
        obj = JSON.parse(data);
    });
    console.log(obj);
};
exports.generateReport = generateReport;
