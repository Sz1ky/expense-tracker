import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import cors from "cors";

// Set region
setGlobalOptions({ region: "europe-west1" });

// Initialize Firebase Admin with Application Default Credentials
// This automatically uses the service account from the Firebase environment
initializeApp({
  credential: applicationDefault(),
  projectId: "expense-tracker-a3dda",
});

const db = getFirestore();
console.log("✅ Firebase Admin initialized with Firestore");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://expense-tracker-a3dda.web.app",
  "https://expense-tracker-a3dda.firebaseapp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        console.warn("CORS blocked origin:", origin);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }),
);

app.use(express.json());

// ===== DEBUG ENDPOINT =====
app.get("/debug", async (req, res) => {
  try {
    console.log("🧪 Testing Firestore connection...");

    // Test if Firestore is accessible
    const testRef = db.collection("_debug").doc("connection");
    await testRef.set({
      test: "Firestore connection test",
      timestamp: new Date().toISOString(),
      project: "expense-tracker-a3dda",
    });

    const doc = await testRef.get();

    console.log("✅ Firestore test successful");

    res.json({
      success: true,
      message: "✅ Firestore is working!",
      firestore: {
        connected: true,
        testData: doc.data(),
      },
      project: "expense-tracker-a3dda",
      region: "europe-west1",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Firestore debug error:", error);

    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      suggestion:
        error.code === 5
          ? "Firestore database not created. Go to Firebase Console → Firestore → Create Database"
          : error.code === 7
            ? "Permission denied. Check if Firestore API is enabled and billing is active."
            : "Unknown Firestore error",
    });
  }
});

// ===== MIDDLEWARE: Verify Firebase Token =====
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    // Import here to avoid circular dependency
    const { getAuth } = await import("firebase-admin/auth");
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    project: "expense-tracker-a3dda",
    service: "Expense Tracker API",
  });
});

// ===== EXPENSES ROUTES =====

// Get all expenses for user
app.get("/expenses", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { month, year } = req.query;

    console.log(`📊 Fetching expenses for user: ${userId}`);

    let query = db.collection("expenses").where("userId", "==", userId);

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      console.log(
        `🔍 Filtering by date range: ${startDateStr} to ${endDateStr}`,
      );

      query = query
        .where("date", ">=", startDateStr)
        .where("date", "<", endDateStr);
    }

    const snapshot = await query.orderBy("date", "desc").get();

    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Found ${expenses.length} expenses for user ${userId}`);

    res.status(200).json(expenses);
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
    res.status(500).json({
      error: "Failed to fetch expenses",
      details: error.message,
      code: error.code,
    });
  }
});

// Create new expense
app.post("/expenses", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, amount, category, date, note } = req.body;

    console.log(`📝 Creating expense for user: ${userId}`, req.body);

    // Validation
    if (!name || typeof amount !== "number" || !category || !date) {
      return res.status(400).json({
        error: "Name, amount (number), category, and date are required",
        received: { name, amount, category, date },
      });
    }

    const expenseData = {
      userId,
      name: name.trim(),
      amount: parseFloat(amount.toFixed(2)),
      category,
      date: new Date(date).toISOString().split("T")[0], // YYYY-MM-DD
      note: note?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("💾 Saving expense data:", expenseData);

    const docRef = await db.collection("expenses").add(expenseData);

    console.log("✅ Expense created with ID:", docRef.id);

    res.status(201).json({
      id: docRef.id,
      ...expenseData,
    });
  } catch (error) {
    console.error("❌ Error creating expense:", error);
    res.status(500).json({
      error: "Failed to create expense",
      details: error.message,
      code: error.code,
      suggestion: "Check if Firestore is properly set up and accessible",
    });
  }
});

// Update expense
app.put("/expenses/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const expenseId = req.params.id;

    console.log(`✏️ Updating expense ${expenseId} for user ${userId}`);

    // Check if expense belongs to user
    const expenseRef = db.collection("expenses").doc(expenseId);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expenseDoc.data().userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = req.body;

    // Don't allow changing userId
    if (updates.userId) {
      delete updates.userId;
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await expenseRef.update(updateData);

    const updatedDoc = await expenseRef.get();

    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("❌ Error updating expense:", error);
    res
      .status(500)
      .json({ error: "Failed to update expense", details: error.message });
  }
});

// Delete expense
app.delete("/expenses/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const expenseId = req.params.id;

    console.log(`🗑️ Deleting expense ${expenseId} for user ${userId}`);

    // Check if expense belongs to user
    const expenseRef = db.collection("expenses").doc(expenseId);
    const expenseDoc = await expenseRef.get();

    if (!expenseDoc.exists) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expenseDoc.data().userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await expenseRef.delete();

    res.status(200).json({
      success: true,
      message: "Expense deleted",
      id: expenseId,
    });
  } catch (error) {
    console.error("❌ Error deleting expense:", error);
    res
      .status(500)
      .json({ error: "Failed to delete expense", details: error.message });
  }
});

// ===== SETTINGS ROUTES =====

// Get user settings
app.get("/settings", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    console.log(`⚙️ Fetching settings for user: ${userId}`);

    const settingsRef = db.collection("settings").doc(userId);
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      // Return default settings
      const defaultSettings = {
        currency: "EUR",
        monthlyBudget: 3000,
        budgetEffectiveFrom: new Date().toISOString().slice(0, 7), // YYYY-MM
        createdAt: new Date().toISOString(),
      };

      console.log(`📋 Returning default settings for new user ${userId}`);

      // Save default settings
      await settingsRef.set(defaultSettings);

      return res.status(200).json(defaultSettings);
    }

    console.log(`✅ Found existing settings for user ${userId}`);

    res.status(200).json(settingsDoc.data());
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch settings", details: error.message });
  }
});

// Update user settings
app.put("/settings", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { currency, monthlyBudget } = req.body;

    console.log(`⚙️ Updating settings for user ${userId}:`, req.body);

    // Validation
    if (!currency || typeof monthlyBudget !== "number") {
      return res.status(400).json({
        error: "Currency and monthlyBudget (number) are required",
        received: { currency, monthlyBudget },
      });
    }

    const settingsData = {
      currency,
      monthlyBudget: parseFloat(monthlyBudget.toFixed(2)),
      budgetEffectiveFrom: new Date().toISOString().slice(0, 7),
      updatedAt: new Date().toISOString(),
    };

    const settingsRef = db.collection("settings").doc(userId);
    await settingsRef.set(settingsData, { merge: true });

    console.log(`✅ Settings updated for user ${userId}`);

    res.status(200).json(settingsData);
  } catch (error) {
    console.error("❌ Error updating settings:", error);
    res
      .status(500)
      .json({ error: "Failed to update settings", details: error.message });
  }
});

// ===== SUMMARY ROUTES =====

// Get monthly summary
app.get("/summary/:month", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const month = req.params.month; // Format: YYYY-MM

    console.log(`📈 Getting summary for user ${userId}, month: ${month}`);

    // Parse month
    const [year, monthNum] = month.split("-").map(Number);

    // Get ALL expenses for user once, then filter in code
    const allExpensesSnapshot = await db
      .collection("expenses")
      .where("userId", "==", userId)
      .get();

    // Convert to array
    const allExpenses = allExpensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter for current month in code
    const expenses = allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() + 1 === monthNum
      );
    });

    // Filter for previous month in code
    const prevMonth = new Date(year, monthNum - 2, 1);
    const prevYear = prevMonth.getFullYear();
    const prevMonthNum = prevMonth.getMonth() + 1;

    const prevExpenses = allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === prevYear &&
        expenseDate.getMonth() + 1 === prevMonthNum
      );
    });

    // Calculate totals
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const prevTotal = prevExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Group by category
    const byCategory = {};
    expenses.forEach((expense) => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0;
      }
      byCategory[expense.category] += expense.amount;
    });

    // Calculate percentage change
    let change = 0;
    if (prevTotal > 0) {
      change = ((total - prevTotal) / prevTotal) * 100;
    } else if (total > 0) {
      change = 100;
    }

    // Get settings for budget
    const settingsRef = db.collection("settings").doc(userId);
    const settingsDoc = await settingsRef.get();
    const settings = settingsDoc.exists
      ? settingsDoc.data()
      : {
          currency: "EUR",
          monthlyBudget: 3000,
          budgetEffectiveFrom: new Date().toISOString().slice(0, 7),
        };

    // Check if budget applies to this month
    const hasBudget = month >= settings.budgetEffectiveFrom;
    const budgetRemaining = hasBudget ? settings.monthlyBudget - total : null;

    const summary = {
      month,
      total: parseFloat(total.toFixed(2)),
      previousMonthTotal: parseFloat(prevTotal.toFixed(2)),
      change: parseFloat(change.toFixed(1)),
      expenseCount: expenses.length,
      byCategory,
      hasBudget,
      budgetRemaining:
        budgetRemaining !== null
          ? parseFloat(budgetRemaining.toFixed(2))
          : null,
      currency: settings.currency,
    };

    console.log(`✅ Summary calculated for ${month}:`, summary);

    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ Error fetching summary:", error);
    res.status(500).json({
      error: "Failed to fetch summary",
      details: error.message,
      code: error.code,
    });
  }
});

// ===== EXPORT DATA =====
app.get("/export", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get all expenses
    const expensesSnapshot = await db
      .collection("expenses")
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .get();

    const expenses = expensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get settings
    const settingsRef = db.collection("settings").doc(userId);
    const settingsDoc = await settingsRef.get();
    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    res.status(200).json({
      userId,
      settings,
      expenses,
      exportDate: new Date().toISOString(),
      count: expenses.length,
    });
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    res
      .status(500)
      .json({ error: "Failed to export data", details: error.message });
  }
});

export const api = onRequest(app);
