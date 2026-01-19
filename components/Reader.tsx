
import React, { useMemo } from 'react';

interface ReaderProps {
  text: string;
  onWordSelect: (word: string, sentence: string) => void;
}

// Helper function to find the sentence for a given character index
const findSentence = (fullText: string, index: number): string => {
    let start = index;
    let end = index;

    // Look backwards for sentence start
    while (start > 0 && !'.!?'.includes(fullText[start-1])) {
        start--;
    }

    // Look forwards for sentence end
    while (end < fullText.length - 1 && !'.!?'.includes(fullText[end])) {
        end++;
    }
    // Include the punctuation in the sentence
    if ('.!?'.includes(fullText[end])) {
        end++;
    }

    return fullText.substring(start, end).trim();
};

const Reader: React.FC<ReaderProps> = ({ text, onWordSelect }) => {
  const content = useMemo(() => {
    let charIndex = 0;
    // Regex to split by space, but keep punctuation attached to words, and also split by newlines.
    const parts = text.split(/(\s+)/);

    return parts.map((part, i) => {
      const partStartIndex = charIndex;
      charIndex += part.length;

      if (part.trim() === '') {
        // It's a whitespace part
        return <span key={i}>{part}</span>;
      }
      
      const cleanWord = part.replace(/^[.,!?;:"'()\[\]{}]|[.,!?;:"'()\[\]{}]$/g, "");

      const handleClick = () => {
        const sentence = findSentence(text, partStartIndex);
        onWordSelect(cleanWord, sentence);
      };

      return (
        <span
          key={i}
          onClick={handleClick}
          className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded transition-colors duration-200"
        >
          {part}
        </span>
      );
    });
  }, [text, onWordSelect]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-md max-h-[75vh] overflow-y-auto">
      <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
};

export default React.memo(Reader);
