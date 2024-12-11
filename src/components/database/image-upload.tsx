import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as needed
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
  initialImage?: string;
  initialUrl?: string;
}

export function ImageUpload({ onImageSelect, onClose, initialImage, initialUrl }: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store selected file
  const [selectedUrlImage, setSelectedUrlImage] = useState<string>(''); // Store selected URL
  const [searchUrl, setSearchUrl] = useState(initialUrl || '');
  const [faviconUrls, setFaviconUrls] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imageOptions, setImageOptions] = useState({
    maxWidth: 1024,
    quality: 0.8,
    convertToWebP: true
  });

  useEffect(() => {
    if (initialImage && initialImage.startsWith('https://')) {
      setPreviewUrl(initialImage);
      setSelectedUrlImage(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    if (initialUrl) {
      setSearchUrl(initialUrl);
      handleSearch(initialUrl);
    }
  }, [initialUrl]);

  const uploadToSupabase = async () => {
    try {
      setUploading(true);
      let publicUrl: string;

      if (selectedFile) {
        // Upload file from local
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl: url } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        publicUrl = url;
      } else if (selectedUrlImage) {
        // Upload file from URL
        const response = await fetch(selectedUrlImage);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        const fileExt = 'jpg';
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl: url } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        publicUrl = url;
      } else {
        throw new Error('No image selected');
      }

      onImageSelect(publicUrl);
      onClose();
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (e.g., 5MB limit)
      const fileSizeLimit = 5 * 1024 * 1024; // 5MB
      if (file.size > fileSizeLimit) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      // Optimize image before storing
      const optimizedFile = await optimizeImage(file);
      
      // Store the file and show preview
      setSelectedFile(optimizedFile);
      setSelectedUrlImage(''); // Clear URL selection
      setPreviewUrl(URL.createObjectURL(optimizedFile));
    } catch (error) {
      console.error('Error handling file selection:', error);
      alert('Error selecting file. Please try again.');
    }
  };

  const handleUrlSelect = () => {
    try {
      if (!imageUrl) return;

      // Store the URL and show preview
      setSelectedUrlImage(imageUrl);
      setSelectedFile(null); // Clear file selection
      setPreviewUrl(imageUrl);
      setImageUrl(''); // Clear input
    } catch (error) {
      console.error('Error handling URL selection:', error);
      alert('Error selecting URL. Please try again.');
    }
  };

  const handleSearch = async (url: string) => {
    try {
      setIsSearching(true);
      if (!url) return;

      // Normalize URL
      let urlToUse = url;
      if (!urlToUse.startsWith('http://') && !urlToUse.startsWith('https://')) {
        urlToUse = 'https://' + urlToUse;
      }

      const urlObj = new URL(urlToUse);
      const domain = urlObj.hostname;

      if (!domain) return;

      const possibleUrls = [
        // High quality Google favicon services
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=128`,
        
        // Third-party icon services
        `https://icon.horse/icon/${domain}`,
        `https://favicon.splitbee.io/${domain}`,
        `https://api.faviconkit.com/${domain}/144`,
        `https://icon.horse/icon/${domain}?size=large`,
        `https://besticon-demo.herokuapp.com/icon?url=${domain}&size=80..120..200`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
        
        // Direct favicon paths
        `${urlObj.protocol}//${domain}/favicon.ico`,
        `${urlObj.protocol}//${domain}/favicon.png`,
        `${urlObj.protocol}//${domain}/favicon-32x32.png`,
        `${urlObj.protocol}//${domain}/favicon-64x64.png`,
        `${urlObj.protocol}//${domain}/favicon-96x96.png`,
        `${urlObj.protocol}//${domain}/favicon-128x128.png`,
        
        // Apple touch icons
        `${urlObj.protocol}//${domain}/apple-touch-icon.png`,
        `${urlObj.protocol}//${domain}/apple-touch-icon-precomposed.png`,
        `${urlObj.protocol}//${domain}/apple-touch-icon-57x57.png`,
        `${urlObj.protocol}//${domain}/apple-touch-icon-72x72.png`,
        `${urlObj.protocol}//${domain}/apple-touch-icon-114x114.png`,
        `${urlObj.protocol}//${domain}/apple-touch-icon-144x144.png`,
        
        // Microsoft tile icons
        `${urlObj.protocol}//${domain}/mstile-144x144.png`,
        `${urlObj.protocol}//${domain}/mstile-150x150.png`,
        `${urlObj.protocol}//${domain}/mstile-310x310.png`,
        
        // Common asset directories
        `${urlObj.protocol}//${domain}/assets/favicon.ico`,
        `${urlObj.protocol}//${domain}/assets/images/favicon.ico`,
        `${urlObj.protocol}//${domain}/assets/img/favicon.ico`,
        `${urlObj.protocol}//${domain}/assets/icons/favicon.ico`,
        `${urlObj.protocol}//${domain}/assets/images/logo.png`,
        `${urlObj.protocol}//${domain}/assets/img/logo.png`,
        `${urlObj.protocol}//${domain}/assets/logo.png`,
        `${urlObj.protocol}//${domain}/images/logo.png`,
        
        // Static directories
        `${urlObj.protocol}//${domain}/static/favicon.ico`,
        `${urlObj.protocol}//${domain}/static/images/favicon.ico`,
        `${urlObj.protocol}//${domain}/static/img/favicon.ico`,
        `${urlObj.protocol}//${domain}/static/logo.png`,
        `${urlObj.protocol}//${domain}/static/images/logo.png`,
        `${urlObj.protocol}//${domain}/static/img/logo.png`,
        
        // Public directories
        `${urlObj.protocol}//${domain}/public/favicon.ico`,
        `${urlObj.protocol}//${domain}/public/images/favicon.ico`,
        `${urlObj.protocol}//${domain}/public/img/favicon.ico`,
        `${urlObj.protocol}//${domain}/public/logo.png`,
        
        // WordPress paths
        `${urlObj.protocol}//${domain}/wp-content/uploads/favicon.ico`,
        `${urlObj.protocol}//${domain}/wp-content/uploads/site-icon.png`,
        `${urlObj.protocol}//${domain}/wp-content/themes/favicon.ico`,
        `${urlObj.protocol}//${domain}/wp-content/uploads/logo.png`,
        
        // Common CMS paths
        `${urlObj.protocol}//${domain}/sites/default/files/favicon.ico`,
        `${urlObj.protocol}//${domain}/media/favicon.ico`,
        `${urlObj.protocol}//${domain}/media/logo.png`,
        
        // PWA manifest icons
        `${urlObj.protocol}//${domain}/icon-192x192.png`,
        `${urlObj.protocol}//${domain}/icon-256x256.png`,
        `${urlObj.protocol}//${domain}/icon-384x384.png`,
        `${urlObj.protocol}//${domain}/icon-512x512.png`,
      ];

      const validUrls: string[] = [];

      // Use Promise.allSettled to fetch all URLs concurrently
      const results = await Promise.allSettled(
        possibleUrls.map(async (faviconUrl) => {
          try {
            const response = await fetch(faviconUrl, {
              redirect: 'follow',
              // Add a timeout to prevent hanging
              signal: AbortSignal.timeout(5000)
            });

            if (response.ok || response.status === 304) {
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.startsWith('image/')) {
                return faviconUrl;
              }
            }
            return null;
          } catch (e) {
            console.debug(`Failed to fetch favicon from ${faviconUrl}:`, e);
            return null;
          }
        })
      );

      // Filter out failed requests and duplicates
      const uniqueUrls = new Set(
        results
          .filter((result): result is PromiseFulfilledResult<string | null> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value)
      );
//  setFaviconUrls(Array.from(uniqueUrls));
      // Filter out null values and convert to string array
      const validFaviconUrls = Array.from(uniqueUrls).filter((url): url is string => url !== null);
      setFaviconUrls(validFaviconUrls);
    } catch (error) {
      console.error('Error searching favicons:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFaviconSelect = (url: string) => {
    setSelectedUrlImage(url);
    setPreviewUrl(url);
  };

  const optimizeImage = async (file: File): Promise<File> => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Calculate new dimensions maintaining aspect ratio
    let { width, height } = image;
    if (width > imageOptions.maxWidth) {
      height *= imageOptions.maxWidth / width;
      width = imageOptions.maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    const format = imageOptions.convertToWebP ? 'image/webp' : file.type;
    const blob = await new Promise<Blob>(resolve => {
      canvas.toBlob(blob => resolve(blob!), format, imageOptions.quality);
    });

    return new File([blob], file.name.replace(/\.[^/.]+$/, format === 'image/webp' ? '.webp' : ''), {
      type: format
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="upload" className="h-full flex flex-col">
            <TabsList className="w-full  bg-gray-100 p-1 rounded-lg shrink-0">
              <TabsTrigger 
                value="upload" 
                className="w-full rounded-md data-[state=active]:bg-white"
              >
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="w-full rounded-md data-[state=active]:bg-white"
              >
                Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex space-y-4">
              <div className=' mt-2 w-full'>
                <div className="relative pb-5">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                    id="file-input"
                  />
                  <div className="flex">
                    <Input
                      readOnly
                      value={selectedFile?.name || "No file chosen"}
                      className="flex-1 rounded-r-none  focus-visible:ring-0 h-8"
                    />
                    {/* UI CHANGE */}
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center justify-center px-4 py-1 h-8 border border-l-0 rounded-r-md bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-600 min-w-[140px]"
                    >
                      Upload from File
                    </label>
                  </div>
                  
                </div>
                
                <div className="flex gap-0">
                  <Input
                    type="text"
                    placeholder="Paste image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={uploading}
                    className="flex-1 rounded-r-none  focus-visible:ring-0 h-8"
                  />
                  <Button 
                    onClick={handleUrlSelect}
                    disabled={uploading || !imageUrl}
                    variant="outline"
                    className="rounded-l-none border-l-0 h-8 bg-white hover:bg-gray-50 text-gray-600 min-w-[140px]"
                  >
                    Upload from URL
                  </Button>
                </div>

                <p className="text-xs text-gray-600 mt-20">
                  Supported formats: JPEG, PNG, SVG, ICO, WEBP
                </p>
              </div>
            </TabsContent>

            <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-0 bg-white z-10 pb-2 shrink-0">
                <Input
                  type="text"
                  placeholder="Paste URL"
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  disabled={isSearching}
                  className="active:ring-0 rounded-r-none border-r-0 focus-visible:ring-0 h-8 "
                />
                <Button 
                  onClick={() => handleSearch(searchUrl)}
                  disabled={isSearching || !searchUrl}
                  variant="outline"
                  className="rounded-l-none border-l-0 h-8 bg-white hover:bg-gray-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 max-h-[146px]  ">
                <div className="grid grid-cols-2 gap-4 p-1">
                  {faviconUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleFaviconSelect(url)}
                      className={cn(
                        "aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-gray-200 transition-colors",
                        selectedUrlImage === url && "ring-2 ring-black"
                      )}
                    >
                      <img 
                        src={url} 
                        alt={`Favicon ${index + 1}`}
                        className="w-12 h-12 object-contain mb-2"
                      />
                      <div className="text-xs text-gray-500 break-all text-center">
                        {url.split('/').pop()}
                      </div>
                    </button>
                  ))}
                  {faviconUrls.length === 0 && (
                    <>
                      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <div className="text-sm font-medium">No results</div>
                        <div className="text-xs text-gray-500">Search to find favicons</div>
                      </div>
                      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <div className="text-sm font-medium">No results</div>
                        <div className="text-xs text-gray-500">Search to find favicons</div>
                      </div>
                      <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <div className="text-sm font-medium">No results</div>
                        <div className="text-xs text-gray-500">Search to find favicons</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <div className="relative w-full h-full group">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  onError={() => setPreviewUrl('')}
                />
                <button
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedUrlImage('');
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 mb-2"></div>
                <div className="w-24 h-12 bg-gray-200"></div>
              </div>
            )}
            
          </div>
          <Button 
            variant="default" 
            onClick={uploadToSupabase}
            disabled={uploading || (!selectedFile && !selectedUrlImage)}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            {uploading ? 'Uploading...' : 'Done'}
          </Button>
        </div>
      </div>
    </div>
  );
}