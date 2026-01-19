
/**
 * Creates a cloze deletion sentence by replacing the target word with '[...]'.
 * @param sentence The full sentence.
 * @param word The word to be replaced.
 * @returns The sentence with the word replaced.
 */
export function createCloze(sentence: string, word: string): string {
    // Use a case-insensitive regex to find the word
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return sentence.replace(regex, '[...]');
}

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param data The array of objects to export.
 * @param filename The desired filename for the downloaded file.
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
    if (!data.length) {
        return;
    }

    const headers = Object.keys(data[0]);
    
    // Function to safely wrap a value in double quotes if it contains a comma, double quote, or newline
    const sanitize = (value: any): string => {
        const str = String(value ?? '');
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => sanitize(row[header])).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
