<template>
  <div class="dashboard">
    <main class="dashboard-main">
      <Navbar />
      <!-- Summary Cards... -->

      <!-- Expense List Section -->
      <section class="expenses-section">
        <h2>Recent Expenses</h2>
        <ExpenseList :expenses="expensesData" />
      </section>
    </main>
  </div>
</template>
<script setup>
  import Navbar from "./Navbar.vue";
  import ExpenseList from "../expenses/ExpenseList.vue";

  const expensesData = [
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
  ];
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
