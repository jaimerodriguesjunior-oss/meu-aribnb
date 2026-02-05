'use client';

import { inviteMember } from '@/app/actions/team';
import { useState } from 'react';
import { Plus, X, Mail, Shield } from 'lucide-react';

export function InviteMemberForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const res: any = await inviteMember(formData);
        if (res?.success) {
            setIsOpen(false);
            // reset form?
        } else {
            alert(res?.error || 'Erro ao convidar');
        }
        setLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
                <Plus size={20} />
                Convidar Membro
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Convidar Membro</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="email"
                                type="email"
                                placeholder="colaborador@email.com"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Função</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <select
                                name="role"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="staff">Staff (Acesso Padrão)</option>
                                <option value="admin">Admin (Gerencia Equipe)</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-500">
                        O usuário receberá um email com instruções para acessar.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Enviando...' : 'Enviar Convite'}
                    </button>
                </form>
            </div>
        </div>
    );
}
