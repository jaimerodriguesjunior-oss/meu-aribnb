export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            organizations: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            organization_members: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'staff'
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    user_id: string
                    role?: 'owner' | 'admin' | 'staff'
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    user_id?: string
                    role?: 'owner' | 'admin' | 'staff'
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    organization_id: string
                    description: string
                    amount: number
                    type: 'income' | 'expense'
                    due_date: string
                    status: 'pending' | 'paid'
                    recurrence_group_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    description: string
                    amount: number
                    type: 'income' | 'expense'
                    due_date: string
                    status?: 'pending' | 'paid'
                    recurrence_group_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    description?: string
                    amount?: number
                    type?: 'income' | 'expense'
                    due_date?: string
                    status?: 'pending' | 'paid'
                    recurrence_group_id?: string | null
                    created_at?: string
                }
            }
        }
        Enums: {
            app_role: 'owner' | 'admin' | 'staff'
            transaction_type: 'income' | 'expense'
            transaction_status: 'pending' | 'paid'
        }
    }
}
