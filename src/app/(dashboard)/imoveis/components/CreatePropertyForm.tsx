'use client';

import { createProperty } from '@/app/actions/properties';
import { useState } from 'react';
import { Plus, X, MapPin, Home } from 'lucide-react';

export function CreatePropertyForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const res: any = await createProperty(formData);
        if (res?.success) {
            setIsOpen(false);
        } else {
            alert(res?.error || 'Erro ao criar');
        }
        setLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
                <Plus size={20} />
                Novo Imóvel
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

                <h2 className="text-xl font-bold text-white mb-6">Novo Imóvel</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Nome / Identificação</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="name"
                                placeholder="Ex: Casa Praia Grande"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Endereço</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="address"
                                placeholder="Rua das Ondas, 123"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Cor (para Calendário)</label>
                        <div className="flex gap-3">
                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                                <label key={color} className="cursor-pointer relative">
                                    <input type="radio" name="color" value={color} className="peer sr-only" defaultChecked={color === '#3B82F6'} />
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-white transition-all transform peer-checked:scale-110"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Salvando...' : 'Cadastrar Imóvel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
