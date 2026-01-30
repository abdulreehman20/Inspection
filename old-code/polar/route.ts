// import { NextResponse } from "next/server";

// const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

// async function generateAccessToken() {
//   const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
//   const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
//     method: "POST",
//     body: "grant_type=client_credentials",
//     headers: { Authorization: `Basic ${auth}` },
//   });
//   const data = await response.json();
//   return data.access_token;
// }

// export async function POST(req: Request) {
//   try {
//     const { price } = await req.json();
//     const accessToken = await generateAccessToken();
    
//     const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify({
//         intent: "CAPTURE",
        
//         // 👇 ADD THIS SECTION: Controls the UI for the user
//         application_context: {
//            brand_name: "AutoK Inspection", // Shows your name on the receipt
//            shipping_preference: "NO_SHIPPING", // 👈 THIS HIDES THE SHIPPING ADDRESS
//            user_action: "PAY_NOW", // Changes button text to "Pay Now"
//         },

//         purchase_units: [
//           {
//             amount: {
//               currency_code: "USD",
//               value: price,
//             },
//             // Optional: Describe what they are buying to appear on the statement
//             description: "Vehicle Inspection Report", 
//           },
//         ],
//       }),
//     });

//     const order = await response.json();
//     return NextResponse.json(order);
//   } catch (error) {
//     return NextResponse.json({ error: "Error creating order" }, { status: 500 });
//   }
// }