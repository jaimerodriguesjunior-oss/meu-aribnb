'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function InviteCard({ invite }: { invite: any }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}/invite/${invite.token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-neutral-300 font-medium flex items-center gap-2">
                    {invite.email.includes('placeholder.meuairb.com') ? (
                        <>
                            <span className="bg-blue-500/20 text-blue-400 p-1 rounded"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg></span>
                            Link Compartilhável <span className="text-neutral-600 text-xs font-normal">(Aguardando alguém entrar...)</span>
                        </>
                    ) : (
                        invite.email
                    )}
                </span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{invite.role}</span>
                    <span className="text-xs text-neutral-600">
                        {format(new Date(invite.created_at), "dd MMM", { locale: ptBR })}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="text-xs text-green-400 hover:text-green-300 transition-colors p-2 flex items-center gap-1 border border-green-500/20 rounded bg-green-500/10 hover:bg-green-500/20"
                    onClick={() => {
                        const url = `${window.location.origin}/invite/${invite.token}`;
                        const message = `Olá! Estou te convidando para acessar o Meu Airb na nossa organização. Acesse pelo link: ${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                    WhatsApp
                </button>
                <button
                    className="text-xs text-neutral-400 hover:text-white transition-colors p-2 flex items-center gap-1"
                    onClick={handleCopy}
                >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied ? 'Copiado' : 'Copiar Link'}
                </button>
            </div>
        </div>
    );
}
