import React, { useState } from 'react';
import { Book } from '../../types';

interface ReviewModalProps {
    book: Book;
    onClose: () => void;
    onSave: (rating: number, review: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ book, onClose, onSave }) => {
    const [rating, setRating] = useState(book.rating || 0);
    const [review, setReview] = useState(book.review || '');
    const [hover, setHover] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(rating, review);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-2xl font-serif text-slate-900 mb-1">Rate & Review</h2>
                        <p className="text-slate-500 italic">"{book.title}"</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Global Rating</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        <span className={(hover || rating) >= star ? "text-amber-400" : "text-slate-200"}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400">Select star rating</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">Short Review</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What did you think of this book?"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all h-32 resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0}
                            className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
