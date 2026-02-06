'use client';

import { inviteMember } from '@/app/actions/team';
import { useState } from 'react';
import { Plus, X, Shield, Check, Copy } from 'lucide-react';

export function InviteMemberForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState<{ email: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const res: any = await inviteMember(formData);
        if (res?.success) {
            setInviteSuccess({ email: formData.get('email') as string, token: res.token });
        } else {
            alert(res?.error || 'Erro ao convidar');
        }
        setLoading(false);
    }

    const getInviteUrl = () => `${window.location.origin}/invite/${inviteSuccess?.token}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(getInviteUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = `Olá! Estou te convidando para acessar o Meu Airb na nossa organização. Acesse pelo link: ${getInviteUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleClose = () => {
        setIsOpen(false);
        setInviteSuccess(null);
        setCopied(false);
    };

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
                    onClick={inviteSuccess ? handleClose : () => setIsOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                {inviteSuccess ? (
                    <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Convite Gerado!</h2>
                        <p className="text-sm text-neutral-400 mb-6">
                            Link de convite criado com sucesso.
                            <br />
                            Compartilhe o link abaixo para o membro entrar.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleShareWhatsApp}
                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                                Enviar no WhatsApp
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium py-3 rounded-xl border border-neutral-700 transition-all flex items-center justify-center gap-2"
                            >
                                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                {copied ? 'Link Copiado!' : 'Copiar Link'}
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-neutral-800">
                            <div className="bg-neutral-950 p-3 rounded-lg break-all text-xs text-neutral-500 text-center font-mono border border-neutral-800">
                                {getInviteUrl()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-white mb-6">Gerar Link de Convite</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-sm text-blue-200 flex gap-3 items-start">
                                    <span className="text-xl mt-0.5">🔗</span>
                                    <span>
                                        Gere um link único e envie para seu colaborador.
                                        Ele poderá criar a conta e entrar automaticamente na sua equipe.
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Função de Acesso</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                    <select
                                        name="role"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="staff">Staff (Acesso Padrão)</option>
                                        <option value="admin">Admin (Gerencia Equipe)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Gerando Link...' : 'Gerar Link de Convite'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
