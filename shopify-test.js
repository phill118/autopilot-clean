import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const router = express.Router();

/**
 * 1️⃣ Step 1: Begin Shopify OAuth process
 * Example: /api/shopify/auth?shop=your-store.myshopify.com
 */
router.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing ?shop= parameter");
  }

  const state = crypto.randomBytes(8).toString("hex");
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/shopify/callback`;

  const scopes =
    process.env.SCOPES ||
    "read_products,write_products,read_orders,write_orders,read_inventory,write_inventory";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  res.redirect(installUrl);
});

/**
 * 2️⃣ Step 2: Handle OAuth callback from Shopify
 * Example: /api/shopify/callback
 */
router.get("/callback", async (req, res) => {
  const { shop, hmac, code } = req.query;

  if (!shop || !hmac || !code) {
    return res.status(400).send("Required parameters missing.");
  }

  // Validate HMAC signature
  const message = Object.keys(req.query)
    .filter((key) => key !== "hmac")
    .sort()
    .map((key) => `${key}=${req.query[key]}`)
    .join("&");

  const generatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex");

  if (generatedHmac !== hmac) {
    return res.status(400).send("Invalid HMAC signature");
  }

  // Exchange temporary code for permanent access token
  try {
    const response = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code,
        }),
      }
    );

    const data = await response.json();

    // Store access token in memory (temporary MVP solution)
    process.env.SHOPIFY_ACCESS_TOKEN = data.access_token;
    console.log("✅ Shopify store successfully connected!");
    res.send("✅ Shopify store successfully connected!");
  } catch (err) {
    console.error("Error exchanging code:", err);
    res.status(500).send("Error exchanging code for token.");
  }
});

/**
 * 3️⃣ Step 3: Test route — check store info using token
 */
router.get("/test", async (req, res) => {
  try {
    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      return res.status(401).json({ ok: false, error: "No access token found" });
    }

    const response = await fetch(
      "https://all-sorts-dropped.myshopify.com/admin/api/2023-10/shop.json",
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    res.json({ ok: true, shop: data.shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
