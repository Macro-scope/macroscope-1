"use client"
import { Button, ColorPicker, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setGroupBorderColor,
  setGroupFillColor,
  setTileBorderColor,
  setTileFillColor,
} from "../../redux/localSettingsSlice";
import { saveLocalCardStyle } from "../../hooks/saveLocalCardStyle";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { IoClose, IoCloseOutline } from "react-icons/io5";
import { getMapData } from "../../hooks/getMapData";
import { setCards } from "../../redux/mapCardsSlice";
import { getGlobalMapStyles } from "../../hooks/getGlobalMapStyles";
import { setGlobalSettings } from "../../redux/globalSettingsSlice";
import { useParams } from "next/navigation";
import { useEffect } from "react";

// const DemoCard = () => {
//   const { localtile, localgroup } = useSelector((state: any) => ({
//     localtile: state.localSettings?.tile,
//     localgroup: state.localSettings?.group,
//   }));

//   const { title, group, tileStyle } = useSelector((state: any) => ({
//     title: state.globalSettings.title,
//     group: state.globalSettings.group,
//     tileStyle: state.globalSettings.tile,
//   }));

//   return (
//     <div
//       className="bg-white rounded-lg relative"
//       style={{
//         borderRadius: `${group.corner}`,
//       }}
//     >
//       <div
//         className={`p-2`}
//         style={{
//           border: `${group.borderWeight} solid ${localgroup?.borderColor}`,
//           background: `${localgroup?.fillColor}`,
//           borderRadius: `${group.corner}`,
//         }}
//       >
//         <div
//           className={`text-black text-xl font-semibold mb-2 absolute -top-4 w-full ${
//             title.alignment === "center"
//               ? "text-center -left-1"
//               : title.alignment === "right"
//               ? "text-right right-2"
//               : "text-left"
//           }`}
//           style={{
//             color: `#${
//               title.fontColor === "default"
//                 ? localgroup?.fillColor
//                 : title.fontColor
//             }`,
//             zIndex: 1000,
//           }}
//         >
//           <span
//             style={{ borderRadius: `${title.corner}` }}
//             className="text-center text-sm border-2 rounded bg-blue-400 border-black px-2 py-1"
//           >
//             Demo Card
//           </span>
//         </div>
//         <div
//           className={`flex flex-wrap gap-2 p-5 rounded-md cursor-pointer`}
//           style={{ zIndex: 2000 }}
//         >
//           <div
//             className="bg-white shadow-lg p-2 flex items-center justify-center z-50"
//             style={{
//               border: `${tileStyle.borderWeight} solid ${localtile?.borderColor}`,
//               background: `${localtile?.fillColor}`,
//               // background: `#fff`,
//               borderRadius: `${tileStyle.corner}`,
//             }}
//           >
//             <div className="h-7 w-7 rounded-full mr-2">
//               <img
//                 src={`https://icons.duckduckgo.com/ip3/www.google.com.ico`}
//                 className="h-full"
//                 alt="logo"
//               />
//             </div>
//             <p>Google</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const LocalSettings = () => {
  const { cardId, localStyle, group, tile } = useSelector((state: any) => ({
    cardId: state.localCardId.cardId,
    localStyle: state.localSettings,
    group: state.localSettings.group,
    tile: state.localSettings.tile,
  }));

  console.log(cardId);
  const dispatch = useDispatch();

  let { id: mapId } = useParams();
  mapId = String(mapId);

  useEffect(() => {
    console.log("localStyle", localStyle);
  }, [localStyle]);

  const saveSettings = () => {
    console.log("Final ---- ",localStyle)
    saveLocalCardStyle(cardId, localStyle);
    dispatch(setMapSettings("none"));

    const getCards = async (mapId: string) => {
      try {
        const data: any = await getMapData(mapId);
        if (data) {
          dispatch(setCards(data.cards));
        }
      } catch (error) {
        console.error("Fetching error:", error);
      }
    };

    const setGlobalStyles = async (mapId: string) => {
      const globalStyles: any = await getGlobalMapStyles(mapId);
      dispatch(setGlobalSettings(globalStyles!.settings));
    };

    if (mapId) {
      getCards(mapId);
      setGlobalStyles(mapId);
    }
  };

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
        dispatch(setMapSettings("none"));
      },
      okText: "Save changes",
      cancelText: "Discard",
    });
  };

  return (
    <div className="w-[360px] bg-white flex flex-col gap-3 px-3 h-full">
      <div className="flex justify-between items-center">
        <p className="font-bold">Local Settings</p>
        <button
          className="w-fit"
          onClick={showDiscardConfirm}
        >
          <IoCloseOutline className="text-black text-xl" />
        </button>
      </div>

      {/* <DemoCard /> */}

      <div className="flex flex-col gap-2">
        <p className="font-semibold">Group</p>
        <div className="flex w-full justify-between">
          <p>Border Color</p>
          <ColorPicker
            style={{ width: 100 }}
            disabledAlpha
            showText
            value={group.borderColor}
            onChange={(hex) => {
              console.log(hex.toHexString());
              dispatch(setGroupBorderColor(hex.toHexString()));
            }}
          />
        </div>

        <div className="flex w-full justify-between mb-2">
          <p>Fill Color</p>
          <ColorPicker
            style={{ width: 100 }}
            disabledAlpha
            showText
            value={group.fillColor}
            onChange={(hex) => {
              dispatch(setGroupFillColor(hex.toHexString()));
            }}
          />
        </div>
      </div>
      <hr />

      <div className="flex flex-col gap-2">
        <p className="font-semibold">Tile</p>
        <div className="flex w-full justify-between">
          <p>Border Color</p>
          <ColorPicker
            style={{ width: 100 }}
            disabledAlpha
            showText
            value={tile.borderColor}
            onChange={(hex) => {
              dispatch(setTileBorderColor(hex.toHexString()));
            }}
          />
        </div>

        <div className="flex w-full justify-between">
          <p>Fill Color</p>
          <ColorPicker
            style={{ width: 100 }}
            disabledAlpha
            showText
            value={tile.fillColor}
            onChange={(hex) => {
              dispatch(setTileFillColor(hex.toHexString()));
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 h-full justify-end">
        <Button
          onClick={saveSettings}
          className="bg-black text-white font-semibold"
        >
          Save
        </Button>
        <Button
          className="text-black font-semibold"
          onClick={() => {
            dispatch(setMapSettings("none"));
          }}
        >
          Discard
        </Button>
      </div>
    </div>
  );
};

export default LocalSettings;
