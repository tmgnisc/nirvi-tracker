const API_BASE_URL = '/api';

export interface Domain {
  name: string;
  renewalDate: string;
  status: string;
}

export interface ServerInfo {
  name: string;
  ip?: string;
  url?: string;
  nameservers: string[];
  websites: string[];
}

export interface TeamMember {
  name: string;
  role?: string;
  email?: string;
  skills: string[];
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MetaService {
  async getDomains(): Promise<Domain[]> {
    const res = await fetch(`${API_BASE_URL}/domains.php`);
    const json: ApiResponse<Domain[]> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch domains');
    return json.data || [];
  }

  async getServers(): Promise<ServerInfo[]> {
    const res = await fetch(`${API_BASE_URL}/servers.php`);
    const json: ApiResponse<ServerInfo[]> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch servers');
    return json.data || [];
  }

  async getTeam(): Promise<TeamMember[]> {
    const res = await fetch(`${API_BASE_URL}/team.php`);
    const json: ApiResponse<TeamMember[]> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch team');
    return json.data || [];
  }
}

export const metaService = new MetaService();


