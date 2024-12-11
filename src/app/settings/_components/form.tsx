"use client";

import { useState } from "react";

interface FormData {
  url: string;
  name: string;
  email: string;
  socialLink: string;
  isAssociated: boolean;
  additionalDetails: string;
}

export default function SuggestItemForm() {
  const [formData, setFormData] = useState<FormData>({
    url: "",
    name: "",
    email: "",
    socialLink: "",
    isAssociated: false,
    additionalDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="max-w-[600px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Suggest an item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="url"
            name="url"
            required
            placeholder="Paste the URL"
            value={formData.url}
            onChange={handleChange}
            className="w-full p-2 bg-gray-100 rounded border-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Submitted by</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-100 rounded border-0"
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 bg-gray-100 rounded border-0"
          />
        </div>

        <div>
          <input
            type="url"
            name="socialLink"
            placeholder="Twitter or LinkedIn profile link (optional)"
            value={formData.socialLink}
            onChange={handleChange}
            className="w-full p-2 bg-gray-100 rounded border-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAssociated"
            id="isAssociated"
            checked={formData.isAssociated}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          <label htmlFor="isAssociated" className="text-sm">
            I&apos;m the directly associated with the item suggested
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Any additional details? (optional)
          </label>
          <textarea
            name="additionalDetails"
            placeholder="Email address"
            value={formData.additionalDetails}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 bg-gray-100 rounded border-0 resize-none"
          />
        </div>

        <div className="mb-4">{/* captcha */}</div>
        <div className="flex justify-center">
          <button
            type="submit"
            className=" bg-black text-white py-2 px-14 rounded hover:bg-black/90 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}