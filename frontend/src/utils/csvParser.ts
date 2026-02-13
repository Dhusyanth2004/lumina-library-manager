import { Book, BookStatus } from '../types';

export const parseCSV = (csvText: string): Partial<Book>[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const books: Partial<Book>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const book: Partial<Book> = {};
        headers.forEach((header, index) => {
            const val = values[index]?.trim();
            if (!val) return;

            if (header.includes('title')) book.title = val;
            else if (header.includes('author')) book.author = val;
            else if (header.includes('category')) book.category = val;
            else if (header.includes('borrower')) book.borrower = val;
            else if (header.includes('status')) book.status = val as BookStatus;
        });

        if (book.title) {
            books.push(book);
        }
    }

    return books;
};

const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
};
