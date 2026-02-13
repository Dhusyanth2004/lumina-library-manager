
import React, { useState, useRef } from 'react';
import { Book, BookStatus, UserRole } from '../types';
import { extractBookInfo } from '../services/geminiService';
import { parseCSV } from '../utils/csvParser';

// Manual entry state
interface AddBookModalProps {
  onClose: () => void;
  onSave: (book: Book) => void;
  onBulkSave: (books: Book[]) => void;
  initialData?: Partial<Book>;
  books: Book[];
  currentRole: UserRole;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onSave, onBulkSave, initialData, books, currentRole }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'camera' | 'manual' | 'bulk'>('manual');
  const [bulkBooks, setBulkBooks] = useState<Partial<Book>[]>([]);

  // Manual entry state
  const [manualTitle, setManualTitle] = useState(initialData?.title || '');
  const [manualAuthor, setManualAuthor] = useState(initialData?.author || '');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualCategory, setManualCategory] = useState(initialData?.category || '');
  const [manualLanguage, setManualLanguage] = useState(initialData?.language || 'English');
  const [manualBorrower, setManualBorrower] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCoverUrl, setManualCoverUrl] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState(initialData?.externalLink || '');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAIScan = async () => {
    if (!input && mode === 'text') return;
    setLoading(true);
    setError(null);
    try {
      const bookData = await extractBookInfo(input);
      setManualTitle(bookData.title || '');
      setManualAuthor(bookData.author || '');
      setManualCategory(bookData.category || '');
      setMode('manual');
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    const hasBorrower = manualBorrower.trim().length > 0;

    if (hasBorrower && !manualDueDate) {
      setError("Due Date is required when assigning a borrower.");
      return;
    }

    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: manualTitle,
      author: manualAuthor,
      category: manualCategory || 'General',
      language: manualLanguage || 'English',
      borrowDate: hasBorrower ? new Date().toISOString().split('T')[0] : '',
      dueDate: manualDueDate || '',
      status: hasBorrower ? BookStatus.BORROWED : BookStatus.AVAILABLE,
      renewalCount: 0,
      coverUrl: manualCoverUrl || `https://picsum.photos/seed/${encodeURIComponent(manualTitle)}/300/450`,
      borrower: hasBorrower ? manualBorrower : undefined,
      borrowerEmail: hasBorrower ? manualEmail : undefined,
      externalLink: manualLink || undefined
    };

    onSave(newBook);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size too large. Please use an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setManualCoverUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera.");
      setMode('text');
    }
  };

  const captureAndScan = async () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');

      setLoading(true);
      try {
        const bookData = await extractBookInfo("Extract book info from cover", dataUrl);
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());

        setManualTitle(bookData.title || '');
        setManualAuthor(bookData.author || '');
        setManualCategory(bookData.category || '');
        setMode('manual');
      } catch (e) {
        setError("Failed to identify book from image.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Add New Book</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Manual
            </button>
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.LIBRARIAN) && (
              <button
                onClick={() => setMode('bulk')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'bulk' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
              >
                Bulk
              </button>
            )}
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              AI
            </button>
            <button
              onClick={startCamera}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'camera' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Scan
            </button>
          </div>

          {mode === 'manual' && (
            <div className="space-y-4">
              <div className="flex gap-6 items-start p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125"></div>
                <div className="w-24 h-36 bg-slate-200 rounded-2xl flex-shrink-0 overflow-hidden relative shadow-lg group-hover:shadow-indigo-100 transition-all border-2 border-white">
                  {manualCoverUrl ? (
                    <img src={manualCoverUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
                      <span className="text-3xl">📚</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">No Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    title="Upload cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-xl mb-1">📸</span>
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Update</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Book Cover</h4>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">Add a custom cover to make this book stand out in the library.</p>

                  <div className="flex items-center gap-3">
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
                      <span>📤</span> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {manualCoverUrl && (
                      <button
                        onClick={() => setManualCoverUrl(null)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                        title="Remove cover"
                      >
                        <span className="text-sm font-bold">🗑️</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    PNG, JPG up to 2MB
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. The Hobbit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author *</label>
                <input
                  type="text"
                  value={manualAuthor}
                  onChange={(e) => setManualAuthor(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. J.R.R. Tolkien"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. Fantasy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                <input
                  type="text"
                  value={manualLanguage}
                  onChange={(e) => setManualLanguage(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">External Resource Link</label>
                <input
                  type="url"
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. https://openlibrary.org/books/..."
                />
              </div>
              <div className="pt-4 border-t border-slate-100 mt-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Borrowing Details (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={manualDueDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setManualDueDate(e.target.value)}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Receiver/Borrower</label>
                    <input
                      type="text"
                      value={manualBorrower}
                      onChange={(e) => setManualBorrower(e.target.value)}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>
          )}

          {mode === 'bulk' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const text = e.target?.result as string;
                        const data = parseCSV(text);
                        setBulkBooks(data);
                        if (data.length === 0) setError("No valid books found in CSV.");
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-sm font-bold text-slate-800">Upload CSV File</p>
                  <p className="text-xs text-slate-500 mt-1">Headers should include Title, Author, Category</p>
                </label>
              </div>

              {bulkBooks.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                  <div>
                    <p className="text-sm font-bold text-emerald-900">{bulkBooks.length} Books Found</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Ready to be added to library</p>
                  </div>
                  <button
                    onClick={() => {
                      const completeBooks: Book[] = bulkBooks.map(b => ({
                        id: Math.random().toString(36).substr(2, 9),
                        title: b.title || 'Unknown Title',
                        author: b.author || 'Unknown Author',
                        category: b.category || 'General',
                        borrowDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: BookStatus.AVAILABLE,
                        renewalCount: 0,
                        coverUrl: `https://picsum.photos/seed/${encodeURIComponent(b.title || 'unknown')}/300/450`,
                        ...b
                      })) as Book[];
                      onBulkSave(completeBooks);
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                  >
                    Import All
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Book Details</span>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. 'The Hobbit by J.R.R. Tolkien' or just the ISBN"
                  className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-3 h-24 text-sm"
                />
              </label>
              <p className="text-xs text-slate-400">Our AI will automatically find the author, category, and set a 14-day due date.</p>
            </div>
          )}

          {mode === 'camera' && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-dashed border-white border-opacity-30 m-8 pointer-events-none rounded-xl"></div>
              <button
                onClick={captureAndScan}
                disabled={loading}
                className="absolute bottom-6 bg-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-full border-4 border-indigo-600 group-active:scale-95 transition-transform"></div>
              </button>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-rose-500 font-medium">⚠️ {error}</p>}
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          {mode === 'manual' && (
            <button
              onClick={handleManualSubmit}
              disabled={!manualTitle || !manualAuthor}
              className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
            >
              {manualBorrower.trim() ? 'Add Borrowing' : 'Add to Inventory'}
            </button>
          )}

          {mode === 'text' && (
            <button
              onClick={handleAIScan}
              disabled={loading || !input}
              className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
            >
              {loading ? "Analyzing..." : "Identify with AI"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;
