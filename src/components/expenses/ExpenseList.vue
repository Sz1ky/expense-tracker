<template>
  <div class="expense-list">
    <!-- Empty state -->
    <div v-if="expenses.length === 0" class="empty-state">
      <p>No expenses yet. Add your first expense!</p>
    </div>

    <!-- List of expenses -->
    <div v-else class="expenses-container">
      <ExpenseItem
        v-for="expense in expenses"
        :key="expense.id"
        :expense="expense"
      />
    </div>
  </div>
</template>

<script setup>
  import ExpenseItem from "./ExpenseItem.vue";

  defineProps({
    expenses: {
      type: Array,
      required: true,
      default: () => [],
    },
  });
</script>

<style scoped>
  .expense-list {
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
    font-size: 1rem;
    background: white;
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
  }

  .expenses-container {
    display: flex;
    flex-direction: column;
  }
</style>
