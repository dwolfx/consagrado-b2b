
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eilpafndxtzsmxozrpnm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhZm5keHR6c214b3pycG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTcwMzUsImV4cCI6MjA4MDg3MzAzNX0.yFiNZ1W9YmrJbMx-2_YPdgfgZ2qYWUMk4xjPLDlN9hk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
    // Products
    // Products
    getProducts: async (establishmentId = 1) => {
        let { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('establishment_id', establishmentId)
            .order('name');
        if (error) console.error('Error fetching products', error);
        return data || [];
    },
    createProduct: async (product, establishmentId = 1) => {
        const { data, error } = await supabase
            .from('products')
            .insert([{ ...product, establishment_id: establishmentId }])
            .select();
        if (error) throw error;
        return data[0];
    },
    updateProduct: async (id, updates) => {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },
    deleteProduct: async (id) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // Tables
    getTables: async (establishmentId = 1) => {
        let { data, error } = await supabase
            .from('tables')
            .select('*, orders(*), establishment:establishments(*)')
            .eq('establishment_id', establishmentId)
            .order('number');
        if (error) console.error('Error fetching tables', error);
        return data || [];
    },
    getTable: async (id) => {
        let { data, error } = await supabase
            .from('tables')
            .select('*, orders(*)')
            .eq('id', id)
            .single();
        if (error) console.error('Error fetching table', error);
        return data;
    },
    // Orders
    addOrder: async (tableId, orderItem) => {
        // Just insert into orders table. Realtime triggers will handle the rest.
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                establishment_id: 1, // Default to Pizzaria for Demo
                table_id: tableId,
                product_id: orderItem.productId,
                name: orderItem.name,
                price: orderItem.price,
                quantity: orderItem.quantity,
                status: 'pending',
                author_name: orderItem.orderedBy, // Compatibility with V2
                // ordered_by_staff_id: ... (Future: Link real ID)
            }])
            .select();

        // Also update table status to occupied if needed
        await supabase
            .from('tables')
            .update({ status: 'occupied' })
            .eq('id', tableId);

        if (error) console.error('Error adding order', error);
        return data;
    },

    closeTable: async (tableId) => {
        try {
            // 1. Mark all pending orders as paid
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('table_id', tableId)
                .in('status', ['pending', 'delivered', 'ready']); // Update active statuses

            if (orderError) throw orderError;

            // 2. Free the table
            const { error: tableError } = await supabase
                .from('tables')
                .update({ status: 'free' })
                .eq('id', tableId);

            if (tableError) throw tableError;

            return true;
        } catch (error) {
            console.error('Error closing table:', error);
            return false;
        }
    },

    // Establishments
    getEstablishments: async () => {
        let { data, error } = await supabase
            .from('establishments')
            .select('*');
        return data || [];
    },

    // Users (Auth) - B2B Custom Auth for Schema V2
    login: async (email, password) => {
        // 1. Try finding in b2b_users
        const { data, error } = await supabase
            .from('b2b_users')
            .select('*')
            .eq('email', email)
            .eq('password_hash', password) // Simulação Demo
            .single();

        if (error || !data) throw new Error('Credenciais inválidas');
        return { user: data, session: { access_token: 'demo-token' } };
    },

    // Sales / Payments
    getSales: async (establishmentId = 1) => {
        // Fetch from 'payments' table
        const { data, error } = await supabase
            .from('payments')
            .select('*, establishment:establishments(name)')
            .eq('establishment_id', establishmentId)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching sales', error);
        return data || [];
    },

    // Suppliers
    getSuppliers: async (establishmentId = 1) => {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('establishment_id', establishmentId)
            .order('name');

        if (error) console.error('Error fetching suppliers', error);
        return data || [];
    },

    addSupplier: async (supplier, establishmentId = 1) => {
        const { data, error } = await supabase
            .from('suppliers')
            .insert([{ ...supplier, establishment_id: establishmentId }])
            .select();

        if (error) throw error;
        return data[0];
    },

    deleteSupplier: async (id) => {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
