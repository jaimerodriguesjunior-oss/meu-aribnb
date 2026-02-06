'use client';

import {
    LayoutDashboard,
    Wallet,
    Building,
    CalendarDays,
    Users,
    Plane,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname();

    const mainLinks = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/financeiro', icon: Wallet, label: 'Financeiro' },
        { href: '/imoveis', icon: Building, label: 'Imóveis' },
        { href: '/reservas', icon: CalendarDays, label: 'Reservas' },
    ];

    return (
        <aside className="w-64 bg-neutral-900 border-r border-neutral-800 hidden md:flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 group">
                        <Plane className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-200 to-blue-400 bg-clip-text text-transparent">
                        Meu Airbnb
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {mainLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
                        >
                            <Icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}


                <div className="mt-auto pt-4">
                    <Link
                        href="/equipe"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/equipe' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
                    >
                        <Users className="w-5 h-5" />
                        Equipe
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-neutral-800 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 border border-neutral-600">
                        {userEmail?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-neutral-200 truncate">{userEmail}</p>
                        <p className="text-xs text-neutral-500">Admin</p>
                    </div>
                </div>
                <form action="/auth/logout" method="post">
                    <button type="submit" className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </form>
            </div>
        </aside>
    );
}
