import { GoogleGenAI, Type } from "@google/genai";
import { Book, BookStatus } from "../types";

const MOCK_BOOKS: Record<string, any> = {
  "the great gatsby": {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Classic Literature",
    notes: "A story of wealth, class, and the American dream in the 1920s."
  },
  "dune": {
    title: "Dune",
    author: "Frank Herbert",
    category: "Science Fiction",
    notes: "The epic saga of Paul Atreides and the desert planet Arrakis."
  },
  "1984": {
    title: "1984",
    author: "George Orwell",
    category: "Dystopian Fiction",
    notes: "A chilling vision of a totalitarian future under Big Brother."
  },
  "the hobbit": {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    notes: "Bilbo Baggins' unexpected adventure to reclaim a lost treasure."
  }
};

const mockExtractBookInfo = async (prompt: string): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const query = prompt.toLowerCase();

  // 1. Try to match specific mock dictionary first
  for (const key in MOCK_BOOKS) {
    if (query.includes(key)) {
      return MOCK_BOOKS[key];
    }
  }

  // 2. Smart parsing for "Title by Author" or "Title - Author"
  let title = prompt;
  let author = "Unknown Author";
  let category = "General";

  const delimiters = [/\s+by\s+/i, /\s+-\s+/, /:\s+/];
  for (const delimiter of delimiters) {
    if (delimiter.test(prompt)) {
      const parts = prompt.split(delimiter);
      title = parts[0].trim();
      author = parts[1].trim();
      break;
    }
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    author: author.charAt(0).toUpperCase() + author.slice(1),
    category,
    notes: "This is a simulated response (Demo Mode Active)."
  };
};

export const extractBookInfo = async (prompt: string, imageData?: string): Promise<Partial<Book>> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isDemoMode = !apiKey || apiKey.includes('PASTE_YOUR_API_KEY');

  let data: any;

  if (isDemoMode) {
    console.warn("Lumina: Using Demo Mode (Mock AI). Please set VITE_GEMINI_API_KEY for real AI search.");
    data = await mockExtractBookInfo(prompt || (imageData ? "Image Content" : "Book Search"));
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-2.0-flash';

      const systemInstruction = `
        You are a library assistant AI. Extract book details (title, author, category) from the provided text or image.
        If it's an image, perform OCR and identify the book cover.
        Provide a concise JSON response.
      `;

      const config = {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            category: { type: Type.STRING },
            notes: { type: Type.STRING, description: "A brief one-sentence summary of the book" }
          },
          required: ["title", "author", "category"]
        }
      };

      const contents = imageData
        ? { parts: [{ text: prompt || "Identify this book" }, { inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } }] }
        : { parts: [{ text: prompt }] };

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      const text = response.text ? response.text : JSON.stringify(response);
      data = JSON.parse(text);
    } catch (error: any) {
      console.error("AI Service Error:", error);
      // Fallback to mock on error if not in production, or just let users know
      throw new Error(error.message || "Could not extract book information.");
    }
  }

  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    status: BookStatus.ACTIVE,
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewalCount: 0,
    coverUrl: `https://picsum.photos/seed/${encodeURIComponent(data.title)}/300/450`
  };
};

export const generateChatResponse = async (userMessage: string, contextBooks: Book[]): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isDemoMode = !apiKey || apiKey.includes('PASTE_YOUR_API_KEY');

  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "I'm currently in Demo Mode. To enable my full AI capabilities, please provide a Gemini API key. However, I can tell you that we have " + contextBooks.length + " books in our library!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const inventoryContext = contextBooks.map(b => `${b.title} by ${b.author} (${b.category}) - ${b.status}`).join('\n');
    
    const prompt = `
      You are Lumina, a helpful and friendly library assistant. 
      The current library inventory is:
      ${inventoryContext}
      
      User Question: ${userMessage}
      
      Respond helpfully. If they ask for recommendations, suggest books from the inventory. Keep your response concise (max 3-4 sentences).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chat AI Error:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};
