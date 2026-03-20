export interface Profile {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string | null
  tags: string[]
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  created_at: string
  members?: WorkspaceMember[]
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  joined_at: string
  profile?: Profile
}

export interface Message {
  id: string
  workspace_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}
