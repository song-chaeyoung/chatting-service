import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Room {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  is_private: boolean;
  password?: string;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  links?: MessageLink[];
}

export interface MessageLink {
  id: string;
  message_id: string;
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  last_accessed_at: string;
}
