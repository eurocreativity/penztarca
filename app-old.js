class FinanceApp {
    constructor() {
        this.expenses = this.safeParseJSON(localStorage.getItem('expenses'), []);
        this.budget = this.safeParseJSON(localStorage.getItem('budget'), 0);
        this.currentEditId = null;
        this.currentLanguage = this.safeParseJSON(localStorage.getItem('language'), 'hu');

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
                deleteConfirm: 'Biztosan törölni szeretnéd ezt a kiadást?',
                invalidAmount: 'Kérlek, adj meg egy érvényes összeget!',
                selectCategoryError: 'Kérlek, válassz egy kategóriát!',
                enterDescription: 'Kérlek, adj meg egy leírást!',
                invalidFileFormat: 'Érvénytelen fájl formátum!',
                importOverwrite: 'Az importálás felülírja a jelenlegi adatokat. Biztosan folytatod?',
                importSuccess: 'Adatok sikeresen importálva!',
                importInvalidFormat: 'Az importált adatok formátuma érvénytelen!',
                importError: 'Hiba történt a fájl beolvasása során! Ellenőrizd a fájl formátumát.',
                saveError: 'Hiba történt az adatok mentése során!'
            },
            en: {
                appTitle: 'Personal Finance Tracker',
                monthlyBudget: 'Monthly Budget',
                monthlyFrame: 'Monthly limit:',
                setBudget: 'Set',
                spending: 'Spending',
                remaining: 'Remaining:',
                todayExpenses: "Today's expenses",
                monthlyAmount: 'Monthly amount',
                newExpense: 'New Expense',
                amount: 'Amount ($)',
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
                noFilteredExpenses: 'No expenses match the selected filters',
                noChartData: 'No data available',
                actualSpending: 'Actual spending',
                plannedBudget: 'Planned budget',
                deleteConfirm: 'Are you sure you want to delete this expense?',
                invalidAmount: 'Please enter a valid amount!',
                selectCategoryError: 'Please select a category!',
                enterDescription: 'Please enter a description!',
                invalidFileFormat: 'Invalid file format!',
                importOverwrite: 'Import will overwrite current data. Are you sure you want to continue?',
                importSuccess: 'Data imported successfully!',
                importInvalidFormat: 'Invalid import data format!',
                importError: 'Error reading file! Please check the file format.',
                saveError: 'Error saving data!'
            }
        };

        this.categoryNames = {
            hu: {
                food: 'Élelmiszer',
                transport: 'Közlekedés',
                entertainment: 'Szórakozás',
                bills: 'Számlák',
                other: 'Egyéb'
            },
            en: {
                food: 'Food',
                transport: 'Transport',
                entertainment: 'Entertainment',
                bills: 'Bills',
                other: 'Other'
            }
        };

        this.categoryColors = {
            food: '#f59e0b',
            transport: '#d97706',
            entertainment: '#b45309',
            bills: '#ef4444',
            other: '#92400e'
        };

        this.init();
    }

    safeParseJSON(item, defaultValue) {
        try {
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('JSON parsing failed:', error);
            return defaultValue;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    init() {
        this.setupEventListeners();
        this.loadDarkMode();
        this.loadLanguage();
        this.updateBudgetDisplay();
        this.updateExpensesList();
        this.updateCharts();
        this.updateQuickStats();
        this.setTodayDate();
    }

    setupEventListeners() {
        document.getElementById('setBudgetBtn').addEventListener('click', () => this.setBudget());
        document.getElementById('expenseForm').addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('languageSelector').addEventListener('change', (e) => this.changeLanguage(e.target.value));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('change', (e) => this.importData(e));
        document.getElementById('showAllExpenses').addEventListener('click', () => this.showAllExpensesModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('filterCategory').addEventListener('change', () => this.filterExpenses());
        document.getElementById('filterMonth').addEventListener('change', () => this.filterExpenses());

        document.getElementById('expensesModal').addEventListener('click', (e) => {
            if (e.target.id === 'expensesModal') {
                this.closeModal();
            }
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    }

    setBudget() {
        const budgetInput = document.getElementById('monthlyBudget');
        const amount = parseFloat(budgetInput.value);

        if (isNaN(amount) || amount <= 0) {
            alert(this.t('invalidAmount'));
            return;
        }

        this.budget = amount;
        this.saveExpenses();
        this.updateBudgetDisplay();
        budgetInput.value = '';
    }

    updateBudgetDisplay() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyExpenses = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);

        const remaining = this.budget - monthlyExpenses;
        const percentage = this.budget > 0 ? (monthlyExpenses / this.budget) * 100 : 0;

        document.getElementById('budgetProgress').textContent =
            `${this.formatCurrency(monthlyExpenses)} / ${this.formatCurrency(this.budget)}`;
        document.getElementById('remainingBudget').textContent = this.formatCurrency(remaining);
        document.getElementById('budgetPercentage').textContent = `${Math.round(percentage)}%`;

        const budgetBar = document.getElementById('budgetBar');
        budgetBar.style.width = `${Math.min(percentage, 100)}%`;

        if (percentage > 100) {
            budgetBar.classList.remove('bg-primary-500');
            budgetBar.classList.add('bg-red-500');
        } else if (percentage > 80) {
            budgetBar.classList.remove('bg-primary-500', 'bg-red-500');
            budgetBar.classList.add('bg-yellow-500');
        } else {
            budgetBar.classList.remove('bg-red-500', 'bg-yellow-500');
            budgetBar.classList.add('bg-primary-500');
        }
    }

    handleExpenseSubmit(e) {
        e.preventDefault();

        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value.trim();
        const date = document.getElementById('expenseDate').value;

        if (isNaN(amount) || amount <= 0) {
            alert(this.t('invalidAmount'));
            return;
        }

        if (!category) {
            alert(this.t('selectCategoryError'));
            return;
        }

        if (!description) {
            alert(this.t('enterDescription'));
            return;
        }

        const expense = {
            id: this.currentEditId || Date.now(),
            amount,
            category,
            description,
            date,
            timestamp: new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.expenses.findIndex(exp => exp.id === this.currentEditId);
            this.expenses[index] = expense;
            this.currentEditId = null;
        } else {
            this.expenses.unshift(expense);
        }

        this.saveExpenses();
        this.updateAll();
        this.resetForm();
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseDate').value = expense.date;

        this.currentEditId = id;

        const submitBtn = document.querySelector('#expenseForm button[type="submit"]');
        submitBtn.innerHTML = `<i class="fas fa-edit mr-2"></i>${this.t('editExpense')}`;

        document.getElementById('expenseAmount').focus();
    }

    deleteExpense(id) {
        if (confirm(this.t('deleteConfirm'))) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.updateAll();
        }
    }

    updateExpensesList() {
        const container = document.getElementById('recentExpensesList');
        const recentExpenses = this.expenses.slice(0, 5);

        container.innerHTML = '';

        if (recentExpenses.length === 0) {
            const emptyMessage = this.createElement('p', 'text-gray-500 dark:text-gray-400 text-center py-4', this.t('noExpenses'));
            container.appendChild(emptyMessage);
            return;
        }

        recentExpenses.forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'flex-1';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'flex items-center space-x-2';

            const descriptionSpan = this.createElement('span', 'text-sm font-medium text-gray-900 dark:text-white', expense.description);
            const categorySpan = this.createElement('span', 'px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full', this.getCurrentCategoryNames()[expense.category]);

            headerDiv.appendChild(descriptionSpan);
            headerDiv.appendChild(categorySpan);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'flex items-center space-x-2 mt-1';

            const amountSpan = this.createElement('span', 'text-lg font-semibold text-red-600 dark:text-red-400', this.formatCurrency(expense.amount));
            const dateSpan = this.createElement('span', 'text-sm text-gray-500 dark:text-gray-400', this.formatDate(expense.date));

            detailsDiv.appendChild(amountSpan);
            detailsDiv.appendChild(dateSpan);

            contentDiv.appendChild(headerDiv);
            contentDiv.appendChild(detailsDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex space-x-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => this.editExpense(expense.id));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => this.deleteExpense(expense.id));

            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);

            expenseDiv.appendChild(contentDiv);
            expenseDiv.appendChild(buttonsDiv);

            container.appendChild(expenseDiv);
        });
    }

    showAllExpensesModal() {
        document.getElementById('expensesModal').classList.remove('hidden');
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterMonth').value = '';
        this.updateAllExpensesList();
    }

    closeModal() {
        document.getElementById('expensesModal').classList.add('hidden');
    }

    updateAllExpensesList() {
        const container = document.getElementById('allExpensesList');
        let filteredExpenses = [...this.expenses];

        const categoryFilter = document.getElementById('filterCategory').value;
        const monthFilter = document.getElementById('filterMonth').value;

        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        }

        if (monthFilter) {
            const [year, month] = monthFilter.split('-');
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() == year && (expenseDate.getMonth() + 1) == month;
            });
        }

        container.innerHTML = '';

        if (filteredExpenses.length === 0) {
            const emptyMessage = this.createElement('p', 'text-gray-500 dark:text-gray-400 text-center py-8', this.t('noFilteredExpenses'));
            container.appendChild(emptyMessage);
            return;
        }

        filteredExpenses.forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'flex-1';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'flex items-center space-x-2';

            const descriptionSpan = this.createElement('span', 'font-medium text-gray-900 dark:text-white', expense.description);
            const categorySpan = this.createElement('span', 'px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full', this.getCurrentCategoryNames()[expense.category]);

            headerDiv.appendChild(descriptionSpan);
            headerDiv.appendChild(categorySpan);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'flex items-center space-x-4 mt-2';

            const amountSpan = this.createElement('span', 'text-xl font-semibold text-red-600 dark:text-red-400', this.formatCurrency(expense.amount));
            const dateSpan = this.createElement('span', 'text-sm text-gray-500 dark:text-gray-400', this.formatDate(expense.date));

            detailsDiv.appendChild(amountSpan);
            detailsDiv.appendChild(dateSpan);

            contentDiv.appendChild(headerDiv);
            contentDiv.appendChild(detailsDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex space-x-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => {
                this.editExpense(expense.id);
                this.closeModal();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => this.deleteExpense(expense.id));

            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);

            expenseDiv.appendChild(contentDiv);
            expenseDiv.appendChild(buttonsDiv);

            container.appendChild(expenseDiv);
        });
    }

    filterExpenses() {
        this.updateAllExpensesList();
    }

    updateQuickStats() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const todayStr = today.toISOString().split('T')[0];

        const todayExpenses = this.expenses
            .filter(expense => expense.date === todayStr)
            .reduce((total, expense) => total + expense.amount, 0);

        const monthlyExpenses = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);

        document.getElementById('todayExpenses').textContent = this.formatCurrency(todayExpenses);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(monthlyExpenses);
    }

    updateCharts() {
        // Properly cleanup existing charts to prevent memory leaks
        if (this.categoryChart) {
            this.categoryChart.destroy();
            this.categoryChart = null;
        }
        if (this.trendChart) {
            this.trendChart.destroy();
            this.trendChart = null;
        }
        this.updateCategoryChart();
        this.updateTrendChart();
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');

        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const categoryTotals = {};
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const data = Object.keys(this.categoryNames.hu).map(key => ({
            category: key,
            amount: categoryTotals[key] || 0
        })).filter(item => item.amount > 0);

        if (data.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'center';
            ctx.fillText(this.t('noChartData'), ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => this.getCurrentCategoryNames()[item.category]),
                datasets: [{
                    data: data.map(item => item.amount),
                    backgroundColor: data.map(item => this.categoryColors[item.category]),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');

        if (this.trendChart) {
            this.trendChart.destroy();
        }

        const last6Months = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last6Months.push({
                month: date.getMonth(),
                year: date.getFullYear(),
                label: date.toLocaleDateString(this.currentLanguage === 'en' ? 'en-US' : 'hu-HU', { month: 'short', year: 'numeric' })
            });
        }

        const monthlyData = last6Months.map(monthInfo => {
            const monthlyTotal = this.expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getMonth() === monthInfo.month &&
                           expenseDate.getFullYear() === monthInfo.year;
                })
                .reduce((total, expense) => total + expense.amount, 0);

            return {
                label: monthInfo.label,
                amount: monthlyTotal,
                budget: this.budget
            };
        });

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(item => item.label),
                datasets: [{
                    label: this.t('actualSpending'),
                    data: monthlyData.map(item => item.amount),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: this.t('plannedBudget'),
                    data: monthlyData.map(item => item.budget),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                        }
                    }
                }
            }
        });
    }

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        try {
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        } catch (error) {
            console.warn('Failed to save dark mode setting:', error);
        }

        setTimeout(() => {
            this.updateCharts();
        }, 100);
    }

    loadDarkMode() {
        try {
            const isDark = localStorage.getItem('darkMode') === 'true';
            if (isDark) {
                document.documentElement.classList.add('dark');
            }
        } catch (error) {
            console.warn('Failed to load dark mode setting:', error);
        }
    }

    loadLanguage() {
        try {
            document.getElementById('languageSelector').value = this.currentLanguage;
            this.updateLanguage();
        } catch (error) {
            console.warn('Failed to load language setting:', error);
        }
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        try {
            localStorage.setItem('language', JSON.stringify(language));
        } catch (error) {
            console.warn('Failed to save language setting:', error);
        }
        this.updateLanguage();
        this.updateAll();
    }

    t(key) {
        try {
            return this.languages[this.currentLanguage]?.[key] ||
                   this.languages['hu']?.[key] ||
                   `[Missing: ${key}]`;
        } catch (error) {
            console.warn(`Translation error for key: ${key}`, error);
            return key;
        }
    }

    getCurrentCategoryNames() {
        return this.categoryNames[this.currentLanguage] || this.categoryNames['hu'];
    }

    formatCurrency(amount) {
        if (this.currentLanguage === 'en') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(amount);
        } else {
            return new Intl.NumberFormat('hu-HU', {
                style: 'currency',
                currency: 'HUF',
                minimumFractionDigits: 0
            }).format(amount);
        }
    }

    updateLanguage() {
        // Batch DOM updates for better performance
        requestAnimationFrame(() => {
            document.title = this.t('appTitle');
            document.documentElement.lang = this.currentLanguage;

            const elementsToUpdate = [
                { selector: 'h1', textKey: 'appTitle' },
                { selector: '[data-lang="export"]', textKey: 'export' },
                { selector: '[data-lang="import"]', textKey: 'import' }
            ];

            elementsToUpdate.forEach(({ selector, textKey }) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = this.t(textKey);
                }
            });

            this.updateFormLanguage();
            this.updateStaticTextElements();
        });
    }

    updateFormLanguage() {
        const categorySelects = ['expenseCategory', 'filterCategory'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '';

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = selectId === 'filterCategory' ? this.t('allCategories') : this.t('selectCategory');
                select.appendChild(defaultOption);

                const categories = this.getCurrentCategoryNames();
                Object.keys(categories).forEach(key => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = categories[key];
                    select.appendChild(option);
                });

                select.value = currentValue;
            }
        });
    }

    updateStaticTextElements() {
        const elementsWithDataLang = document.querySelectorAll('[data-lang]');
        elementsWithDataLang.forEach(element => {
            const langKey = element.getAttribute('data-lang');
            if (langKey) {
                element.textContent = this.t(langKey);
            }
        });

        const submitButton = document.querySelector('#expenseForm button[type="submit"] span[data-lang]');
        if (submitButton) {
            const parent = submitButton.parentElement;
            parent.innerHTML = `<i class="fas fa-plus mr-2"></i>${this.t('addExpense')}`;
        }
    }

    exportData() {
        const data = {
            expenses: this.expenses,
            budget: this.budget,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `penztarca_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.expenses && Array.isArray(data.expenses)) {
                    const isValidData = this.validateImportData(data);
                    if (!isValidData) {
                        alert(this.t('importInvalidFormat'));
                        return;
                    }

                    if (confirm(this.t('importOverwrite'))) {
                        this.expenses = data.expenses;
                        this.budget = typeof data.budget === 'number' ? data.budget : 0;
                        this.saveExpenses();
                        this.updateAll();
                        alert(this.t('importSuccess'));
                    }
                } else {
                    alert(this.t('invalidFileFormat'));
                }
            } catch (error) {
                console.error('Import error:', error);
                alert(this.t('importError'));
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    validateImportData(data) {
        if (!data.expenses || !Array.isArray(data.expenses)) return false;

        const validCategories = Object.keys(this.categoryNames.hu); // Use Hungarian as base reference for validation
        return data.expenses.every(expense =>
            expense &&
            typeof expense.amount === 'number' &&
            typeof expense.category === 'string' &&
            typeof expense.description === 'string' &&
            typeof expense.date === 'string' &&
            validCategories.includes(expense.category)
        );
    }

    formatDate(dateString) {
        const locale = this.currentLanguage === 'en' ? 'en-US' : 'hu-HU';
        return new Date(dateString).toLocaleDateString(locale);
    }

    resetForm() {
        document.getElementById('expenseForm').reset();
        this.setTodayDate();
        this.currentEditId = null;

        const submitBtn = document.querySelector('#expenseForm button[type="submit"]');
        submitBtn.innerHTML = `<i class="fas fa-plus mr-2"></i>${this.t('addExpense')}`;
    }

    saveExpenses() {
        try {
            localStorage.setItem('expenses', JSON.stringify(this.expenses));
            localStorage.setItem('budget', JSON.stringify(this.budget));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
            alert(this.t('saveError'));
        }
    }

    updateAll() {
        this.updateBudgetDisplay();
        this.updateExpensesList();
        this.updateCharts();
        this.updateQuickStats();
        this.updateAllExpensesList();
    }
}

// Export for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceApp;
} else {
    // Browser environment - create app instance
    const app = new FinanceApp();
}