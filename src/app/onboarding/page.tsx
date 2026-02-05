'use client';

import { createOrganization } from '../actions/onboarding';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [isPersonal, setIsPersonal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        try {
            // We call the server action. 
            // In a real scenario, we might want to check the result type more strictly.
            // But since createOrganization redirects significantly on success, this is acceptable.
            const result: any = await createOrganization(formData);

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (e: any) {
            setError(e.message || "Erro desconhecido");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />

            <div className="w-full max-w-lg p-8 relative z-10">
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 mb-6 shadow-lg shadow-purple-500/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-400 bg-clip-text text-transparent">
                            Bem-vindo!
                        </h1>
                        <p className="text-neutral-400 mt-3 text-lg">
                            Para começar, vamos criar sua organização.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Toggle Type */}
                        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                            <button
                                type="button"
                                onClick={() => setIsPersonal(false)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isPersonal ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                Organização / Empresa
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPersonal(true)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isPersonal ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                            >
                                Uso Pessoal / Autônomo
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1">
                                {isPersonal ? 'Nome do seu Espaço' : 'Nome da Organização / Empresa'}
                            </label>
                            <input
                                name="orgName"
                                type="text"
                                placeholder={isPersonal ? "Ex: Minhas Lojas, Meus Imóveis..." : "Ex: Minha Imobiliária, Família Silva..."}
                                className="w-full p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all text-neutral-200 placeholder:text-neutral-600 text-lg"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 text-lg disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>{isPersonal ? 'Começar Agora' : 'Criar Organização'} <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-600 mt-8 leading-relaxed">
                        Se você foi convidado para uma organização existente, <br /> peça para o administrador reenviar o link de convite.
                    </p>
                </div>
            </div>
        </div>
    );
}
