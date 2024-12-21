const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Store in .env file
  key_secret: process.env.RAZORPAY_KEY_SECRET // Store in .env file
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Route to create a Razorpay payment order
app.post("/create-order", async (req, res) => {
  const { amount
  // , receiptId 
  } = req.body;
  console.log(amount)
  try { 
    const options = {
      amount: amount, // Amount in paise
      currency: "INR",
      // receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating Razorpay order",
      error: error.message,
    });
  }
});

// Route to verify payment signature
app.post("/verify-payment", (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (generatedSignature === signature) {
      console.log("Payment signature successfully");
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      console.log("Payment signature failed");
      res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
