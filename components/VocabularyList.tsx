
import React from 'react';
import { VocabularyEntry } from '../types';
import { TrashIcon, QuoteIcon, ExportIcon } from './Icons';
import { createCloze, exportToCSV } from '../utils/export';

interface VocabularyListProps {
  entries: VocabularyEntry[];
  onRemove: (word: string) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({ entries, onRemove }) => {

  const handleExport = () => {
    const dataToExport = entries.map(entry => ({
      Word: entry.word,
      Definition: entry.definition,
      'Example Sentence': entry.sentence,
      'Cloze Sentence': createCloze(entry.sentence, entry.word),
    }));
    exportToCSV(dataToExport, 'vocabulary_export.csv');
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold sr-only">My Vocabulary</h2>
            {entries.length > 0 && (
                <button
                    onClick={handleExport}
                    className="ml-auto flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                >
                    <ExportIcon className="w-5 h-5"/>
                    <span>Export to CSV</span>
                </button>
            )}
        </div>
        {entries.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 mt-6 text-center">Your saved words will appear here. Tap on a word in the text to get started!</p>
        ) : (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                {entries.map((entry) => (
                    <div key={entry.word} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 relative group">
                        <button 
                          onClick={() => onRemove(entry.word)} 
                          className="absolute top-2 right-2 p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-800 hover:text-red-700 dark:hover:text-red-200 transition-opacity"
                          aria-label={`Remove ${entry.word}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{entry.word}</h3>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{entry.definition}</p>
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2 text-slate-500 dark:text-slate-400">
                            <QuoteIcon className="w-4 h-4 mt-1 flex-shrink-0"/>
                            <blockquote className="italic text-sm">
                                {entry.sentence}
                            </blockquote>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default VocabularyList;
