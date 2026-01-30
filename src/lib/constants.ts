import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaXRay,
} from "react-icons/fa";

export const socialLinks = [
  {
    icon: FaGithub,
    href: "https://autokinspection.com",
    label: "GitHub",
  },
  {
    icon: FaLinkedin,
    href: "https://autokinspection.com",
    label: "LinkedIn",
  },
  {
    icon: FaFacebook,
    href: "https://autokinspection.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://autokinspection.com",
    label: "Instagram",
  },
  { icon: FaXRay, href: "https://autokinspection.com", label: "Twitter" },
];

export const pricing = [
  {
    id: "10201",
    plan: "Our Plan",
    price: "$49",
    features: [
      "1 Vehicle Report",
      "Vehicle Specification",
      "DMV Title History",
      "Safety Recall Status",
      "Online Listing History",
      "Junk & Salvage Information",
      "Accident Information",
    ],
  },
];

// Development client ID
const clientId = process.env.PAYPAL_CLIENT_ID || "AcA7gyCxg6QXlibRKaeJloj-qjVpRTqTXRfILOB3RkD6pgotxj-cqt4C0_nEkW34xmbYiI9dUYUjKTKX"

// Production client ID
// const clientId = process.env.PAYPAL_CLIENT_ID || "Aa4Y6EHO1CZryK1x0gR0L4OEhlMIPYoxoqqXbiAgJAeQeVVfKeK172OcCdNUjkxDsaWtu9zoTuLqDlUk"

export const initialOptions = {
  clientId: clientId,
  currency: "USD",
  intent: "capture",
};
