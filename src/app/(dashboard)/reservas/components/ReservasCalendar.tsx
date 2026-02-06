'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHolidays } from '@/app/actions/holidays';

interface Booking {
    id: string;
    guest_name: string;
    start_date: string;
    end_date: string;
    property?: {
        name: string;
        color_code: string;
    };
}

interface Holiday {
    date: string;
    name: string;
    type: string;
}

interface ReservasCalendarProps {
    bookings: Booking[];
}

export function ReservasCalendar({ bookings }: ReservasCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        async function loadHolidays() {
            const data = await getHolidays(year);
            setHolidays(data);
        }
        loadHolidays();
    }, [year]);

    // Navigation
    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Calendar grid helpers
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Build array of days
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null); // Empty cells before month starts
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Check if a date is a holiday
    const isHoliday = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return holidays.find(h => h.date === dateStr);
    };

    // Get bookings for a specific day
    const getBookingsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter(b => {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            const check = new Date(dateStr);
            return check >= start && check <= end;
        });
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={goToPrevMonth}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-white capitalize">{monthName}</h2>
                <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : 'text-neutral-400'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="h-20 md:h-24" />;
                    }

                    const holiday = isHoliday(day);
                    const dayBookings = getBookingsForDay(day);
                    const isSunday = (firstDayOfMonth + day - 1) % 7 === 0;
                    const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === month &&
                        new Date().getFullYear() === year;

                    return (
                        <div
                            key={day}
                            className={`h-20 md:h-24 p-1 rounded-lg border transition-colors ${isToday
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : holiday
                                        ? 'border-orange-500/30 bg-orange-500/5'
                                        : 'border-neutral-800 bg-neutral-950'
                                }`}
                        >
                            {/* Day Number */}
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={`text-sm font-medium ${holiday
                                            ? 'text-orange-400'
                                            : isSunday
                                                ? 'text-red-400'
                                                : 'text-neutral-300'
                                        }`}
                                >
                                    {day}
                                </span>
                                {holiday && (
                                    <span className="text-[10px] text-orange-400 truncate max-w-[60px]" title={holiday.name}>
                                        {holiday.name.split(' ')[0]}
                                    </span>
                                )}
                            </div>

                            {/* Bookings */}
                            <div className="space-y-0.5 overflow-hidden">
                                {dayBookings.slice(0, 2).map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium"
                                        style={{ backgroundColor: booking.property?.color_code || '#3B82F6' }}
                                        title={`${booking.guest_name} - ${booking.property?.name}`}
                                    >
                                        {booking.guest_name}
                                    </div>
                                ))}
                                {dayBookings.length > 2 && (
                                    <div className="text-[10px] text-neutral-500">
                                        +{dayBookings.length - 2} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
                    Feriado
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
                    Hoje
                </div>
                {/* Property colors from bookings */}
                {Array.from(new Set(bookings.map(b => JSON.stringify({ name: b.property?.name, color: b.property?.color_code }))))
                    .slice(0, 5)
                    .map((propStr) => {
                        const prop = JSON.parse(propStr);
                        if (!prop.name) return null;
                        return (
                            <div key={prop.name} className="flex items-center gap-2 text-xs text-neutral-400">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: prop.color }} />
                                {prop.name}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
