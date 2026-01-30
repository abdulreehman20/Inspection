// import { NextResponse } from 'next/server';
// import { APIContracts, APIControllers } from 'authorizenet';
// import db from "@/lib/db";
// import nodemailer from "nodemailer";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { cardNumber, expDate, cvv, amount, firstName, lastName, email } = body;

//     // 1. Setup Email System
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.NODE_MAILER_EMAIL,
//         pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
//       },
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     return new Promise<NextResponse>((resolve) => {
//       // 2. Configure Authorize.net
//       const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
//       merchantAuthenticationType.setName(process.env.AUTHORIZE_API_LOGIN_ID);
//       merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);

//       const creditCard = new APIContracts.CreditCardType();
//       creditCard.setCardNumber(cardNumber);
//       creditCard.setExpirationDate(expDate);
//       creditCard.setCardCode(cvv);

//       const paymentType = new APIContracts.PaymentType();
//       paymentType.setCreditCard(creditCard);

//       const transactionRequestType = new APIContracts.TransactionRequestType();
//       transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
//       transactionRequestType.setPayment(paymentType);
//       transactionRequestType.setAmount(amount);

//       const customer = new APIContracts.CustomerDataType();
//       customer.setEmail(email);
//       transactionRequestType.setCustomer(customer);

//       const createRequest = new APIContracts.CreateTransactionRequest();
//       createRequest.setMerchantAuthentication(merchantAuthenticationType);
//       createRequest.setTransactionRequest(transactionRequestType);

//       const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
      
//       // PRODUCTION URL (Live Money)
//       ctrl.setEnvironment('https://api.authorize.net/xml/v1/request.api');

//       ctrl.execute(async () => {
//         const apiResponse = ctrl.getResponse();
//         const response = new APIContracts.CreateTransactionResponse(apiResponse);

//         // 3. Check if Bank said "YES"
//         if (response != null && response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
//           if (response.getTransactionResponse().getMessages() != null) {
            
//             const transactionId = response.getTransactionResponse().getTransId();
//             console.log("✅ Payment Approved. ID:", transactionId);

//             try {
//               // A. Save to Database
//               await db.payment.create({
//                 data: {
//                   firstName: firstName,
//                   lastName: lastName,
//                   email: email,
//                   orderID: transactionId,
//                   status: "COMPLETED",
//                 },
//               });

//               // B. Send Email to ADMIN (Dark Mode + Red Table)
//               await transporter.sendMail({
//                 from: process.env.NODE_MAILER_EMAIL,
//                 to: process.env.NODE_MAILER_EMAIL,
//                 subject: `Payment Successful - AutoK`,
//                 html: `
//                   <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 0; margin: 0;">
//                      <div style="background-color: #ed1d24; padding: 20px; text-align: center;">
//                         <h2 style="margin: 0; color: white; font-size: 24px;">✓ Payment Successful - AutoK</h2>
//                      </div>
//                      <div style="background-color: #1e1e1e; padding: 30px; margin: 20px auto; max-width: 600px; border-radius: 8px;">
//                         <p style="color: #cccccc; font-size: 16px;">Hello AutoK Owner,</p>
//                         <p style="color: #cccccc; font-size: 16px;">A new payment has been received. Below are the payment details:</p>
                        
//                         <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold; width: 35%;">Name:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: white;">${firstName} ${lastName}</td>
//                            </tr>
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold;">Email:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: #4da6ff;">${email}</td>
//                            </tr>
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold;">Amount:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: white;">$${amount}</td>
//                            </tr>
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold;">Plan:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: white;">Our Plan - ${amount}</td>
//                            </tr>
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold;">Order ID:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: white;">${transactionId}</td>
//                            </tr>
//                            <tr>
//                               <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold;">Status:</td>
//                               <td style="background-color: #2d2d2d; padding: 15px; color: white;">COMPLETED</td>
//                            </tr>
//                         </table>
//                         <p style="margin-top: 30px; color: #888888; font-size: 14px;">Please follow up with the client accordingly.</p>
//                      </div>
//                   </div>
//                 `
//               });

//               // C. Send Receipt to USER (The Corrected Red/Dark Design)
//               await transporter.sendMail({
//                 from: `"AutoK Inspection" <${process.env.NODE_MAILER_EMAIL}>`,
//                 to: email,
//                 subject: `Your AutoK Inspection Report Request`,
//                 html: `
//                   <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 0; margin: 0;">
//                     <div style="background-color: #ed1d24; padding: 20px; text-align: center;">
//                       <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">AutoK</h1>
//                     </div>

//                     <div style="background-color: #1e1e1e; padding: 30px; margin: 20px auto; max-width: 600px; border-radius: 8px;">
//                       <p style="color: #cccccc; font-size: 16px;">Hello ${firstName} ${lastName},</p>
//                       <p style="color: #cccccc; font-size: 16px;">We have received your request to retrieve your AutoK Car Inspection Report. Below are your request details:</p>
                      
//                       <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
//                         <tr>
//                           <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold; width: 35%; vertical-align: top;">Name:</td>
//                           <td style="background-color: #2d2d2d; padding: 15px; color: white;">${firstName} ${lastName}</td>
//                         </tr>
//                         <tr>
//                           <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold; vertical-align: top;">Email:</td>
//                           <td style="background-color: #2d2d2d; padding: 15px;"><a href="mailto:${email}" style="color: #4da6ff; text-decoration: none;">${email}</a></td>
//                         </tr>
//                         <tr>
//                           <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold; vertical-align: top;">VIN Number:</td>
//                           <td style="background-color: #2d2d2d; padding: 15px; color: white;">N/A</td>
//                         </tr>
//                         <tr>
//                           <td style="background-color: #ed1d24; padding: 15px; color: black; font-weight: bold; vertical-align: top;">Plan:</td>
//                           <td style="background-color: #2d2d2d; padding: 15px; color: white;">Our Plan - ${amount}</td>
//                         </tr>
//                       </table>

//                       <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">
//                         Our team will process your request and email you the <strong>inspection report</strong> within just 6 working hours. If you need any further assistance, feel free to reach out.
//                       </p>
//                       <p style="color: #cccccc; font-size: 14px; margin-top: 20px;">
//                         For urgent inquiries, contact us at <a href="mailto:autokinspection@gmail.com" style="color: #ed1d24; text-decoration: none;">autokinspection@gmail.com</a>.
//                       </p>
//                     </div>
//                   </div>
//                 `
//               });

//             } catch (innerError) {
//               console.error("❌ Post-Payment Error:", innerError);
//             }

//             resolve(NextResponse.json({ success: true, transactionId }));

//           } else {
//             // DECLINED
//             const errorText = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
//             resolve(NextResponse.json({ success: false, message: 'Declined: ' + errorText }));
//           }
//         } else {
//           // ERROR
//           let errorText = 'Transaction Error';
//           if (response != null && response.getMessages() != null) {
//             errorText = response.getMessages().getMessage()[0].getText();
//           }
//           resolve(NextResponse.json({ success: false, message: errorText }));
//         }
//       });
//     });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
//   }
// }