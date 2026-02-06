'use client';

import { createBooking } from '@/app/actions/bookings';
import { useState } from 'react';
import { Plus, X, Calendar, DollarSign, User, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Property {
    id: string;
    name: string;
    color_code: string;
}

interface CreateBookingFormProps {
    properties: Property[];
}

export function CreateBookingForm({ properties }: CreateBookingFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const res: any = await createBooking(formData);

        if (res?.success) {
            setIsOpen(false);
            setStartDate('');
            setEndDate('');
            router.refresh();
        } else {
            alert(res?.error || 'Erro ao criar reserva');
        }
        setLoading(false);
    }

    function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setStartDate(val);
        // Only auto-fill end date if it's currently empty or previously equal to start date (heuristic)?
        // User requested: "A data de saída já pode ser preenchida automaticamente com o mesmo dia da data de entrada"
        // Let's just set it to the same value to be helpful.
        if (!endDate || endDate === startDate) {
            setEndDate(val);
        } else {
            // Also, if the new start date is AFTER the current end date, update end date to match start date
            if (val > endDate) {
                setEndDate(val);
            }
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
                <Plus size={20} />
                Nova Reserva
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

                <h2 className="text-xl font-bold text-white mb-6">Nova Reserva</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Hóspede</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="guestName"
                                placeholder="Nome do hóspede"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Imóvel</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <select
                                name="propertyId"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none appearance-none"
                                required
                            >
                                <option value="">Selecione um imóvel...</option>
                                {properties.map(property => (
                                    <option key={property.id} value={property.id}>
                                        {property.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Entrada</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-400 uppercase">Saída</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Valor Total</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="amount"
                                placeholder="0,00"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Salvando...' : 'Criar Reserva'}
                    </button>
                </form>
            </div>
        </div>
    );
}
