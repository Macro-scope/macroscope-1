'use client';
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Modal,
} from 'antd';

import { supabase } from '../../lib/supabaseClient';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { updateMapCards } from '../../hooks/updateMapCards';

import {Copy,RefreshCcw,Check,Plus,Cloud,X} from "lucide-react"
import {
  setPublishMapSettings,
} from '../../redux/publishedMapSlice';
import { setPublishedNav } from '../../hooks/updatePublishNav';

import { renameMap } from '../../hooks/renameMap';

import { updateImages } from '../../hooks/updateImages';
import { usePathname, useRouter } from 'next/navigation';
import PublishMapSettings from '@/components/PublishMapSettings/PublishMapSettings';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // Get the current location object
  const currentPath = usePathname();
  const router = useRouter();
  const saveStatus = useSelector((state: any) => state.saveStatus.status);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    // setUser(null)
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a className="w-[400px]" href="/dashboard">
          Dashboard
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <div className="w-full text-red-500" onClick={handleLogout}>
          Logout
        </div>
      ),
    },
  ];

  const [currUser, setCurrUser] = useState<User | null>();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrUser(user);
    };

    const setPublishSettings = async () => {
      const { data } = await supabase
        .from('maps')
        .select('navbar')
        .eq('map_id', mapId)
        .single();
      dispatch(setPublishMapSettings(data?.navbar));
    };
    setPublishSettings();
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let { id: mapId } = useParams();
  mapId = String(mapId);
  //temporray code

  const [mapName, setMapName] = useState<any>();
  useEffect(() => {
    const getMapName = async () => {
      const { data } = await supabase
        .from('maps')
        .select('name')
        .eq('map_id', mapId)
        .single();

      console.log(data?.name);
      setMapName(data?.name);
    };
    getMapName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //temporray code

  const { mapCards, publishedMapNav, images } = useSelector((state: any) => ({
    mapCards: state.mapCards,
    publishedMapNav: state.publishedMapNav,
    images: state.images,
  }));

  const [isSaving, setisSaving] = useState(false);

  // const toast = useToast();
  const updateCards = async () => {
    updateMapCards(mapId!, mapCards.data);
    setisSaving(true);
    setTimeout(() => {
      setisSaving(false);
    }, 3000);
    await supabase
      .from('maps')
      .update({ last_updated: new Date() }) // Correctly pass the update as an object
      .eq('map_id', mapId);
    // toast.success("Map Saved");
  };

  // const updateImg = async () => {
  //   updateImages(mapId!, images);
  //   setisSaving(true);
  //   setTimeout(() => {
  //     setisSaving(false);
  //   }, 3000);
  //   await supabase
  //     .from("maps")
  //     .update({ last_updated: new Date() }) // Correctly pass the update as an object
  //     .eq("map_id", mapId);
  //   // toast.success("Map Saved");
  // };

  // useEffect(() => {
  //   updateCards();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mapCards]);

  useEffect(() => {
    // updateImg();
  }, [images]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [_websiteUrl, _setWebsiteUrl] = useState('');

  const dispatch = useDispatch();

  const oncloseModal = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const modal2Cancel = () => {
    setIsPublishModalOpen(false);
  };

  const handleUnpublish = async () => {
    await supabase
      .from('maps')
      .update({ is_published: false })
      .eq('map_id', mapId);

    setIsModalOpen(false);
  };

  const handlePublish = async () => {
    await supabase
      .from('maps')
      .update({ is_published: true })
      .eq('map_id', mapId);

    setIsModalOpen(false);
    setPublishedNav(mapId!, publishedMapNav);
    // const componentHtml = renderToString(
    //   <Provider store={store}>
    //     <PannableCanvas />
    //   </Provider>
    // );
    // const navbarHtml = renderToString(
    //   <Provider store={store}>
    //     <MapNavbar />
    //   </Provider>
    // );
    // const url = await convertToHtml(mapId!, componentHtml, navbarHtml);
    // console.log(url);
    // setWebsiteUrl(url);
    setIsPublishModalOpen(true);
  };

  const getCurrentUserId = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('Here ------ ', session);
    return session?.user?.id || null;
  };

  const createNewProject = async () => {
    const userId = (await getCurrentUserId()) || null;

    if (userId) {
      const { data, error } = await supabase
        .from('maps')
        .insert([
          {
            user_id: userId,
            name: newProjectName,
          },
        ])
        .select('map_id')
        .single();

      if (error) {
        console.error('Error inserting data:', error);
        return;
      }

      await supabase.from("publish_settings").insert({
        map_id:data.map_id,
        title:newProjectName,
        description:newProjectName
      })

      // Generate a UUID for the category
      const categoryId = crypto.randomUUID();

      // Create a category with the generated UUID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert([
          {
            category_id: categoryId,
            name: 'Other',
            map_id: data.map_id,
            created_at: new Date().toISOString(),
          },
        ])
        .select('category_id, name')
        .single();

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        return;
      }

      // Insert a new card with category_id
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .insert([
          {
            category_id: categoryData.category_id,
            map_id: data.map_id,
            name: categoryData.name,
          },
        ])
        .select('card_id')
        .single();

      if (cardError) {
        console.error('Error inserting card:', cardError);
        return;
      }

      const { data: tileData, error: tileError } = await supabase
        .from('tiles')
        .insert([
          {
            category_id: categoryData.category_id,
            card_id: cardData.card_id,
            name: 'Macroscope',
            url: 'macroscope.so',
          },
        ])
        .single();

      if (tileError) {
        console.error('Error inserting tile:', tileError);
        return;
      }

      setIsModalOpen(false);
      router.push(`/editor/${data?.map_id}`);
    } else {
      console.error('No user is currently logged in');
    }
  };

  const [newProjectName, setNewProjectName] = useState('Untitled');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const showMapModal = () => {
    setIsMapModalOpen(true);
  };
  const handleCancelMap = () => {
    setNewProjectName('untitled');
    setIsMapModalOpen(false);
  };
  // const openProject = async (wid: string) => {
  //   navigate(`/map/${wid}`);
  // };
  const [isEditing, setIsEditing] = useState(false);
  // const [mapName, setMapName] = useState("initialName");

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: any) => {
    setMapName(e.target.value);
  };

  const handleBlur = () => {
    renameMap(mapId!, mapName);
    setIsEditing(false); // Switch back to text display on input blur
  };

  const [isCopied, setIsCopied] = useState(false);

  const [customDomain, setCustomDomain] = useState('');

  async function addDomain(domain: string, projectId: string) {
    const response = await fetch('/api/add-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, projectId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add domain');
    }
    return response.json();
  }

  const handleCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Add domain to Vercel project
      await addDomain(customDomain, process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID!);

      // Save domain and route mapping to your database
      const { error } = await supabase
        .from('maps')
        .update({ domain: customDomain })
        .eq('map_id', mapId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      console.log('finally');
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <Modal
          title="Create New Map"
          width={400}
          centered
          footer={[
            <Button
              key="back"
              className="bg-black text-white mt-4 w-[120px]"
              onClick={createNewProject}
            >
              Create
            </Button>,
          ]}
          open={isMapModalOpen}
          onCancel={handleCancelMap}
        >
          <Input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter your map name"
            className="mt-5"
            required
          />
        </Modal>

        {isModalOpen && (
          <div className="fixed top-[47px] right-0 h-[calc(100vh-50px)] bg-white shadow-lg z-40 flex">
            <div className="w-[420px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-medium text-md">Publish Settings</span>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setIsModalOpen(false)}
                  className="p-0 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <PublishMapSettings mapId={mapId} isPrevopen={setIsModalOpen} />
            </div>
          </div>
        )}

        <Modal
          title="Published Site"
          open={isPublishModalOpen}
          onCancel={modal2Cancel}
          footer={null}
          width={350}
        >
          <div className="flex gap-2">
            <Input
              value={`app.macroscope.so/map/${mapName?.replace(/\s+/g, '-')}`}
              readOnly
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `app.macroscope.so/map/${mapName?.replace(/\s+/g, '-')}`
                );
                setIsCopied(true);
              }}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </Modal>
        <div className="bg-white p-2 flex justify-between items-center border-b py-2 pl-5">
          {currentPath === '/dashboard' ? (
            <div></div>
          ) : (
            <div>
               
                

              {isEditing ? (
                <div className="flex items-center gap-2">
                  

                  <img onClick={()=>{router.push("/dashboard")}} src="/logosmallblack.svg" alt="logo" className="h-7 cursor-pointer" />

                <input
                  type="text"
                  value={mapName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  autoFocus
                  className="font-medium text-xl border-b-2 border-gray-300 focus:outline-none"
                />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <img  onClick={()=>{  router.push("/dashboard")}} src="/logosmallblack.svg" alt="logo" className="h-7 cursor-pointer" />
                  <div
                    className="text-lg font-semibold cursor-pointer "
                    onClick={handleTextClick}
                  >
                    {mapName}
                  </div>
                  <span className="text-xs bg-green-400 text-white px-3 rounded-full">
                    Pro
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-center items-center gap-2">
            {currentPath === '/dashboard' ||
            currentPath === '/dashboard/subscriptions' ? (
              <>
                <button
                  onClick={showMapModal}
                  className="bg-black flex justify-center items-center gap-2 text-white h-[30px] px-2 rounded-full text-sm"
                >
                  <Plus />
                  <p className="pr-2">Create New</p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={updateCards}
                  className="mx-2 font-semibold text-gray-400 hover:underline"
                >
                  {isSaving || saveStatus === 'saving' ? (
                    <div className="flex items-center gap-1">
                      <RefreshCcw className="text-[20px] animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Cloud className="text-[20px]" />
                    </div>
                  )}
                </button>
                <div className="flex justify-center items-center gap-3">
                  <button
                    onClick={() => {
                      window.open(
                        `https://app.macroscope.so/preview/${mapId}`,
                        '_blank'
                      );
                    }}
                    title="Preview Map"
                  >
                    <img
                      src="/goto_map_icon.svg"
                      alt=""
                      className="w-[20px] h-[20px]"
                    />
                  </button>
                  <button
                    onClick={showModal}
                    className="text-white text-sm px-3 h-[30px] w-[80px] flex items-center justify-center bg-black rounded-full"
                  >
                    Publish
                  </button>
                </div>
              </>
            )}
            <button className="border-none text-3xl bg-black rounded-full h-[30px] w-[30px]">
              {/* <FaUserCircle /> */}
              <Dropdown menu={{ items }} placement="bottomRight" arrow>
                {currUser?.user_metadata.avatar_url ? (
                  <img
                    src={currUser.user_metadata.avatar_url}
                    alt="profile"
                    className="rounded-full h-[30px] w-[30px] text-sm bg-black justify-end"
                    // onError={(e) => {
                    //   e.currentTarget.style.display = 'none';
                    //   (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                    // }}
                  />
                ) : (
                  <div className="rounded-full h-[30px] w-[30px] bg-black text-white flex items-center justify-center text-lg uppercase">
                    {currUser?.user_metadata.full_name?.[0] ||
                      currUser?.email?.[0] ||
                      '?'}
                  </div>
                )}
              </Dropdown>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
