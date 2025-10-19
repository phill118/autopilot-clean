import express from "express";
import crypto from "crypto";
import { env } from "./env.js";

const router = express.Router();

// Step 1: Start OAuth flow
router.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing shop parameter");

  const state = crypto.randomBytes(8).toString("hex");
  const redirectUri = `${env.HOST}/api/shopify/callback`;
  const scopes = [
    "read_products",
    "write_products",
    "read_orders",
    "write_orders",
    "read_inventory",
    "write_inventory"
  ].join(",");

  const url =
    `https://${shop}/admin/oauth/authorize?client_id=${env.SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  res.redirect(url);
});

// Step 2: Handle OAuth callback
router.get("/callback", (req, res) => {
  const { shop, hmac, code, state } = req.query;

  if (!shop || !hmac || !code) {
    return res.status(400).send("Required parameters missing");
  }

  const params = new URLSearchParams(req.query);
  params.delete("hmac");

  const message = params.toString();
  const generatedHmac = crypto
    .createHmac("sha256", env.SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex");

  if (generatedHmac !== hmac) {
    return res.status(400).send("HMAC validation failed");
  }

  // Success — you can now exchange the code for an access token (next step)
  res.send("✅ Shopify store successfully connected!");
});

export default router;
