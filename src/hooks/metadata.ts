interface Metadata {
    type: 'youtube' | 'website' | 'github' | 'twitter' | 'vimeo';
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    embedUrl?: string;
  }
  
  export const getMetadata = async (url: string): Promise<Metadata> => {
    try {
      // YouTube
      const youtubeRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return {
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          title: 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        };
      }
  
      // Vimeo
      const vimeoRegex = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        return {
          type: 'vimeo',
          url,
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
          title: 'Vimeo Video',
        };
      }
  
      // GitHub
      const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const githubMatch = url.match(githubRegex);
      if (githubMatch) {
        const [, owner, repo] = githubMatch;
        try {
          const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
          const data = await response.json();
          return {
            type: 'github',
            url,
            title: data.full_name,
            description: data.description,
            thumbnail: data.owner.avatar_url,
          };
        } catch (error) {
          console.error('Failed to fetch GitHub metadata:', error);
        }
      }
  
      // Twitter/X
      if (url.includes('twitter.com') || url.includes('x.com')) {
        const tweetId = url.split('/').pop();
        return {
          type: 'twitter',
          url,
          embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
          title: 'Tweet',
        };
      }
  
      // For other websites, try to fetch metadata using a CORS proxy
      const corsProxy = 'https://api.allorigins.win/get?url=';
      const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
      const data = await response.json();
      const html = data.contents;
  
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
  
      // Extract metadata
      const title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') 
        || doc.querySelector('title')?.textContent 
        || url;
      
      const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
        || doc.querySelector('meta[name="description"]')?.getAttribute('content')
        || '';
      
      const thumbnail = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
        || '';
  
      return {
        type: 'website',
        url,
        title,
        description,
        thumbnail,
      };
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      // Return basic metadata if all else fails
      return {
        type: 'website',
        url,
        title: url,
      };
    }
  };