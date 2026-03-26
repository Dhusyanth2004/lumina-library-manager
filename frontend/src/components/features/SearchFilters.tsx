import React from 'react';
import { Book } from '../../types';

interface SearchFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    selectedLanguage: string;
    onLanguageChange: (value: string) => void;
    categories: string[];
    languages: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedLanguage,
    onLanguageChange,
    categories,
    languages,
}) => {
    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by title, author, or category..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-48 relative">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner cursor-pointer font-medium"
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">▼</span>
                </div>

                {/* Language Filter */}
                <div className="w-full md:w-48 relative">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner cursor-pointer font-medium"
                        value={selectedLanguage}
                        onChange={(e) => onLanguageChange(e.target.value)}
                    >
                        <option value="all">All Languages</option>
                        {languages.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">▼</span>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;
