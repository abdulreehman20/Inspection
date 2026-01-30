import db from "@/lib/db";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { price, firstName, lastName, email, plan } = await request.json();
    console.log("Received create order request:");

    if (!price || !firstName || !lastName || !email || !plan) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Retrieve PayPal credentials from environment variables.
    const clientId = process.env.PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID";
    const clientSecret = process.env.PAYPAL_SECRET_KEY || "YOUR_PAYPAL_SECRET_KEY";
    // console.log("Using PayPal clientId:", clientId);

    // Generate the Base64-encoded authorization string for Basic Auth.
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    // console.log("Generated Basic Auth header.");

    // Determine the PayPal base URL based on environment.
    const baseURL =
      process.env.NODE_ENV === "production"
        ? process.env.PAYPAL_API_URL_PRODUCTION
        : process.env.PAYPAL_API_URL_SANDBOX;

    // console.log("Using PayPal API URL:", baseURL);

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

    // console.log("Token response received:", tokenResponse.data);

    // Extract the access token.
    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new Error("No access token received from PayPal");
    }

    // console.log("Access token obtained.");

    // Construct the payload for order creation using the dynamic price and invoice_id.
    // Note: This example uses hard-coded payer details (e.g. name, email); you can update these as needed.
    const payload = {
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          name: {
            given_name: firstName,
            surname: lastName,
          },
          email_address: email,
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            payment_method_selected: "PAYPAL",
            brand_name: "AutoK Inspection",
            locale: "en-US",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: process.env.NEXT_PUBLIC_SUCCESS_URL,
            cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL,
          },
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: 49,
          },
          description: `AutoK Inspection - ${plan} Plan`,
        },
      ],
    };

    // console.log("Constructed payload for order creation:");

    // Send the POST request to PayPal's Create Order API endpoint.
    // console.log("Sending request to create order on PayPal...");

    const orderResponse = await axios.post(
      `${baseURL}/v2/checkout/orders`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Order creation response from PayPal:");

    // Create payment record with the database user ID
    const createPayment = await db.payment.create({
      data: {
        firstName,
        lastName,
        email,
        orderID: orderResponse.data.id,
        status: "PENDING",
        plan: "Our Plan - 49",
      },
    });

    console.log("Payment record created:");

    // Return the order details received from PayPal as JSON.
    return NextResponse.json(orderResponse.data, {
      status: orderResponse.status,
    });
  } catch (error: any) {
    console.error(
      "Error creating PayPal order:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
