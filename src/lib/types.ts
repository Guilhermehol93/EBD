export type MagazineStatus = 'scheduled' | 'published' | 'archived';

export interface Magazine {
  id: string;
  title: string;
  description: string | null;
  edition_quarter: string | null;
  lesson_number: number | null;
  lesson_date: string;
  file_path: string;
  file_name: string;
  file_size: number;
  cover_image_path: string | null;
  publish_at: string;
  status: MagazineStatus;
  whatsapp_scheduled: boolean;
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  whatsapp_message_custom: string | null;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChurchSettings {
  id: string;
  church_name: string;
  site_title: string;
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_facebook: string | null;
  social_whatsapp_group: string | null;
  social_website: string | null;
  church_address: string;
  service_times: string;
  whatsapp_api_provider: 'evolution' | 'webhook';
  whatsapp_instance_name: string;
  whatsapp_group_jid: string;
  whatsapp_default_message: string;
  updated_at: string;
}

export interface WhatsAppLog {
  id: string;
  magazine_id: string | null;
  recipient: string;
  status: 'success' | 'failed' | 'pending';
  message: string | null;
  response_payload: any;
  error_message: string | null;
  created_at: string;
  // Join option
  magazine?: Magazine;
}

export interface DashboardStats {
  totalMagazines: number;
  publishedCount: number;
  scheduledCount: number;
  archivedCount: number;
  totalViews: number;
  totalDownloads: number;
  whatsappSentCount: number;
}
