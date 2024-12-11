"use client";
import React, { useState } from "react";

const accordionData = [
  {
    id: 1,
    title: "What is a Market Map?",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          A market map visually represents a market by breaking it down into
          segments and displaying the key products and services within each.
          Think of it as a bird’s-eye view of the market landscape—organized,
          clear, and easy to understand. Market Map transforms complex market
          data into a straightforward visual, helping you grasp the bigger
          picture at a glance. It also helps in spotting trends, identifying
          gaps, or assessing competitors. Examples of market maps:{" "}
          <a
            href="https://www.sequoiacap.com/wp-content/uploads/sites/6/2023/09/generative-ai-market-map-3.png"
            target="_blank"
            className="text-blue-600 dark:text-blue-500 hover:underline"
          >
            {" "}
            here
          </a>{" "}
          and{" "}
          <a
            href="https://lsvp.com/wp-content/uploads/2024/08/AI-Market-Map-Series-Article-I-V3-32.png"
            target="_blank"
            className="text-blue-600 dark:text-blue-500 hover:underline"
          >
            {" "}
            here
          </a>
        </p>
      </>
    ),
  },
  {
    id: 2,
    title: "Can I import data from other sources?",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          Yes. Macroscope has a built-in table feature. You can simply copy and
          paste data straight from Google Sheets or a CSV file.
        </p>
      </>
    ),
  },
  {
    id: 3,
    title: "Can I add my team members?",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          Not currently. Collaboration features are on our feature roadmap. Feel
          free to share your suggestions here, and stay updated on our latest
          developments by signing up.
        </p>
      </>
    ),
  },
  {
    id: 4,
    title: "Is there a free trial? ",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          Yes. You get a 15-day free trial to try the premium features when you
          upgrade. You can cancel anytime during this period, and you won’t be
          charged.
        </p>
      </>
    ),
  },
  {
    id: 5,
    title: "What is the refund policy?",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          After the free trial period, we will issue a refund if there is a
          technical problem with the product that we are unable to resolve in a
          timely manner.
        </p>
      </>
    ),
  },
  {
    id: 6,
    title: "How do I reachout to Macroscope team?",
    content: (
      <>
        <p className="mb-2 text-gray-500 dark:text-gray-400">
          You can reach out to us easily via the chat widget in the app or
          through email at team@macroscope.so
        </p>
      </>
    ),
  },
];
const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index:any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <section className="bg-[#F3F2F0] py-24">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-[72px]">
          Frequently Asked Questions
        </h2>
        <div className="max-w-5xl justify-self-center">
          {accordionData.map((item, index) => (
            <div key={item.id} className="border-b">
              <h2>
                <button
                  className={`flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500  ${
                    index === 0 ? "rounded-t-xl" : ""
                  }  gap-3`}
                  onClick={() => handleToggle(index)}
                >
                  <h2 className="text-start font-sans text-lg font-extrabold text-[#464646] sm:text-2xl">
                    {item.title}
                  </h2>
                  <svg
                    data-accordion-icon
                    className={`w-3 h-3 transform ${
                      activeIndex === index ? "" : "rotate-180"
                    } shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>
              <div
                className={`${
                  activeIndex === index ? "block" : "hidden"
                } pb-5 px-5 text-start font-sans text-base font-medium text-[#464646] sm:text-base`}
                aria-labelledby={`accordion-collapse-heading-${item.id}`}
              >
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
