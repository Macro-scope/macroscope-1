"use client";

import { Copy, X } from "lucide-react";
import { useState } from "react";

interface Submission {
  url: string;
  category: string;
  submittedBy: string;
  email: string;
  socialLink: string;
  message: string;
  submittedTime: string;
}

export default function SubmissionForm() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const formLink = "https://app.notionpost.apphvjkbvkjbvkj";

  const copyLink = () => {
    navigator.clipboard.writeText(formLink);
  };

  const removeSubmission = (index: number) => {
    setSubmissions(submissions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-md font-semibold">Submission form link</span>
          <a
            href={formLink}
            className="text-md text-blue-500 hover:underline underline-offset-2"
          >
            {formLink}
          </a>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            <Copy className="w-3 h-3" />
            Copy Link
          </button>
        </div>
        <p className="text-sm">
          You can share this link with your team members others to suggest
          entries.
        </p>
        <p className="text-sm">
          The suggestions shared through this form and from the published
          website will appear in the below table.
        </p>
      </div>

      <div>
        <h2 className="text-md font-medium mb-4">Submissions</h2>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  URL
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Proposed Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Submitted by
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Social Link
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Message
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Submitted time
                </th>
                <th className="w-[80px] py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((submission, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{submission.url}</td>
                    <td className="py-3 px-4">{submission.category}</td>
                    <td className="py-3 px-4">{submission.submittedBy}</td>
                    <td className="py-3 px-4">{submission.email}</td>
                    <td className="py-3 px-4">{submission.socialLink}</td>
                    <td className="py-3 px-4">{submission.message}</td>
                    <td className="py-3 px-4">{submission.submittedTime}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removeSubmission(index)}
                        className="inline-flex items-center text-gray-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}