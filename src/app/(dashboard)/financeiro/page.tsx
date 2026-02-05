import { getTransactions } from '../../actions/finance';
import { CreateTransactionForm } from './components/CreateTransactionForm';
import { MarkAsPaidButton } from './components/MarkAsPaidButton';
import { TransactionActions } from './components/TransactionActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function FinancePage() {
    const transactions = await getTransactions();

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white">Financeiro</h1>
                <CreateTransactionForm />
            </div>

            {/* Mobile: Cards Layout */}
            <div className="md:hidden space-y-3">
                {transactions.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center text-neutral-500">
                        Nenhuma transação encontrada.
                    </div>
                ) : (
                    transactions.map((t: any) => (
                        <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-neutral-200">{t.description}</p>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        {format(new Date(t.due_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'income'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {t.type === 'income' ? 'Receita' : 'Despesa'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                                <span className="text-lg font-mono text-neutral-200">
                                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                <div className="flex items-center gap-2">
                                    {t.status === 'paid' ? (
                                        <span className="text-green-400 text-sm font-medium">✓ Pago</span>
                                    ) : (
                                        <MarkAsPaidButton transactionId={t.id} />
                                    )}
                                    <TransactionActions transaction={t} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-950/50 text-neutral-400 text-sm uppercase font-medium">
                            <tr>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Vencimento</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-neutral-800/50 transition-colors">
                                        <td className="p-4 font-medium text-neutral-200">{t.description}</td>
                                        <td className="p-4 text-neutral-400">
                                            {format(new Date(t.due_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'income'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {t.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-neutral-200 font-mono">
                                            R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            {t.status === 'paid' ? (
                                                <span className="text-green-400 text-xs">Pago</span>
                                            ) : (
                                                <MarkAsPaidButton transactionId={t.id} />
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <TransactionActions transaction={t} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
