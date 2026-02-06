'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Wallet,
    Building,
    CalendarDays,
    Users,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileMenu({ userEmail }: { userEmail?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const menuContent = (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-[9998] animate-in fade-in"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-64 bg-neutral-950 border-l border-neutral-800 p-6 z-[9999] shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-white">Menu</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-neutral-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 border border-neutral-600">
                            {userEmail?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-neutral-200 truncate max-w-[150px]">{userEmail}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        <Link
                            href="/equipe"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/equipe' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
                        >
                            <Users size={20} />
                            Equipe
                        </Link>
                        <form action="/auth/logout" method="post">
                            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-neutral-800 rounded-xl transition-colors">
                                <LogOut size={20} />
                                Sair
                            </button>
                        </form>
                    </nav>
                </div>
            </div>
        </>
    );

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-neutral-400 hover:text-white"
            >
                <Menu size={24} />
            </button>

            {mounted && isOpen && createPortal(menuContent, document.body)}
        </div>
    );
}

export function MobileBottomNav() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: LayoutDashboard, label: 'Dash' },
        { href: '/financeiro', icon: Wallet, label: 'Finanças' },
        { href: '/imoveis', icon: Building, label: 'Imóveis' },
        { href: '/reservas', icon: CalendarDays, label: 'Reservas' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-800 p-2 z-50 pb-safe">
            <div className="flex justify-around items-center">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-blue-400' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <Icon size={20} className={isActive ? 'fill-blue-400/20' : ''} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
