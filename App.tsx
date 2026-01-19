
import React, { useState, useCallback } from 'react';
import { parseFile } from './services/fileParser';
import { detectLanguage, getDefinition } from './services/geminiService';
import { VocabularyEntry, SelectedWord } from './types';
import Reader from './components/Reader';
import VocabularyList from './components/VocabularyList';
import DefinitionPopup from './components/DefinitionPopup';
import { BookOpenIcon, UploadCloudIcon, LoaderIcon } from './components/Icons';

type ActiveTab = 'reader' | 'vocabulary';

export default function App() {
  const [fileContent, setFileContent] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isFetchingDef, setIsFetchingDef] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('reader');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Parsing document...');
    setError(null);
    setFileContent('');
    setVocabulary([]);
    setActiveTab('reader'); // Reset to reader tab on new file upload

    try {
      const text = await parseFile(file);
      setFileContent(text);
      
      setLoadingMessage('Detecting language...');
      const detectedLang = await detectLanguage(text.substring(0, 1000));
      setLanguage(detectedLang);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during file processing.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleWordSelect = useCallback(async (word: string, sentence: string) => {
    if (vocabulary.some(entry => entry.word.toLowerCase() === word.toLowerCase())) {
        const existingEntry = vocabulary.find(entry => entry.word.toLowerCase() === word.toLowerCase());
        if (existingEntry) {
            setSelectedWord({ word, sentence });
            setDefinition(existingEntry.definition);
            setIsPopupOpen(true);
        }
        return;
    }

    setSelectedWord({ word, sentence });
    setIsPopupOpen(true);
    setIsFetchingDef(true);
    setDefinition(null);
    try {
      const fetchedDefinition = await getDefinition(word, language);
      setDefinition(fetchedDefinition);
    } catch (err) {
      setDefinition('Sorry, I could not find a definition for this word.');
    } finally {
      setIsFetchingDef(false);
    }
  }, [language, vocabulary]);

  const handleAddToVocabulary = () => {
    if (selectedWord && definition) {
      const newEntry: VocabularyEntry = {
        word: selectedWord.word,
        definition: definition,
        sentence: selectedWord.sentence,
      };
      if (!vocabulary.some(entry => entry.word.toLowerCase() === newEntry.word.toLowerCase())) {
        setVocabulary(prev => [newEntry, ...prev]);
      }
      closePopup();
    }
  };
  
  const handleRemoveFromVocabulary = (wordToRemove: string) => {
    setVocabulary(prev => prev.filter(entry => entry.word !== wordToRemove));
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedWord(null);
    setDefinition(null);
  };
  
  const TabButton: React.FC<{tab: ActiveTab; label: string; count?: number}> = ({tab, label, count}) => {
    const isActive = activeTab === tab;
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                isActive 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
            }`}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`ml-2 h-5 w-5 flex items-center justify-center rounded-full text-xs ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight">Interactive Reading Assistant</h1>
          </div>
          <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center gap-2">
            <UploadCloudIcon className="w-5 h-5" />
            <span>Upload File</span>
          </label>
          <input id="file-upload" type="file" accept=".pdf,.epub" className="hidden" onChange={handleFileUpload} />
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <LoaderIcon className="w-12 h-12 text-indigo-500" />
            <p className="text-lg font-medium">{loadingMessage}</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        ) : fileContent ? (
          <div>
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tab="reader" label="Reader" />
                    <TabButton tab="vocabulary" label="Vocabulary" count={vocabulary.length} />
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'reader' && (
                    <Reader text={fileContent} onWordSelect={handleWordSelect} />
                )}
                {activeTab === 'vocabulary' && (
                    <VocabularyList entries={vocabulary} onRemove={handleRemoveFromVocabulary} />
                )}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 px-6">
            <BookOpenIcon className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600" />
            <h2 className="mt-6 text-2xl font-bold text-slate-700 dark:text-slate-300">Start Your Reading Journey</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Upload a PDF or EPUB file to begin reading and building your vocabulary.</p>
             <div className="mt-8">
                <label htmlFor="file-upload-main" className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 ease-in-out inline-flex items-center gap-2">
                    <UploadCloudIcon className="w-6 h-6" />
                    <span>Select a Document</span>
                </label>
                <input id="file-upload-main" type="file" accept=".pdf,.epub" className="hidden" onChange={handleFileUpload} />
             </div>
          </div>
        )}
      </main>

      {isPopupOpen && selectedWord && (
        <DefinitionPopup
          word={selectedWord.word}
          definition={definition}
          isLoading={isFetchingDef}
          onClose={closePopup}
          onAddToVocabulary={handleAddToVocabulary}
        />
      )}
    </div>
  );
}
