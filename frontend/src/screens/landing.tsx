import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cveResults, setCveResults] = useState<any[]>([]);
    const [cvssScore, setCvssScore] = useState<number | null>(null);

    const handleSearch = async () => {
        if (!searchQuery) {
            setCveResults([]);
            setCvssScore(null);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:3000/result/cve/${searchQuery}`);
            setCveResults([{ id: searchQuery, description: response.data.description }]);
            setCvssScore(response.data.cvssScore);
        } catch (error) {
            console.error('Error searching for CVE:', error);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="flex flex-col items-center py-20">
                <div className="w-[60%] p-8 rounded-lg shadow-lg bg-gray-800">
                    <div className="text-5xl font-bold mb-4 text-center text-blue-400">
                        Protect Your Containers
                    </div>
                    <div className="text-lg text-center mb-6">
                        Use our tool to enhance the security of your containerized applications easily and effectively.
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate("/upload")}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-all duration-300"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>

                <div className="w-[60%] mt-10 p-6 rounded-lg shadow-lg bg-gray-800">
                    <div className="text-3xl font-semibold mb-4 text-center text-blue-400">
                        Search for Vulnerabilities
                    </div>
                    <div className="text-center mb-6">
                        Enter a CVE identifier or package name to check for known vulnerabilities.
                    </div>
                    <div className="flex justify-center items-center mb-6">
                        <input
                            type="text"
                            placeholder="Enter CVE ID or package name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 rounded-l-lg text-black"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-r-lg transition-all duration-300"
                        >
                            Search
                        </button>
                    </div>
                    <div>
                        {cveResults.length > 0 ? (
                            <div>
                                <ul className="list-disc pl-5">
                                    {cveResults.map((result, index) => (
                                        <li key={index} className="my-2">
                                            <span className="font-bold">CVE ID: {result.id}</span> - {result.description}
                                        </li>
                                    ))}
                                </ul>
                                {cvssScore !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-4 text-center text-lg"
                                    >
                                        <span className="font-bold">CVSS Score: </span>
                                        <span className="text-blue-400 text-2xl">{cvssScore}</span>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">No information found for the given CVE ID or package name. Please try again.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
