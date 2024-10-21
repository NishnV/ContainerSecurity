import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ProgressType {
    [key: string]: number;
}

interface UploadStatusType {
    [key: string]: string;
}

type BaseImage = "Node.js" | "Java" | "Go" | ".NET" | "Rust" | "Swift" | "PHP" | "Ruby" | "Other";

const dependencyFiles: Record<BaseImage, string> = {
    "Node.js": "package.json",
    "Java": "pom.xml",
    "Go": "go.mod",
    ".NET": ".csproj",
    "Rust": "Cargo.toml",
    "Swift": "Package.swift",
    "PHP": "composer.json",
    "Ruby": "Gemfile",
    "Other": "", 
};

export const Upload: React.FC = () => {
    const [files, setFiles] = useState<{ [key: string]: File }>({});
    const [progress, setProgress] = useState<ProgressType>({});
    const [uploadStatus, setUploadStatus] = useState<UploadStatusType>({});
    const [baseImage, setBaseImage] = useState<BaseImage | "">("");
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const updatedFiles = { ...files };
            newFiles.forEach(file => {
                updatedFiles[file.name] = file;
            });
            setFiles(updatedFiles);
        }
    };

    const handleBaseImageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setBaseImage(event.target.value as BaseImage);
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            const selectedBaseImage = event.target.value as BaseImage; 
            const dependencyFile = dependencyFiles[selectedBaseImage];

            if (dependencyFile && updatedFiles[dependencyFile]) {
                delete updatedFiles[dependencyFile];
            }
            return updatedFiles;
        });
    };

    const handleFileUpload = () => {
        setIsUploading(true);
        const formData = new FormData();
        
        formData.append('baseImage', baseImage);
        
        if (files['Dockerfile']) {
            formData.append('Dockerfile', files['Dockerfile']);
        }

        const selectedDependencyFile = dependencyFiles[baseImage as BaseImage]; 
        if (selectedDependencyFile && files[selectedDependencyFile]) {
            formData.append(selectedDependencyFile, files[selectedDependencyFile]);
        }

        axios.post('http://localhost:3000/upload', formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentage = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress((prevProgress) => ({ ...prevProgress, 'upload': percentage }));
                }
            }
        })
        .then(response => {
            if (response.status === 200) {
                navigate('/result', { state: { result: response.data } });
            }
        })
        .catch(error => {
            setUploadStatus({ upload: "Files not uploaded" });
            console.error(error);
        })
        .finally(() => {
            setIsUploading(false);
        });
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 text-white">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-center text-blue-400">Upload Your Dockerfile and Dependency File</h1>
                <p className="text-center text-lg mb-6">Secure your container by uploading the necessary files to analyze and detect vulnerabilities.</p>
            </div>
            <div className="w-full max-w-lg p-6 rounded-lg shadow-lg bg-gray-800 space-y-6">
                <select onChange={handleBaseImageChange} className="w-full p-3 rounded-lg text-black">
                    <option value="">Select Base Image</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Java">Java</option>
                    <option value="Go">Go</option>
                    <option value=".NET">.NET (C#)</option>
                    <option value="Rust">Rust</option>
                    <option value="Swift">Swift</option>
                    <option value="PHP">PHP</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-3 rounded-lg text-black"
                />
                <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all duration-300"
                    onClick={handleFileUpload}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </button>
                {isUploading && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.upload}%` }}
                        className="bg-blue-500 h-2 rounded-full mt-2"
                    />
                )}
                {isUploading && (
                    <div className="text-center mt-2">Estimated wait time: {Math.max(5, Math.floor(100 / (progress.upload + 1)))} seconds</div>
                )}
                {Object.keys(uploadStatus).length > 0 && (
                    <div className="text-center mt-4 text-red-500">{uploadStatus.upload}</div>
                )}
            </div>
        </div>
    );
};
