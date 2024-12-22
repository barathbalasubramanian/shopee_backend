const axios = require('axios');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(cors({
  origin: true, 
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Store in .env file
  key_secret: process.env.RAZORPAY_KEY_SECRET // Store in .env file
});

// const sendPickupRequest = async (orderData) => {
//   const config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: 'https://erpstcourier.com/ecom/v2/pickup.php',
//     headers: {
//       'API-TOKEN': '3rmKwMWI8nCjHJTzzxEQrwmTTVZ6IYLY',
//       'Content-Type': 'application/json',
//       'Cookie': 'PHPSESSID=6uf0363pmjp6jou187gn0e6oa4'
//     },
//     data: JSON.stringify(orderData)
//   };

//   try {
//     const response = await axios.request(config);
//     console.log('Pickup request successful:', response.data);
//     return response.data; 
//   } catch (error) {
//     console.error('Error sending pickup request:', error.message);
//     throw error;
//   }
// };


app.get("/", async (req, res) => {
  res.send("Welcome to the Razorpay API server");
  // try {
  //   const data = await sendPickupRequest(orderData);
  //   console.log("Response:", data);
  //   res.status(200).json({ success: true, data });
  // } catch (error) {
  //   console.error("Error:", error.message);
  //   res.status(500).json({ success: false, message: error.message });
  // }
});

app.post("/pickup", async (req, res) => {
  const orderData = req.body;

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://erpstcourier.com/ecom/v2/pickup.php",
    headers: {
      "API-TOKEN": "3rmKwMWI8nCjHJTzzxEQrwmTTVZ6IYLY",
      "Content-Type": "application/json",
      'Cookie': 'PHPSESSID=6uf0363pmjp6jou187gn0e6oa4'
    },
    data: JSON.stringify(orderData),
  };

  try {
    const response = await axios.request(config);
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error sending pickup request:", error.message);
    res.status(500).json({ message: "Failed to send pickup request" });
  }
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
