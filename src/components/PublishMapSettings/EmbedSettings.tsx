"use client";
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react';
import { BiCopy } from 'react-icons/bi';
import { FaCheck } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';

type Props = {};

const EmbedSettings = (props: Props) => {
  let { id: mapId } = useParams();
  mapId = String(mapId);

  const [mapName, setMapName] = useState<any>();
  useEffect(() => {
    const getMapName = async () => {
      const { data } = await supabase
        .from("maps")
        .select("name")
        .eq("map_id", mapId)
        .single();

      console.log(data?.name);
      setMapName(data?.name);
    };
    getMapName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(mapId, mapName);

  const [isCopied, setIsCopied] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [isPro, setIsPro] = useState(true);

  return (
    // <>
    //   {isPro ? (
    //     <div>
    //       <div className="flex gap-24 justify-center">
    //         <div>
    //           <h2 className="font-medium text-xl text-gray-800">Status</h2>
    //           <li className="flex items-center space-x-3">
    //             <div className="w-2 h-2 rounded-full bg-green-500"></div>
    //             <span className="text-gray-800 font-medium">Published</span>
    //           </li>
    //         </div>
    //         <button className="px-8 py-2 rounded-2xl bg-black text-white hover:bg-gray-800">
    //           Publish
    //         </button>
    //       </div>

    //       <hr className="border-t-2 my-6" />

    //       <div className="flex flex-col gap-4">
    //         <h1 className="font-medium text-xl text-gray-800">Embed</h1>
    //         <p className="text-gray-600">Copy the code below and paste it in your web page's HTML</p>
    //         <div className="flex items-center gap-2">
    //           <button
    //             onClick={() => {
    //               navigator.clipboard.writeText(
    //                 `app.macroscope.so/map/${mapName?.replace(/\s+/g, "-")}`
    //               );
    //               setIsCopied(true);
    //             }}
    //             className="text-blue-500"
    //           >
    //             {isCopied ? <FaCheck size={20} /> : <BiCopy size={20} />}
    //           </button>
    //           <input
    //             type="text"
    //             className="w-full p-4 bg-gray-200 border border-gray-300 rounded-lg"
    //             value={`app.macroscope.so/map/${mapName?.replace(/\s+/g, "-")}`}
    //             readOnly
    //           />
    //         </div>
    //       </div>

    //       <div className="flex justify-start gap-8 mt-10">
    //         <h1 className="font-medium text-base text-gray-800">
    //           Macroscope branding <span className="py-1 px-2 bg-green-300">Pro</span>
    //         </h1>
    //         <label className="flex items-center cursor-pointer">
    //           <div
    //             className={`relative w-12 h-6 ${isToggled ? "bg-black" : "bg-gray-300"} rounded-full transition-colors duration-300`}
    //             onClick={() => setIsToggled(!isToggled)}
    //           >
    //             <div
    //               className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${isToggled ? "translate-x-6" : "translate-x-1"}`}
    //             ></div>
    //           </div>
    //         </label>
    //       </div>
    //     </div>
    //   ) : (
    //     <div className="flex flex-col justify-center items-center">
    //       <div className="flex items-center space-x-2">
    //         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
    //           <path d="M12 2L2 9l10 13 10-13-10-7zM4.4 9h15.2L12 20.3 4.4 9zM7 3h10l-2 5H9l-2-5z" />
    //         </svg>
    //         <h1 className="font-medium text-xl text-gray-800">Pro Feature</h1>
    //       </div>
    //       <button className="bg-gray-200 py-2 px-3 mt-4 rounded-md hover:bg-gray-300 text-gray-800">
    //         Upgrade
    //       </button>
    //     </div>
    //   )}

    //   <div className="w-full border-2 mt-20"></div>
    // </>
  //  <div>
  //     Coming soon
  //   </div> 
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

export default EmbedSettings;
