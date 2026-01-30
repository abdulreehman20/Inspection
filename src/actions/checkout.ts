// "use server";

// ========================== Paypal Code ==========================
// import axios from "axios";
// import db from "@/lib/db";
// import nodemailer from "nodemailer";


// ------------------- Create Paypal Order -------------------
// export async function createPaypalOrder({
//   price,
//   firstName,
//   lastName,
//   email,
//   plan,
// }: {
//   price: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   plan: string;
// }) {
//   try {
//     const { userId } = await auth();

//     if (!price || !firstName || !lastName || !email || !plan || !userId) {
//       return {
//         success: false,
//         message: "Missing required fields",
//         status: 400,
//       };
//     }

//     // Retrieve PayPal credentials from environment variables.
//     const clientId = process.env.PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID";
//     const clientSecret =
//       process.env.PAYPAL_SECRET_KEY || "YOUR_PAYPAL_SECRET_KEY";

//     // Generate the Base64-encoded authorization string for Basic Auth.
//     const paypalAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
//       "base64"
//     );

//     // Determine the PayPal base URL based on environment.
//     const baseURL =
//       process.env.NODE_ENV === "production"
//         ? process.env.PAYPAY_API_URL_Prodution
//         : process.env.PAYPAY_API_URL_Development;

//     // Request an access token from PayPal's OAuth endpoint.
//     const tokenResponse = await axios.post(
//       `${baseURL}/v1/oauth2/token`,
//       "grant_type=client_credentials",
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: `Basic ${paypalAuth}`,
//         },
//       }
//     );

//     // Extract the access token.
//     const accessToken = tokenResponse.data.access_token;
//     if (!accessToken) {
//       throw new Error("No access token received from PayPal");
//     }

//     // Construct the payload for order creation using the dynamic price and invoice_id.
//     const payload = {
//       intent: "CAPTURE",
//       payment_source: {
//         paypal: {
//           name: {
//             given_name: firstName,
//             surname: lastName,
//           },
//           email_address: email,
//           experience_context: {
//             payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
//             payment_method_selected: "PAYPAL",
//             brand_name: "AutoK Inspection",
//             locale: "en-US",
//             landing_page: "LOGIN",
//             shipping_preference: "NO_SHIPPING",
//             user_action: "PAY_NOW",
//             return_url: process.env.NEXT_PUBLIC_SUCCESS_URL,
//             cancel_url: process.env.NEXT_PUBLIC_SUCCESS_URL,
//           },
//         },
//       },
//       purchase_units: [
//         {
//           amount: {
//             currency_code: "USD",
//             value: 39.99,
//           },
//           description: `AutoK Inspection - ${plan} Plan`,
//         },
//       ],
//     };

//     // Send the POST request to PayPal's Create Order API endpoint.
//     const orderResponse = await axios.post(
//       `${baseURL}/v2/checkout/orders`,
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // Create payment record in DB
//     const createPayment = await db.payment.create({
//       data: {
//         userId,
//         firstName,
//         lastName,
//         email,
//         plan,
//         status: "PENDING",
//         orderID: orderResponse.data.id,
//       },
//     });

//     // Return the order details received from PayPal as JSON.
//     return {
//       ...orderResponse.data,
//       status: orderResponse.status,
//       success: true,
//     };
//   } catch (error: any) {
//     return {
//       error: error.response?.data || error.message,
//       status: 500,
//       success: false,
//     };
//   }
// }

// ------------------- Capture Paypal Order -------------------

// export async function capturePaypalOrder({ orderID, firstName, lastName, email, vnNumber }: {
//   orderID: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   vnNumber?: string;
// }) {
//   try {
//     if (!orderID) {
//       return {
//         success: false,
//         message: "Please Provide Order ID",
//         status: 400,
//       };
//     }

//     // Retrieve PayPal credentials from environment variables.
//     const clientId = process.env.PAYPAL_CLIENT_ID;
//     const clientSecret = process.env.PAYPAL_SECRET_KEY;

//     if (!clientId || !clientSecret) {
//       throw new Error("Missing PayPal credentials in environment variables");
//     }

//     // Determine the PayPal base URL based on environment.
//     const baseURL =
//       process.env.NODE_ENV === "production"
//         ? process.env.PAYPAY_API_URL_Prodution
//         : process.env.PAYPAY_API_URL_Development;

//     // Generate the Base64-encoded authorization string for Basic Auth.
//     const paypalAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//     // Request an access token from PayPal's OAuth endpoint.
//     const tokenResponse = await axios.post(
//       `${baseURL}/v1/oauth2/token`,
//       "grant_type=client_credentials",
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: `Basic ${paypalAuth}`,
//         },
//       }
//     );

//     const accessToken = tokenResponse.data.access_token;
//     if (!accessToken) {
//       throw new Error("No access token received from PayPal");
//     }

//     // (Optional) Get order details to check its status before capturing.
//     const orderDetailsResponse = await axios.get(
//       `${baseURL}/v2/checkout/orders/${orderID}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // Check if the order status is APPROVED before capturing.
//     if (orderDetailsResponse.data.status !== "APPROVED") {
//       throw new Error("Order is not approved and cannot be captured.");
//     }

//     // Capture the order.
//     const captureResponse = await axios.post(
//       `${baseURL}/v2/checkout/orders/${orderID}/capture`,
//       {},
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "PayPal-Request-Id": "7b92603e-77ed-4896-8e78-5dea2050476a",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // Update the corresponding Payment record in the database using the unique orderID
//     const updatedPayment = await db.payment.update({
//       where: { orderID: orderID },
//       data: {
//         status: "COMPLETED",
//         firstName: firstName || undefined,
//         lastName: lastName || undefined,
//         email: email || undefined,
//         // vnNumber: vnNumber || undefined,
//       },
//     });

//     const getPaymentData = await db.payment.findUnique({
//       where: { orderID: orderID },
//     });

//     // Configure Nodemailer
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.NODE_MAILER_EMAIL,
//         pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
//       },
//     });

//     // Verify transporter
//     await transporter.verify();

//     // Send email to owner
//     try {
//       await transporter.sendMail({
//         from: process.env.NODE_MAILER_EMAIL,
//         to: process.env.NODE_MAILER_EMAIL,
//         subject: "New Payment Received - AutoK",
//         html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #f8f9fa;">
//           <h2 style="background-color: #e53935; color: #fff; padding: 15px; text-align: center; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
//             ✔️ Payment Successful - AutoK
//           </h2>
//           <div style="padding: 20px; background-color: #ffffff;">
//             <p style="font-size: 16px; color: #555;">
//               Hello AutoK Owner,<br><br>
//               A new payment has been received. Below are the payment details:
//             </p>
//             <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; color: #333;">
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Name:</td>
//                 <td style="padding: 10px;">${getPaymentData?.firstName} ${getPaymentData?.lastName}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Email:</td>
//                 <td style="padding: 10px;">${getPaymentData?.email}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">VIN Number:</td>
//                 <td style="padding: 10px;">${vnNumber || "N/A"}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Plan:</td>
//                 <td style="padding: 10px;">${getPaymentData?.plan}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Order ID:</td>
//                 <td style="padding: 10px;">${getPaymentData?.orderID}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Status:</td>
//                 <td style="padding: 10px;">${getPaymentData?.status}</td>
//               </tr>
//             </table>
//             <p style="margin-top: 20px; font-size: 16px; color: #555;">
//               Please follow up with the client accordingly.
//             </p>
//           </div>
//           <footer style="background-color: #424242; padding: 10px; text-align: center; font-size: 12px; color: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
//             <strong>AutoK Car Inspection</strong> | Ensuring Quality, One Car at a Time
//           </footer>
//         </div>
//         `,
//       });

//       // Send confirmation email to customer
//       if (getPaymentData?.email) {
//         await transporter.sendMail({
//           from: process.env.NODE_MAILER_EMAIL,
//           to: getPaymentData.email,
//           subject: "Your Payment Confirmation - AutoK Car Inspection",
//           html: `
//           <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #f8f9fa;">
//             <h2 style="background-color: #e53935; color: #fff; padding: 15px; text-align: center; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
//               ✔️ Payment Successful - AutoK 
//             </h2>
//             <div style="padding: 20px; background-color: #ffffff;">
//               <p style="font-size: 16px; color: #555;">
//                 Hello ${getPaymentData.firstName} ${getPaymentData.lastName},<br><br>
//                 We have received your request to retrieve your AutoK Car Inspection Report. Below are your request details:
//               </p>
//               <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; color: #333;">
//                 <tr>
//                   <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Name:</td>
//                   <td style="padding: 10px;">${getPaymentData.firstName} ${getPaymentData.lastName}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Email:</td>
//                   <td style="padding: 10px;">${getPaymentData.email}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">VIN Number:</td>
//                   <td style="padding: 10px;">${vnNumber || "N/A"}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Plan:</td>
//                   <td style="padding: 10px;">${getPaymentData.plan}</td>
//                 </tr>
//               </table>
//               <p style="margin-top: 20px; font-size: 16px; color: #555;">
//                 Our team will process your request and email you the <strong>inspection report</strong> within just 6 working hours. If you need any further assistance, feel free to reach out.
//               </p>
//               <p style="font-size: 16px; color: #555;">
//                 For urgent inquiries, contact us at <a href="mailto:autokinspection@gmail.com" style="color: #e53935;">autokinspection@gmail.com</a>.
//               </p>
//             </div>
//             <footer style="background-color: #424242; padding: 10px; text-align: center; font-size: 12px; color: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
//               <strong>AutoK Car Inspection</strong> | Ensuring Quality, One Car at a Time
//             </footer>
//           </div>
//           `,
//         });
//       }
//     } catch (emailError) {
//       // Log but don't throw
//       console.error("Error sending payment confirmation email:", emailError);
//     }

//     // Return the capture details as JSON with redirect URL.
//     return {
//       ...captureResponse.data,
//       redirectUrl: "/payment-success",
//       success: true,
//       status: captureResponse.status,
//     };
//   } catch (error: any) {
//     console.error(
//       "Error capturing PayPal order:",
//       error.response?.data || error.message
//     );
//     return {
//       error: error.response?.data || error.message,
//       redirectUrl: "/payment-cancel",
//       success: false,
//       status: 500,
//     };
//   }
// }

// ========================== Lemon Squeezy Code ==========================
// import { lemonSqueezyClient } from "@/lib/lemonsqueezy";
// export const buySubscription = async (id: string) => { /* ... */ }

