import { useState } from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Upload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const navigate = useNavigate();


    const uploadFunc = async () => {
        if (!file) {
            setUploadStatus("Please select a file first.");
            return;
        }
        const formData = new FormData();
        formData.append('file',file);

        try {
            const response = await axios.post('http://localhost:3000/upload', formData );
            setUploadStatus("File Uploaded successfully");
            navigate('/result', { state : { result : response.data } })

        } catch (error) {
            setUploadStatus("File not uploaded");
            console.error(error);
        }
        

    };

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
            <div className="mb-4">
                <h1 className="text-white text-2xl mb-2">Upload your container tar file</h1>
            </div>
            <div className="flex flex-col items-center space-y-4">
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="text-white"
                />
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                    onClick={uploadFunc}
                >
                    Upload
                </button>
                {uploadStatus && (
                    <div className={`text-lg ${uploadStatus.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
                        {uploadStatus}
                    </div>
                )}

            </div>
        </div>
    );
}

