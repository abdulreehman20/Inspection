// "use client";

// import { Navbar } from "@/components/navbar";
// import { FooterSection } from "@/components/footer";
// import { initialOptions } from "@/lib/constants";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// const pricing = [
//   {
//     id: "10201",
//     plan: "Our Plan",
//     price: "$49",
//     features: [
//       "1 Vehicle Report",
//       "Vehicle Specification",
//       "DMV Title History",
//       "Safety Recall Status",
//       "Online Listing History",
//       "Junk & Salvage Information",
//       "Accident Information",
//     ],
//   },
// ];

// export default function PricingPage() {
//   const router = useRouter();
//   const [userDetails, setUserDetails] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setUserDetails((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const createOrder = async (price: string, planDetails: any) => {
//     try {
//       if (
//         !userDetails.firstName ||
//         !userDetails.lastName ||
//         !userDetails.email
//       ) {
//         toast.error("Missing Information", {
//           description: "Please fill in all required fields",
//           style: {
//             backgroundColor: "#ed1d24",
//             color: "#fff",
//           },
//         });
//         return;
//       }

//       const response = await axios.post("/api/paypal/create-order", {
//         price: price.replace(/[^0-9.]/g, ""),
//         firstName: userDetails.firstName,
//         lastName: userDetails.lastName,
//         email: userDetails.email,
//         plan: planDetails.planName,
//       });

//       return response.data.id;
//     } catch (error) {
//       console.error("Error creating order:", error);
//       throw error;
//     }
//   };

//   const onApprove = async (orderID: string) => {
//     try {
//       const response = await axios.post("/api/paypal/capture-order", {
//         orderID,
//       });

//       if (response.data.status === "COMPLETED") {
//         toast.success("Payment Received", {
//           description: "Payment processed successfully!",
//           style: {
//             backgroundColor: "#ed1d24",
//             color: "#fff",
//           },
//         });
//         router.push("/payment-success");
//       }
//     } catch (error) {
//       console.error("Payment capture error:", error);
//       toast.error("Payment Failed", {
//         description: "Payment processing failed",
//         style: {
//           backgroundColor: "#ed1d24",
//           color: "#fff",
//         },
//       });
//       router.push("/payment-cancel");
//     }
//   };

//   return (
//     <main className="max-w-[1920px] mx-auto relative overflow-hidden">
//       <Navbar />
//       <div className="mt-10 max-w-6xl mx-auto px-4 py-10">
//         {/* Main Pricing Section */}
//         <div className="py-16 px-4">
//           <div className="container mx-auto">
//             <div className="text-center mb-12">
//               <h2 className="text-4xl font-bold mb-4">
//                 Get Your Vehicle Report
//               </h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 Get detailed information about your vehicle with our
//                 comprehensive report.
//               </p>
//             </div>

//             <div className="grid max-w-xl mx-auto">
//               {pricing.map((plan) => (
//                 <div
//                   key={plan.id}
//                   className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
//                 >
//                   <div className="absolute inset-x-0 top-0 h-2 bg-custom_red rounded-t-2xl" />
//                   <div className="relative">
//                     <h3 className="text-custom_red text-xl font-semibold mb-1">
//                       {plan.plan}
//                     </h3>
//                     <div className="mb-8">
//                       <p className="text-gray-600 text-sm">PRICE</p>
//                       <p className="text-4xl font-bold text-custom_red">
//                         {plan.price}
//                       </p>
//                     </div>
//                     <div className="space-y-4 mb-8">
//                       {plan.features.map((feature, i) => (
//                         <div key={i} className="flex items-start">
//                           <span className="text-custom_red mr-2">✔️</span>
//                           <span className="text-gray-600">{feature}</span>
//                         </div>
//                       ))}
//                     </div>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button className="w-full bg-neutral-900 mb-4">
//                           Get Started
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
//                         <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
//                           <DialogTitle className="text-neutral-900">
//                             Complete Payment for {plan.plan}
//                           </DialogTitle>
//                         </DialogHeader>
//                         <div className="py-4">
//                           <div className="space-y-4 mb-4">
//                             <div className="space-y-2">
//                               <Label htmlFor="firstName">First Name</Label>
//                               <Input
//                                 id="firstName"
//                                 name="firstName"
//                                 placeholder="Enter your first name"
//                                 value={userDetails.firstName}
//                                 onChange={handleInputChange}
//                                 required
//                               />
//                             </div>
//                             <div className="space-y-2">
//                               <Label htmlFor="lastName">Last Name</Label>
//                               <Input
//                                 id="lastName"
//                                 name="lastName"
//                                 placeholder="Enter your last name"
//                                 value={userDetails.lastName}
//                                 onChange={handleInputChange}
//                                 required
//                               />
//                             </div>
//                             <div className="space-y-2">
//                               <Label htmlFor="email">Email</Label>
//                               <Input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 placeholder="Enter your email"
//                                 value={userDetails.email}
//                                 onChange={handleInputChange}
//                                 required
//                               />
//                             </div>
//                           </div>
//                           <PayPalScriptProvider options={initialOptions}>
//                             <PayPalButtons
//                               style={{ layout: "vertical", color: "silver" }}
//                               createOrder={() =>
//                                 createOrder(plan.price, { planName: plan.plan })
//                               }
//                               onApprove={(data) => onApprove(data.orderID)}
//                             />
//                           </PayPalScriptProvider>
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                     {/* <div className="flex gap-4">
//                       <CheckoutButton />
//                       <Button>Check Demo Report</Button>
//                     </div> */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       <FooterSection />
//     </main>
//   );
// }
