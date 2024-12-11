"use client";
import Image from "next/image";
import React, { useState } from "react";
import rightArrow from "../../../public/right_arrow.png";
import nobgrightArrow from "../../../public/lucide_arrow-up.png";
import CheckNoBg from "../../../public/CheckNoBg.svg";
import Check from "../../../public/Check.svg";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("yearly"); // Options: 'monthly', 'yearly', 'once'
  const [selectedPlan, setSelectedPlan] = useState(1);
  console.log("🚀 ~ Pricing ~ selectedPlan:", selectedPlan);

  const handleCycleChange = (cycle:any) => {
    setBillingCycle(cycle);
  };

  const plans = [
    {
      name: "Hobby",
      price: { monthly: "0", yearly: "FREE", once: "FREE" },
      cta: "Start for Free",
      features: [
        { name: "Standard Themes", included: false },
        { name: "Macroscope Domain", included: false },
        { name: "Basic Analytics", included: false },
        { name: "Export as Image", included: false },
        { name: "Macroscope Branding", included: false },
      ],
    },
    {
      name: "Creator",
      price: { monthly: "15", yearly: "12", once: "120" },
      cta: "Start Free Trial",
      features: [
        { name: "Custom Themes", included: true },
        { name: "Publish with Your Domain", included: true },
        { name: "Detailed Analytics", included: true },
        { name: "Export as Image", included: true },
        { name: "Macroscope Branding", included: false },
      ],
    },
    {
      name: "Creator Pro",
      price: { monthly: "30", yearly: "24", once: "240" },
      cta: "Start Free Trial",
      features: [
        { name: "Custom Themes", included: true },
        { name: "Publish with Your Domain", included: true },
        { name: "Detailed Analytics", included: true },
        { name: "Export as Image", included: true },
        { name: "No Macroscope Branding", included: true },
      ],
    },
  ];
  return (
    <section className="py-[132px]">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <div className="text-sm font-bold tracking-wide border font-sans border-customGray w-fit justify-self-center px-6 py-2 rounded-[130px] text-customGray uppercase mb-4">
          Pricing
        </div>
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646]">
          Create Maps for free
        </h2>
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-[72px]">
          Upgrade for premium features
        </h2>
        <div className="px-6 mx-auto max-w-7xl">
          <div className="flex justify-center">
            <div className="flex bg-[#F3F2F0] p-1 rounded-[20px]">
              {["Pay Monthly", "Pay Yearly", "Pay Once"].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleCycleChange(label.toLowerCase().split(" ")[1])
                  }
                  className={`px-4 lg:px-9 py-2.5 text-sm lg:text-xl font-sans font-medium rounded-[20px] ${
                    billingCycle === label.toLowerCase().split(" ")[1]
                      ? "bg-[#464646] shadow-lg text-[#D7D7D7]"
                      : "text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#515151] mt-1 mb-12 font-inter font-normal">
            2 months free
          </p>

          <div className="grid grid-cols-1 gap-8 mx-auto sm:grid-cols-2 lg:grid-cols-3 max-w-7xl">
            {plans.map((plan:any, index:any) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(index)}
                className={`relative rounded-2xl p-8 cursor-pointer transition-all ${
                  selectedPlan === index
                    ? "border-2 border-[#000000] shadow-lg bg-[#F9F9F8]"
                    : "border border-[#D7D7D7] bg-[#F3F2F0]"
                }`}
                style={{
                  transform:
                    selectedPlan === index ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.2s ease",
                }}
              >
                <h2 className="mb-4 font-sans text-2xl font-medium text-customGray">
                  {plan.name}
                </h2>
                <div className="mb-4">
                  {plan?.price?.[billingCycle] === "FREE" ? (
                    <span className="text-6xl font-['Playfair_Display'] font-inter font-bold text-[#464646]">
                      FREE
                    </span>
                  ) : (
                    <div className="flex items-start justify-center">
                      <span className="text-6xl font-inter font-bold text-[#464646] font-['Playfair_Display']">
                        ${plan.price[billingCycle]}
                        {billingCycle !== "once" && (
                          <span className="text-2xl font-normal font-inter">
                            /mo
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <span className="mt-1 block text-base font-medium text-[#464646] sm:text-base">
                    {plan?.price?.[billingCycle] === "FREE"
                      ? "Unlimited projects (Fair Use)"
                      : billingCycle === "once"
                      ? "one-time payment"
                      : `per project billed ${billingCycle}`}
                  </span>
                </div>
                <a
                  href="#"
                  className={` justify-self-center flex w-fit gap-3 px-5 py-2 font-normal text-base xl:text-xl ${
                    index === 0
                      ? "bg-transparent text-black border border-black "
                      : "bg-[#464646] text-white hover:bg-gray-800"
                  }  rounded-full  font-serif mb-16`}
                >
                  {plan.cta}{" "}
                  <Image
                    src={index === 0 ? nobgrightArrow : rightArrow}
                    alt="rightArrow image"
                    className="h-[22px] w-[22px] self-center"
                  />
                </a>

                <ul className="mb-24 space-y-4 text-left">
                  {plan.features.map((feature:any, featureIndex:any) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center`}
                      >
                        <Image
                          src={feature?.included ? Check : CheckNoBg}
                          alt="rightArrow image"
                        />
                      </span>
                      <span className={`font-sans text-base font-medium text-[#464646] sm:text-base font-inter`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-12 font-sans text-xl font-medium text-center text-customGray">
            15-day free trial • Cancel anytime • Money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
