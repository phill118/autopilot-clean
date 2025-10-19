import express from "express";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

import shopifyTest from "./shopify-test.js";
app.use("/api/shopify", shopifyTest);

app.get("/api/status", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
