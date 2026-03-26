import React, { useState } from 'react';
import { Book } from '../../types';

interface EditDueDateModalProps {
    book: Book;
    onClose: () => void;
    onSave: (id: string, newDate: string) => void;
}

const EditDueDateModal: React.FC<EditDueDateModalProps> = ({ book, onClose, onSave }) => {
    const [newDate, setNewDate] = useState(book.dueDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDate) {
            onSave(book.id, newDate);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Edit Due Date</h2>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{book.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">New Due Date</label>
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 p-4 text-sm font-medium shadow-inner transition-all"
                            required
                        />
                        <p className="mt-2 text-[10px] text-slate-400">
                            Current: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                        >
                            Update Date
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDueDateModal;
