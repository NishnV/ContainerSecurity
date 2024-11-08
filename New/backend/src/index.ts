import express, { json, Request, Response } from "express";
import { Pool } from "pg";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { SyftRunner } from "./syftrunner";
import cors from "cors";

const pool = new Pool({
  user: 'nishantv',
  database: 'ContainerSecurity',
  password: 'nishant123',
});

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

const upload = multer({ dest: "uploads/" });

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

const createDefaultDependencyFile = async (baseImage: string, uploadPath: string) => {
  const defaultFiles: { [key: string]: { name: string, content: string } } = {
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
    const filePath = path.join(uploadPath, fileInfo.name);
    await fs.writeFile(filePath, fileInfo.content);
    console.log(`${fileInfo.name} created`);
  } else {
    console.log("No default file to create for this base image.");
  }
};

const handleFileRenaming = async (baseImage: string, files: { [fieldname: string]: Express.Multer.File[] }, filePath: string) => {
  const dependencyFiles: { [key: string]: string } = {
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
    const uploadedFilePath = path.join(filePath, files[requiredDependencyFile][0]["filename"]);
    const newFilePath = path.join(filePath, requiredDependencyFile); 

    await fs.rename(uploadedFilePath, newFilePath);
    console.log(`${requiredDependencyFile} renamed successfully`);
  } else {
    await createDefaultDependencyFile(baseImage, filePath);
  }
};

app.get('/result/cve/:id', async (req: Request, res: Response) => {
  const cveName = req.params.id;

  try {
    const query = `SELECT description FROM cve_table WHERE name = $1`;
    const result = await pool.query(query, [cveName]);

    const query2 = `SELECT score FROM cvss_score WHERE cve_name = $1`;
    const result2 = await pool.query(query2, [cveName]);


    if (result.rows.length > 0) {
      res.json({ description: result.rows[0].description, cvssScore : result2.rows[0].score });
    } else {
      res.status(404).json({ error: 'CVE not found' });
    }

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post(
  "/upload",
  upload.fields([
    { name: "Dockerfile" },
    { name: "package.json" },
    { name: "pom.xml" },
    { name: "go.mod" },
    { name: ".csproj" },
    { name: "Cargo.toml" },
    { name: "Package.swift" },
    { name: "composer.json" },
    { name: "Gemfile" },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const baseImage = req.body.baseImage;
      console.log("Received files:", files);
      console.log("Selected base image:", baseImage);

      if (!files["Dockerfile"]) {
        return res.status(400).send({ message: "Dockerfile is required" });
      }

      const filePath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/uploads/";
      
      await handleFileRenaming(baseImage, files, filePath);

      const uploadedDockerFilePath = path.join(filePath, files["Dockerfile"][0]["filename"]);
      const dockerFilePath = path.join(filePath, "Dockerfile");
      await fs.rename(uploadedDockerFilePath, dockerFilePath);
      console.log("Dockerfile renamed successfully");
      const newDockerFilePath = path.join(filePath, "Dockerfile");

      exec(`docker build -f ${dockerFilePath} -t user-image ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error("Docker build failed:", error);
          return res.status(500).send({ message: "Docker build failed", error });
        }
        console.log("Docker build output:", stdout);

        exec(`docker images`, async (error, stdout, stderr) => {
          if (error) {
            console.error("Docker images listing failed:", error);
            return res.status(500).send({ message: "Docker image listing failed", error });
          }

          const regex = new RegExp(`user-image\\s+\\S+\\s+(\\w{12})`);
          const match = stdout.match(regex);
          const imageId = match ? match[1] : null;

          if (imageId) {
            const scanner = new SyftRunner(imageId);

            try {
              const scanResult = await scanner.scan();
              return res.status(200).json(scanResult);
            } catch (error) {
              console.error("Syft scan failed:", error);
              return res.status(500).send({ message: "Syft scan failed", error });
            }
          } else {
            return res.status(400).send({ message: "Docker image not found" });
          }
        });
      });
    } catch (error) {
      console.error("Unexpected error in file upload:", error);
      return res.status(500).send({ message: "Internal server error", error });
    }
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
