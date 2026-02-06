import { redirect } from 'next/navigation';
import { checkUserOrganization } from '../actions/onboarding';
import Link from 'next/link';
import { Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MobileMenu, MobileBottomNav } from './components/MobileNavigation';
import { Sidebar } from './components/Sidebar';

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
            {/* Desktop Sidebar */}
            <Sidebar userEmail={user?.email} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-neutral-950 relative pb-20 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                            Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'} 👋
                        </h2>
                        <p className="text-xs md:text-sm text-neutral-400">
                            Gerenciando Organização
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Trigger */}
                        <MobileMenu userEmail={user?.email} />

                        {/* Org Badge (Desktop/Tablet) */}
                        <div className="hidden md:flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2">
                            <Building className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-neutral-300">Minha Organização</span>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
