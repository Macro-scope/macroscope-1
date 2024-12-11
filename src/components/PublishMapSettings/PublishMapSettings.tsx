import { setSubtext, setSuggest, setTitle } from "@/redux/publishedMapSlice";
import { ConfigProvider, Input, Tabs, TabsProps } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import WebsiteSettings from "./WebsiteSettings";
import EmbedSettings from "./EmbedSettings";
import ExportImageSettings from "./ExportImageSettings";

type Props = {
  isPrevopen: (value: boolean) => void;
};

const PublishMapSettings = (props: Props) => {
  const { publishedMapNav } = useSelector((state: any) => ({
    publishedMapNav: state.publishedMapNav,
  }));

  const dispatch = useDispatch();
console.log(publishedMapNav,"ddddddddddd")
  const onChange = (key: string) => {
    console.log(key);
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Website",
      children: <WebsiteSettings isPrevOpen={props.isPrevopen} />,
    },
    {
      key: "2",
      label: "Embed",
      children: <EmbedSettings />,
    },
    {
      key: "3",
      label: "Image",
      children: <ExportImageSettings />,
    },
  ];

  return (
    <div className="">
      <ConfigProvider
        theme={{
          token: {
            // paddingLG: 0,
            // paddingSM: 0,
            // paddingXS: 0,
            // padding: 0,
          },
          components: {
            Tabs: {
              /* here is your component tokens */
              // cardPadding: "0px 0px",
              // horizontalItemPadding: "0px, 0px",
              // verticalItemPadding: "0px 0px",
            },
          },
        }}
      >
        <Tabs
          className="-mt-6"
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
        />
      </ConfigProvider>
    </div>
  );
};

export default PublishMapSettings;
