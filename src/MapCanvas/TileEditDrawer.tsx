"use client";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { url } from "inspector";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { ImNewTab } from "react-icons/im";
import { useSelector } from "react-redux";

type Props = {
  tileId: string;
  cancelDrawer: () => void;
};

const TileEditDrawer = (props: Props) => {
  const [tile, setTile] = useState<any>();
  const [categories, setCategories] = useState([]);
  const { mapCards } = useSelector((state: any) => ({
    mapCards: state.mapCards,
  }));

  useEffect(() => {
    setCategories(
      mapCards.data.map((c: any) => {
        return {
          value: c.card_id,
          label: c.name,
        };
      })
    );
  }, [mapCards]);

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      const { data } = await supabase
        .from("tiles")
        .select()
        .eq("tile_id", tileId)
        .single();

      setTile(data);
    };

    getTileInfo(props.tileId);
  }, [props.tileId]);

  const convertToDate = (timestamp: string) => {
    const date = new Date(timestamp); // Convert timestamp to Date object
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return new Date(timestamp).toLocaleString();
  };

  const [newName, setNewName] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");

  const saveTileSettings = async () => {
    const { data, error } = await supabase
      .from("tiles")
      .update({
        name: newName,
        url: newUrl,
        card_id: newCategory,
      })
      .eq("tile_id", props.tileId)
      .select()
      .single();

    if (error) {
      console.log(error);
    } else {
      console.log(data);
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
        saveTileSettings();
      },
      onCancel() {
        props.cancelDrawer;
      },
      okText: "Save changes",
      cancelText: "Discard",
    });
  };

  return (
    <div className="flex flex-col gap-2" style={{ zIndex: "2000" }}>
      <div className="">
        <img
          src={`https://icons.duckduckgo.com/ip3/www.${tile?.url}.ico`}
          alt=""
          className="h-40"
        />
        <Input type="file" />
      </div>

      <div className="flex flex-col">
        Name
        <Input
          type="text"
          onChange={(e) => setNewName(e.target.value)}
          value={newName || tile?.name}
        />
      </div>
      <div className="flex flex-col">
        URL
        <Input
          type="text"
          onChange={(e) => setNewUrl(e.target.value)}
          value={newUrl || tile?.url}
        />
      </div>
      <div className="flex flex-col">
        Category
        <Select
          defaultValue={"Select Category"}
          // style={{ width: 120 }}
          // onChange={handleChange}
          onChange={(value) => setNewCategory(value)}
          options={categories}
        />
      </div>
      <div className="flex flex-col justify-between relative">
        <p>Description</p>
        <Button className="absolute z-50 right-3 top-[50%]">Edit</Button>
        <TextArea rows={5} />
      </div>
      <div>Last Modified: {convertToDate(tile?.updated_at)}</div>

      <div className="flex gap-2 h-full justify-end">
        <Button
          onClick={saveTileSettings}
          className="bg-black text-white font-semibold"
        >
          Save
        </Button>
        <Button
          className="text-black font-semibold"
          onClick={props.cancelDrawer}
        >
          Discard
        </Button>
      </div>
    </div>
  );
};

export default TileEditDrawer;
