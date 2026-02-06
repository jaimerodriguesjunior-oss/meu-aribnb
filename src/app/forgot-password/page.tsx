"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, ArrowLeft, Mail, Plane } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
            });
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Erro ao enviar email de recuperação.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-airb.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px]" />
            </div>

            {/* Background Effects (Subtle on top of image) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] mix-blend-overlay" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] mix-blend-overlay" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 mb-6 shadow-lg shadow-purple-500/20 transition-all duration-500 group">
                            <Plane className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-400 bg-clip-text text-transparent transition-all duration-500 tracking-tight">
                            Recuperar Senha
                        </h1>
                        <p className="text-sm text-neutral-400 mt-2">
                            Digite seu email para receber o link
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-400 ml-1">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full p-3 pl-10 bg-neutral-800/60 border border-neutral-700 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all text-neutral-200 placeholder:text-neutral-500"
                                    required
                                />
                                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg border text-xs text-center ${message.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 shadow-purple-500/20 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Enviar Link de Recuperação'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-purple-400 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para Login
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-neutral-600 mt-8">
                    &copy; 2026 Meu Airb - Gestão Inteligente.
                </p>
            </div>
        </div>
    );
}
