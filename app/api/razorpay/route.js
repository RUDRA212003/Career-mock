import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const body = await req.json();

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: body.amount * 100, // ₹1 = 100 paise
      currency: "INR",
      receipt: "receipt#1",
    };

    const order = await instance.orders.create(options);
    return Response.json(order);
  } catch (err) {
    console.error(err);
    return new Response("Error creating Razorpay order", { status: 500 });
  }
}
