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
    // Try inserting a row
    const { error: insertError } = await supabase
      .from("test_table")
      .insert({ message: "Hello from the server!" });

    if (insertError) throw insertError;

    // Read back the latest row
    const { data, error: selectError } = await supabase
      .from("test_table")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);

    if (selectError) throw selectError;

    res.json({ ok: true, message: "Database test succeeded", data });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || JSON.stringify(err)
    });
  }
});


// --- BASIC STATUS ROUTE ---
app.get("/api/status", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));


