<template>
  <div class="dashboard">
    <main class="dashboard-main">
      <Navbar
        @open-settings="showSettings = true"
        @month-changed="handleMonthChange"
      />
      <section class="summary-section">
        <h1 class="dashboard-title">Expense Overview</h1>
        <div class="summary-cards-grid">
          <!-- Card 1: Total Spent -->
          <SummaryCard
            label="Total Spent"
            :value="
              settingsStore.formatCurrency(monthlySummary.currentMonthTotal)
            "
            :trend="
              (monthlySummary.change > 0 ? '+' : '') +
              monthlySummary.change +
              '%'
            "
            :trend-type="monthlySummary.isPositive ? 'positive' : 'negative'"
            description="from last month"
          />

          <!-- Card 2: Budget Remaining - Only show if budget exists for selected month -->
          <SummaryCard
            v-if="monthlySummary.hasBudget"
            label="Budget Remaining"
            :value="
              settingsStore.formatCurrency(
                Math.max(0, monthlySummary.budgetRemaining),
              )
            "
            :trend="
              (monthlySummary.budgetHealthPercentage > 0 ? '+' : '') +
              monthlySummary.budgetHealthPercentage +
              '%'
            "
            :trend-type="
              monthlySummary.budgetHealthPositive ? 'positive' : 'negative'
            "
            description="budget health"
          />

          <!-- Show alternative card if no budget for selected month -->
          <SummaryCard
            v-else
            label="Budget"
            value="Not Set"
            description="Budget not set for this month"
            trend-type="neutral"
          />

          <!-- Card 3: Top Category -->
          <SummaryCard
            label="Top Category"
            :value="topCategoryName"
            :description="topCategory.percentage + '% of total spending'"
          />
        </div>
      </section>

      <section class="expenses-section">
        <h2>Recent Expenses</h2>

        <!-- Custom empty state for past months -->
        <div
          v-if="isPastMonth && filteredExpenses.length === 0"
          class="empty-state"
        >
          <p>No expenses recorded for this month. Past months are view-only.</p>
        </div>

        <!-- Regular expense list for non-empty months -->
        <ExpenseList v-else :expenses="filteredExpenses" />
      </section>
    </main>

    <!-- Hide floating button for past months -->
    <AddExpenseButton v-if="!isPastMonth" @click="showAddExpense = true" />

    <AddExpense
      v-if="showAddExpense"
      @close="showAddExpense = false"
      @save="handleSaveExpense"
    />
    <Settings v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
  import { ref, computed, watch } from "vue";
  import { useExpenseStore } from "@/stores/expense";
  import { useSettingsStore } from "@/stores/settings";
  import { useAuthStore } from "@/stores/auth";
  import Navbar from "./Navbar.vue";
  import SummaryCard from "../cards/SummaryCard.vue";
  import ExpenseList from "../expenses/ExpenseList.vue";
  import AddExpenseButton from "../expenses/AddExpenseButton.vue";
  import AddExpense from "../modals/AddExpense.vue";
  import Settings from "../modals/Settings.vue";

  // Initialize stores
  const expenseStore = useExpenseStore();
  const settingsStore = useSettingsStore();
  const authStore = useAuthStore();

  // Modal states
  const showAddExpense = ref(false);
  const showSettings = ref(false);

  // Current selected month (default to current month)
  const selectedMonth = ref(new Date());

  // Load expenses when authenticated
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) {
        expenseStore.loadExpenses();
      } else {
        expenseStore.clearExpenses();
      }
    },
    { immediate: true },
  );

  // Load expenses when month changes
  watch(selectedMonth, () => {
    if (authStore.isAuthenticated) {
      const year = selectedMonth.value.getFullYear();
      const month = selectedMonth.value.getMonth() + 1;
      expenseStore.loadMonthlySummary(year, month);
    }
  });

  // Check if selected month is in the past
  const isPastMonth = computed(() => {
    const now = new Date();
    const selected = selectedMonth.value;

    // Compare year and month only (ignore days)
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const selectedYear = selected.getFullYear();
    const selectedMonthNum = selected.getMonth() + 1; // 1-12

    // Month is past if its year is less than current year,
    // OR same year but month is less than current month
    return (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonthNum < currentMonth)
    );
  });

  // Check if selected month has a budget
  const hasBudgetForSelectedMonth = computed(() => {
    const yearMonth = selectedMonth.value.toISOString().slice(0, 7); // YYYY-MM
    return settingsStore.hasBudgetForMonth(yearMonth);
  });

  // Get budget for selected month (null if no budget)
  const monthlyBudget = computed(() => {
    const yearMonth = selectedMonth.value.toISOString().slice(0, 7);
    return settingsStore.getBudgetInEUR();
  });

  // Handle month change from navbar
  function handleMonthChange(newDate) {
    selectedMonth.value = newDate;
    console.log(
      "Month changed to:",
      newDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      "Is past month:",
      isPastMonth.value,
    );
  }

  // Filter expenses by selected month
  const filteredExpenses = computed(() => {
    const year = selectedMonth.value.getFullYear();
    const month = selectedMonth.value.getMonth() + 1;

    return expenseStore.expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getFullYear() === year &&
          expenseDate.getMonth() + 1 === month
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  // Get previous month's expenses for comparison
  const previousMonthExpenses = computed(() => {
    const prevMonth = new Date(selectedMonth.value);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth() + 1;

    return expenseStore.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() + 1 === month
      );
    });
  });

  // REAL CALCULATIONS for summary cards
  const monthlySummary = computed(() => {
    const currentTotal = filteredExpenses.value.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const previousTotal = previousMonthExpenses.value.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Calculate percentage change
    let change = 0;
    if (previousTotal > 0) {
      change = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
      change = 100; // First month with spending
    }

    // Calculate budget-related metrics only if budget exists for this month
    let budgetRemaining = null;
    let budgetHealthPercentage = null;
    let budgetHealthPositive = null;

    if (monthlyBudget.value !== null) {
      const budget = monthlyBudget.value;
      budgetRemaining = budget - currentTotal;
      budgetHealthPercentage =
        budget > 0 ? ((budget - currentTotal) / budget) * 100 : 0;
      budgetHealthPositive = budgetRemaining > budget * 0.2; // More than 20% budget left
    }

    return {
      currentMonthTotal: currentTotal,
      previousMonthTotal: previousTotal,
      change: Math.round(change),
      isPositive: currentTotal <= previousTotal,
      budgetRemaining: budgetRemaining,
      budgetHealthPercentage:
        budgetHealthPercentage !== null
          ? Math.round(budgetHealthPercentage)
          : null,
      budgetHealthPositive: budgetHealthPositive,
      hasBudget: monthlyBudget.value !== null,
    };
  });

  // Top category calculation
  const topCategory = computed(() => {
    const filtered = filteredExpenses.value;
    const categories = {};

    filtered.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });

    let top = null;
    let maxAmount = 0;

    for (const [category, amount] of Object.entries(categories)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        top = category;
      }
    }

    const total = monthlySummary.value.currentMonthTotal;

    return {
      category: top,
      amount: maxAmount,
      percentage: total > 0 ? Math.round((maxAmount / total) * 100) : 0,
    };
  });

  // Format category name
  const topCategoryName = computed(() => {
    if (!topCategory.value.category) return "None";

    const categoryMap = {
      dining: "Dining Out",
      transport: "Transport",
      groceries: "Groceries",
      bills: "Bills",
      health: "Health",
      shopping: "Shopping",
      entertainment: "Entertainment",
    };

    return (
      categoryMap[topCategory.value.category] ||
      topCategory.value.category.charAt(0).toUpperCase() +
        topCategory.value.category.slice(1)
    );
  });

  // Handle new expense from modal
  function handleSaveExpense(newExpenseData) {
    // Check if we're trying to add to a past month
    const selectedYear = selectedMonth.value.getFullYear();
    const selectedMonthNum = selectedMonth.value.getMonth() + 1;
    const expenseDate = new Date(newExpenseData.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth() + 1;

    // Only allow if expense date matches selected month
    if (expenseYear === selectedYear && expenseMonth === selectedMonthNum) {
      expenseStore.addExpense(newExpenseData);
      console.log("✅ Expense added via store");
    } else {
      alert(
        "Cannot add expense to a different month than selected. Please select the correct month first.",
      );
    }
  }
</script>

<style scoped>
  .dashboard {
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .dashboard-main {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .dashboard-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
    letter-spacing: -0.025em;
  }

  .summary-section {
    margin-bottom: 3rem;
    margin-top: 50px;
  }

  .summary-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .expenses-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    margin-top: 50px;
  }

  .expenses-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
    font-size: 1rem;
    background: white;
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
    margin-bottom: 1.5rem;
  }
</style>
