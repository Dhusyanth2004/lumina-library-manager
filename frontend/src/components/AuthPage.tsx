import React, { useState } from 'react';
import { UserRole } from '../types';

interface AuthPageProps {
    onLogin: (role: UserRole, username: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        if (!trimmedUsername || !trimmedPassword) {
            setError("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }

        if (!isLogin && !email.trim()) {
            setError("Email is required.");
            setIsLoading(false);
            return;
        }

        const endpoint = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/signup';
        const payload = isLogin
            ? { username: trimmedUsername, password: trimmedPassword }
            : { username: trimmedUsername, password: trimmedPassword, email: email.trim(), role };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user.role, data.user.username);
            } else {
                setError(data.message || "An error occurred during authentication.");
            }
        } catch (err) {
            setError("Could not connect to the authentication server. Please ensure it's running.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-700 font-['Outfit',sans-serif] overflow-hidden relative">
            {/* Animated Background Mesh - Softened for Light Theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/40 blur-[130px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-200/40 blur-[130px] rounded-full animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-emerald-100/30 blur-[150px] rounded-full animate-bounce duration-[10s]"></div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                .auth-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                }
                .input-field {
                    background: #ffffff;
                    border: 2px solid #e2e8f0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .input-field:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                    outline: none;
                }
            `}</style>

            <div className="w-full max-w-6xl flex flex-col md:flex-row auth-card rounded-[40px] md:rounded-[60px] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-1000">

                {/* Visual Section */}
                <div className="md:w-[45%] p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 opacity-100"></div>
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>

                    <div className="relative z-20">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-10 shadow-2xl transform hover:rotate-12 transition-transform cursor-default">
                            L
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
                            The future of <span className="text-indigo-100 italic">reading</span> starts here.
                        </h1>
                        <p className="text-indigo-50/90 text-lg leading-relaxed max-w-sm font-light">
                            Experience the world's most intelligent library ecosystem, now enhanced with persistence and AI.
                        </p>
                    </div>

                    <div className="relative z-20 mt-12 space-y-4">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                            <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center text-emerald-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <p className="text-sm font-semibold text-white">Real-time Backend Sync</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                            <div className="w-10 h-10 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-300 font-bold text-lg">⚡</div>
                            <p className="text-sm font-semibold text-white">Instant Role-Based Access</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:w-[55%] p-12 lg:p-20 flex flex-col justify-center relative bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 text-lg">
                                {isLogin ? 'Enter your credentials to manage your world.' : 'Join the network and start your journey.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-sm font-semibold flex items-center gap-3 animate-shake">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Username</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="flex-1 input-field rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 text-lg"
                                            placeholder="Username"
                                        />
                                        <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </span>
                                    </div>
                                </div>

                                {!isLogin && (
                                    <>
                                        <div className="group">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Email</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="flex-1 input-field rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 text-lg"
                                                    placeholder="email@example.com"
                                                />
                                                <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="animate-in slide-in-from-top-2 duration-500">
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Security Level</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: UserRole.STUDENT, label: 'Student', emoji: '🎓' },
                                                    { id: UserRole.LIBRARIAN, label: 'Staff', emoji: '📚' },
                                                    { id: UserRole.ADMIN, label: 'Admin', emoji: '🔑' }
                                                ].map(r => (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => setRole(r.id)}
                                                        className={`py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${role === r.id
                                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <span className="text-xl group-hover:scale-110 transition-transform">{r.emoji}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{r.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="group">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full input-field rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 text-lg"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                )}
                                            </button>
                                        </div>
                                        <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-[0.99] mt-8 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Enter Dashboard' : 'Create Account'}</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-slate-400 font-medium">
                                {isLogin ? "New here?" : "Already joined?"}
                                <button
                                    onClick={toggleMode}
                                    className="ml-3 text-indigo-600 font-bold hover:text-indigo-800 transition-colors border-b-2 border-indigo-100 hover:border-indigo-600 pb-0.5"
                                    type="button"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In Now'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attribution */}
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                Lumina System v2.3 • Polished Edition
            </p>
        </div>
    );
};

export default AuthPage;
