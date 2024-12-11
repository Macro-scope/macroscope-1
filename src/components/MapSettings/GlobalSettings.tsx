"use client"
import { Button, Modal, Segmented, Select } from "antd";
import { LuAlignJustify, LuAlignLeft, LuAlignRight } from "react-icons/lu";
import {
  TbBorderCornerPill,
  TbBorderCornerRounded,
  TbBorderCornerSquare,
} from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import {
  setGlobalSettings,
  setGroupBorderWeight,
  setGroupCorner,
  setTileBorderWeight,
  setTileCorner,
  setTitleAlignment,
  setTitleBorder,
  setTitleCorner,
  setTitleFontColor,
} from "../../redux/globalSettingsSlice";
import { useParams } from "next/navigation";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { IoClose, IoCloseOutline } from "react-icons/io5";
import { setGlobalMapStyle } from "@/hooks/setGlobalMapStyle";
import { useRef } from "react";
import { getGlobalMapStyles } from "@/hooks/getGlobalMapStyles";

const GlobalSettings = () => {
  const { mapStyle, title, group, tileStyle } = useSelector((state: any) => ({
    mapStyle: state.globalSettings,
    title: state.globalSettings.title,
    group: state.globalSettings.group,
    tileStyle: state.globalSettings.tile,
  }));
  const dispatch = useDispatch();

  const prevMapStyle = mapStyle;

  let { id: mapId } = useParams();
  mapId = String(mapId);

  const { confirm } = Modal;
  const showDiscardConfirm = () => {
    confirm({
      title: "Do you want to save these changes?",
      icon: (
        <BsFillExclamationCircleFill className="text-2xl mr-2 text-blue-500" />
      ),
      // content: 'Some descriptions',
      onOk() {
        saveSettings();
      },
      onCancel() {
        //
        resetGlobalSetting();
        dispatch(setMapSettings("none"));
      },
      okText: "Save changes",
      cancelText: "Discard",
    });
  };

  const resetGlobalSetting = async () => {
    const globalStyles: any = await getGlobalMapStyles(mapId);
    dispatch(setGlobalSettings(globalStyles!.settings));
  }

  const saveSettings = () => {
    setGlobalMapStyle(mapId!, mapStyle);
    dispatch(setMapSettings("none"));
  };

  return (
    <div className="w-[360px] bg-white flex flex-col gap-3 overflow-y-scroll px-3 h-full">
      <div className="flex justify-between items-center">
        <p className="font-bold">Global Settings</p>
        <button
          className="w-fit"
          onClick={showDiscardConfirm}
        >
          <IoCloseOutline className="text-black text-xl" />
        </button>
      </div>
      <p className="font-semibold">Group Name</p>
      <div className="flex flex-col gap-2">
        {/* <div className="flex w-full justify-between">
          <p>Style Template</p>
        </div> */}
        {/* <Segmented
          // value={title.corner}
          // onChange={(value) => {
          //   dispatch(setTitleCorner(value));
          // }}
          options={[
            {
              value: "2px",
              icon: (
                <img
                  src="https://picsum.photos/2000"
                  alt="template"
                  className="h-20 w-full rounded"
                />
              ),
            },
            {
              value: "7px",
              icon: (
                <img
                  src="https://picsum.photos/2001"
                  alt="template"
                  className="h-20 w-full rounded"
                />
              ),
            },
          ]}
          block
        /> */}
        <div className="flex w-full justify-between">
          <p>Border & Fill</p>
          <Select
            value={title.border}
            style={{ width: 130 }}
            onChange={(value)=>dispatch(setTitleBorder(value))}
            options={[
              { value: "fill", label: "Fill" },
              { value: "no_fill", label: "No Fill" },
            ]}
          />
        </div>
        <div className="flex w-full justify-between">
          <p>Corner</p>
          <Segmented
            value={title.corner}
            style={{ width: 130 }}
            onChange={(value) => {
              dispatch(setTitleCorner(value));
            }}
            options={[
              {
                value: "2px",
                icon: <TbBorderCornerSquare className="text-xl" />,
              },
              {
                value: "7px",
                icon: <TbBorderCornerRounded className="text-xl" />,
              },
              {
                value: "15px",
                icon: <TbBorderCornerPill className="text-xl" />,
              },
            ]}
          />
        </div>
        <div className="flex w-full justify-between">
          <p>Alignment</p>
          <Segmented
            style={{ width: 130 }}
            value={title.alignment}
            onChange={(value) => {
              dispatch(setTitleAlignment(value));
            }}
            options={[
              { value: "left", icon: <LuAlignLeft className="text-xl" /> },
              { value: "center", icon: <LuAlignJustify className="text-xl" /> },
              { value: "right", icon: <LuAlignRight className="text-xl" /> },
            ]}
          />
        </div>
        <div className="flex w-full justify-between">
          <p>Text Color</p>
          <Select
            defaultValue="default"
            style={{ width: 130 }}
            value={title.fontColor}
            onChange={(value) => {
              dispatch(setTitleFontColor(value));
            }}
            options={[
              { value: "default", label: "Default" },
              { value: "#000000", label: "Black" },
              { value: "#ffffff", label: "White" },
            ]}
          />
        </div>
      </div>

      <hr />

      <div className="flex flex-col gap-2">
        <p className="font-semibold">Group</p>
        <div className="flex w-full justify-between">
          <p>Border Weight</p>
          <Select
            defaultValue="2px"
            value={group.borderWeight}
            style={{ width: 130 }}
            onChange={(value) => {
              dispatch(setGroupBorderWeight(value));
            }}
            options={[
              {
                value: "1px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    1px<div className="w-full h-[1px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "2px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    2px<div className="w-full h-[2px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "4px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    4px<div className="w-full h-[4px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "8px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    8px<div className="w-full h-[8px] bg-black"></div>
                  </div>
                ),
              },
            ]}
          />
        </div>
        <div className="flex w-full justify-between">
          <p>Corner</p>
          <Segmented
            style={{ width: 130 }}
            value={group.corner}
            onChange={(value) => {
              dispatch(setGroupCorner(value));
            }}
            options={[
              {
                value: "2px",
                icon: <TbBorderCornerSquare className="text-xl" />,
              },
              {
                value: "7px",
                icon: <TbBorderCornerRounded className="text-xl" />,
              },
              {
                value: "15px",
                icon: <TbBorderCornerPill className="text-xl" />,
              },
            ]}
          />
        </div>
      </div>

      <hr />

      <div className="flex flex-col gap-2">
        <p className="font-semibold">Tile</p>
        <div className="flex w-full justify-between">
          <p>Border Weight</p>
          <Select
            defaultValue="2px"
            value={tileStyle.borderWeight}
            style={{ width: 130 }}
            onChange={(value) => {
              dispatch(setTileBorderWeight(value));
            }}
            options={[
              {
                value: "1px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    1px<div className="w-full h-[1px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "2px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    2px<div className="w-full h-[2px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "4px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    4px<div className="w-full h-[4px] bg-black"></div>
                  </div>
                ),
              },
              {
                value: "8px",
                label: (
                  <div className="flex items-center justify-center gap-1">
                    8px<div className="w-full h-[8px] bg-black"></div>
                  </div>
                ),
              },
            ]}
          />
        </div>
        <div className="flex w-full justify-between">
          <p>Corner</p>
          <Segmented
            style={{ width: 130 }}
            value={tileStyle.corner}
            onChange={(value) => {
              dispatch(setTileCorner(value));
            }}
            options={[
              {
                value: "2px",
                icon: <TbBorderCornerSquare className="text-xl" />,
              },
              {
                value: "7px",
                icon: <TbBorderCornerRounded className="text-xl" />,
              },
              {
                value: "25px",
                icon: <TbBorderCornerPill className="text-xl" />,
              },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 h-full justify-end">
        <Button
          className="bg-blue-500 font-semibold text-white"
          onClick={saveSettings}
        >
          Save
        </Button>
        <Button
          className="font-semibold text-black"
          onClick={async () => {
            resetGlobalSetting();
            dispatch(setMapSettings("none"))}}
          // onClick={showDiscardConfirm}
        >
          Discard
        </Button>
      </div>
    </div>
  );
};

export default GlobalSettings;
