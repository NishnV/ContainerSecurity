"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDependencyFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateDependencyFile = (baseImage, uploadPath) => {
    let fileName;
    let fileContent;
    switch (baseImage) {
        case "Node.js":
            fileName = "package.json";
            fileContent = JSON.stringify({
                name: "default-app",
                version: "1.0.0",
                dependencies: {}
            }, null, 2);
            break;
        case "Ruby":
            fileName = "Gemfile";
            fileContent = `source 'https://rubygems.org'\ngem 'rails', '~> 6.1'`;
            break;
        case "PHP":
            fileName = "composer.json";
            fileContent = JSON.stringify({
                name: "default-app",
                require: {}
            }, null, 2);
            break;
        case "Java":
            fileName = "pom.xml";
            fileContent = `<?xml version="1.0" encoding="UTF-8"?>
                        <project xmlns="http://maven.apache.org/POM/4.0.0"
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                                http://maven.apache.org/xsd/maven-4.0.0.xsd">
                            <modelVersion>4.0.0</modelVersion>
                            <groupId>com.example</groupId>
                            <artifactId>default-app</artifactId>
                            <version>1.0.0</version>
                        </project>`;
            break;
        case "Go":
            fileName = "go.mod";
            fileContent = `module default-app\n\ngo 1.16`;
            break;
        case ".NET":
            fileName = "default.csproj";
            fileContent = `<Project Sdk="Microsoft.NET.Sdk">
                            <PropertyGroup>
                                <OutputType>Exe</OutputType>
                                <TargetFramework>net5.0</TargetFramework>
                            </PropertyGroup>
                            </Project>`;
            break;
        case "Rust":
            fileName = "Cargo.toml";
            fileContent = `[package]
            name = "default-app"
            version = "0.1.0"
            edition = "2018"

            [dependencies]`;
            break;
        case "Swift":
            fileName = "Package.swift";
            fileContent = `// swift-tools-version:5.3
                import PackageDescription

                let package = Package(
                    name: "default-app",
                    dependencies: [],
                    targets: [
                        .target(
                            name: "default-app",
                            dependencies: []),
                    ]
                )`;
            break;
        default:
            throw new Error(`No default file available for the base image: ${baseImage}`);
    }
    const filePath = path_1.default.join(uploadPath, fileName);
    try {
        fs_1.default.writeFileSync(filePath, fileContent);
        console.log(`${fileName} created successfully at ${filePath}`);
    }
    catch (error) {
        console.error(`Error creating ${fileName}:`, error);
        throw error;
    }
};
exports.generateDependencyFile = generateDependencyFile;
