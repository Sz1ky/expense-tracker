import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useExpenseStore = defineStore("expense", () => {
  const selectedMonth = ref(new Date()); // Default to current month
  // State - Mock expenses data
  const expenses = ref([
    {
      id: 1,
      name: "Starbucks",
      date: "2026-01-24",
      displayDate: "Jan 24, 2026",
      category: "dining",
      amount: 8.75,
      note: "Morning coffee",
    },
    {
      id: 2,
      name: "Uber Trip",
      date: "2026-01-22",
      displayDate: "Jan 22, 2026",
      category: "transport",
      amount: 24.5,
      note: "Airport ride",
    },
    {
      id: 3,
      name: "Whole Foods",
      date: "2026-01-21",
      displayDate: "Jan 21, 2026",
      category: "groceries",
      amount: 86.3,
      note: "Weekly groceries",
    },
    {
      id: 4,
      name: "ConEd Utilities",
      date: "2026-01-19",
      displayDate: "Jan 19, 2026",
      category: "bills",
      amount: 120.0,
      note: "Electricity bill",
    },
    {
      id: 5,
      name: "Equinox Gym",
      date: "2026-01-15",
      displayDate: "Jan 15, 2026",
      category: "health",
      amount: 250.0,
      note: "Monthly membership",
    },
  ]);

  // Getters
  const totalExpenses = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
  });

  const recentExpenses = computed(() => {
    return [...expenses.value]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  });

  const expensesByCategory = computed(() => {
    const categories = {};
    expenses.value.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });
    return categories;
  });

  const topCategory = computed(() => {
    const categories = expensesByCategory.value;
    let top = null;
    let maxAmount = 0;

    for (const [category, amount] of Object.entries(categories)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        top = category;
      }
    }

    return {
      category: top,
      amount: maxAmount,
      percentage:
        totalExpenses.value > 0
          ? ((maxAmount / totalExpenses.value) * 100).toFixed(0)
          : 0,
    };
  });

  const monthlySummary = computed(() => {
    const currentTotal = totalExpenses.value;

    // Mock previous month (80% of current for demo)
    const previousTotal = currentTotal * 0.8;

    const change =
      previousTotal > 0
        ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(0)
        : 0;

    return {
      currentMonthTotal: currentTotal,
      previousMonthTotal: previousTotal,
      change: parseFloat(change),
      isPositive: currentTotal <= previousTotal,
    };
  });

  // Getter for filtered expenses
  const filteredExpenses = computed(() => {
    const year = selectedMonth.value.getFullYear();
    const month = selectedMonth.value.getMonth() + 1;

    return expenses.value.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() + 1 === month
      );
    });
  });

  // Actions
  function addExpense(expenseData) {
    const newExpense = {
      id: Date.now(),
      name: expenseData.note || "Unnamed Expense",
      date: expenseData.date,
      displayDate: formatDisplayDate(expenseData.date),
      category: expenseData.category,
      amount: parseFloat(expenseData.amount),
      note: expenseData.note || "",
    };

    expenses.value.unshift(newExpense);
    return newExpense;
  }

  function updateExpense(id, updatedData) {
    const index = expenses.value.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses.value[index] = {
        ...expenses.value[index],
        ...updatedData,
        amount: parseFloat(updatedData.amount || expenses.value[index].amount),
      };
    }
  }

  function deleteExpense(id) {
    const index = expenses.value.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      expenses.value.splice(index, 1);
    }
  }

  function getExpensesByMonth(year, month) {
    return expenses.value.filter((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  function getExpensesByCategory(category) {
    return expenses.value.filter((expense) => expense.category === category);
  }

  function setSelectedMonth(date) {
    selectedMonth.value = date;
  }

  // Helper function
  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return {
    // State
    expenses,

    // Getters
    totalExpenses,
    recentExpenses,
    expensesByCategory,
    topCategory,
    monthlySummary,

    // Actions
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByMonth,
    getExpensesByCategory,
  };
});
