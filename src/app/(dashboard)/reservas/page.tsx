import { getBookings } from '../../actions/bookings';
import { CalendarDays, Plus } from 'lucide-react';
import { getProperties } from '../../actions/properties';

export default async function BookingsPage() {
    const bookings = await getBookings();
    const properties = await getProperties();

    // Group bookings by month or just a list for now
    // A full calendar UI is complex, we will start with a list view that looks like a calendar summary

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Reservas</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
                    <Plus size={20} />
                    Nova Reserva
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 min-h-[400px]">
                        <div className="flex items-center gap-2 text-neutral-400 mb-6">
                            <CalendarDays className="w-5 h-5" />
                            <span className="font-medium">Calendário de Reservas</span>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-neutral-600 border border-neutral-800 border-dashed rounded-xl">
                                <p>Nenhuma reserva encontrada</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center gap-4 bg-neutral-950 p-4 rounded-xl border-l-4" style={{ borderLeftColor: booking.property?.color_code }}>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{booking.guest_name}</h4>
                                            <p className="text-sm text-neutral-500">{booking.property?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-neutral-300">
                                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm font-bold text-green-400">
                                                R$ {booking.total_amount}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Legenda</h3>
                    <div className="space-y-3">
                        {properties.map((property: any) => (
                            <div key={property.id} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: property.color_code }} />
                                <span className="text-neutral-300 text-sm truncate">{property.name}</span>
                            </div>
                        ))}
                        {properties.length === 0 && <p className="text-neutral-500 text-sm">Sem imóveis cadastrados.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
