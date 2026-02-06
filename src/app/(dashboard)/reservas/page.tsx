import { getBookings } from '../../actions/bookings';
import { getProperties } from '../../actions/properties';
import { getHolidays } from '../../actions/holidays';
import { BookingForm } from './components/BookingForm';
import { BookingCard } from './components/BookingCard';
import { ReservasTabs } from './components/ReservasTabs';
import { ReservasCalendar } from './components/ReservasCalendar';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function BookingsPage() {
    const bookings = await getBookings();
    const properties = await getProperties();

    // Fetch upcoming holidays
    const currentYear = new Date().getFullYear();
    const holidays = await getHolidays(currentYear);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingHolidays = holidays
        .filter(h => new Date(h.date) >= today)
        .slice(0, 5); // Show next 5

    const listView = (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 min-h-[400px]">
                    {bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-600 border border-neutral-800 border-dashed rounded-xl">
                            <p>Nenhuma reserva encontrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking: any) => (
                                <BookingCard key={booking.id} booking={booking} properties={properties} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Legenda</h3>
                    <div className="space-y-3">
                        {properties.map((property: any) => (
                            <div key={property.id} className="flex items-center gap-3">
                                {property.image_url ? (
                                    <div className="relative">
                                        <img src={property.image_url} alt={property.name} className="w-8 h-8 rounded-full object-cover border border-neutral-700" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-neutral-900" style={{ backgroundColor: property.color_code }} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800 border border-neutral-700">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: property.color_code }} />
                                    </div>
                                )}
                                <span className="text-neutral-300 text-sm truncate">{property.name}</span>
                            </div>
                        ))}
                        {properties.length === 0 && <p className="text-neutral-500 text-sm">Sem imóveis cadastrados.</p>}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-neutral-900 to-orange-950/20 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        Próximos Feriados
                    </h3>
                    <div className="space-y-3">
                        {upcomingHolidays.map((holiday: any) => {
                            const holidayDate = new Date(holiday.date + 'T00:00:00');
                            return (
                                <div key={holiday.date} className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-lg w-10 h-10 min-w-10">
                                        <span className="text-xs font-bold text-orange-400">{format(holidayDate, 'dd')}</span>
                                        <span className="text-[9px] uppercase text-neutral-400">{format(holidayDate, 'MMM', { locale: ptBR })}</span>
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-neutral-200 text-sm font-medium truncate" title={holiday.name}>{holiday.name}</span>
                                        <span className="text-xs text-neutral-500">{format(holidayDate, 'EEEE', { locale: ptBR })}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {upcomingHolidays.length === 0 && <p className="text-neutral-500 text-sm">Nenhum feriado próximo.</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    const calendarView = (
        <ReservasCalendar bookings={bookings} />
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Reservas</h1>
                <BookingForm properties={properties} />
            </div>

            <ReservasTabs listView={listView} calendarView={calendarView} />
        </div>
    );
}
