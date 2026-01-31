<template>
  <div class="dashboard">
    <main class="dashboard-main">
      <Navbar />
      <!-- Summary Cards Section -->
      <section class="summary-section">
        <h1 class="dashboard-title">Expense Overview</h1>
        <div class="summary-cards-grid">
          <!-- Card 1: Total Spent -->
          <SummaryCard
            label="Total Spent"
            value="€2,450.00"
            trend="-5%"
            :trend-type="'negative'"
            description="from last month"
          />

          <!-- Card 2: Budget Remaining -->
          <SummaryCard
            label="Budget Remaining"
            value="€1,550.00"
            trend="+12%"
            :trend-type="'positive'"
            description="budget health"
          />

          <!-- Card 3: Top Category -->
          <SummaryCard
            label="Top Category"
            value="Dining Out"
            description="32% of total spending"
          />
        </div>
      </section>

      <!-- Expense List Section -->
      <section class="expenses-section">
        <h2>Recent Expenses</h2>
        <ExpenseList :expenses="expensesData" />
      </section>
    </main>

    <!-- Floating Action Button -->
    <AddExpenseButton @click="showAddExpense = true" />

    <!-- Add Expense Modal -->
    <AddExpense
      v-if="showAddExpense"
      @close="showAddExpense = false"
      @save="handleSaveExpense"
    />
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import Navbar from "./Navbar.vue";
  import SummaryCard from "../cards/SummaryCard.vue";
  import ExpenseList from "../expenses/ExpenseList.vue";
  import AddExpenseButton from "../expenses/AddExpenseButton.vue";
  import AddExpense from "../modals/AddExpense.vue";

  const showAddExpense = ref(false);

  const expensesData = ref([
    {
      id: 1,
      name: "Starbucks",
      date: "Jan 24, 2026",
      category: "dining",
      amount: 8.75,
    },
    {
      id: 2,
      name: "Uber Trip",
      date: "Jan 22, 2026",
      category: "transport",
      amount: 24.5,
    },
    {
      id: 3,
      name: "Whole Foods",
      date: "Jan 21, 2026",
      category: "groceries",
      amount: 86.3,
    },
    {
      id: 4,
      name: "ConEd Utilities",
      date: "Jan 19, 2026",
      category: "bills",
      amount: 120.0,
    },
    {
      id: 5,
      name: "Equinox Gym",
      date: "Jan 15, 2026",
      category: "health",
      amount: 250.0,
    },
  ]);

  // Handle new expense from modal
  function handleSaveExpense(newExpenseData) {
    // Create a new expense object
    const newExpense = {
      id: expensesData.value.length + 1,
      name: newExpenseData.note || "Unnamed Expense",
      date: formatExpenseDate(newExpenseData.date),
      category: newExpenseData.category,
      amount: newExpenseData.amount,
    };

    // Add to the beginning of the array (most recent first)
    expensesData.value.unshift(newExpense);

    console.log("✅ Expense added:", newExpense);

    // In real app:
    // 1. Send to API
    // 2. Update summary cards
    // 3. Refresh data
  }

  // Format date
  function formatExpenseDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
