import React, { useState, useEffect } from "react";

export const TranscribingOverlay = () => {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots === "..." ? "." : prevDots + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-white text-3xl font-bold">
        Transcribing Audio{dots}
      </div>
    </div>
  );
};