'use client';

import { useState } from 'react';
import { List, CalendarDays } from 'lucide-react';

interface ReservasTabsProps {
    listView: React.ReactNode;
    calendarView: React.ReactNode;
}

export function ReservasTabs({ listView, calendarView }: ReservasTabsProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

    return (
        <div>
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'list'
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                >
                    <List size={18} />
                    Lista
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'calendar'
                            ? 'bg-white text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                >
                    <CalendarDays size={18} />
                    Calendário
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'list' ? listView : calendarView}
            </div>
        </div>
    );
}
