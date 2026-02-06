'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkUserOrganization } from './onboarding';
import { revalidatePath } from 'next/cache';

export async function getBookings() {
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
        .from('bookings')
        .select(`
            *,
            property:properties(name, color_code)
        `)
        .eq('organization_id', orgId);

    return data || [];
}

export async function createBooking(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const guest_name = formData.get('guestName') as string;
    const property_id = formData.get('propertyId') as string;
    const start_date = formData.get('startDate') as string;
    const end_date = formData.get('endDate') as string;
    const amount = formData.get('amount') as string;

    if (!guest_name || !property_id || !start_date || !end_date || !amount) {
        return { error: 'Todos os campos são obrigatórios' };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    // Convert amount string "1.234,56" or "1234.56" to number
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

    const { error } = await supabase
        .from('bookings')
        .insert({
            organization_id: orgId,
            property_id,
            guest_name,
            start_date,
            end_date,
            total_amount: numericAmount,
            status: 'confirmed'
        });

    if (error) {
        console.error('Create booking error:', error);
        return { error: 'Erro ao criar reserva' };
    }

    // Optional: Create a transaction for this booking automatically?
    // For now, let's keep it simple.

    return { success: true };
}

export async function updateBooking(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const bookingId = formData.get('bookingId') as string;
    const guest_name = formData.get('guestName') as string;
    const property_id = formData.get('propertyId') as string;
    const start_date = formData.get('startDate') as string;
    const end_date = formData.get('endDate') as string;
    const amount = formData.get('amount') as string;

    if (!bookingId || !guest_name || !property_id || !start_date || !end_date || !amount) {
        return { error: 'Todos os campos são obrigatórios' };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

    const { error } = await supabase
        .from('bookings')
        .update({
            property_id,
            guest_name,
            start_date,
            end_date,
            total_amount: numericAmount
        })
        .eq('id', bookingId)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Update booking error:', error);
        return { error: 'Erro ao atualizar reserva' };
    }

    revalidatePath('/reservas');
    return { success: true };
}

export async function deleteBooking(bookingId: string) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Delete booking error:', error);
        return { error: 'Erro ao excluir reserva' };
    }

    revalidatePath('/reservas');
    return { success: true };
}

export async function registerBookingPayment(bookingId: string, amount: number, date: string, description: string, settleBooking: boolean = false) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    // 1. Transaction creation
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            organization_id: orgId,
            description: description,
            amount: amount,
            type: 'income',
            due_date: date,
            status: 'paid',
            booking_id: bookingId
        });

    if (transactionError) {
        console.error('Error creating transaction for booking:', transactionError);
        return { error: 'Erro ao criar transação financeira.' };
    }

    // 2. Update booking paid_amount. 
    const { data: booking } = await supabase.from('bookings').select('paid_amount, total_amount').eq('id', bookingId).single();

    const currentPaid = booking?.paid_amount || 0;
    const newPaid = currentPaid + amount;
    // Round to 2 decimals
    const newPaidRounded = Math.round(newPaid * 100) / 100;

    // Determine status
    let newTotal = booking?.total_amount || 0;

    if (settleBooking) {
        // If settling, we adjust the total to match what was paid (waiving the rest)
        newTotal = newPaidRounded;
    }

    const isFullyPaid = newPaidRounded >= newTotal;
    const newStatus = isFullyPaid ? 'paid' : 'confirmed';

    const updates: any = {
        paid_amount: newPaidRounded,
        status: newStatus
    };

    if (settleBooking) {
        updates.total_amount = newTotal;
    }

    const { error: bookingError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .eq('organization_id', orgId);

    if (bookingError) {
        console.error('Error updating booking status:', bookingError);
        return { error: 'Erro ao atualizar status da reserva' };
    }

    revalidatePath('/reservas');
    revalidatePath('/financeiro');
    return { success: true };
}
