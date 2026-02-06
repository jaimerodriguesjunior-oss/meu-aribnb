'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { acceptInvite } from '../../actions/team';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const processInvite = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // 1. Check if User is Logged In
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Save pending invite to localStorage (survives email confirmation flow)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('pending_invite_token', token);
                }
                // Use window.location.href for hard redirect (ensures URL params are read correctly)
                const nextUrl = `/invite/${token}`;
                window.location.href = `/login?next=${encodeURIComponent(nextUrl)}&view=signup`;
                return;
            }

            // 2. Accept Invite
            const result = await acceptInvite(token);

            if (result.error) {
                setStatus('error');
                setMessage(result.error);
            } else {
                setStatus('success');
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        };

        processInvite();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <h1 className="text-xl font-medium text-white">Processando convite...</h1>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-xl font-medium text-white">Ops! Algo deu errado.</h1>
                        <p className="text-neutral-400">{message}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-4 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                        >
                            Ir para o Início
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-xl font-medium text-white">Convite aceito!</h1>
                        <p className="text-neutral-400">Você agora faz parte da equipe.</p>
                        <p className="text-xs text-neutral-500 mt-4">Redirecionando...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
