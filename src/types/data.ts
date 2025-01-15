export interface Tile {
    url: string;
    logo: string | null;
    name: string;
    tags: string[];
    hidden: boolean;
    card_id: string;
    tile_id: string;
    position: number;
    created_at: string;
    updated_at: string;
    category_id: string;
    description: string | null;
    description_markdown: string | null;
  }
  
  export interface Settings {
    tile: {
      fillColor: string;
      borderColor: string;
    };
    group: {
      fillColor: string;
      borderColor: string;
    };
  }
  
  export interface Category {
    name: string;
    color: string | null;
    map_id: string;
    created_at: string;
    category_id: string;
  }
  
  export interface Card {
    name: string;
    tiles: Tile[];
    hidden: boolean;
    map_id: string;
    card_id: string;
    position: [string, string];
    settings: Settings;
    dimension: [string, string];
    categories: Category;
    created_at: string;
    category_id: string;
    description: string | null;
    parent_category_id: string | null;
  }
  