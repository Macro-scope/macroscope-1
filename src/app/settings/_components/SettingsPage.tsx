"use client";

import React, { useState } from "react";

import {
  Settings as SettingsIcon,
  BarChart3,
  FileText,
  Globe,
  Users,
  Check,
  Play,
  Maximize2,
} from "lucide-react";
import SubmissionForm from "./submission-form";

import CustomLayout from "@/layout/CustomLayout";

// type Props = {};
type TabType = "analytics" | "form" | "domain" | "member";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [activeStep, setActiveStep] = useState(1);

  return (
    <CustomLayout>
      <div className="py-5 px-10 h-[calc(100vh-60px)] overflow-y-auto">
        <div className="flex items-center  gap-2 mb-6">
          <SettingsIcon className="w-5 h-5" />
          <h1 className="text-xl font-medium">SETTINGS</h1>
        </div>

        <div className="border-b mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-1 py-4 ${
                activeTab === "analytics"
                  ? "border-b-2 border-black relative -mb-[2px]"
                  : ""
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-md font-semibold">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-1 py-4 ${
                activeTab === "form"
                  ? "border-b-2 border-black relative -mb-[2px]"
                  : ""
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-md font-semibold">Form</span>
            </button>

            <div className="flex flex-col items-center">
              <span className="text-xs text-red-500">Coming Soon</span>
              <div className="flex items-center gap-2 px-1 ">
                <Globe className="w-4 h-4" />
                <span className="text-md font-semiboldtext-sm">Domain</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-red-500 ">Coming Soon</span>
              <div className="flex items-center gap-2 px-1">
                <Users className="w-4 h-4" />
                <span className="text-md font-semibold">Member</span>
              </div>
            </div>
          </nav>
        </div>

        {activeTab === "analytics" && (
          <>
            <div className="mb-8">
              <p className="text-gray-800">
                Currently, Directory Kit is designed to integrate with{" "}
                <span className="font-medium">Umami.is</span> for website
                Analytics.
              </p>
              <p className="text-gray-800">
                It's has a generous free tier up-to ~100k events (visits) per
                month.{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  View Demo →
                </a>
              </p>
            </div>

            <div className="grid md:grid-cols-[300px,1fr] gap-8">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeStep === step ? "bg-gray-100" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${
                        step === 1 ? "bg-emerald-100" : "border border-gray-300"
                      } flex items-center justify-center`}
                    >
                      {step === 1 && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">Step {step}</div>
                      <div className="text-gray-600 text-sm">
                        {step === 1 && "Log in and add Website"}
                        {step === 2 && "Enter Tracking Code"}
                        {step === 3 && "Enter Share URL"}
                        {step === 4 && "Enter API Key"}
                        {step === 5 && "View Analytics"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative bg-blue-100 rounded-lg aspect-video">
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-white/10 rounded">
                      <Play className="w-4 h-4" />
                    </button>
                    <span className="text-sm">0:10 / 0:16</span>
                  </div>
                  <button className="p-1 hover:bg-white/10 rounded">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button className="px-6 py-1 bg-black text-white rounded hover:bg-black/90">
                Mark as Complete
              </button>
              <div className="text-emerald-500 font-semibold">Completed</div>
            </div>
          </>
        )}

        {activeTab === "form" && (
         <SubmissionForm/>
          // <SuggestItemForm />
        )}
      </div>
    </CustomLayout>
  );
};

export default Settings;