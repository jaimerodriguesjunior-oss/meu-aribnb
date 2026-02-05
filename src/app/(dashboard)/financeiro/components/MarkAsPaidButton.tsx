'use client';

import { markAsPaid } from '@/app/actions/finance';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function MarkAsPaidButton({ transactionId }: { transactionId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleClick() {
        setLoading(true);
        const res: any = await markAsPaid(transactionId);
        if (res?.error) {
            alert(res.error);
        }
        setLoading(false);
        router.refresh();
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1 transition-all disabled:opacity-50"
        >
            <Check size={12} />
            {loading ? '...' : 'Pagar'}
        </button>
    );
}
