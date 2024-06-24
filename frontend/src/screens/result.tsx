import React from "react";
import { useLocation } from "react-router-dom";

export const Result: React.FC = () => {
    const location = useLocation();
    let result = location.state?.result;
    result = Array.from(result);

    console.log(result);

    const DisplayData = (result: any[]) => {
        return result.map((item, index) => (
            <tr key={index} className="text-white">
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.version}</td>
                <td className="border px-4 py-2">{item.fixed_in}</td>
                <td className="border px-4 py-2">{item.type}</td>
                <td className="border px-4 py-2">{item.vulnerability}</td>
                <td className="border px-4 py-2">{item.severity}</td>
            </tr>
        ));
    };

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-white">
                <h1 className="text-2xl mb-4">Result</h1>
                <div>
                    <table className="table-auto">
                        <thead>
                            <tr className="text-white">
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Version</th>
                                <th className="border px-4 py-2">Fixed_in</th>
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Vulnerability</th>
                                <th className="border px-4 py-2">Severity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DisplayData(result)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
