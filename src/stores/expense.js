import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "./settings";

export const useExpenseStore = defineStore("expense", () => {
  const selectedMonth = ref(new Date());
  const authStore = useAuthStore();
  const settingsStore = useSettingsStore();

  // State
  const expenses = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // API Base URL from environment
  const API_BASE = import.meta.env.VITE_API_URL || "";

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
    const previousTotal = currentTotal * 0.8; // TODO: Get from API

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

  // ===== API HELPERS =====
  async function fetchWithAuth(url, options = {}) {
    const user = authStore.user;
    if (!user) throw new Error("User not authenticated");

    const token = await authStore.getToken();

    const fullUrl = API_BASE + url;

    console.log("🌐 API Request:", fullUrl, options); // Debug log

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API Error:", error);
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  // ===== API ACTIONS =====

  // Load all expenses from API
  async function loadExpenses() {
    if (!authStore.isAuthenticated) {
      expenses.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await fetchWithAuth("/expenses");

      expenses.value = data.map((expense) => ({
        id: expense.id,
        name: expense.name,
        date: expense.date,
        displayDate: formatDisplayDate(expense.date),
        category: expense.category,
        amount: expense.amount,
        note: expense.note || "",
      }));

      console.log("✅ Expenses loaded from API:", expenses.value.length);
    } catch (err) {
      error.value = err.message;
      console.error("Error loading expenses:", err);
      expenses.value = []; // Clear on error
    } finally {
      isLoading.value = false;
    }
  }

  // Add expense via API
  async function addExpense(expenseData) {
    if (!authStore.isAuthenticated) {
      throw new Error("User not authenticated");
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Convert amount to EUR for storage
      const amountInEUR = settingsStore.convertToEUR(
        parseFloat(expenseData.amount),
      );

      const apiData = {
        name: expenseData.note || "Unnamed Expense",
        amount: amountInEUR,
        category: expenseData.category,
        date: expenseData.date,
        note: expenseData.note || "",
      };

      const newExpense = await fetchWithAuth("/expenses", {
        method: "POST",
        body: JSON.stringify(apiData),
      });

      // Add to local state
      expenses.value.unshift({
        id: newExpense.id,
        name: newExpense.name,
        date: newExpense.date,
        displayDate: formatDisplayDate(newExpense.date),
        category: newExpense.category,
        amount: newExpense.amount,
        note: newExpense.note || "",
      });

      console.log("✅ Expense added via API:", newExpense);
      return newExpense;
    } catch (err) {
      error.value = err.message;
      console.error("Error adding expense:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Update expense via API
  async function updateExpense(id, updatedData) {
    if (!authStore.isAuthenticated) {
      throw new Error("User not authenticated");
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Convert amount if provided
      if (updatedData.amount) {
        updatedData.amount = settingsStore.convertToEUR(
          parseFloat(updatedData.amount),
        );
      }

      const updatedExpense = await fetchWithAuth(`/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });

      // Update local state
      const index = expenses.value.findIndex((exp) => exp.id === id);
      if (index !== -1) {
        expenses.value[index] = {
          ...expenses.value[index],
          ...updatedExpense,
          displayDate: formatDisplayDate(updatedExpense.date),
        };
      }

      console.log("✅ Expense updated via API:", updatedExpense);
      return updatedExpense;
    } catch (err) {
      error.value = err.message;
      console.error("Error updating expense:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete expense via API
  async function deleteExpense(id) {
    if (!authStore.isAuthenticated) {
      throw new Error("User not authenticated");
    }

    isLoading.value = true;
    error.value = null;

    try {
      await fetchWithAuth(`/expenses/${id}`, {
        method: "DELETE",
      });

      // Remove from local state
      const index = expenses.value.findIndex((exp) => exp.id === id);
      if (index !== -1) {
        expenses.value.splice(index, 1);
      }

      console.log("✅ Expense deleted via API:", id);
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Error deleting expense:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Load monthly summary from API (for accurate calculations)
  async function loadMonthlySummary(year, month) {
    if (!authStore.isAuthenticated) {
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const summary = await fetchWithAuth(
        `/summary/${year}-${String(month).padStart(2, "0")}`,
      );
      console.log("✅ Monthly summary loaded:", summary);
      return summary;
    } catch (err) {
      error.value = err.message;
      console.error("Error loading monthly summary:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear all expenses (on logout)
  function clearExpenses() {
    expenses.value = [];
    isLoading.value = false;
    error.value = null;
  }

  // ===== HELPER FUNCTIONS =====
  function setSelectedMonth(date) {
    selectedMonth.value = date;
  }

  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  return {
    // State
    expenses,
    isLoading,
    error,
    selectedMonth,

    // Getters
    totalExpenses,
    recentExpenses,
    expensesByCategory,
    topCategory,
    monthlySummary,
    filteredExpenses,

    // Actions
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    loadMonthlySummary,
    clearExpenses,
    setSelectedMonth,
    getExpensesByMonth: (year, month) => {
      return expenses.value.filter((expense) => {
        const date = new Date(expense.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    },
    getExpensesByCategory: (category) => {
      return expenses.value.filter((expense) => expense.category === category);
    },
  };
});
