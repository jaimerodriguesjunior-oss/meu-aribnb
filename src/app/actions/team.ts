'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkUserOrganization } from './onboarding';
import { revalidatePath } from 'next/cache';

export async function getTeamMembers() {
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
        .from('organization_members')
        .select(`
            id,
            role,
            created_at,
            user:profiles(email, full_name, avatar_url)
        `)
        .eq('organization_id', orgId);

    return data || [];
}

export async function getInvites() {
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
        .from('invites')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'pending');

    return data || [];
}

export async function inviteMember(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const email = formData.get('email') as string;
    const role = formData.get('role') as 'admin' | 'staff';

    if (!email) return { error: 'Email é obrigatório' };

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

    // 1. Check if already member
    // ideally check profiles -> members, but simpler logic here:

    // 2. Create Invite
    const { error } = await supabase
        .from('invites')
        .insert({
            organization_id: orgId,
            email,
            role: role || 'staff'
        });

    if (error) {
        console.error('Invite error:', error);
        return { error: 'Erro ao enviar convite' };
    }

    revalidatePath('/equipe');
    return { success: true };
}

export async function generateInviteLink(inviteToken: string) {
    // In a real app, this would be `https://myapp.com/onboarding?token=${inviteToken}`
    // Since we don't have the domain env var clearly set for prod, we return a relative path for now
    // or assume localhost for dev.
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${origin}/invite/${inviteToken}`;
}
