export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string | null;
          folder_id: string | null;
          author_name: string | null;
          is_published: boolean;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string | null;
          folder_id?: string | null;
          author_name?: string | null;
          is_published?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string | null;
          folder_id?: string | null;
          author_name?: string | null;
          is_published?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          icon: string | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          icon?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          icon?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      search_documents: {
        Args: { search_query: string };
        Returns: {
          id: string;
          title: string;
          slug: string;
          folder_id: string | null;
          folder_slug: string | null;
          excerpt: string;
          rank: number;
        }[];
      };
    };
  };
}

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type FolderInsert = Database["public"]["Tables"]["folders"]["Insert"];
