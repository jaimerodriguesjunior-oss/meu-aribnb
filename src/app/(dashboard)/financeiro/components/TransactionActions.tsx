'use client';

import { deleteTransaction, updateTransaction } from '@/app/actions/finance';
import { Pencil, Trash2, X, Calendar, DollarSign, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    due_date: string;
    status: string;
}

export function TransactionActions({ transaction }: { transaction: Transaction }) {
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
        setDeleting(true);
        const res: any = await deleteTransaction(transaction.id);
        if (res?.error) {
            alert(res.error);
        }
        setDeleting(false);
        router.refresh();
    }

    async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const res: any = await updateTransaction(transaction.id, formData);
        if (res?.success) {
            setEditing(false);
        } else {
            alert(res?.error || 'Erro ao atualizar');
        }
        setLoading(false);
        router.refresh();
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all"
                    title="Editar"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all disabled:opacity-50"
                    title="Excluir"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95">
                        <button
                            onClick={() => setEditing(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">Editar Lançamento</h2>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Descrição</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                    <input
                                        name="description"
                                        defaultValue={transaction.description}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-green-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-neutral-400 uppercase">Valor</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                        <input
                                            name="amount"
                                            defaultValue={transaction.amount.toFixed(2).replace('.', ',')}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-neutral-400 uppercase">Data</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="dueDate"
                                            defaultValue={transaction.due_date}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="cursor-pointer">
                                        <input type="radio" name="type" value="income" className="peer sr-only" required defaultChecked={transaction.type === 'income'} />
                                        <div className="text-center p-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 peer-checked:bg-green-500/20 peer-checked:text-green-400 peer-checked:border-green-500/50 transition-all">
                                            Receita
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" name="type" value="expense" className="peer sr-only" required defaultChecked={transaction.type === 'expense'} />
                                        <div className="text-center p-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 peer-checked:bg-red-500/20 peer-checked:text-red-400 peer-checked:border-red-500/50 transition-all">
                                            Despesa
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
