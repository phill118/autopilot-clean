import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
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
