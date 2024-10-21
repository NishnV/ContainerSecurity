import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { motion } from "framer-motion";

interface ResultItem {
    name: string;
    version: string;
    fixed_in: string;
    type: string;
    vulnerability: string;
    score: string;
}

interface PopupPosition {
    top: number;
    left: number;
}

export const Result: React.FC = () => {
    const location = useLocation();
    const result = location.state?.result as ResultItem[];

    const [clickedCVE, setClickedCVE] = useState<string | null>(null);
    const [cveDescription, setCveDescription] = useState<string>('');
    const [popupPosition, setPopupPosition] = useState<PopupPosition>({ top: 0, left: 0 });
    const [containerScore, setContainerScore] = useState<number | null>(null);

    useEffect(() => {
        if (result && result.length > 0) {
            let total_cvss = 0;
            result.forEach((item) => total_cvss += parseInt(item.score));
            setContainerScore(Math.round(total_cvss / result.length));
        }
    }, [result]);

    const handleCVEClick = async (cve: string, event: React.MouseEvent<HTMLTableCellElement>) => {
        setClickedCVE(cve);
        setPopupPosition({
            top: event.clientY + 10,
            left: event.clientX + 10,
        });

        try {
            const response = await axios.get(`http://localhost:3000/result/cve/${cve}`);
            setCveDescription(response.status === 200 ? response.data.description : 'CVE not available in our database');
        } catch (error) {
            console.error('Error fetching CVE details:', error);
            setCveDescription('Error fetching CVE details');
        }
    };

    const handleClosePopup = () => {
        setClickedCVE(null);
        setCveDescription('');
    };

    const DisplayData = (result: ResultItem[]) => {
        return result.map((item, index) => (
            <tr key={index} className="text-white">
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.version}</td>
                <td className="border px-4 py-2">{item.fixed_in}</td>
                <td className="border px-4 py-2">{item.type}</td>
                <td className="border px-4 py-2 cursor-pointer" onClick={(e) => handleCVEClick(item.vulnerability, e)}>
                    {item.vulnerability}
                </td>
                <td className="border px-4 py-2">{item.score}</td>
            </tr>
        ));
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Scan Results</h1>
                <div className="overflow-x-auto w-full">
                    <table className="table-auto w-full text-left">
                        <thead>
                            <tr className="text-blue-400">
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Version</th>
                                <th className="border px-4 py-2">Fixed In</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Vulnerability</th>
                                <th className="border px-4 py-2">CVSS Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result ? DisplayData(result) : <tr><td colSpan={6} className="text-center py-4">No data available</td></tr>}
                        </tbody>
                    </table>
                </div>
                {containerScore !== null && (
                    <div className="mt-8 flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-red-600 text-white text-3xl font-bold shadow-lg"
                        >
                            {containerScore}
                            <span className="text-sm mt-2">Container Score</span>
                        </motion.div>
                    </div>
                )}
            </div>
            {clickedCVE && (
                <div 
                    style={{
                        position: 'fixed',
                        top: popupPosition.top,
                        left: popupPosition.left,
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid black',
                        padding: '10px',
                        zIndex: 1000,
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                >
                    <h3 className="font-bold mb-2">{clickedCVE}</h3>
                    <p>{cveDescription || 'Loading...'}</p>
                    <button onClick={handleClosePopup} className='bg-red-500 text-white px-2 py-1 rounded mt-4'>Close</button>
                </div>
            )}
        </div>
    );
};
