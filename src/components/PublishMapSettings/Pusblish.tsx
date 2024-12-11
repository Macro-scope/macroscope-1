"use-client";
import { setSubtext, setSuggest, setTitle } from "@/redux/publishedMapSlice";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {};

const Pusblish = (props: Props) => {
  const [isToggled, setIsToggled] = useState(false);
  const { publishedMapNav } = useSelector((state: any) => ({
    publishedMapNav: state.publishedMapNav,
  }));

  const dispatch = useDispatch();

  const onChange = (key: string) => {
    console.log(key);
  };
  return (
    <div>
      <div className="flex justify-start gap-12 mt-10">
        <h1 className=" font-medium text-sm">
          Macroscope branding{" "}
          <span className="py-1 px-2 bg-green-300">Pro</span>
        </h1>
        <label className="flex items-center cursor-pointer">
          <div
            className={`relative w-12 h-6 ${
              isToggled ? "bg-black" : "bg-gray-300"
            } rounded-full transition-colors duration-300`}
            onClick={() => setIsToggled(!isToggled)}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                isToggled ? "translate-x-6" : "translate-x-1"
              }`}
            ></div>
          </div>
        </label>
      </div>
      <hr className="border-2 my-6" />

      <h1 className="font-semibold text-base">Map Settings</h1>
      <div className="flex flex-col mt-4">
        <h1 className="font-medium">Title</h1>
        <input
          type="text"
          placeholder="Map Name"
          className="w-full rounded-xl border-2 p-2 my-2"
          value={publishedMapNav.title}
        onChange={(e) => {
          dispatch(setTitle(e.target.value));
        }}
        />
      </div>
      <div className="flex flex-col mt-4">
        <h1 className="font-medium">Sub Title</h1>
        <input
          type="text"
          placeholder="Name | Email | Website"
          className="w-full rounded-xl border-2 p-2 my-2"
          value={publishedMapNav.subtext}
        onChange={(e) => {
          dispatch(setSubtext(e.target.value));
        }}
        />
      </div>

      <div className="flex flex-col gap-32 mb-5">
        <div className="flex flex-col gap-4">
          <h1>NavBarLogo</h1>
          <h2>80 X 250 px</h2>

          <input type="file" placeholder="Sub-text" className="mb-3"/>
        </div>
        {/* <div>
          <img src="" alt="img" className="h-28" />
          <p className="text-left">Redirect </p>
          <span>Link</span>
        </div> */}
      </div>
      <div>
        <h1 className="font-medium">Suggestion form link</h1>
        <input type="text" className="w-full rounded-xl border-2 p-2 my-2"
        value={publishedMapNav.suggest}
        onChange={(e) => {
          dispatch(setSuggest(e.target.value));
        }}
        />
      </div>
            <hr className="border-2"/>
      <div>
      </div>
    </div>
  );
};

export default Pusblish;
