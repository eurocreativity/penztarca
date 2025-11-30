class AuthManager {
    constructor() {
        console.log('AuthManager constructor called');

        // Initialize ToastManager for notifications
        this.toastManager = new ToastManager();

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

        // Only setup form listeners if we're on the auth page
        const isAuthPage = window.location.pathname.includes('auth.html') ||
                          document.getElementById('loginFormElement');

        if (isAuthPage) {
            this.setupEventListeners();
        }

        this.checkAuthStatus();
    }

    setupEventListeners() {
        console.log('Setting up auth page event listeners...');

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
                try {
                    await this.handleLogin();
                } catch (error) {
                    console.error('Login error:', error);
                    this.hideLoadingOverlay();
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
                try {
                    await this.handleRegister();
                } catch (error) {
                    console.error('Registration error:', error);
                    this.hideLoadingOverlay();
                }
            });
        } else {
            console.error('registerFormElement not found');
        }

        document.getElementById('forgotPasswordFormElement')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Forgot password form submitted');
            try {
                await this.handleForgotPassword();
            } catch (error) {
                console.error('Password reset error:', error);
                this.hideLoadingOverlay();
            }
        });

        document.getElementById('resetPasswordFormElement')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Reset password form submitted');
            try {
                await this.handlePasswordReset();
            } catch (error) {
                console.error('Password reset error:', error);
                this.hideLoadingOverlay();
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
            this.showLoadingOverlay('Munkamenet ellenőrzése...');

            const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

            this.hideLoadingOverlay();

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
            this.hideLoadingOverlay();
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

    // Loading state management
    /**
     * Show loading overlay with message
     * @param {string} message - Message to display in loading overlay
     * @param {number} minDisplayTime - Minimum time to display spinner (default: 300ms)
     */
    showLoadingOverlay = (message = 'Betöltés...', minDisplayTime = 300) => {
        const overlay = document.getElementById('loadingOverlay');
        const loadingMessage = document.getElementById('loadingMessage');
        if (overlay && loadingMessage) {
            loadingMessage.textContent = message;
            overlay.classList.remove('hidden');
            overlay.classList.add('fade-in');
            overlay.dataset.showTime = Date.now();
            overlay.dataset.minDisplayTime = minDisplayTime;
        }
    };

    /**
     * Hide loading overlay with minimum display time
     * @param {number} minDisplayTime - Minimum time to display spinner (default: 300ms)
     */
    hideLoadingOverlay = (minDisplayTime = 300) => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const showTime = overlay.dataset.showTime ? parseInt(overlay.dataset.showTime) : Date.now();
            const elapsedTime = Date.now() - showTime;
            const delayTime = Math.max(0, minDisplayTime - elapsedTime);
            
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.classList.remove('fade-in');
                    overlay.classList.add('hidden');
                    overlay.classList.remove('fade-out');
                    delete overlay.dataset.showTime;
                    delete overlay.dataset.minDisplayTime;
                }, 300);
            }, delayTime);
        }
    };

    /**
     * Set button to loading state with spinner
     * @param {HTMLElement} button - Button element to set loading state
     * @param {boolean} isLoading - True to enable loading, false to disable
     * @param {string} originalText - Optional original text to restore
     */
    setButtonLoading = (button, isLoading, originalText = null) => {
        if (!button) return;

        if (isLoading) {
            button.setAttribute('data-loading', 'true');
            button.disabled = true;
            if (!button.dataset.originalText && originalText) {
                button.dataset.originalText = originalText;
            } else if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
        } else {
            button.removeAttribute('data-loading');
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
    };

    /**
     * Show loading overlay with fade animation
     * @param {string} message - Message to display
     */
    showLoadingWithAnimation = (message = 'Betöltés...') => {
        this.showLoadingOverlay(message);
    };

    /**
     * Hide loading overlay with fade animation
     */
    hideLoadingWithAnimation = () => {
        this.hideLoadingOverlay();
    };

    /**
     * Set button group loading state
     * @param {string} buttonSelector - CSS selector for buttons
     * @param {boolean} isLoading - Loading state
     */
    setButtonGroupLoading = (buttonSelector, isLoading) => {
        const buttons = document.querySelectorAll(buttonSelector);
        buttons.forEach(button => {
            this.setButtonLoading(button, isLoading);
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

            // Show loading state
            const registerForm = document.getElementById('registerFormElement');
            const submitButton = registerForm?.querySelector('button[type="submit"]');
            this.setButtonLoading(submitButton, true, submitButton?.textContent);
            this.showLoadingOverlay('Regisztráció folyamatban...');

            console.log('Starting registration process...');

            // Use production URL for email confirmation
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const redirectUrl = isLocalhost
                ? 'https://penztarca.netlify.app/auth.html?verify=true'
                : window.location.origin + '/auth.html?verify=true';

            this.showLoadingOverlay('Ellenőrzési email küldése...');

            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    },
                    emailRedirectTo: redirectUrl
                }
            });

            console.log('Registration response:', { data, error });

            if (error) {
                console.error('Registration error:', error);
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('registerError', error.message);
                return;
            }

            if (data?.user?.identities?.length === 0) {
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('registerError', 'Ez az email cím már regisztrálva van. Kérlek, jelentkezz be.');
                return;
            }

            this.hideLoadingOverlay();
            this.showSuccess('registerSuccess', 'Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet.');
            setTimeout(() => {
                this.showLoginForm();
                document.getElementById('loginEmail').value = email;
            }, 3000);
        } catch (error) {
            console.error('Registration error:', error);
            const registerForm = document.getElementById('registerFormElement');
            const submitButton = registerForm?.querySelector('button[type="submit"]');
            this.hideLoadingOverlay();
            this.setButtonLoading(submitButton, false);
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

            // Show loading state
            const loginForm = document.getElementById('loginFormElement');
            const submitButton = loginForm?.querySelector('button[type="submit"]');
            this.setButtonLoading(submitButton, true, submitButton?.textContent);
            this.showLoadingOverlay('Bejelentkezés folyamatban...');

            console.log('Attempting to sign in...');
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Login error:', error);
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
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
                console.error('No session returned from signIn');
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('loginError', 'Sikertelen bejelentkezés. Kérlek próbáld újra.');
                return;
            }

            console.log('Login successful:', data);
            this.showLoadingOverlay('Munkamenet ellenőrzése...');

            // Wait longer for session to be fully persisted
            console.log('Waiting for session to persist...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verify session exists with retry
            let verifySession = null;
            let retryCount = 0;
            while (!verifySession && retryCount < 3) {
                const result = await window.supabaseClient.auth.getSession();
                verifySession = result.data?.session;
                console.log(`Session verification attempt ${retryCount + 1}/3:`, {
                    hasSession: !!verifySession,
                    userId: verifySession?.user?.id
                });
                if (!verifySession && retryCount < 2) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                retryCount++;
            }

            if (verifySession) {
                console.log('✅ Session verified, redirecting to index.html');
                this.showLoadingOverlay('Átirányítás...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            } else {
                console.error('❌ Session not found after login and retries');
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('loginError', 'Sikertelen bejelentkezés. Kérlek próbáld újra vagy töröld a böngésző cache-t.');
            }
        } catch (error) {
            console.error('Unexpected error during login:', error);
            const loginForm = document.getElementById('loginFormElement');
            const submitButton = loginForm?.querySelector('button[type="submit"]');
            this.hideLoadingOverlay();
            this.setButtonLoading(submitButton, false);
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
            // Show loading state
            const forgotForm = document.getElementById('forgotPasswordFormElement');
            const submitButton = forgotForm?.querySelector('button[type="submit"]');
            this.setButtonLoading(submitButton, true, submitButton?.textContent);
            this.showLoadingOverlay('Jelszó-visszaállítást küldésben...');

            // Use production URL for password reset
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const redirectTo = isLocalhost
                ? 'https://penztarca.netlify.app/auth.html'
                : new URL('/auth.html', window.location.origin).toString();

            console.log('Current URL:', window.location.href);
            console.log('Origin:', window.location.origin);
            console.log('Final redirect URL:', redirectTo);

            console.log('Sending password reset email to:', email);
            const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: redirectTo
            });

            console.log('Reset password response:', { data, error });

            if (error) {
                console.error('Password reset error:', error);
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('forgotPasswordError', 'Hiba történt a jelszó-visszaállítás során: ' + error.message);
            } else {
                console.log('Password reset email sent successfully');
                this.hideLoadingOverlay();
                this.showSuccess('forgotPasswordSuccess', 'Jelszó-visszaállító linket küldtünk az e-mail címedre. Kérlek, ellenőrizd a leveleidet!');
                // Clear the form after success
                setTimeout(() => {
                    document.getElementById('forgotPasswordEmail').value = '';
                    this.setButtonLoading(submitButton, false);
                }, 2000);
            }
        } catch (error) {
            console.error('Unexpected error during password reset:', error);
            const forgotForm = document.getElementById('forgotPasswordFormElement');
            const submitButton = forgotForm?.querySelector('button[type="submit"]');
            this.hideLoadingOverlay();
            this.setButtonLoading(submitButton, false);
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
            // Show loading state
            const resetForm = document.getElementById('resetPasswordFormElement');
            const submitButton = resetForm?.querySelector('button[type="submit"]');
            this.setButtonLoading(submitButton, true, submitButton?.textContent);
            this.showLoadingOverlay('Jelszó frissítése...');

            console.log('Attempting to update password...');
            const { error } = await window.supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error('Password update error:', error);
                this.hideLoadingOverlay();
                this.setButtonLoading(submitButton, false);
                this.showError('resetPasswordError', 'Hiba történt a jelszó frissítése során: ' + error.message);
            } else {
                console.log('Password updated successfully');
                this.hideLoadingOverlay();
                this.showSuccess('resetPasswordSuccess', 'A jelszavad sikeresen frissítve! Most már bejelentkezhetsz.');

                // Redirect to login form after a delay
                setTimeout(() => {
                    this.showLoginForm();
                    // Clear the password field for security
                    document.getElementById('resetPassword').value = '';
                    this.setButtonLoading(submitButton, false);
                }, 3000);
            }
        } catch (error) {
            console.error('Unexpected error during password update:', error);
            const resetForm = document.getElementById('resetPasswordFormElement');
            const submitButton = resetForm?.querySelector('button[type="submit"]');
            this.hideLoadingOverlay();
            this.setButtonLoading(submitButton, false);
            this.showError('resetPasswordError', 'Váratlan hiba történt a jelszó frissítése során. Kérlek, próbáld újra később.');
        }
    };


    static async logout() {
        try {
            if (!window.supabaseClient) {
                console.error('Supabase client not initialized');
                throw new Error('Supabase client not initialized');
            }

            // Show loading overlay
            const overlay = document.getElementById('loadingOverlay');
            const loadingMessage = document.getElementById('loadingMessage');
            if (overlay && loadingMessage) {
                loadingMessage.textContent = 'Kijelentkezés...';
                overlay.classList.remove('hidden');
            }

            console.log('Attempting to sign out...');
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) {
                console.error('Supabase signOut error:', error);
                if (overlay) overlay.classList.add('hidden');
                throw error;
            }
            console.log('Successfully signed out from Supabase');

            // Clear all local storage
            localStorage.clear();
            console.log('Local storage cleared');

            // Force redirect to landing page
            console.log('Redirecting to landing page...');
            if (loadingMessage) {
                loadingMessage.textContent = 'Átirányítás...';
            }
            setTimeout(() => {
                window.location.replace('landing.html');
            }, 500);
        } catch (error) {
            console.error('Error during logout:', error);
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) overlay.classList.add('hidden');
            // Use toastManager if available, otherwise fallback to alert
            if (window.app && window.app.toastManager) {
                window.app.toastManager.showError(window.app.getText('logoutError'));
            } else {
                alert('Hiba történt a kijelentkezés során. Kérlek, próbáld újra.');
            }
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

    /**
     * Helper method for displaying toast notifications
     * Provides easy access to ToastManager from anywhere in AuthManager
     */
    toast(message, type = 'info', duration) {
        return this.toastManager.showToast(message, type, duration);
    }

    /**
     * Show success toast
     */
    showSuccess(message, duration = 3000) {
        return this.toastManager.showSuccess(message, duration);
    }

    /**
     * Show error toast
     */
    showError(message, duration = 5000) {
        return this.toastManager.showError(message, duration);
    }

    /**
     * Show warning toast
     */
    showWarning(message, duration = 4000) {
        return this.toastManager.showWarning(message, duration);
    }

    /**
     * Show info toast
     */
    showInfo(message, duration = 3000) {
        return this.toastManager.showInfo(message, duration);
    }
}

// Initialize auth manager
// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
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
});
