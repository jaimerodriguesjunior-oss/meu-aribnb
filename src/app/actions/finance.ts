'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkUserOrganization } from './onboarding';

export async function createTransaction(formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const description = formData.get('description') as string;
    const amountStr = formData.get('amount') as string;
    const type = formData.get('type') as 'income' | 'expense';
    const dueDateStr = formData.get('dueDate') as string;

    // Installments
    const isInstallment = formData.get('isInstallment') === 'on';
    const installmentsCount = isInstallment ? parseInt(formData.get('installmentsCount') as string) : 1;

    // Already Paid
    const isPaid = formData.get('isPaid') === 'on';

    if (!description || !amountStr || !dueDateStr || !type) {
        return { error: 'Preencha todos os campos obrigatórios' };
    }

    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return { error: 'Valor inválido' };

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

    const transactionsToInsert = [];
    const recurrenceGroupId = installmentsCount > 1 ? crypto.randomUUID() : null;
    let baseDate = new Date(dueDateStr);
    const installmentAmount = Math.round((amount / installmentsCount) * 100) / 100; // Divide and round to 2 decimals

    for (let i = 0; i < installmentsCount; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setMonth(baseDate.getMonth() + i);

        transactionsToInsert.push({
            organization_id: orgId,
            description: installmentsCount > 1 ? `${description} (${i + 1}/${installmentsCount})` : description,
            amount: installmentAmount,
            type: type,
            due_date: currentDate.toISOString().split('T')[0],
            status: isPaid ? 'paid' : 'pending',
            recurrence_group_id: recurrenceGroupId
        });
    }

    const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

    if (error) {
        console.error('Error creating transaction:', error);
        return { error: 'Erro ao criar transação' };
    }

    revalidatePath('/financeiro');
    return { success: true };
}

export async function getTransactions() {
    const orgId = await checkUserOrganization();
    if (!orgId) return [];

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', orgId)
        .order('due_date', { ascending: true });

    return data || [];
}

export async function getDashboardSummary() {
    const orgId = await checkUserOrganization();
    if (!orgId) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', orgId);

    if (!transactions) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalIncome = 0;
    let totalExpense = 0;
    let overduePayables = 0;
    let upcomingPayables = 0;
    const overdueList: any[] = [];
    const upcomingList: any[] = [];

    transactions.forEach((t: any) => {
        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (t.status === 'paid') {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        } else {
            // Pending
            if (t.type === 'expense') {
                if (dueDate <= today) {
                    overduePayables += t.amount;
                    overdueList.push(t);
                } else {
                    upcomingPayables += t.amount;
                    upcomingList.push(t);
                }
            } else if (t.type === 'income') {
                if (dueDate <= today) {
                    overdueList.push(t);
                } else {
                    upcomingList.push(t);
                }
            }
        }
    });

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        overduePayables,
        upcomingPayables,
        overdueList: overdueList.slice(0, 5),
        upcomingList: upcomingList.slice(0, 5)
    };
}

export async function markAsPaid(transactionId: string) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

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

    const { error } = await supabase
        .from('transactions')
        .update({ status: 'paid' })
        .eq('id', transactionId)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error marking as paid:', error);
        return { error: 'Erro ao marcar como pago' };
    }

    revalidatePath('/financeiro');
    return { success: true };
}

export async function deleteTransaction(transactionId: string) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

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

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error deleting transaction:', error);
        return { error: 'Erro ao excluir transação' };
    }

    revalidatePath('/financeiro');
    return { success: true };
}

export async function updateTransaction(transactionId: string, formData: FormData) {
    const orgId = await checkUserOrganization();
    if (!orgId) return { error: 'Organização não encontrada' };

    const description = formData.get('description') as string;
    const amountStr = formData.get('amount') as string;
    const type = formData.get('type') as 'income' | 'expense';
    const dueDateStr = formData.get('dueDate') as string;

    if (!description || !amountStr || !dueDateStr || !type) {
        return { error: 'Preencha todos os campos obrigatórios' };
    }

    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return { error: 'Valor inválido' };

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

    const { error } = await supabase
        .from('transactions')
        .update({
            description,
            amount,
            type,
            due_date: dueDateStr
        })
        .eq('id', transactionId)
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error updating transaction:', error);
        return { error: 'Erro ao atualizar transação' };
    }

    revalidatePath('/financeiro');
    return { success: true };
}
