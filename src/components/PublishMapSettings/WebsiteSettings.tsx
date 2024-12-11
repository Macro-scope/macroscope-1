// import React, { useState } from "react";
// import { Drawer } from "antd";
// import Pusblish from "./Pusblish";

// type Props = {
//   isPrevOpen: (value: boolean) => void;
// };

// const WebsiteSettings = (props: Props) => {
//   const [open, setOpen] = useState(false);

//   // States for each status
//   const [published, setPublished] = useState(true);
//   const [notPublished, setNotPublished] = useState(false);
//   const [unpublishedChange, setUnpublishedChange] = useState(false);
//   const [error, setError] = useState(false);

//   // States for error handling
//   const [subdomainError, setSubdomainError] = useState<string | null>(null);
//   const [customDomainError, setCustomDomainError] = useState<string | null>(null);

//   const showDrawer = () => {
//     setOpen(true);
//     props.isPrevOpen(false);
//   };

//   const onClose = () => {
//     setOpen(false);
//   };

//   // Validation functions
//   const validateSubdomain = (subdomain: string) => {
//     if (!subdomain) {
//       setSubdomainError("Subdomain cannot be empty.");
//       return false;
//     }
//     setSubdomainError(null);
//     return true;
//   };

//   const validateCustomDomain = (domain: string) => {
//     if (!domain) {
//       setCustomDomainError("Custom domain cannot be empty.");
//       return false;
//     }
//     setCustomDomainError(null);
//     return true;
//   };

//   return (
//     <div>
//       <div className="flex justify-center gap-11">
//         <div>
//           <h2 className="font-bold">Status</h2>
//           {published && (
//             <li className="flex items-center space-x-3">
//               <div className="w-2 h-2 rounded-full bg-green-500"></div>
//               <span className="text-gray-800 font-medium">Published</span>
//             </li>
//           )}
//           {notPublished && (
//             <li className="flex items-center space-x-3">
//               <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//               <span className="text-gray-800 font-medium">Not Published</span>
//             </li>
//           )}
//           {unpublishedChange && (
//             <li className="flex items-center space-x-3">
//               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//               <span className="text-gray-800 font-medium">Unpublished change</span>
//             </li>
//           )}
//           {error && (
//             <li className="flex items-center space-x-3">
//               <div className="w-2 h-2 rounded-full bg-red-500"></div>
//               <span className="text-gray-800 font-medium">Error</span>
//             </li>
//           )}
//         </div>
      
//         <div className="flex justify-center items-center">
//           <button
//             onClick={showDrawer}
//             className=" px-10 py-2 rounded-2xl bg-black text-white"
//           >
//             Publish
//           </button>
//         </div>
//       </div>
//       <Drawer title="Publish" onClose={onClose} open={open}>
//         <Pusblish />
//       </Drawer>
//       <hr className="border-1 mt-7" />

//       <div className=" flex flex-col items-start m-2">
//         <h1 className="font-bold text text-gray-800 p-2">Macroscope Subdomain</h1>
//         <div className="relative flex items-center">
//           <input
//             type="text"
//             placeholder="Enter subdomain"
//             className="w-72 px-4 py-2 pr-16 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             onBlur={(e) => validateSubdomain(e.target.value)}
//           />
//           <span className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
//             .macroscope.so
//           </span>
//           <span className="ml-2 bg-black text-white p-2 rounded-full flex items-center justify-center">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </span>
//         </div>

//         {/* Error message section for subdomain */}
//         {subdomainError && (
//           <div className="text-sm text-red-500 mt-2">
//             <p>{subdomainError}</p>
//           </div>
//         )}

//         {/* Bottom line */}
//         <hr className="border-1 mt-5 w-full" />
//       </div>

//       <div className="mt-2 flex flex-col items-start">
//         <h1 className="font-bold p-2">
//           Custom Domain <span className="py-1 px-2 bg-green-300">Pro</span>
//         </h1>
//         <h2 className="font-semibold text-sm text-gray-800 p-2">
//           Your Custom Domain
//         </h2>
//         <div className="relative flex items-center">
//           <input
//             type="text"
//             placeholder="www.mysite.com"
//             className="w-72 px-4 py-2 pr-16 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             onBlur={(e) => validateCustomDomain(e.target.value)}
//           />
//           <span className="ml-2 bg-black text-white p-2 rounded-full flex items-center justify-center">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </span>
//         </div>

//         {/* Error message section for custom domain */}
//         {customDomainError && (
//           <div className="text-sm text-red-500 mt-2">
//             <p>{customDomainError}</p>
//           </div>
//         )}
//       </div>

//       <div className="mt-4">
//         <h1 className="my-7 font-medium text-[15px]">
//           Add the following DNS records to connect your domain
//         </h1>
//         <p className="my-3 font-medium text-[15px]">
//           To have your site on a root domain (like yoursite.com), add the following A record.
//         </p>
//         <p>Name? A record and:</p>
//         <img src="" alt="DNS Image" />

//         <p className="my-2 font-medium text-[15px]">
//           To have your site on a subdomain (like subdomain.yoursite.com), add the
//         </p>
//         <img src="" alt="DNS Image" />
//       </div>
//       <p className="mt-3 font-medium text-[15px]">
//         Check the instruction specific to popular domain and DNS providers
//       </p>
//       <a
//         href="https://www.godaddy.com/"
//         className="underline text-blue-600 text-[15px]"
//       >
//         GoDaddy,
//       </a>{" "}
//       <a
//         className="text-[15px] underline text-blue-600"
//         href="https://www.namecheap.com/"
//       >
//         NameCheap
//       </a>
//     </div>
//   );
// };

// export default WebsiteSettings;





// TEMPORARY
import React, { useState } from "react";
import { Drawer } from "antd";
import Pusblish from "./Pusblish";

type Props = {
  isPrevOpen: (value: boolean) => void;
};

const WebsiteSettings = (props: Props) => {
  const [open, setOpen] = useState(false);

  // States for each status
  const [published, setPublished] = useState(true);
  const [notPublished, setNotPublished] = useState(false);
  const [unpublishedChange, setUnpublishedChange] = useState(false);
  const [error, setError] = useState(false);

  // States for error handling
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [customDomainError, setCustomDomainError] = useState<string | null>(null);

  const showDrawer = () => {
    setOpen(true);
    props.isPrevOpen(false);
  };

  const onClose = () => {
    setOpen(false);
  };

  // Validation functions
  const validateSubdomain = (subdomain: string) => {
    if (!subdomain) {
      setSubdomainError("Subdomain cannot be empty.");
      return false;
    }
    setSubdomainError(null);
    return true;
  };

  const validateCustomDomain = (domain: string) => {
    if (!domain) {
      setCustomDomainError("Custom domain cannot be empty.");
      return false;
    }
    setCustomDomainError(null);
    return true;
  };

  return (
    <div className="">
      {/* Publish Map Link Section */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Publish Map Link</h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value="Map Name"
            readOnly
            className="flex-1 px-4 py-2 border rounded-md bg-gray-50"
          />
          <button className="px-4 py-2 bg-black text-white rounded-md">
            Copy Link
          </button>
        </div>
      </div>

      {/* Map Settings Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Map Settings</h3>
          <button className="px-6 py-1.5 bg-black text-white rounded-md">
            Save
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            placeholder="Map Name"
            className="w-full px-4 py-2 border rounded-md"
          />
         
        </div>

        {/* Sub-title */}
        <div className="mb-4">
          <label className="block mb-1">Sub-title</label>
          <input
            type="text"
            placeholder="Name | Email | Website"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Navbar Logo */}
        {/* <div className="mb-4">
          <label className="block mb-1">Navbar Logo</label>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">80 × 250 px</span>
            <button className="px-4 py-1 bg-gray-200 rounded-md flex items-center gap-2">
              <span>⬆️</span> Upload
            </button>
          </div>
          <div className="mt-2 border rounded-md p-8 flex justify-center">
            <div className="w-32 h-24 bg-gray-100 flex items-center justify-center">
              <span>🖼️</span>
            </div>
          </div>
        </div> */}

       
      

        {/* Suggestion form link */}
        <div className="mb-4">
          <label className="block mb-1">Suggestion form link</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Custom Domain */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Custom Domain</h3>
            <span className="px-2 py-0.5 bg-green-200 rounded text-sm">Pro</span>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center p-8 border rounded-md">
            <div className="text-center">
              <div className="mb-4">⚠️</div>
              <h4 className="font-medium mb-2">Coming soon</h4>
              <p className="text-sm text-gray-500">
                Custom domain functionality is coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default WebsiteSettings;

