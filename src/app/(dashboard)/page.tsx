import { redirect } from 'next/navigation';
import { checkUserOrganization } from '../actions/onboarding';
import { getDashboardSummary } from '../actions/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Clock, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const orgId = await checkUserOrganization();

    if (!orgId) {
        redirect('/onboarding');
    }

    const summary = await getDashboardSummary();

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-neutral-900 p-4 md:p-6 rounded-2xl border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <h3 className="text-neutral-400 text-sm font-medium">Receitas</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-green-400">
                        R$ {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Recebido</p>
                </div>
                <div className="bg-neutral-900 p-4 md:p-6 rounded-2xl border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <h3 className="text-neutral-400 text-sm font-medium">Despesas</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-red-400">
                        R$ {formatCurrency(summary?.totalExpense || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Pago</p>
                </div>
                <div className="bg-neutral-900 p-4 md:p-6 rounded-2xl border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <h3 className="text-neutral-400 text-sm font-medium">A Pagar</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-orange-400">
                        R$ {formatCurrency(summary?.overduePayables || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Vencido/Hoje</p>
                </div>
                <div className="bg-neutral-900 p-4 md:p-6 rounded-2xl border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <h3 className="text-neutral-400 text-sm font-medium">Futuras</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-400">
                        R$ {formatCurrency(summary?.upcomingPayables || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">A vencer</p>
                </div>
            </div>

            {/* Balance Card */}
            <div className="mt-4 md:mt-6 bg-gradient-to-r from-neutral-900 to-neutral-800 p-4 md:p-6 rounded-2xl border border-neutral-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-white" />
                        <div>
                            <h3 className="text-neutral-400 text-sm font-medium">Saldo Atual</h3>
                            <p className={`text-2xl md:text-3xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                R$ {formatCurrency(summary?.balance || 0)}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/financeiro"
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        Ver transações →
                    </Link>
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                {/* Overdue */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 md:p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Contas Vencidas / Hoje
                    </h2>
                    {summary?.overdueList?.length === 0 ? (
                        <div className="text-neutral-500 text-center py-6">
                            Nenhuma conta vencida. 🎉
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {summary?.overdueList?.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-200">{t.description}</p>
                                        <p className="text-xs text-neutral-500">
                                            {format(new Date(t.due_date), "dd 'de' MMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <span className={`font-mono text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        R$ {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 md:p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Próximos Vencimentos
                    </h2>
                    {summary?.upcomingList?.length === 0 ? (
                        <div className="text-neutral-500 text-center py-6">
                            Nenhum lançamento futuro.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {summary?.upcomingList?.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-200">{t.description}</p>
                                        <p className="text-xs text-neutral-500">
                                            {format(new Date(t.due_date), "dd 'de' MMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <span className={`font-mono text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        R$ {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
