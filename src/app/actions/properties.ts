'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkUserOrganization } from './onboarding';
import { revalidatePath } from 'next/cache';

export async function createProperty(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const color = formData.get('color') as string;

    if (!name) return { error: 'Nome é obrigatório' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const { error } = await supabase
        .from('properties')
        .insert({
            organization_id: orgId,
            name,
            address,
            color_code: color || '#3B82F6'
        });

    if (error) {
        console.error('Create property error:', error);
        return { error: 'Erro ao criar imóvel' };
    }

    revalidatePath('/imoveis');
    return { success: true };
}

export async function getProperties() {
    const orgId = await checkUserOrganization();
    if (!orgId) return [];

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    return data || [];
}
