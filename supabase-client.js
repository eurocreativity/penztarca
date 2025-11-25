// Wait for Supabase library to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase client if not already done
    if (!window.supabaseClient && window.supabase) {
        try {
            console.log('Initializing Supabase client...');
            const supabase = window.supabase.createClient(
                'https://oavxilimosjrodillmea.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdnhpbGltb3Nqcm9kaWxsbWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTQ3NzksImV4cCI6MjA3MzYzMDc3OX0.BQMeFbWZmrEXN3kOurUd_wyn6Dh0jVk417if-QRdMbY'
            );

            // Export the initialized client globally
            window.supabaseClient = supabase;
            console.log('Supabase client initialized successfully');

            // Dispatch an event to notify that Supabase is ready
            window.dispatchEvent(new Event('supabaseReady'));
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            alert('Hiba történt a rendszer inicializálása során. Kérlek, frissítsd az oldalt vagy próbáld újra később.');
        }
    } else {
        console.log('Supabase client already initialized or library not loaded');
    }
});
