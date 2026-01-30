import { FooterSection } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import React from "react";

export default function RefundPolicy() {
  return (
    <main className="max-w-[1920px] mx-auto relative overflow-hidden">
      <Navbar />
      {/* Wrapper to push content below Navbar */}
      <div className="mt-24 max-w-6xl mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-custom_red to-red-600 rounded-lg p-16 mb-8">
          <h1 className="text-4xl font-medium text-white text-center">
            Non Refund Policy
          </h1>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          <p className="text-gray-600">
            Thank you for choosing Autos Checkup. Please read this policy
            carefully. This is the Non-Refund Policy of AUTOS CHECKS.
          </p>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">
                1. All Sales Are Final
              </h2>
              <p className="text-gray-600">
                All purchases of digital products, including car inspection
                history reports, are final. Once the purchase is completed, no
                refunds will be issued.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">
                2. No Returns or Exchanges
              </h2>
              <p className="text-gray-600">
                We do not accept returns or exchanges for any digital products.
                Please review your order carefully before making a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">
                3. Defective Products
              </h2>
              <p className="text-gray-600">
                If you experience issues with accessing or downloading the
                digital product, please contact us. We will assist you in
                resolving any technical issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">
                4. Exceptions
              </h2>
              <p className="text-gray-600">
                In exceptional circumstances, if a product is found to be
                defective or not as described, please contact us within 2 days
                of purchase. We will review your case and determine if a refund
                or replacement is warranted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-800 mb-2">
                5. Contact Us
              </h2>
              <p className="text-gray-600">
                For any questions or concerns regarding this policy, please{" "}
                <Link   
                  href="/#contact" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  contact us
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
}
