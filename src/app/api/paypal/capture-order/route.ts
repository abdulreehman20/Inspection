import db from "@/lib/db";
import axios from "axios";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body to get the orderID and user data
    const { orderID, firstName, lastName, email, vnNumber } = await request.json();
    // console.log("Received capture request for orderID:", orderID);

    if (!orderID) {
      return NextResponse.json(
        { success: false, message: "Please Provide Order ID" },
        { status: 400 }
      );
    }

    // Retrieve PayPal credentials from environment variables.
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET_KEY;
    // console.log("PayPal Client ID:", clientId ? "Available" : "Missing");
    // console.log("PayPal Secret Key:", clientSecret ? "Available" : "Missing");

    if (!clientId || !clientSecret) {
      throw new Error("Missing PayPal credentials in environment variables");
    }

    // Determine the PayPal base URL based on environment.
    const baseURL =
      process.env.NODE_ENV === "production"
        ? process.env.PAYPAL_API_URL_PRODUCTION
        : process.env.PAYPAL_API_URL_SANDBOX;
    // console.log("Using PayPal API URL:", baseURL);

    // Generate the Base64-encoded authorization string for Basic Auth.
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    // console.log("Generated Basic Auth header.");

    // Request an access token from PayPal's OAuth endpoint.
    // console.log("Requesting access token from PayPal...");
    const tokenResponse = await axios.post(
      `${baseURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    // console.log("Token response received:");

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new Error("No access token received from PayPal");
    }
    // console.log("Access token obtained:", accessToken.substring(0, 10) + "...");

    // (Optional) Get order details to check its status before capturing.
    // console.log(`Fetching details for orderID: ${orderID}...`);
    const orderDetailsResponse = await axios.get(
      `${baseURL}/v2/checkout/orders/${orderID}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // console.log("Order details received:");

    // Check if the order status is APPROVED before capturing.
    if (orderDetailsResponse.data.status !== "APPROVED") {
      console.error(
        "Order is not approved. Current status:",
        orderDetailsResponse.data.status
      );
      throw new Error("Order is not approved and cannot be captured.");
    }

    // Capture the order.
    // console.log("Sending request to capture payment for orderID:");
    const captureResponse = await axios.post(
      `${baseURL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          // You can add a unique PayPal-Request-Id here for idempotency.
          "PayPal-Request-Id": "7b92603e-77ed-4896-8e78-5dea2050476a",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // console.log("Capture response from PayPal");

    // Update the corresponding Payment record in the database using the unique orderID
    const updatedPayment = await db.payment.update({
      where: { orderID: orderID },
      data: { 
        status: "COMPLETED",
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        // vnNumber: vnNumber || undefined,
      },
    });
    // console.log("Payment updated with status COMPLETED:");

    const getPaymentData = await db.payment.findUnique({
      where: { orderID: orderID },
    });

    // console.log("Get Payment Data:");

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // This will allow self-signed certificates
      }
    });

    // Verify transporter
    await transporter.verify();

    // Send email to owner
    try {
      await transporter.sendMail({
        from: process.env.NODE_MAILER_EMAIL,
        to: process.env.NODE_MAILER_EMAIL,
        subject: "New Payment Received - AutoK",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #f8f9fa;">
          <h2 style="background-color: #e53935; color: #fff; padding: 15px; text-align: center; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            ✔️ Payment Successful - AutoK
          </h2>
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #555;">
              Hello AutoK Owner,<br><br>
              A new payment has been received. Below are the payment details:
            </p>
            <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; color: #333;">
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Name:</td>
                <td style="padding: 10px;">${getPaymentData?.firstName} ${getPaymentData?.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Email:</td>
                <td style="padding: 10px;">${getPaymentData?.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">VIN Number:</td>
                <td style="padding: 10px;">${vnNumber || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Plan:</td>
                <td style="padding: 10px;">${getPaymentData?.plan}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Order ID:</td>
                <td style="padding: 10px;">${getPaymentData?.orderID}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Status:</td>
                <td style="padding: 10px;">${getPaymentData?.status}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 16px; color: #555;">
              Please follow up with the client accordingly.
            </p>
          </div>
          <footer style="background-color: #424242; padding: 10px; text-align: center; font-size: 12px; color: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <strong>AutoK Car Inspection</strong> | Ensuring Quality, One Car at a Time
          </footer>
        </div>
        `,
      });
      // console.log("Payment confirmation email sent successfully to the owner.");

      // Send confirmation email to customer
      if (getPaymentData?.email) {
        await transporter.sendMail({
          from: process.env.NODE_MAILER_EMAIL,
          to: getPaymentData.email,
          subject: "Your Payment Confirmation - AutoK Car Inspection",
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background-color: #f8f9fa;">
            <h2 style="background-color: #e53935; color: #fff; padding: 15px; text-align: center; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              ✔️ Payment Successful - AutoK 
            </h2>
            <div style="padding: 20px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #555;">
                Hello ${getPaymentData.firstName} ${getPaymentData.lastName},<br><br>
                We have received your request to retrieve your AutoK Car Inspection Report. Below are your request details:
              </p>
              <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; color: #333;">
                <tr>
                  <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Name:</td>
                  <td style="padding: 10px;">${getPaymentData.firstName} ${getPaymentData.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Email:</td>
                  <td style="padding: 10px;">${getPaymentData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">VIN Number:</td>
                  <td style="padding: 10px;">${vnNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; background-color: #e53935; font-weight: bold; color: #fff;">Plan:</td>
                  <td style="padding: 10px;">${getPaymentData.plan}</td>
                </tr>
              </table>
              <p style="margin-top: 20px; font-size: 16px; color: #555;">
                Our team will process your request and email you the <strong>inspection report</strong> within just 6 working hours. If you need any further assistance, feel free to reach out.
              </p>
              <p style="font-size: 16px; color: #555;">
                For urgent inquiries, contact us at <a href="mailto:autokinspection@gmail.com" style="color: #e53935;">autokinspection@gmail.com</a>.
              </p>
            </div>
            <footer style="background-color: #424242; padding: 10px; text-align: center; font-size: 12px; color: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
              <strong>AutoK Car Inspection</strong> | Ensuring Quality, One Car at a Time
            </footer>
          </div>
          `,
        });
        console.log(
          "Payment confirmation email sent to customer:",
          getPaymentData.email
        );
      }
    } catch (emailError) {
      console.error("Error sending payment confirmation email:", emailError);
    }

    // Return the capture details as JSON with redirect URL.
    return NextResponse.json(
      {
        ...captureResponse.data,
        redirectUrl: "/payment-success",
        success: true,
      },
      {
        status: captureResponse.status,
      }
    );
  } catch (error: any) {
    console.error(
      "Error capturing PayPal order:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
        redirectUrl: "/payment-cancel",
        success: false,
      },
      { status: 500 }
    );
  }
}
