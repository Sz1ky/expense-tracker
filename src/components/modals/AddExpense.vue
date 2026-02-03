<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Add New Expense</h2>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">
          &times;
        </button>
      </div>

      <p class="modal-subtitle">Fill in the details of your recent purchase.</p>

      <!-- Form -->
      <form class="expense-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">AMOUNT</label>
          <div class="amount-input">
            <span class="currency">€</span>
            <input
              v-model="form.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="amount-field"
              required
            />
          </div>
        </div>

        <!-- Category Select -->
        <div class="form-group">
          <label class="form-label">Category</label>
          <select v-model="form.category" class="form-select" required>
            <option value="" disabled selected>Select category</option>
            <option value="dining">Dining</option>
            <option value="transport">Transport</option>
            <option value="groceries">Groceries</option>
            <option value="bills">Bills</option>
            <option value="health">Health</option>
            <option value="shopping">Shopping</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>

        <!-- Date Input -->
        <div class="form-group">
          <label class="form-label">Date</label>
          <input v-model="form.date" type="date" class="form-input" required />
        </div>

        <!-- Note Input -->
        <div class="form-group">
          <label class="form-label">Note</label>
          <input
            v-model="form.note"
            type="text"
            placeholder="What was this for?"
            class="form-input"
          />
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn-save">Save Expense</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useExpenseStore } from "@/stores/expense";

  const emit = defineEmits(["close", "save"]);
  const expenseStore = useExpenseStore();

  // Form data
  const form = ref({
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    note: "",
  });

  // Handle form submission
  function handleSubmit() {
    // Create expense data
    const expenseData = {
      amount: parseFloat(form.value.amount),
      category: form.value.category,
      date: form.value.date,
      note: form.value.note,
    };

    // Save to store
    expenseStore.addExpense(expenseData);

    // Reset form
    form.value = {
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    };

    // Close modal
    emit("close");
  }

  // Close modal when clicking overlay
  function closeModal(event) {
    if (event.target.classList.contains("modal-overlay")) {
      emit("close");
    }
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #94a3b8;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .modal-subtitle {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .expense-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .amount-input {
    display: flex;
    align-items: center;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    transition: border-color 0.2s;
    background: white;
  }

  .amount-input:focus-within {
    border-color: #667eea;
  }

  .currency {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-right: 0.5rem;
  }

  .amount-field {
    border: none;
    outline: none;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    width: 100%;
    background: transparent;
  }

  .amount-field::placeholder {
    color: #cbd5e1;
  }

  .form-input,
  .form-select {
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    color: #1e293b;
    transition: border-color 0.2s;
    background: white;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #667eea;
  }

  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #64748b;
  }

  .btn-cancel:hover {
    background: #e2e8f0;
  }

  .btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
</style>
