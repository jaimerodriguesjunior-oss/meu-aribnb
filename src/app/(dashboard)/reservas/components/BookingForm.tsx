'use client';

import { createBooking, updateBooking } from '@/app/actions/bookings';
import { useState, useEffect } from 'react';
import { Plus, X, Calendar, DollarSign, User, Home, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Property {
    id: string;
    name: string;
    color_code: string;
}

interface BookingFormProps {
    properties: Property[];
    booking?: any; // If provided, we are in Edit mode
    onClose?: () => void; // Used when opened from a card
    trigger?: React.ReactNode; // Custom trigger button
}

export function BookingForm({ properties, booking, onClose, trigger }: BookingFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [guestName, setGuestName] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [amount, setAmount] = useState('');

    const router = useRouter();
    const isEditing = !!booking;

    // Initialize state if editing
    useEffect(() => {
        if (booking) {
            setGuestName(booking.guest_name);
            setPropertyId(booking.property_id);
            // Format dates YYYY-MM-DD
            setStartDate(booking.start_date.split('T')[0]);
            setEndDate(booking.end_date.split('T')[0]);
            setAmount(booking.total_amount.toString());
            setIsOpen(true);
        }
    }, [booking]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        let res: any;
        if (isEditing) {
            formData.append('bookingId', booking.id);
            res = await updateBooking(formData);
        } else {
            res = await createBooking(formData);
        }

        if (res?.success) {
            handleClose();
            router.refresh();
        } else {
            alert(res?.error || 'Erro ao salvar reserva');
        }
        setLoading(false);
    }

    function handleClose() {
        setIsOpen(false);
        if (onClose) onClose();
        if (!isEditing) {
            // Reset form if it was a create action
            setGuestName('');
            setPropertyId('');
            setStartDate('');
            setEndDate('');
            setAmount('');
        }
    }

    function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setStartDate(val);
        // Auto-fill logic
        if (!endDate || endDate === startDate) {
            setEndDate(val);
        } else {
            if (val > endDate) {
                setEndDate(val);
            }
        }
    }

    // If controlled by parent (like in edit card), we might just show the modal directly?
    // Actually, usually we want the Card to control "isEditing" state. 
    // But for "Create", we want a button that opens it.
    // Let's handle both.

    const showModal = isOpen || (booking && isOpen); // Simplification: component handles its own open state generally.

    if (!showModal) {
        if (trigger) {
            return <div onClick={() => setIsOpen(true)}>{trigger}</div>;
        }
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
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {isEditing ? 'Editar Reserva' : 'Nova Reserva'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Hóspede</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="guestName"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
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
                                value={propertyId}
                                onChange={(e) => setPropertyId(e.target.value)}
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
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <Save size={20} />
                                {isEditing ? 'Atualizar Reserva' : 'Criar Reserva'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
