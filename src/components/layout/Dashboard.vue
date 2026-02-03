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
          <!-- Card 1: Total Spent with REAL change percentage -->
          <SummaryCard
            label="Total Spent"
            :value="'€' + monthlySummary.currentMonthTotal.toFixed(2)"
            :trend="
              (monthlySummary.change > 0 ? '+' : '') +
              monthlySummary.change +
              '%'
            "
            :trend-type="monthlySummary.isPositive ? 'positive' : 'negative'"
            description="from last month"
          />

          <!-- Card 2: Budget Remaining with REAL budget health -->
          <SummaryCard
            label="Budget Remaining"
            :value="
              '€' + Math.max(0, monthlySummary.budgetRemaining).toFixed(2)
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
        <ExpenseList :expenses="filteredExpenses" />
      </section>
    </main>

    <AddExpenseButton @click="showAddExpense = true" />
    <AddExpense
      v-if="showAddExpense"
      @close="showAddExpense = false"
      @save="handleSaveExpense"
    />
    <Settings v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
  import { ref, computed } from "vue";
  import { useExpenseStore } from "@/stores/expense";
  import Navbar from "./Navbar.vue";
  import SummaryCard from "../cards/SummaryCard.vue";
  import ExpenseList from "../expenses/ExpenseList.vue";
  import AddExpenseButton from "../expenses/AddExpenseButton.vue";
  import AddExpense from "../modals/AddExpense.vue";
  import Settings from "../modals/Settings.vue";

  // Initialize stores
  const expenseStore = useExpenseStore();

  // Modal states
  const showAddExpense = ref(false);
  const showSettings = ref(false);

  // Current selected month (default to current month)
  const selectedMonth = ref(new Date());

  // User's monthly budget (from settings/store)
  const monthlyBudget = ref(3000); // Default, later from settings

  // Handle month change from navbar
  function handleMonthChange(newDate) {
    selectedMonth.value = newDate;
    console.log(
      "Month changed to:",
      newDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
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

    // Calculate budget usage percentage
    const budgetUsage =
      monthlyBudget.value > 0 ? (currentTotal / monthlyBudget.value) * 100 : 0;
    const budgetRemaining = monthlyBudget.value - currentTotal;

    // Budget health: positive if spending less than 80% of budget
    const budgetHealthPercentage =
      monthlyBudget.value > 0
        ? ((monthlyBudget.value - currentTotal) / monthlyBudget.value) * 100
        : 0;

    return {
      currentMonthTotal: currentTotal,
      previousMonthTotal: previousTotal,
      change: Math.round(change),
      isPositive: currentTotal <= previousTotal, // Spending less than last month is positive
      budgetRemaining: budgetRemaining,
      budgetHealthPercentage: Math.round(budgetHealthPercentage),
      budgetHealthPositive: budgetRemaining > monthlyBudget.value * 0.2, // More than 20% budget left
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
    expenseStore.addExpense(newExpenseData);
    console.log("✅ Expense added via store");
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
</style>
