'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createOrganization(formData: FormData) {
    const name = formData.get('orgName') as string;

    if (!name) {
        return { error: 'Nome da organização é obrigatório' };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: any) { },
                remove(name: string, options: any) { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autenticado' };

    // 1. Create Organization & Member via RPC (Atomic & Secure)
    // We use a database function to avoid the "Chicken & Egg" RLS problem 
    // (User creates org but can't see it to create membership).
    const { data: orgId, error: keyError } = await supabase
        .rpc('create_org_with_owner', { name });

    if (keyError) {
        console.error('Error creating org:', keyError);
        return { error: `Erro ao criar organização: ${keyError.message} (${keyError.code})` };
    }

    // No need to insert member manually, the function does it.

    redirect('/');
}

export async function checkUserOrganization() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: any) { },
                remove(name: string, options: any) { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: memberships, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

    console.log('[checkUserOrganization] User:', user.id);
    console.log('[checkUserOrganization] Memberships:', memberships);
    console.log('[checkUserOrganization] Error:', error);

    if (error || !memberships || memberships.length === 0) {
        return null;
    }

    return memberships[0].organization_id;
}
