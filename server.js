import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(morgan("dev"));

// --- ✅ SUPABASE TEST CODE ---
import pkg from "@supabase/supabase-js";
const { createClient } = pkg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple API route to test the connection
app.get("/api/dbtest", async (_req, res) => {
  try {
    // Just ask Supabase who we are
    const { data, error } = await supabase.from("pg_tables").select("tablename").limit(1);
    if (error) throw error;
    res.json({ ok: true, message: "Database connection working!" });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- BASIC STATUS ROUTE ---
app.get("/api/status", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));

