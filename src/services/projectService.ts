const API_BASE_URL = '/api';

export interface Project {
  name: string;
  url?: string;
  type?: string;
  techStack?: string[] | string;
  handledBy?: string;
  renewalDate?: string;
  status: string;
  client?: string;
  description?: string;
  assignedTo?: string[];
  deadline?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ProjectService {
  async list(): Promise<Project[]> {
    const res = await fetch(`${API_BASE_URL}/projects.php`);
    const json: ApiResponse<Project[]> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch projects');
    return json.data || [];
  }

  async create(project: Project): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    const json: ApiResponse<Project> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create project');
    return json.data!;
  }

  async update(name: string, project: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects.php?name=${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    const json: ApiResponse<Project> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update project');
    return json.data!;
  }

  async delete(name: string): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects.php?name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    const json: ApiResponse<Project> = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete project');
    return json.data!;
  }
}

export const projectService = new ProjectService();


