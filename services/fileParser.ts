
// This file uses global objects `pdfjsLib` and `ePub` which are expected to be loaded from a CDN in index.html.

declare const pdfjsLib: any;
declare const ePub: any;

export async function parseFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'pdf') {
    return parsePdf(file);
  } else if (fileExtension === 'epub') {
    return parseEpub(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or EPUB file.');
  }
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
}

async function parseEpub(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    await book.ready;
  
    const allSections = await Promise.all(
      book.spine.spineItems.map((item: any) => {
        return item.load(book.load.bind(book)).then((doc: Document) => {
          return doc.body.textContent || '';
        });
      })
    );
  
    return allSections.join('\n\n');
}
