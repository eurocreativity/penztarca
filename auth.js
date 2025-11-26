class AuthManager {
    constructor() {
        console.log('AuthManager constructor called');
        if (window.supabaseClient) {
            console.log('Supabase client already available, initializing...');
            this.init();
        } else {
            console.log('Waiting for supabaseReady event...');
            window.addEventListener('supabaseReady', () => {
                console.log('supabaseReady event received, initializing...');
                this.init();
            });
        }
    }

    init() {
        console.log('AuthManager initializing...');
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Form toggle buttons
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.showRegisterForm());
        } else {
            console.warn('showRegisterBtn not found');
        }

        const showLoginBtn = document.getElementById('showLoginBtn');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.showLoginForm());
        } else {
            console.warn('showLoginBtn not found');
        }

        document.getElementById('showForgotPasswordBtn')?.addEventListener('click', () => this.showForgotPasswordForm());
        document.getElementById('showLoginFromForgotBtn')?.addEventListener('click', () => this.showLoginForm());

        // Password toggle buttons
        this.setupPasswordToggle('toggleLoginPassword', 'loginPassword');
        this.setupPasswordToggle('toggleRegisterPassword', 'registerPassword');
        this.setupPasswordToggle('toggleConfirmPassword', 'registerConfirmPassword');

        // Form submissions
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                const submitButton = e.target.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = true;
                try {
                    await this.handleLogin();
                } catch (error) {
                    console.error('Login error:', error);
                    this.showError('loginError', 'Hiba történt a bejelentkezés során: ' + error.message);
                } finally {
                    if (submitButton) submitButton.disabled = false;
                }
            });
        } else {
            console.error('loginFormElement not found');
        }

        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Register form submitted');
                const submitButton = e.target.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = true;
                try {
                    await this.handleRegister();
                } catch (error) {
                    console.error('Registration error:', error);
                    this.showError('registerError', 'Hiba történt a regisztráció során: ' + error.message);
                } finally {
                    if (submitButton) submitButton.disabled = false;
                }
            });
        } else {
            console.error('registerFormElement not found');
        }

        document.getElementById('forgotPasswordFormElement')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Forgot password form submitted');
            const submitButton = e.target.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            try {
                await this.handleForgotPassword();
            } catch (error) {
                console.error('Password reset error:', error);
                this.showError('forgotPasswordError', 'Hiba történt a jelszó visszaállítás során');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });

        document.getElementById('resetPasswordFormElement')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            try {
                await this.handlePasswordReset();
            } catch (error) {
                console.error('Password reset error:', error);
                this.showError('resetPasswordError', 'Hiba történt a jelszó módosítása során');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    checkAuthStatus = async () => {
        try {
            if (!window.supabaseClient) {
                console.error('Supabase client not initialized');
                return;
            }

            console.log('Checking auth status...');
            const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

            if (sessionError) {
                console.error('Session error:', sessionError);
                return;
            }

            // Handle email verification
            const params = new URLSearchParams(window.location.search);
            if (params.get('verify') === 'true' && session) {
                console.log('Email verification flow detected and session exists');
                this.showSuccess('loginSuccess', 'Email cím sikeresen megerősítve! Most már bejelentkezhetsz.');
                this.showLoginForm();
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            // Removed automatic redirect to index.html to prevent loop
            // User will be redirected after successful login via handleLogin method
            // else if (session && window.location.pathname.includes('auth.html')) {
            //     // If user is already logged in and on auth page, redirect to index
            //     window.location.href = 'index.html';
            // }

            // Listen for auth state changes
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');

                // Removed SIGNED_IN redirect to prevent loop
                // Redirect happens in handleLogin instead
                if (event === 'PASSWORD_RECOVERY') {
                    console.log('Showing password recovery form');
                    this.showResetPasswordForm();
                } else if (event === 'USER_UPDATED') {
                    console.log('User updated');
                    this.showSuccess('loginSuccess', 'Fiók sikeresen frissítve!');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }
            });
        } catch (error) {
            console.error('Error in checkAuthStatus:', error);
        }
    }

    setupPasswordToggle = (buttonId, inputId) => {
        try {
            const toggleButton = document.getElementById(buttonId);
            const passwordInput = document.getElementById(inputId);

            if (!toggleButton || !passwordInput) {
                console.error('Password toggle elements not found:', { buttonId, inputId });
                return;
            }

            toggleButton.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleButton.innerHTML = type === 'password'
                    ? '<i class="fas fa-eye"></i>'
                    : '<i class="fas fa-eye-slash"></i>';
            });
        } catch (error) {
            console.error('Error setting up password toggle:', error);
        }
    };

    showRegisterForm = () => {
        document.getElementById('loginForm')?.classList.add('hidden');
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.classList.remove('hidden');
            registerForm.classList.add('animate-slide-in');
        }
        this.clearErrors();
    };

    showLoginForm = () => {
        document.getElementById('registerForm')?.classList.add('hidden');
        document.getElementById('forgotPasswordForm')?.classList.add('hidden');
        document.getElementById('resetPasswordForm')?.classList.add('hidden');
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.classList.remove('hidden');
            loginForm.classList.add('animate-slide-in');
        }
        this.clearErrors();
    };

    showForgotPasswordForm = () => {
        document.getElementById('loginForm')?.classList.add('hidden');
        document.getElementById('registerForm')?.classList.add('hidden');
        document.getElementById('resetPasswordForm')?.classList.add('hidden');
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) {
            forgotForm.classList.remove('hidden');
            forgotForm.classList.add('animate-slide-in');
        }
        this.clearErrors();
    };

    showResetPasswordForm = () => {
        document.getElementById('loginForm')?.classList.add('hidden');
        document.getElementById('registerForm')?.classList.add('hidden');
        document.getElementById('forgotPasswordForm')?.classList.add('hidden');
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.classList.remove('hidden');
            resetForm.classList.add('animate-slide-in');
        }
        this.clearErrors();
    };

    clearErrors = () => {
        const errorElements = [
            'loginError', 'registerError', 'registerSuccess',
            'forgotPasswordError', 'forgotPasswordSuccess',
            'resetPasswordError', 'resetPasswordSuccess'
        ];
        errorElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.textContent = '';
            }
        });
    };

    showError = (elementId, message) => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        } else {
            console.error('Error element not found:', elementId);
        }
    };

    showSuccess = (elementId, message) => {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.remove('hidden');
        } else {
            console.error('Success element not found:', elementId);
        }
    };

    validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    validatePassword = (password) => {
        return password.length >= 6;
    };

    handleRegister = async () => {
        try {
            this.clearErrors();

            const name = document.getElementById('registerName')?.value.trim() || '';
            const email = document.getElementById('registerEmail')?.value.trim() || '';
            const password = document.getElementById('registerPassword')?.value || '';
            const confirmPassword = document.getElementById('registerConfirmPassword')?.value || '';

            if (!name) {
                this.showError('registerError', 'Kérlek add meg a neved');
                return;
            }
            if (!this.validateEmail(email)) {
                this.showError('registerError', 'Kérlek adj meg egy érvényes email címet');
                return;
            }
            if (!this.validatePassword(password)) {
                this.showError('registerError', 'A jelszónak legalább 6 karakter hosszúnak kell lennie');
                return;
            }
            if (password !== confirmPassword) {
                this.showError('registerError', 'A jelszavak nem egyeznek');
                return;
            }

            console.log('Starting registration process...');
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    },
                    emailRedirectTo: window.location.origin + '/auth.html?verify=true'
                }
            });

            console.log('Registration response:', { data, error });

            if (error) {
                console.error('Registration error:', error);
                this.showError('registerError', error.message);
                return;
            }

            if (data?.user?.identities?.length === 0) {
                this.showError('registerError', 'Ez az email cím már regisztrálva van. Kérlek, jelentkezz be.');
                return;
            }

            this.showSuccess('registerSuccess', 'Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet.');
            setTimeout(() => {
                this.showLoginForm();
                document.getElementById('loginEmail').value = email;
            }, 3000);
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('registerError', 'Hiba történt a regisztráció során');
        }
    };



    handleLogin = async () => {
        try {
            console.log('Starting login process...');
            this.clearErrors();

            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!this.validateEmail(email)) {
                this.showError('loginError', 'Kérlek adj meg egy érvényes email címet');
                return;
            }
            if (!password) {
                this.showError('loginError', 'Kérlek add meg a jelszót');
                return;
            }

            console.log('Attempting to sign in...');
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Login error:', error);
                let errorMessage = 'Hiba történt a bejelentkezés során';
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Hibás email cím vagy jelszó';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Kérlek erősítsd meg az email címedet a regisztráció befejezéséhez';
                }
                this.showError('loginError', errorMessage);
                return;
            }

            if (!data.session) {
                this.showError('loginError', 'Sikertelen bejelentkezés. Kérlek próbáld újra.');
                return;
            }

            console.log('Login successful:', data);
            this.showSuccess('loginSuccess', 'Sikeres bejelentkezés!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('Unexpected error during login:', error);
            this.showError('loginError', 'Váratlan hiba történt. Kérlek, próbáld újra később.');
        }
    };

    handleForgotPassword = async () => {
        this.clearErrors();
        const email = document.getElementById('forgotPasswordEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showError('forgotPasswordError', 'Kérlek adj meg egy érvényes email címet');
            return;
        }

        try {
            console.log('Current URL:', window.location.href);
            console.log('Origin:', window.location.origin);
            console.log('Redirect URL:', window.location.origin + '/auth.html?type=recovery');

            const redirectTo = new URL('/auth.html', window.location.origin).toString();
            console.log('Final redirect URL:', redirectTo);

            console.log('Sending password reset email to:', email);
            const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: redirectTo
            });

            console.log('Reset password response:', { data, error });

            if (error) {
                console.error('Password reset error:', error);
                this.showError('forgotPasswordError', 'Hiba történt a jelszó-visszaállítás során: ' + error.message);
            } else {
                console.log('Password reset email sent successfully');
                this.showSuccess('forgotPasswordSuccess', 'Jelszó-visszaállító linket küldtünk az e-mail címedre. Kérlek, ellenőrizd a leveleidet!');
            }
        } catch (error) {
            console.error('Unexpected error during password reset:', error);
            this.showError('forgotPasswordError', 'Váratlan hiba történt a jelszó-visszaállítás során. Kérlek, próbáld újra később.');
        }
    };

    handlePasswordReset = async () => {
        this.clearErrors();
        const newPassword = document.getElementById('resetPassword').value;

        if (!this.validatePassword(newPassword)) {
            this.showError('resetPasswordError', 'A jelszónak legalább 6 karakter hosszúnak kell lennie');
            return;
        }

        try {
            console.log('Attempting to update password...');
            const { error } = await window.supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error('Password update error:', error);
                this.showError('resetPasswordError', 'Hiba történt a jelszó frissítése során: ' + error.message);
            } else {
                console.log('Password updated successfully');
                this.showSuccess('resetPasswordSuccess', 'A jelszavad sikeresen frissítve! Most már bejelentkezhetsz.');

                // Redirect to login form after a delay
                setTimeout(() => {
                    this.showLoginForm();
                    // Clear the password field for security
                    document.getElementById('resetPassword').value = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Unexpected error during password update:', error);
            this.showError('resetPasswordError', 'Váratlan hiba történt a jelszó frissítése során. Kérlek, próbáld újra később.');
        }
    };


    static async logout() {
        try {
            if (!window.supabaseClient) {
                console.error('Supabase client not initialized');
                throw new Error('Supabase client not initialized');
            }

            console.log('Attempting to sign out...');
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) {
                console.error('Supabase signOut error:', error);
                throw error;
            }
            console.log('Successfully signed out from Supabase');

            // Clear all local storage
            localStorage.clear();
            console.log('Local storage cleared');

            // Force redirect to landing page
            console.log('Redirecting to landing page...');
            window.location.replace('landing.html');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Hiba történt a kijelentkezés során. Kérlek, próbáld újra.');
            throw error;
        }
    }

    static async getCurrentUser() {
        try {
            console.log('Getting current user...');
            const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

            if (sessionError) {
                console.error('Session error:', sessionError);
                return null;
            }

            if (!session) {
                console.log('No active session');
                return null;
            }

            console.log('Session found, fetching profile...');
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                return null;
            }

            // Combine auth user data with profile data
            const userData = { ...session.user, ...profile };
            console.log('User data loaded:', userData);
            return userData;
        } catch (error) {
            console.error('Unexpected error in getCurrentUser:', error);
            return null;
        }
    }

    static async saveUserData(userData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('profiles')
            .update(userData)
            .eq('id', user.id);

        if (error) {
            console.error('Error saving user data:', error);
            return false;
        }
        return true;
    }
}

// Initialize auth manager only on auth.html page
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize AuthManager if we're on the auth.html page
    if (window.location.pathname.includes('auth.html')) {
        const initAuth = () => {
            new AuthManager();
        };

        if (window.supabaseClient) {
            initAuth();
        } else {
            window.addEventListener('supabaseReady', () => {
                initAuth();
            });
        }
    }
});
