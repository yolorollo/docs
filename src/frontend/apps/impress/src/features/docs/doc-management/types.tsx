import { User } from '@/features/auth';

export interface Access {
  id: string;
  role: Role;
  team: string;
  user: User;
  abilities: {
    destroy: boolean;
    partial_update: boolean;
    retrieve: boolean;
    set_role_to: Role[];
    update: boolean;
  };
}

export enum Role {
  READER = 'reader',
  EDITOR = 'editor',
  ADMIN = 'administrator',
  OWNER = 'owner',
}

export enum LinkReach {
  RESTRICTED = 'restricted',
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
}

export enum LinkRole {
  READER = 'reader',
  EDITOR = 'editor',
}

export type Base64 = string;

export interface Doc {
  id: string;
  title?: string;
  content: Base64;
  creator: string;
  is_favorite: boolean;
  link_reach: LinkReach;
  link_role: LinkRole;
  nb_accesses_ancestors: number;
  nb_accesses_direct: number;
  created_at: string;
  updated_at: string;
  abilities: {
    accesses_manage: boolean;
    accesses_view: boolean;
    ai_transform: boolean;
    ai_translate: boolean;
    attachment_upload: boolean;
    children_create: boolean;
    children_list: boolean;
    collaboration_auth: boolean;
    destroy: boolean;
    favorite: boolean;
    invite_owner: boolean;
    link_configuration: boolean;
    media_auth: boolean;
    move: boolean;
    partial_update: boolean;
    restore: boolean;
    retrieve: boolean;
    update: boolean;
    versions_destroy: boolean;
    versions_list: boolean;
    versions_retrieve: boolean;
  };
}

export enum DocDefaultFilter {
  ALL_DOCS = 'all_docs',
  MY_DOCS = 'my_docs',
  SHARED_WITH_ME = 'shared_with_me',
}

export interface AccessRequest {
  id: string;
  document: string;
  user: User;
  role: Role;
  created_at: string;
  abilities: {
    destroy: boolean;
    update: boolean;
    partial_update: boolean;
    retrieve: boolean;
    accept: boolean;
  };
}
