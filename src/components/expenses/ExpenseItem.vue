<template>
  <div class="expense-item">
    <!-- Left: Category + Info -->
    <div class="expense-left">
      <!-- Category indicator (colored dot) -->
      <div class="category-indicator" :class="categoryClass"></div>

      <div class="expense-info">
        <div class="expense-name">{{ expense.name }}</div>
        <div class="expense-category">
          {{ formatCategory(expense.category) }}
        </div>
      </div>
    </div>

    <!-- Right: Date + Amount -->
    <div class="expense-right">
      <div class="expense-date">{{ expense.date }}</div>
      <div class="expense-amount">€{{ formatAmount(expense.amount) }}</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from "vue";

  const props = defineProps({
    expense: {
      type: Object,
      required: true,
    },
  });

  // Category styling based on type
  const categoryClass = computed(() => {
    return `category-${props.expense.category.toLowerCase()}`;
  });

  // Format amount with 2 decimals
  function formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }

  // Format category name (capitalize, etc.)
  function formatCategory(category) {
    // Convert 'groceries' → 'Groceries', 'dining' → 'Dining'
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
</script>

<style scoped>
  .expense-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    transition:
      background-color 0.2s,
      transform 0.2s;
    border: 1px solid #f1f5f9;
  }

  .expense-item:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
    border-color: #e2e8f0;
  }

  .expense-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .category-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Category colors */
  .category-dining {
    background-color: #ef4444;
  }

  .category-transport {
    background-color: #3b82f6;
  }

  .category-groceries {
    background-color: #10b981;
  }

  .category-bills {
    background-color: #8b5cf6;
  }

  .category-health {
    background-color: #ec4899;
  }

  .expense-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .expense-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 1rem;
  }

  .expense-category {
    font-size: 0.875rem;
    color: #64748b;
  }

  .expense-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .expense-date {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .expense-amount {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.125rem;
  }
</style>
