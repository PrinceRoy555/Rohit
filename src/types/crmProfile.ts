export type AvatarType = 'library' | 'custom' | 'initials';

export type AvatarCategory = 'Anime' | '3D Tech' | 'Cartoon' | 'Illustrated';

export interface AdminUserProfile {
  uid?: string;
  name: string;
  displayName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  phone?: string;
  avatarType: AvatarType;
  avatarId?: string;
  customPhotoUrl?: string;
  backgroundColor: string;
  bio?: string;
  updatedAt?: string;
}

export interface AvatarLibraryItem {
  id: string;
  name: string;
  category: AvatarCategory;
  description: string;
  tags: string[];
}

export interface AvatarBackgroundPreset {
  id: string;
  name: string;
  value: string;
  textColor?: string;
  isGradient?: boolean;
}
