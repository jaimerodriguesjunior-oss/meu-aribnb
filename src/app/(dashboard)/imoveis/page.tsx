import { getProperties } from '../../actions/properties';
import { PropertyForm } from './components/PropertyForm';
import { Home, MapPin, CalendarDays } from 'lucide-react';

export default async function PropertiesPage() {
    const properties = await getProperties();

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Imóveis</h1>
                <PropertyForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                    <div className="col-span-full p-12 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-600">
                        Nenhum imóvel cadastrado.
                    </div>
                ) : (
                    properties.map((property: any) => (
                        <div key={property.id} className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col">
                            {/* Image Header */}
                            <div className="h-48 w-full bg-neutral-950 relative">
                                {property.image_url ? (
                                    <img
                                        src={property.image_url}
                                        alt={property.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${property.color_code}10` }}>
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${property.color_code}20`, color: property.color_code }}>
                                            <Home className="w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <PropertyForm property={property} />
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white mb-2">{property.name}</h3>
                                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-6">
                                    <MapPin className="w-4 h-4" />
                                    {property.address || 'Sem endereço'}
                                </div>

                                <div className="mt-auto">
                                    <a href={`/reservas?property=${property.id}`} className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-sm font-medium group">
                                        <CalendarDays className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                                        Ver Calendário
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
