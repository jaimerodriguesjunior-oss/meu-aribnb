'use client';

import { createProperty, updateProperty } from '@/app/actions/properties';
import { useState, useEffect } from 'react';
import { Plus, X, MapPin, Home, Image as ImageIcon, Loader2, Pencil } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface PropertyFormProps {
    property?: any;
}

export function PropertyForm({ property }: PropertyFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const isEditing = !!property;

    useEffect(() => {
        if (isOpen && property) {
            setPreview(property.image_url);
        }
    }, [isOpen, property]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            let imageUrl = property?.image_url || '';

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            if (imageUrl) {
                formData.append('image_url', imageUrl);
            }

            if (isEditing) {
                formData.append('id', property.id);
                const res: any = await updateProperty(formData);
                if (res?.success) {
                    setIsOpen(false);
                } else {
                    alert(res?.error || 'Erro ao atualizar');
                }
            } else {
                const res: any = await createProperty(formData);
                if (res?.success) {
                    setIsOpen(false);
                    setPreview(null);
                    setFile(null);
                } else {
                    alert(res?.error || 'Erro ao criar');
                }
            }

        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload da imagem.' + error.message);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        if (isEditing) {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                >
                    <Pencil size={16} />
                </button>
            );
        }

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
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Foto do Imóvel</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-800 border-dashed rounded-xl cursor-pointer bg-neutral-950 hover:bg-neutral-900 transition-colors relative overflow-hidden group">
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-medium">Alterar foto</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-8 h-8 text-neutral-500 mb-2" />
                                        <p className="text-xs text-neutral-500">Clique para enviar uma foto</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase">Nome / Identificação</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 text-neutral-500 w-4 h-4" />
                            <input
                                name="name"
                                defaultValue={property?.name}
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
                                defaultValue={property?.address}
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
                                    <input
                                        type="radio"
                                        name="color"
                                        value={color}
                                        className="peer sr-only"
                                        defaultChecked={property ? property.color_code === color : color === '#3B82F6'}
                                    />
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? 'Salvando...' : (isEditing ? 'Atualizar Imóvel' : 'Cadastrar Imóvel')}
                    </button>
                </form>
            </div>
        </div>
    );
}
