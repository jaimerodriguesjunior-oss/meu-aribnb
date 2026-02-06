'use client';

import { registerBookingPayment } from '@/app/actions/bookings';
import { useState } from 'react';
import { X, DollarSign, Calendar, Check } from 'lucide-react';

interface PaymentModalProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentModal({ booking, isOpen, onClose }: PaymentModalProps) {
    // Determine remaining to pay
    const total = booking?.total_amount || 0;
    const paid = booking?.paid_amount || 0;
    const remaining = Math.max(0, total - paid);

    // Default input to remaining amount
    const [amount, setAmount] = useState(remaining.toString());
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [settleBooking, setSettleBooking] = useState(false);
    const [loading, setLoading] = useState(false);

    // Calculate projected remaining based on input
    const inputAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    const projectedRemaining = Math.max(0, remaining - inputAmount);
    const excess = Math.max(0, inputAmount - remaining);

    // Show Discount option if paying less than remaining
    const showDiscountOption = projectedRemaining > 0 && inputAmount > 0;
    // Show Update Total option if paying more than remaining
    const showUpdateTotalOption = excess > 0;

    if (!isOpen) return null;

    async function handlePayment() {
        setLoading(true);
        const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        const description = `Reserva: ${booking.guest_name} (${booking.property?.name})`;

        const res: any = await registerBookingPayment(booking.id, numericAmount, date, description, settleBooking);

        if (res?.success) {
            onClose();
        } else {
            alert(res?.error || 'Erro ao registrar pagamento');
        }
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Receber Pagamento</h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Registre um pagamento parcial ou total.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-neutral-950 p-4 rounded-xl space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Total:</span>
                            <span className="text-white">R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Já Pago:</span>
                            <span className="text-green-500">R$ {paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-neutral-800 font-bold">
                            <span className="text-neutral-400">Restante:</span>
                            <span className="text-yellow-500">R$ {remaining.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Valor a Receber</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Data do Recebimento</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-green-500 outline-none"
                            />
                        </div>
                    </div>

                    {showDiscountOption && (
                        <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settleBooking}
                                    onChange={(e) => setSettleBooking(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-neutral-900"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-yellow-400 block">Quitar reserva (Desconto)?</span>
                                    <span className="text-xs text-neutral-400">
                                        Perdoar o restante de <span className="text-white font-bold">R$ {projectedRemaining.toFixed(2)}</span> e marcar como Pago.
                                    </span>
                                </div>
                            </label>
                        </div>
                    )}

                    {showUpdateTotalOption && (
                        <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settleBooking}
                                    onChange={(e) => setSettleBooking(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-blue-400 block">Atualizar valor total?</span>
                                    <span className="text-xs text-neutral-400">
                                        Valor excede o restante. Ajustar o total da reserva para <span className="text-white font-bold">R$ {(paid + inputAmount).toFixed(2)}</span>?
                                    </span>
                                </div>
                            </label>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <Check size={20} />
                                Confirmar Recebimento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
