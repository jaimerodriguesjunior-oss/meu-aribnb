import { redirect } from 'next/navigation';
import { checkUserOrganization } from '../actions/onboarding';
import Link from 'next/link';
import {
    LayoutDashboard,
    Wallet,
    Building,
    CalendarDays,
    Users,
    LogOut,
    Menu
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const orgId = await checkUserOrganization();

    if (!orgId) {
        redirect('/onboarding');
    }

    const cookieStore = await cookies();
    const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: { user } } = await supabaseServer.auth.getUser();

    return (
        <div className="min-h-screen bg-neutral-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-neutral-900 border-r border-neutral-800 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Building className="w-6 h-6 text-green-500" />
                        Meu Airbnb
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/financeiro" className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors">
                        <Wallet className="w-5 h-5" />
                        Financeiro
                    </Link>
                    <Link href="/imoveis" className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors">
                        <Building className="w-5 h-5" />
                        Imóveis
                    </Link>
                    <Link href="/reservas" className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors">
                        <CalendarDays className="w-5 h-5" />
                        Reservas
                    </Link>
                    <Link href="/equipe" className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors">
                        <Users className="w-5 h-5" />
                        Equipe
                    </Link>
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 border border-neutral-600">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-neutral-200 truncate">{user?.email}</p>
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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
