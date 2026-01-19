
import React, { useEffect } from 'react';
import { LoaderIcon, PlusIcon, CloseIcon } from './Icons';

interface DefinitionPopupProps {
  word: string;
  definition: string | null;
  isLoading: boolean;
  onClose: () => void;
  onAddToVocabulary: () => void;
}

const DefinitionPopup: React.FC<DefinitionPopupProps> = ({ word, definition, isLoading, onClose, onAddToVocabulary }) => {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{word}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400"/>
          </button>
        </div>
        <div className="p-6 min-h-[120px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <LoaderIcon className="w-6 h-6"/>
              <span>Fetching definition...</span>
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">{definition}</p>
          )}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
          <button 
            onClick={onAddToVocabulary} 
            disabled={isLoading || !definition}
            className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5"/>
            <span>Add to Vocabulary</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DefinitionPopup;
