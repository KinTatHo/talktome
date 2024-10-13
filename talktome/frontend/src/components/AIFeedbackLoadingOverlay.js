import React from 'react';
import { Brain } from 'lucide-react';

const AIFeedbackLoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg flex flex-col items-center">
        <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
        <div className="mt-4 text-lg font-semibold text-gray-800">AI is analyzing your lesson...</div>
        <div className="mt-2 text-sm text-gray-600">This may take a few moments</div>
        <div className="mt-4 flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: `${i * 0.2}s`}} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIFeedbackLoadingOverlay;