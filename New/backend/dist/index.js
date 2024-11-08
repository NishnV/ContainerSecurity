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
const pg_1 = require("pg");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const child_process_1 = require("child_process");
const syftrunner_1 = require("./syftrunner");
const cors_1 = __importDefault(require("cors"));
const pool = new pg_1.Pool({
    user: 'nishantv',
    database: 'ContainerSecurity',
    password: 'nishant123',
});
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
const upload = (0, multer_1.default)({ dest: "uploads/" });
const defaultPackageJson = {
    name: "my-project",
    version: "1.0.0",
    description: "",
    main: "index.js",
    scripts: {
        start: "node index.js",
    },
    author: "",
    license: "ISC",
};
const createDefaultDependencyFile = (baseImage, uploadPath) => __awaiter(void 0, void 0, void 0, function* () {
    const defaultFiles = {
        "Node.js": {
            name: "package.json",
            content: JSON.stringify(defaultPackageJson, null, 2),
        },
        "Java": {
            name: "pom.xml",
            content: "<project xmlns=\"http://maven.apache.org/POM/4.0.0\" ...>...</project>",
        },
        "Go": {
            name: "go.mod",
            content: "module my-module\n\ngo 1.16\n",
        },
        ".NET": {
            name: "yes.csproj",
            content: "<Project Sdk=\"Microsoft.NET.Sdk\">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net7.0</TargetFramework>\n  </PropertyGroup>\n</Project>",
        },
        "Rust": {
            name: "Cargo.toml",
            content: "[package]\nname = \"my_crate\"\nversion = \"0.1.0\"\nedition = \"2018\"\n",
        },
        "Swift": {
            name: "Package.swift",
            content: "import PackageDescription\nlet package = Package(name: \"MyPackage\")\n",
        },
        "PHP": {
            name: "composer.json",
            content: "{\n  \"require\": {}\n}",
        },
        "Ruby": {
            name: "Gemfile",
            content: "source 'https://rubygems.org'\n",
        },
    };
    if (defaultFiles[baseImage]) {
        const fileInfo = defaultFiles[baseImage];
        const filePath = path_1.default.join(uploadPath, fileInfo.name);
        yield promises_1.default.writeFile(filePath, fileInfo.content);
        console.log(`${fileInfo.name} created`);
    }
    else {
        console.log("No default file to create for this base image.");
    }
});
const handleFileRenaming = (baseImage, files, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const dependencyFiles = {
        "Node.js": "package.json",
        "Java": "pom.xml",
        "Go": "go.mod",
        ".NET": "yes.csproj",
        "Rust": "Cargo.toml",
        "Swift": "Package.swift",
        "PHP": "composer.json",
        "Ruby": "Gemfile",
    };
    if (!dependencyFiles[baseImage]) {
        throw new Error("Unsupported base image");
    }
    const requiredDependencyFile = dependencyFiles[baseImage];
    if (files[requiredDependencyFile]) {
        const uploadedFilePath = path_1.default.join(filePath, files[requiredDependencyFile][0]["filename"]);
        const newFilePath = path_1.default.join(filePath, requiredDependencyFile);
        yield promises_1.default.rename(uploadedFilePath, newFilePath);
        console.log(`${requiredDependencyFile} renamed successfully`);
    }
    else {
        yield createDefaultDependencyFile(baseImage, filePath);
    }
});
app.get('/result/cve/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cveName = req.params.id;
    try {
        const query = `SELECT description FROM cve_table WHERE name = $1`;
        const result = yield pool.query(query, [cveName]);
        const query2 = `SELECT score FROM cvss_score WHERE cve_name = $1`;
        const result2 = yield pool.query(query2, [cveName]);
        if (result.rows.length > 0) {
            res.json({ description: result.rows[0].description, cvssScore: result2.rows[0].score });
        }
        else {
            res.status(404).json({ error: 'CVE not found' });
        }
    }
    catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.post("/upload", upload.fields([
    { name: "Dockerfile" },
    { name: "package.json" },
    { name: "pom.xml" },
    { name: "go.mod" },
    { name: ".csproj" },
    { name: "Cargo.toml" },
    { name: "Package.swift" },
    { name: "composer.json" },
    { name: "Gemfile" },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const baseImage = req.body.baseImage;
        console.log("Received files:", files);
        console.log("Selected base image:", baseImage);
        if (!files["Dockerfile"]) {
            return res.status(400).send({ message: "Dockerfile is required" });
        }
        const filePath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/uploads/";
        yield handleFileRenaming(baseImage, files, filePath);
        const uploadedDockerFilePath = path_1.default.join(filePath, files["Dockerfile"][0]["filename"]);
        const dockerFilePath = path_1.default.join(filePath, "Dockerfile");
        yield promises_1.default.rename(uploadedDockerFilePath, dockerFilePath);
        console.log("Dockerfile renamed successfully");
        const newDockerFilePath = path_1.default.join(filePath, "Dockerfile");
        (0, child_process_1.exec)(`docker build -f ${dockerFilePath} -t user-image ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error("Docker build failed:", error);
                return res.status(500).send({ message: "Docker build failed", error });
            }
            console.log("Docker build output:", stdout);
            (0, child_process_1.exec)(`docker images`, (error, stdout, stderr) => __awaiter(void 0, void 0, void 0, function* () {
                if (error) {
                    console.error("Docker images listing failed:", error);
                    return res.status(500).send({ message: "Docker image listing failed", error });
                }
                const regex = new RegExp(`user-image\\s+\\S+\\s+(\\w{12})`);
                const match = stdout.match(regex);
                const imageId = match ? match[1] : null;
                if (imageId) {
                    const scanner = new syftrunner_1.SyftRunner(imageId);
                    try {
                        const scanResult = yield scanner.scan();
                        return res.status(200).json(scanResult);
                    }
                    catch (error) {
                        console.error("Syft scan failed:", error);
                        return res.status(500).send({ message: "Syft scan failed", error });
                    }
                }
                else {
                    return res.status(400).send({ message: "Docker image not found" });
                }
            }));
        });
    }
    catch (error) {
        console.error("Unexpected error in file upload:", error);
        return res.status(500).send({ message: "Internal server error", error });
    }
}));
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
