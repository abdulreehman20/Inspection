"use client";

import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/variants";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { handleReportRequest } from "@/actions/report";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().min(2, { message: "Email must be at least 2 characters." }),
  vnnumber: z
    .string()
    .min(17, { message: "VIN Number must be 17 characters." })
    .max(17, { message: "VIN Number must be 17 characters." }),
});

export const InspectionReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firstName, lastName, email, vnNumber, setUserData } = useUserStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      vnnumber: vnNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    // Store user data in Zustand
    setUserData({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      vnNumber: values.vnnumber,
    });

    try {
      const response = await handleReportRequest({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        vnNumber: values.vnnumber,
      });

      if (response.success === true) {
        toast.success("Form Submitted", {
          description: "Thank you for submitting the form.",
          style: {
            backgroundColor: "#ed1d24",
            color: "#fff",
          }
        });

        // Only reset form after successful submission
        form.reset();

        // Redirect to pricing page
        router.push("/pricing");
      } else {
        toast.error("Error", {
          description: "An error occurred. Please try again.",
          style: {
            backgroundColor: "#ed1d24",
            color: "#fff",
          },
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      className="py-6 px-4"
      id="report"
      variants={fadeIn("down", 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <div
        className="container mx-auto max-w-6xl p-8 rounded-lg shadow-md flex flex-col lg:flex-row gap-12"
        id="get-report"
      >
        {/* Left Side: Image and Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <h3 className="h2">AutoK Inspection Service</h3>
            <p className="text-lg text-gray-600">
              we <span className="font-bold text-red-600">ensure</span> your car
              is in perfect condition.
            </p>
          </div>
          <div className="mt-10">
            <Image
              src="/carImage/2.png"
              alt="Car Inspection"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1">
          <h2 className="h2">Get Your Report now</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-semibold">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter First Name"
                        {...field}
                        className="focus:ring-red-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name Field */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-semibold">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Last Name"
                        {...field}
                        className="focus:ring-red-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-semibold">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Your Email"
                        {...field}
                        className="focus:ring-red-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Car VIN Number Field */}
              <FormField
                control={form.control}
                name="vnnumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black font-semibold">
                      Car VIN Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter VIN Number"
                        {...field}
                        className="focus:ring-red-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-fit bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.section>
  );
};
