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
    const color_code = formData.get('color') as string;
    const image_url = formData.get('image_url') as string;

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
            color_code: color_code || '#3B82F6',
            image_url: image_url || null
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

export async function updateProperty(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const color_code = formData.get('color') as string;
    const image_url = formData.get('image_url') as string;

    if (!id || !name) return { error: 'ID e Nome são obrigatórios' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const updateData: any = {
        name,
        address,
        color_code: color_code || '#3B82F6'
    };

    if (image_url) {
        updateData.image_url = image_url;
    }

    const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Update property error:', error);
        return { error: 'Erro ao atualizar imóvel' };
    }

    revalidatePath('/imoveis');
    return { success: true };
}
