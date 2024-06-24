import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="bg-black min-h-screen">
                <div className="font-Helvetica text-white text-left ml-[100px] mt-[100px]">
                    <div className="w-[60%] h-32 bg-white">
                        <div className="text-black text-5xl font-bold">
                            Secure your Container
                        </div>
                        <div className="text-black text-lg mt-2">
                            Your container can be secured with our tool
                        </div>

                        <button onClick = {() => {
                            navigate("/upload")
                        }} className='bg-blue-400'>Get Started</button>
                        
                    </div>
                </div>
            </div>
        </>
    );
}
