import { getProperties } from '../../actions/properties';
import { CreatePropertyForm } from './components/CreatePropertyForm';
import { Home, MapPin, CalendarDays } from 'lucide-react';

export default async function PropertiesPage() {
    const properties = await getProperties();

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Imóveis</h1>
                <CreatePropertyForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                    <div className="col-span-full p-12 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-600">
                        Nenhum imóvel cadastrado.
                    </div>
                ) : (
                    properties.map((property: any) => (
                        <div key={property.id} className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${property.color_code}20`, color: property.color_code }}>
                                    <Home className="w-6 h-6" />
                                </div>
                                {/* Future actions menu */}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{property.name}</h3>
                            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-6">
                                <MapPin className="w-4 h-4" />
                                {property.address || 'Sem endereço'}
                            </div>

                            <a href={`/reservas?property=${property.id}`} className="block w-full py-2.5 text-center bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-sm font-medium">
                                Ver Calendário
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
