class FinanceApp {
    constructor() {
        if (window.app) {
            return window.app;
        }

        this.currentUser = null;
        this.expenses = [];
        this.budget = 0;
        this.categories = [];
        this.currentEditId = null;
        this.currentLanguage = 'hu';

        this.languages = {
            hu: {
                appTitle: 'Pénzügyi Nyilvántartó',
                monthlyBudget: 'Havi Költségvetés',
                monthlyFrame: 'Havi keret:',
                setBudget: 'Beállít',
                spending: 'Költés',
                remaining: 'Maradék:',
                todayExpenses: 'Mai kiadások',
                monthlyAmount: 'Havi összeg',
                newExpense: 'Új Kiadás',
                amount: 'Összeg (Ft)',
                category: 'Kategória',
                description: 'Leírás',
                date: 'Dátum',
                addExpense: 'Kiadás Hozzáadása',
                editExpense: 'Kiadás Módosítása',
                recentExpenses: 'Legutóbbi Kiadások',
                viewAll: 'Összes megtekintése',
                categoryChart: 'Kiadások Kategóriánként',
                monthlyTrend: 'Havi Trend',
                allExpenses: 'Összes Kiadás',
                allCategories: 'Minden kategória',
                export: 'Export',
                import: 'Import',
                selectCategory: 'Válassz kategóriát',
                noExpenses: 'Még nincsenek kiadások',
                noFilteredExpenses: 'Nincsenek kiadások a megadott szűrőkkel',
                noChartData: 'Nincsenek adatok',
                actualSpending: 'Tényleges költés',
                plannedBudget: 'Tervezett költségvetés',
                income: 'Bevétel',
                deleteConfirm: 'Biztosan törölni szeretnéd ezt a kiadást?',
                invalidAmount: 'Kérlek, adj meg egy érvényes összeget!',
                selectCategoryError: 'Kérlek, válassz egy kategóriát!',
                enterDescription: 'Kérlek, adj meg egy leírást!',
                invalidFileFormat: 'Érvénytelen fájl formátum!',
                importOverwrite: 'Az importálás felülírja a jelenlegi adatokat. Biztosan folytatod?',
                importSuccess: 'Adatok sikeresen importálva!',
                importInvalidFormat: 'Az importált adatok formátuma érvénytelen!',
                importError: 'Hiba történt a fájl beolvasása során! Ellenőrizd a fájl formátumát.',
                saveError: 'Hiba történt az adatok mentése során!',
                logout: 'Kilépés',
                welcome: 'Üdvözlet',
                categories: 'Kategóriák',
                manageCategories: 'Kategóriák kezelése',
                addCategory: 'Új kategória',
                editCategory: 'Kategória szerkesztése',
                categoryName: 'Kategória neve',
                categoryColor: 'Szín',
                categoryIcon: 'Ikon',
                saveCategory: 'Mentés',
                deleteCategory: 'Törlés',
                cancelEdit: 'Mégse'
            },
            en: {
                appTitle: 'Finance Tracker',
                monthlyBudget: 'Monthly Budget',
                monthlyFrame: 'Monthly limit:',
                setBudget: 'Set',
                spending: 'Spending',
                remaining: 'Remaining:',
                todayExpenses: 'Today\'s expenses',
                monthlyAmount: 'Monthly amount',
                newExpense: 'New Expense',
                amount: 'Amount (HUF)',
                category: 'Category',
                description: 'Description',
                date: 'Date',
                addExpense: 'Add Expense',
                editExpense: 'Edit Expense',
                recentExpenses: 'Recent Expenses',
                viewAll: 'View all',
                categoryChart: 'Expenses by Category',
                monthlyTrend: 'Monthly Trend',
                allExpenses: 'All Expenses',
                allCategories: 'All categories',
                export: 'Export',
                import: 'Import',
                selectCategory: 'Select category',
                noExpenses: 'No expenses yet',
                noFilteredExpenses: 'No expenses match the filters',
                noChartData: 'No data',
                actualSpending: 'Actual spending',
                plannedBudget: 'Planned budget',
                income: 'Income',
                deleteConfirm: 'Are you sure you want to delete this expense?',
                invalidAmount: 'Please enter a valid amount!',
                selectCategoryError: 'Please select a category!',
                enterDescription: 'Please enter a description!',
                invalidFileFormat: 'Invalid file format!',
                importOverwrite: 'Import will overwrite current data. Continue?',
                importSuccess: 'Data imported successfully!',
                importInvalidFormat: 'Invalid import data format!',
                importError: 'Error reading file! Check the file format.',
                saveError: 'Error saving data!',
                logout: 'Logout',
                welcome: 'Welcome',
                categories: 'Categories',
                manageCategories: 'Manage Categories',
                addCategory: 'Add Category',
                editCategory: 'Edit Category',
                categoryName: 'Category Name',
                categoryColor: 'Color',
                categoryIcon: 'Icon',
                saveCategory: 'Save',
                deleteCategory: 'Delete',
                cancelEdit: 'Cancel'
            }
        };

        this.init();
    }

    async init() {
        try {
            console.log('Initializing app...');

            // Wait a moment for Supabase to fully initialize
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check authentication
            const { data: { session }, error: authError } = await window.supabaseClient.auth.getSession();

            console.log('Auth check result:', {
                hasSession: !!session,
                userId: session?.user?.id,
                error: authError
            });

            if (authError) {
                console.error('Auth error:', authError);
                window.location.href = 'auth.html';
                return;
            }

            if (!session) {
                console.log('No authenticated session, redirecting to auth.html...');
                window.location.href = 'auth.html';
                return;
            }

            // Get user data
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is OK for new users
                console.error('Profile error:', profileError);
                window.location.href = 'auth.html';
                return;
            }

            // If profile doesn't exist, create it
            if (!profile || profileError?.code === 'PGRST116') {
                console.log('Profile not found, creating new profile...');

                const profileData = {
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email,
                    budget: 0,
                    language: 'hu'
                };

                console.log('Creating profile with data:', profileData);

                const { data: newProfile, error: createError } = await window.supabaseClient
                    .from('profiles')
                    .insert(profileData)
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating profile:', createError);
                    alert(`Profil létrehozási hiba: ${createError.message}`);
                    window.location.href = 'auth.html';
                    return;
                }

                console.log('Profile created successfully:', newProfile);
                this.currentUser = { ...session.user, ...newProfile };

                // Initialize default categories for new user
                await this.ensureCategories();
            } else {
                this.currentUser = { ...session.user, ...profile };
            }
            console.log('Current user:', this.currentUser);

            // Load user data
            console.log('Loading user data...');
            await this.loadUserData();

            // Setup UI
            console.log('Setting up UI...');
            this.setupEventListeners();
            this.updateLanguage();
            this.updateUI();
            this.setupDarkMode();

            // Force header update
            this.updateUserHeader();

            // Subscribe to auth changes
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    window.location.href = 'auth.html';
                }
            });

            console.log('Initialization complete');
        } catch (error) {
            console.error('Error during initialization:', error);
            window.location.href = 'auth.html';
        }
    }

    async checkAuth() {
        try {
            const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

            if (sessionError) {
                console.error('Session error:', sessionError);
                throw sessionError;
            }

            if (!session) {
                window.location.href = 'landing.html';
                return;
            }

            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error('Profile error:', profileError);
                throw profileError;
            }

            this.currentUser = { ...session.user, ...profile };
            this.updateUserHeader();
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'landing.html';
        }
    }

    updateUserHeader() {
        const headerTitle = document.querySelector('[data-lang="appTitle"]');
        if (headerTitle && this.currentUser) {
            headerTitle.textContent = `${this.getText('welcome')}, ${this.currentUser.name.split(' ')[0]}!`;
        }

        // Find or create header actions container
        let headerActions = document.querySelector('header .flex.items-center.space-x-4');
        if (!headerActions) {
            // If container doesn't exist, create it
            const header = document.querySelector('header .flex.justify-between.items-center');
            if (header) {
                // Find existing buttons container or create new one
                headerActions = header.querySelector('.flex.items-center.space-x-4') || document.createElement('div');
                headerActions.className = 'flex items-center space-x-4';
                header.appendChild(headerActions);
            }
        }

        if (headerActions) {
            // Add category management button if it doesn't exist
            if (!document.getElementById('manageCategoriesBtn')) {
                const manageCategoriesBtn = document.createElement('button');
                manageCategoriesBtn.id = 'manageCategoriesBtn';
                manageCategoriesBtn.className = 'px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';
                manageCategoriesBtn.innerHTML = `<i class="fas fa-tags mr-2"></i><span data-lang="manageCategories">${this.getText('manageCategories')}</span>`;
                manageCategoriesBtn.addEventListener('click', () => {
                    this.showCategoryManager();
                });
                // Insert at the beginning
                headerActions.insertBefore(manageCategoriesBtn, headerActions.firstChild);
            }

            // Add logout button if it doesn't exist
            if (!document.getElementById('logoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'px-6 py-3 bg-gradient-to-r from-warm-500 to-warm-600 text-white rounded-xl hover:from-warm-600 hover:to-warm-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold';
                logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i><span data-lang="logout">${this.getText('logout')}</span>`;
                logoutBtn.addEventListener('click', async () => {
                    if (confirm('Biztosan kilépsz?')) {
                        try {
                            await AuthManager.logout();
                        } catch (error) {
                            console.error('Hiba történt a kijelentkezés során:', error);
                        }
                    }
                });
                // Append at the end for visibility
                headerActions.appendChild(logoutBtn);
            }
        }
    }

    async loadUserData() {
        if (this.currentUser) {
            try {
                console.log('Loading user data from Supabase...');

                // 1. Load Profile (Budget, Language)
                const { data: profile, error: profileError } = await window.supabaseClient
                    .from('profiles')
                    .select('budget, language')
                    .eq('id', this.currentUser.id)
                    .single();

                if (profileError) throw profileError;

                this.budget = profile.budget || 0;
                this.currentLanguage = profile.language || 'hu';

                // 2. Load Categories
                this.categories = await this.ensureCategories();

                // 3. Load Expenses
                const { data: expenses, error: expensesError } = await window.supabaseClient
                    .from('expenses')
                    .select('*')
                    .eq('user_id', this.currentUser.id)
                    .order('date', { ascending: false });

                if (expensesError) throw expensesError;

                // Map expenses to match app structure
                this.expenses = expenses.map(e => ({
                    id: e.id,
                    amount: e.amount,
                    category: e.category_id,
                    description: e.description,
                    date: e.date,
                    timestamp: e.created_at
                }));

                console.log('User data loaded successfully');
            } catch (error) {
                console.error('Failed to load user data:', error);
                // Set default values if loading fails
                this.expenses = [];
                this.budget = 0;
                this.categories = this.getDefaultCategories(); // Fallback
                this.currentLanguage = 'hu';
            }
        }
    }

    async ensureCategories() {
        try {
            let { data: categories, error } = await window.supabaseClient
                .from('categories')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('id', { ascending: true });

            if (error) throw error;

            if (!categories || categories.length === 0) {
                console.log('No categories found, creating defaults...');
                const defaults = this.getDefaultCategories().map(c => ({
                    user_id: this.currentUser.id,
                    name: c.name,
                    color: c.color,
                    icon: c.icon
                }));

                const { data: newCategories, error: insertError } = await window.supabaseClient
                    .from('categories')
                    .insert(defaults)
                    .select();

                if (insertError) throw insertError;
                categories = newCategories;
            }

            return categories;
        } catch (error) {
            console.error('Error ensuring categories:', error);
            return [];
        }
    }

    getDefaultCategories() {
        return [
            // Expense categories
            { id: 'food', name: 'Élelmiszer', color: '#f59e0b', icon: 'fas fa-utensils', type: 'expense' },
            { id: 'transport', name: 'Közlekedés', color: '#3b82f6', icon: 'fas fa-car', type: 'expense' },
            { id: 'entertainment', name: 'Szórakozás', color: '#8b5cf6', icon: 'fas fa-gamepad', type: 'expense' },
            { id: 'bills', name: 'Számlák', color: '#ef4444', icon: 'fas fa-file-invoice', type: 'expense' },
            { id: 'other', name: 'Egyéb', color: '#6b7280', icon: 'fas fa-ellipsis-h', type: 'expense' },
            // Income categories
            { id: 'salary', name: 'Fizetés', color: '#10b981', icon: 'fas fa-money-bill-wave', type: 'income' },
            { id: 'bonus', name: 'Prémium', color: '#34d399', icon: 'fas fa-award', type: 'income' },
            { id: 'freelance', name: 'Megbízás', color: '#6ee7b7', icon: 'fas fa-laptop-code', type: 'income' },
            { id: 'other_income', name: 'Egyéb bevétel', color: '#a7f3d0', icon: 'fas fa-hand-holding-usd', type: 'income' }
        ];
    }

    setupEventListeners() {
        // Budget form
        document.getElementById('setBudgetBtn').addEventListener('click', async () => {
            await this.setBudget();
        });

        // Expense form
        document.getElementById('expenseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            try {
                await this.addOrUpdateExpense();
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });

        // Transaction type listener for filtering categories
        this.setupTransactionTypeListener();

        // Language selector
        document.getElementById('languageSelector').addEventListener('change', async (e) => {
            this.currentLanguage = e.target.value;
            await this.saveLanguage();
            this.updateLanguage();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Show all expenses
        document.getElementById('showAllExpenses').addEventListener('click', () => {
            this.showAllExpensesModal();
        });

        // Modal close button
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeExpensesModal();
        });

        // Close modal on backdrop click
        document.getElementById('expensesModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'expensesModal') {
                this.closeExpensesModal();
            }
        });

        // Filter change handlers
        document.getElementById('filterCategory')?.addEventListener('change', () => {
            this.renderAllExpenses();
        });

        document.getElementById('filterMonth')?.addEventListener('change', () => {
            this.renderAllExpenses();
        });
    }

    // Category Management Methods
    showCategoryManager() {
        this.createCategoryManagerModal();
    }

    createCategoryManagerModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('categoryManagerModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'categoryManagerModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 dark:border-stone-600">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white" data-lang="manageCategories">${this.getText('manageCategories')}</h2>
                        <button id="closeCategoryManager" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <button id="addNewCategoryBtn" class="mb-6 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg">
                        <i class="fas fa-plus mr-2"></i><span data-lang="addCategory">${this.getText('addCategory')}</span>
                    </button>
                    <div id="categoriesList"></div>
                    <div id="categoryEditForm" class="hidden mt-6 p-4 bg-gray-50 dark:bg-stone-700 rounded-xl">
                        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white" data-lang="editCategory">${this.getText('editCategory')}</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-lang="categoryName">${this.getText('categoryName')}</label>
                                <input type="text" id="categoryNameInput" class="w-full px-3 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-stone-600 dark:text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-lang="categoryColor">${this.getText('categoryColor')}</label>
                                <input type="color" id="categoryColorInput" class="w-16 h-10 border border-gray-300 dark:border-stone-600 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-lang="categoryIcon">${this.getText('categoryIcon')}</label>
                                <select id="categoryIconInput" class="w-full px-3 py-2 border border-gray-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-stone-600 dark:text-white">
                                    <option value="fas fa-utensils">🍽️ Étkezés</option>
                                    <option value="fas fa-car">🚗 Közlekedés</option>
                                    <option value="fas fa-gamepad">🎮 Szórakozás</option>
                                    <option value="fas fa-file-invoice">📄 Számlák</option>
                                    <option value="fas fa-shopping-cart">🛒 Vásárlás</option>
                                    <option value="fas fa-home">🏠 Otthon</option>
                                    <option value="fas fa-medkit">🏥 Egészség</option>
                                    <option value="fas fa-graduation-cap">🎓 Oktatás</option>
                                    <option value="fas fa-plane">✈️ Utazás</option>
                                    <option value="fas fa-ellipsis-h">📝 Egyéb</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Típus</label>
                                <div class="flex space-x-4">
                                    <label class="flex items-center">
                                        <input type="radio" name="categoryType" value="expense" class="mr-2" checked>
                                        <span>Kiadás</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="categoryType" value="income" class="mr-2">
                                        <span>Bevétel</span>
                                    </label>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button id="saveCategoryBtn" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                    <span data-lang="saveCategory">${this.getText('saveCategory')}</span>
                                </button>
                                <button id="cancelCategoryBtn" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                    <span data-lang="cancelEdit">${this.getText('cancelEdit')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupCategoryManagerEvents();
        this.renderCategoriesList();
    }

    setupCategoryManagerEvents() {
        // Close modal
        document.getElementById('closeCategoryManager').addEventListener('click', () => {
            document.getElementById('categoryManagerModal').remove();
        });

        // Add new category
        document.getElementById('addNewCategoryBtn').addEventListener('click', () => {
            this.showCategoryEditForm();
        });

        // Save category
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveCategory();
        });

        // Cancel edit
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
            this.hideCategoryEditForm();
        });

        // Close modal on backdrop click
        document.getElementById('categoryManagerModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryManagerModal') {
                document.getElementById('categoryManagerModal').remove();
            }
        });
    }

    renderCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';

        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'flex items-center justify-between p-4 bg-white dark:bg-stone-600 rounded-lg shadow mb-3';
            categoryItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: ${category.color}20">
                        <i class="${category.icon}" style="color: ${category.color}"></i>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">${category.name}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="financeApp.editCategory('${category.id}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="financeApp.deleteCategory('${category.id}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            categoriesList.appendChild(categoryItem);
        });
    }

    showCategoryEditForm(category = null) {
        const form = document.getElementById('categoryEditForm');
        form.classList.remove('hidden');

        if (category) {
            document.getElementById('categoryNameInput').value = category.name;
            document.getElementById('categoryColorInput').value = category.color;
            document.getElementById('categoryIconInput').value = category.icon;
            // Set type radio buttons
            const typeRadios = document.getElementsByName('categoryType');
            typeRadios.forEach(radio => {
                radio.checked = (radio.value === (category.type || 'expense'));
            });
            form.setAttribute('data-editing', category.id);
        } else {
            document.getElementById('categoryNameInput').value = '';
            document.getElementById('categoryColorInput').value = '#f59e0b';
            document.getElementById('categoryIconInput').value = 'fas fa-ellipsis-h';
            // Default to expense type
            const typeRadios = document.getElementsByName('categoryType');
            typeRadios.forEach(radio => {
                radio.checked = (radio.value === 'expense');
            });
            form.removeAttribute('data-editing');
        }
    }

    hideCategoryEditForm() {
        document.getElementById('categoryEditForm').classList.add('hidden');
    }

    async saveCategory() {
        const form = document.getElementById('categoryEditForm');
        const editingId = form.getAttribute('data-editing');
        const name = document.getElementById('categoryNameInput').value.trim();
        const color = document.getElementById('categoryColorInput').value;
        const icon = document.getElementById('categoryIconInput').value;
        const type = document.querySelector('input[name="categoryType"]:checked').value;

        if (!name) {
            alert('Kérlek add meg a kategória nevét!');
            return;
        }

        try {
            const categoryData = {
                user_id: this.currentUser.id,
                name,
                color,
                icon,
                type
            };

            if (editingId) {
                // Edit existing category
                const { error } = await window.supabaseClient
                    .from('categories')
                    .update(categoryData)
                    .eq('id', editingId);

                if (error) throw error;

                // Update local state
                const index = this.categories.findIndex(c => c.id == editingId);
                if (index !== -1) {
                    this.categories[index] = { ...this.categories[index], ...categoryData };
                }
            } else {
                // Add new category
                const { data, error } = await window.supabaseClient
                    .from('categories')
                    .insert(categoryData)
                    .select()
                    .single();

                if (error) throw error;

                this.categories.push(data);
            }

            this.hideCategoryEditForm();
            this.renderCategoriesList();
            this.updateCategorySelectors();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(this.getText('saveError'));
        }
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            this.showCategoryEditForm(category);
        }
    }

    async deleteCategory(categoryId) {
        // Check if category is used in expenses
        const isUsed = this.expenses.some(expense => expense.category == categoryId);

        if (isUsed) {
            alert('Ezt a kategóriát nem lehet törölni, mert használatban van!');
            return;
        }

        if (confirm('Biztosan törölni szeretnéd ezt a kategóriát?')) {
            try {
                const { error } = await window.supabaseClient
                    .from('categories')
                    .delete()
                    .eq('id', categoryId);

                if (error) throw error;

                this.categories = this.categories.filter(c => c.id != categoryId);
                this.renderCategoriesList();
                this.updateCategorySelectors();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert(this.getText('saveError'));
            }
        }
    }

    async saveLanguage() {
        try {
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ language: this.currentLanguage })
                .eq('id', this.currentUser.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error saving language:', error);
        }
    }

    updateCategorySelectors() {
        const selectors = document.querySelectorAll('#expenseCategory, #filterCategory');
        selectors.forEach(selector => {
            const currentValue = selector.value;
            selector.innerHTML = '';

            if (selector.id === 'filterCategory') {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = this.getText('allCategories');
                selector.appendChild(option);
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = this.getText('selectCategory');
                selector.appendChild(option);
            }

            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                selector.appendChild(option);
            });

            selector.value = currentValue;
        });
    }

    // Rest of the existing methods with authentication integration...
    async setBudget() {
        const budgetInput = document.getElementById('monthlyBudget');
        const amount = parseFloat(budgetInput.value);

        if (isNaN(amount) || amount < 0) {
            alert(this.getText('invalidAmount'));
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ budget: amount })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            this.budget = amount;
            this.updateBudgetDisplay();
            budgetInput.value = '';
        } catch (error) {
            console.error('Error saving budget:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            alert(`Hiba mentés közben: ${error.message || error.error_description || 'Ismeretlen hiba'}`);
        }
    }

    async addOrUpdateExpense() {
        const amountInput = document.getElementById('expenseAmount');
        const categorySelect = document.getElementById('expenseCategory');
        const descriptionInput = document.getElementById('expenseDescription');
        const dateInput = document.getElementById('expenseDate');

        const amount = parseFloat(amountInput.value);
        const categoryId = parseInt(categorySelect.value); // Ensure numeric ID
        const description = descriptionInput.value.trim();
        const date = dateInput.value;

        // Validation
        if (isNaN(amount) || amount <= 0) {
            alert(this.getText('invalidAmount'));
            return;
        }

        if (!categoryId) {
            alert(this.getText('selectCategoryError'));
            return;
        }

        if (!description) {
            alert(this.getText('enterDescription'));
            return;
        }

        if (!date) {
            alert('Kérlek válassz dátumot!');
            return;
        }

        try {
            const expenseData = {
                user_id: this.currentUser.id,
                amount: amount,
                category_id: categoryId,
                description: description,
                date: date
            };

            if (this.currentEditId) {
                // Update existing expense
                const { error } = await window.supabaseClient
                    .from('expenses')
                    .update(expenseData)
                    .eq('id', this.currentEditId);

                if (error) throw error;

                // Update local state
                const index = this.expenses.findIndex(exp => exp.id === this.currentEditId);
                if (index !== -1) {
                    this.expenses[index] = {
                        ...this.expenses[index],
                        amount,
                        category: categoryId,
                        description,
                        date
                    };
                }
                this.currentEditId = null;
            } else {
                // Add new expense
                const { data, error } = await window.supabaseClient
                    .from('expenses')
                    .insert(expenseData)
                    .select()
                    .single();

                if (error) throw error;

                // Add to local list
                this.expenses.push({
                    id: data.id,
                    amount: data.amount,
                    category: data.category_id,
                    description: data.description,
                    date: data.date,
                    timestamp: data.created_at
                });
            }

            // Clear form
            amountInput.value = '';
            categorySelect.value = '';
            descriptionInput.value = '';
            dateInput.value = '';

            // Update UI
            this.updateUI();

            // Show success message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg';
            messageDiv.textContent = this.currentLanguage === 'hu' ? 'Kiadás sikeresen mentve!' : 'Expense saved successfully!';
            document.body.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 3000);

        } catch (error) {
            console.error('Error saving expense:', error);
            const errorMessage = this.currentLanguage === 'hu'
                ? 'Hiba történt a kiadás mentése során. Kérlek, próbáld újra.'
                : 'Error saving expense. Please try again.';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg';
            errorDiv.textContent = errorMessage;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    calculateBalance() {
        const totalIncome = this.expenses
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = this.expenses
            .filter(t => t.type === 'expense' || !t.type) // Handle legacy data without type
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        // Update UI
        const balanceElement = document.getElementById('currentBalance');
        const incomeElement = document.getElementById('totalIncome');

        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(balance);
            // Add color indication for balance
            balanceElement.className = `text-xl font-semibold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`;
        }

        if (incomeElement) {
            incomeElement.textContent = this.formatCurrency(totalIncome);
        }
    }

    updateUI() {
        this.calculateBalance();
        this.updateBudgetDisplay();
        this.updateQuickStats();
        this.updateRecentExpenses();
        this.updateCharts();
        this.updateCategorySelectors();
    }

    updateBudgetDisplay() {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthlyExpenses = this.expenses
                .filter(expense =>
                    expense.date.startsWith(currentMonth) &&
                    (expense.type === 'expense' || !expense.type)
                )
                .reduce((sum, expense) => sum + expense.amount, 0);

            const progressElement = document.getElementById('budgetProgress');
            const barElement = document.getElementById('budgetBar');
            const remainingElement = document.getElementById('remainingBudget');
            const percentageElement = document.getElementById('budgetPercentage');

            if (!progressElement || !barElement || !remainingElement || !percentageElement) {
                console.error('Required budget display elements not found');
                return;
            }

            const remaining = this.budget - monthlyExpenses;
            const percentage = this.budget > 0 ? (monthlyExpenses / this.budget) * 100 : 0;

            // Update display elements
            progressElement.textContent = `${this.formatCurrency(monthlyExpenses)} / ${this.formatCurrency(this.budget)}`;
            remainingElement.textContent = this.formatCurrency(remaining);
            percentageElement.textContent = `${Math.round(percentage)}%`;
            barElement.style.width = `${Math.min(percentage, 100)}%`;

            // Update bar color based on percentage
            let colorClass = '';
            if (percentage <= 50) {
                colorClass = 'bg-gradient-to-r from-green-500 to-green-600';
            } else if (percentage <= 80) {
                colorClass = 'bg-gradient-to-r from-yellow-500 to-yellow-600';
            } else {
                colorClass = 'bg-gradient-to-r from-red-500 to-red-600';
            }

            // Update classes without removing transition and shape classes
            barElement.className = `${colorClass} h-4 rounded-full transition-all duration-500 shadow-sm`;

            // Show floating notification if over budget
            if (percentage > 100 && !document.getElementById('budgetWarning')) {
                const warning = document.createElement('div');
                warning.id = 'budgetWarning';
                warning.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
                warning.textContent = this.currentLanguage === 'hu' ? 'Túllépted a havi keretet!' : 'You have exceeded your monthly budget!';
                document.body.appendChild(warning);
                setTimeout(() => {
                    if (warning && warning.parentNode) {
                        warning.remove();
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Error updating budget display:', error);
        }
    }

    updateQuickStats() {
        const today = new Date().toISOString().slice(0, 10);
        const currentMonth = new Date().toISOString().slice(0, 7);

        const todayExpenses = this.expenses
            .filter(expense =>
                expense.date === today &&
                (expense.type === 'expense' || !expense.type)
            )
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyExpenses = this.expenses
            .filter(expense =>
                expense.date.startsWith(currentMonth) &&
                (expense.type === 'expense' || !expense.type)
            )
            .reduce((sum, expense) => sum + expense.amount, 0);

        document.getElementById('todayExpenses').textContent = this.formatCurrency(todayExpenses);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(monthlyExpenses);
    }

    updateRecentExpenses() {
        const recentList = document.getElementById('recentExpensesList');
        const recentExpenses = this.expenses
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        if (recentExpenses.length === 0) {
            recentList.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-8">${this.getText('noExpenses')}</div>`;
            return;
        }

        recentList.innerHTML = recentExpenses.map(expense => {
            const category = this.categories.find(c => c.id === expense.category);
            const isIncome = expense.type === 'income';
            const amountClass = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-warm-600 dark:text-warm-400';
            const sign = isIncome ? '+' : '';

            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-stone-700 rounded-xl hover:shadow-md transition-all duration-300">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: ${category?.color || '#6b7280'}20">
                            <i class="${category?.icon || 'fas fa-ellipsis-h'}" style="color: ${category?.color || '#6b7280'}"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${expense.description}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${category?.name || 'Ismeretlen'} • ${this.formatDate(expense.date)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold ${amountClass}">${sign}${this.formatCurrency(expense.amount)}</span>
                        <button onclick="financeApp.editExpense(${expense.id})" class="text-blue-500 hover:text-blue-700 p-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="financeApp.deleteExpense(${expense.id})" class="text-red-500 hover:text-red-700 p-1">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateTrendChart();
    }

    updateCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.categoryChartInstance) {
            this.categoryChartInstance.destroy();
        }

        const categoryTotals = {};
        this.expenses
            .filter(expense => expense.type === 'expense' || !expense.type)
            .forEach(expense => {
                const category = this.categories.find(c => c.id === expense.category);
                const categoryName = category?.name || 'Ismeretlen';
                categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
            });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = labels.map(label => {
            const category = this.categories.find(c => c.name === label);
            return category?.color || '#6b7280';
        });

        if (data.length === 0) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');

        this.categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                        }
                    }
                }
            }
        });
    }

    updateTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        // Destroy existing chart
        if (this.trendChartInstance) {
            this.trendChartInstance.destroy();
        }

        // Get last 6 months data
        const monthlyData = this.getMonthlyData();
        const labels = monthlyData.map(item => item.month);
        const expenseData = monthlyData.map(item => item.expenses);
        const incomeData = monthlyData.map(item => item.income);
        const budgetData = monthlyData.map(() => this.budget);

        const ctx = canvas.getContext('2d');
        const isDark = document.documentElement.classList.contains('dark');

        this.trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: this.getText('actualSpending'),
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: this.getText('income'),
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: this.getText('plannedBudget'),
                    data: budgetData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: isDark ? '#fff' : '#374151'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280'
                        },
                        grid: {
                            color: isDark ? '#374151' : '#e5e7eb'
                        }
                    },
                    y: {
                        ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            callback: function (value) {
                                return new Intl.NumberFormat('hu-HU', {
                                    style: 'currency',
                                    currency: 'HUF',
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        },
                        grid: {
                            color: isDark ? '#374151' : '#e5e7eb'
                        }
                    }
                }
            }
        });
    }

    getMonthlyData() {
        const months = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });

            const monthlyExpenses = this.expenses
                .filter(expense =>
                    expense.date.startsWith(monthKey) &&
                    (expense.type === 'expense' || !expense.type)
                )
                .reduce((sum, expense) => sum + expense.amount, 0);

            const monthlyIncome = this.expenses
                .filter(expense =>
                    expense.date.startsWith(monthKey) &&
                    expense.type === 'income'
                )
                .reduce((sum, expense) => sum + expense.amount, 0);

            months.push({
                month: monthName,
                expenses: monthlyExpenses,
                income: monthlyIncome
            });
        }

        return months;
    }

    editExpense(expenseId) {
        const expense = this.expenses.find(exp => exp.id === expenseId);
        if (!expense) return;

        this.currentEditId = expenseId;

        // Fill form with expense data
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseDate').value = expense.date;

        // Update button text
        const submitBtn = document.querySelector('#expenseForm button[type="submit"] span');
        submitBtn.textContent = this.getText('editExpense');

        // Scroll to form
        document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth' });
    }
    async deleteExpense(expenseId) {
        if (confirm(this.getText('deleteConfirm'))) {
            try {
                const { error } = await window.supabaseClient
                    .from('expenses')
                    .delete()
                    .eq('id', expenseId);

                if (error) throw error;

                this.expenses = this.expenses.filter(e => e.id !== expenseId);
                this.updateUI();
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert(this.getText('saveError'));
            }
        }
    }

    showAllExpensesModal() {
        const modal = document.getElementById('expensesModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderAllExpenses();
        }
    }

    closeExpensesModal() {
        const modal = document.getElementById('expensesModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    renderAllExpenses() {
        const allExpensesList = document.getElementById('allExpensesList');
        if (!allExpensesList) return;

        const filterCategory = document.getElementById('filterCategory')?.value || '';
        const filterMonth = document.getElementById('filterMonth')?.value || '';

        let filteredExpenses = [...this.expenses];

        // Filter by category
        if (filterCategory) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category == filterCategory);
        }

        // Filter by month
        if (filterMonth) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date.startsWith(filterMonth));
        }

        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredExpenses.length === 0) {
            allExpensesList.innerHTML = `<div class="text-center text-gray-500 dark:text-gray-400 py-8">${filterCategory || filterMonth ? this.getText('noFilteredExpenses') : this.getText('noExpenses')}</div>`;
            return;
        }

        allExpensesList.innerHTML = filteredExpenses.map(expense => {
            const category = this.categories.find(c => c.id === expense.category);
            const isIncome = expense.type === 'income';
            const amountClass = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-warm-600 dark:text-warm-400';
            const sign = isIncome ? '+' : '';

            return `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-stone-700 rounded-xl hover:shadow-md transition-all duration-300">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background-color: ${category?.color || '#6b7280'}20">
                            <i class="${category?.icon || 'fas fa-ellipsis-h'}" style="color: ${category?.color || '#6b7280'}"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${expense.description}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${category?.name || 'Ismeretlen'} • ${this.formatDate(expense.date)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold ${amountClass}">${sign}${this.formatCurrency(expense.amount)}</span>
                        <button onclick="financeApp.editExpense(${expense.id})" class="text-blue-500 hover:text-blue-700 p-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="financeApp.deleteExpense(${expense.id})" class="text-red-500 hover:text-red-700 p-1">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    exportData() {
        const data = {
            expenses: this.expenses,
            budget: this.budget,
            categories: this.categories,
            exportDate: new Date().toISOString(),
            user: this.currentUser.email
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `penztarca-${this.currentUser.email}-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert(this.getText('invalidFileFormat'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.expenses || !Array.isArray(data.expenses)) {
                    alert(this.getText('importInvalidFormat'));
                    return;
                }

                if (confirm(this.getText('importOverwrite'))) {
                    this.expenses = data.expenses;
                    this.budget = data.budget || 0;
                    if (data.categories) {
                        this.categories = data.categories;
                    }

                    this.saveUserData();
                    this.updateUI();
                    alert(this.getText('importSuccess'));
                }
            } catch (error) {
                alert(this.getText('importError'));
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    }

    updateLanguage() {
        // Update language selector
        document.getElementById('languageSelector').value = this.currentLanguage;

        // Update all text elements
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const text = this.getText(key);
            if (text) {
                element.textContent = text;
            }
        });

        this.updateCategorySelectors();
        this.updateCharts(); // Refresh charts with new language
    }

    getText(key) {
        return this.languages[this.currentLanguage]?.[key] || key;
    }

    setupDarkMode() {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.documentElement.classList.add('dark');
        }
    }

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);

        // Update charts with new theme
        setTimeout(() => {
            this.updateCharts();
        }, 100);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('hu-HU', {
            style: 'currency',
            currency: 'HUF',
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('hu-HU');
    }

    safeParseJSON(value, defaultValue) {
        try {
            return value ? JSON.parse(value) : defaultValue;
        } catch {
            return defaultValue;
        }
    }
}



// Set today's date as default
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }
});

// Initialize app
