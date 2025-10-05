const API_BASE_URL = '/api';

export interface UpcomingProject {
  id: string;
  name: string;
  client: string;
  description: string;
  techStack: string[];
  status: 'Upcoming' | 'Under Development' | 'Planning' | 'Cancelled';
  deadline: string;
  assignedTo: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUpcomingProjectData {
  name: string;
  client: string;
  description: string;
  techStack: string[];
  status: string;
  deadline: string;
  assignedTo: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class UpcomingProjectService {
  async getUpcomingProjects(): Promise<UpcomingProject[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-projects.php`);
      const result: ApiResponse<UpcomingProject[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch upcoming projects');
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error fetching upcoming projects:', error);
      throw error;
    }
  }

  async createUpcomingProject(projectData: CreateUpcomingProjectData): Promise<UpcomingProject> {
    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-projects.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const result: ApiResponse<UpcomingProject> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create upcoming project');
      }
      
      return result.data!;
    } catch (error) {
      console.error('Error creating upcoming project:', error);
      throw error;
    }
  }

  async updateUpcomingProject(projectId: string, projectData: Partial<CreateUpcomingProjectData>): Promise<UpcomingProject> {
    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-projects.php?id=${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const result: ApiResponse<UpcomingProject> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update upcoming project');
      }
      
      return result.data!;
    } catch (error) {
      console.error('Error updating upcoming project:', error);
      throw error;
    }
  }

  async deleteUpcomingProject(projectId: string): Promise<UpcomingProject> {
    try {
      const response = await fetch(`${API_BASE_URL}/upcoming-projects.php?id=${projectId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<UpcomingProject> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete upcoming project');
      }
      
      return result.data!;
    } catch (error) {
      console.error('Error deleting upcoming project:', error);
      throw error;
    }
  }

  // Helper method to get upcoming projects by status
  async getUpcomingProjectsByStatus(status: string): Promise<UpcomingProject[]> {
    const projects = await this.getUpcomingProjects();
    return projects.filter(project => project.status === status);
  }

  // Helper method to get projects under development (for ongoing projects section)
  async getOngoingUpcomingProjects(): Promise<UpcomingProject[]> {
    return this.getUpcomingProjectsByStatus('Under Development');
  }

  // Helper method to get upcoming projects (not yet started)
  async getNewUpcomingProjects(): Promise<UpcomingProject[]> {
    return this.getUpcomingProjectsByStatus('Upcoming');
  }
}

export const upcomingProjectService = new UpcomingProjectService();
