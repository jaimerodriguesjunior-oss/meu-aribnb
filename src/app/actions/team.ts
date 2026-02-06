'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { checkUserOrganization } from './onboarding';
import { revalidatePath } from 'next/cache';

export async function getTeamMembers() {
    const orgId = await checkUserOrganization();
    if (!orgId) return [];

    const cookieStore = await cookies();
    // TODO: Revert to RLS safe client after debugging
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
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

    const role = formData.get('role') as 'admin' | 'staff';

    const cookieStore = await cookies();
    // TODO: Revert to RLS safe client after debugging if needed, but keeping consistently admin for now to ensure visibility
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 1. Check for Existing General Link for this Role
    // Pattern: link-{role}-geral@ignore.meuairb.com
    const generalEmail = `link-${role}-geral@ignore.meuairb.com`;

    const { data: existingInvite } = await supabase
        .from('invites')
        .select('token')
        .eq('organization_id', orgId)
        .eq('email', generalEmail)
        .eq('status', 'pending')
        .maybeSingle();

    if (existingInvite) {
        // CLEANUP: Delete old spammy links to clean the database
        // We do this asynchronously/fire-and-forget to not block the response too much
        await supabase
            .from('invites')
            .delete()
            .eq('organization_id', orgId)
            .ilike('email', 'link-%')
            .neq('email', generalEmail)
            .eq('status', 'pending');

        revalidatePath('/equipe');
        return { success: true, token: existingInvite.token };
    }

    // 2. Create NEW General Invite
    const { data, error } = await supabase
        .from('invites')
        .insert({
            organization_id: orgId,
            email: generalEmail,
            role: role || 'staff'
        })
        .select()
        .single();

    if (error) {
        console.error('Invite error:', error);
        return { error: 'Erro ao gerar link geral' };
    }

    revalidatePath('/equipe');
    return { success: true, token: data.token };
}

export async function generateInviteLink(inviteToken: string) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${origin}/invite/${inviteToken}`;
}

export async function acceptInvite(token: string) {
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
    if (!user) return { error: 'Usuário não autenticado' };

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // 1. Validate Token
    const { data: invite, error: inviteError } = await supabaseAdmin
        .from('invites')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

    if (inviteError || !invite) {
        return { error: 'Convite inválido ou expirado' };
    }

    // 2. Add to Organization Members
    const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
            organization_id: invite.organization_id,
            user_id: user.id,
            role: invite.role
        });

    if (memberError) {
        if (memberError.code === '23505') { // Unique violation
            // Already a member, that's fine
        } else {
            console.error('Error adding member:', memberError);
            return { error: 'Erro ao entrar na organização' };
        }
    }

    // 3. Mark Invite as Accepted (ONLY IF NOT GENERAL LINK)
    const isGeneralLink = invite.email.includes('-geral@');

    if (!isGeneralLink) {
        await supabaseAdmin
            .from('invites')
            .update({
                status: 'accepted',
                used_at: new Date().toISOString(),
                email: user.email // Save who accepted
            })
            .eq('id', invite.id);
    }

    return { success: true };
}
