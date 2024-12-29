




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

    <div className="flex flex-col items-center  justify-center h-full py-20">
    <h2 className="text-xl text-gray-600 font-medium mb-2">Coming soon</h2>
    <p className="text-xs text-gray-400">
      We are working on this feature.
    </p>
    <p className="text-xs text-gray-400">
      You can expect the feature to be available in 1-2 weeks
    </p>
  </div>
  );
};

export default WebsiteSettings;

