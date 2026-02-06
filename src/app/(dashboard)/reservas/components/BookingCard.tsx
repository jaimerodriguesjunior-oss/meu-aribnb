'use client';

import { deleteBooking } from '@/app/actions/bookings';
import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { BookingForm } from './BookingForm';
import { PaymentModal } from './PaymentModal';

interface BookingCardProps {
    booking: any;
    properties: any[];
}

export function BookingCard({ booking, properties }: BookingCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const paidAmount = booking.paid_amount || 0;
    const totalAmount = booking.total_amount || 0;

    // Status Logic
    const isPaid = paidAmount >= totalAmount && totalAmount > 0;
    const isPartial = paidAmount > 0 && paidAmount < totalAmount;

    // Show remaining if partial
    const displayAmount = isPartial
        ? <span className="text-yellow-500">R$ {paidAmount} <span className="text-neutral-500 text-sm">/ {totalAmount}</span></span>
        : <span className={isPaid ? 'text-green-500' : 'text-neutral-200'}>R$ {totalAmount}</span>;

    async function handleDelete() {
        if (confirm('Tem certeza que deseja excluir esta reserva?')) {
            await deleteBooking(booking.id);
        }
    }

    return (
        <>
            <div
                className={`flex flex-col md:flex-row md:items-center gap-4 bg-neutral-950 p-4 rounded-xl border-l-4 group relative`}
                style={{ borderLeftColor: booking.property?.color_code }}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-lg">{booking.guest_name}</h4>
                        {isPaid && (
                            <span className="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                                <CheckCircle size={10} />
                                Pago
                            </span>
                        )}
                        {isPartial && (
                            <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-1">
                                <DollarSign size={10} />
                                Parcial
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-neutral-500">{booking.property?.name}</p>
                </div>

                <div className="flex flex-col md:items-end gap-1">
                    <p className="text-neutral-300">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold`}>
                            {displayAmount}
                        </p>
                    </div>
                </div>

                {/* Actions - always visible */}
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {!isPaid && (
                        <button
                            onClick={() => setIsPaymentOpen(true)}
                            title="Registrar Pagamento"
                            className="p-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-colors"
                        >
                            <DollarSign size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditOpen(true)}
                        title="Editar"
                        className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        title="Excluir"
                        className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isEditOpen && (
                <BookingForm
                    properties={properties}
                    booking={booking}
                    onClose={() => setIsEditOpen(false)}
                />
            )}

            {isPaymentOpen && (
                <PaymentModal
                    booking={booking}
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                />
            )}
        </>
    );
}
