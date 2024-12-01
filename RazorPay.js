const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Function to create a Razorpay payment order
const createPaymentOrder = async (amount, receiptId) => {
  try {
    console.log("amount", amount);
    console.log("receiptId", receiptId);
    const options = {
      amount: amount, 
      currency: "INR",
      receipt: receiptId
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error("Error creating Razorpay order: " + error.message);
  }
};

// Function to verify the payment signature
const verifyPaymentSignature = ({ order_id, payment_id, signature }) => {
  const generatedSignature = crypto
    .createHmac("sha256", "NEI0BRFsHp30NQXUkdnIAUFj") 
    .update(order_id + "|" + payment_id)
    .digest("hex");

  return generatedSignature === signature;
};

// Export the functions for use in other modules
module.exports = {
  createPaymentOrder,
  verifyPaymentSignature
};
