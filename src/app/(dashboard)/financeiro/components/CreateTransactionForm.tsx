'use client';

import { createTransaction } from '@/app/actions/finance';
import { useState } from 'react';
import { Plus, X, Calendar, DollarSign, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateTransactionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        // Add checkbox value manually if needed, or rely on normal form behavior (on/null)
        // Checkbox "isInstallment" sends 'on' if checked.

        const res: any = await createTransaction(formData);
        if (res?.success) {
            setIsOpen(false);
            // Optional: reset form
        } else {
            alert(res?.error || 'Erro ao criar');
        }
        setLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
                <Plus size={20} />
                Nova Transação
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

                <h2 className="text-xl font-bold text-white mb-6">Nova Transação</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Descrição</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="description"
                                placeholder="Ex: Aluguel Apto 101"
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
                                    placeholder="0,00"
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
                                <input type="radio" name="type" value="income" className="peer sr-only" required defaultChecked />
                                <div className="text-center p-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 peer-checked:bg-green-500/20 peer-checked:text-green-400 peer-checked:border-green-500/50 transition-all">
                                    Receita
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input type="radio" name="type" value="expense" className="peer sr-only" required />
                                <div className="text-center p-2 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 peer-checked:bg-red-500/20 peer-checked:text-red-400 peer-checked:border-red-500/50 transition-all">
                                    Despesa
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isInstallment"
                                checked={isInstallment}
                                onChange={(e) => setIsInstallment(e.target.checked)}
                                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-900"
                            />
                            <span className="text-sm text-neutral-300">Pagamento Parcelado?</span>
                        </label>

                        {isInstallment && (
                            <div className="mt-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-medium text-neutral-400 uppercase">Número de Parcelas</label>
                                <select
                                    name="installmentsCount"
                                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-green-500 outline-none"
                                >
                                    {[2, 3, 4, 5, 6, 10, 12, 24, 36].map(n => (
                                        <option key={n} value={n}>{n}x</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isPaid"
                                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-900"
                            />
                            <span className="text-sm text-neutral-300">Já foi pago</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Salvando...' : 'Criar Lançamento'}
                    </button>
                </form>
            </div>
        </div>
    );
}
