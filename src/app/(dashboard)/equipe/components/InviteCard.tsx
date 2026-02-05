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
                <span className="text-neutral-300 font-medium">{invite.email}</span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{invite.role}</span>
                    <span className="text-xs text-neutral-600">
                        {format(new Date(invite.created_at), "dd MMM", { locale: ptBR })}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
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
