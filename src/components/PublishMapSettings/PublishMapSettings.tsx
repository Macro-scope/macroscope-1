"use client";

import React from "react";
import { ConfigProvider, Tabs, TabsProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import WebsiteSettings from "./WebsiteSettings";
import EmbedSettings from "./EmbedSettings";
import ExportImageSettings from "./ExportImageSettings";
import SettingsTab from "./SettingsTab";
import { RootState } from "@/redux/store";

type Props = {
  isPrevopen: (value: boolean) => void;
  mapId: string;
};

const PublishMapSettings = (props: Props) => {
  const { publishedMapNav } = useSelector((state: RootState) => ({
    publishedMapNav: state.publishedMapNav,
  }));

  const dispatch = useDispatch();
  const [isBrandingEnabled, setIsBrandingEnabled] = React.useState(true);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <span className="font-medium text-sm">Settings</span>,
      children: <SettingsTab mapId={props.mapId} />,
    },
    // {
    //   key: "2",
    //   label: <span className="font-medium text-sm">Website</span>,
    //   children: <WebsiteSettings isPrevOpen={props.isPrevopen} />,
    // },
    {
      key: "3",
      label: <span className="font-medium text-sm">Embed</span>,
      children: (
        <div className="flex flex-col items-center  justify-center h-full py-20">
          <h2 className="text-xl text-gray-600 font-medium mb-2">
            Coming soon
          </h2>
          <p className="text-xs text-gray-400">
            We are working on this feature.
          </p>
          <p className="text-xs text-gray-400">
            You can expect the feature to be available in 1-2 weeks
          </p>
        </div>
      ),
    },
    {
      key: "4",
      label: <span className="font-medium text-sm">Image</span>,
      children: <ExportImageSettings />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        <ConfigProvider
          theme={{
            token: {},
            components: {
              Tabs: {},
            },
          }}
        >
          <Tabs
            className="px-4"
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
          />
        </ConfigProvider>
      </div>

      {/* Branding Toggle */}
      <div className="border-t bg-white mt-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Macroscope branding</span>
            <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
              Pro
            </span>
          </div>
          <div
            className={`w-11 h-6 ${
              isBrandingEnabled ? "bg-black" : "bg-gray-300"
            } rounded-full relative transition-colors duration-300 cursor-pointer`}
            onClick={() => setIsBrandingEnabled(!isBrandingEnabled)}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                isBrandingEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishMapSettings;
