import type { ResearchProject } from '../types';
import { buildApiUrl } from './apiClient';

export const projectService = {
  async getProjects(): Promise<ResearchProject[]> {
    const token = localStorage.getItem('supabase.auth.token');
    const url = buildApiUrl('/projects/');
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch projects:', response.status);
        return [];
      }

      const data = await response.json();
      // Convert backend response to frontend ResearchProject type
      return (data.projects || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        description: p.description,
        tags: p.tags || [],
        status: p.status || 'active',
        progress: p.progress || 0,
        paperCount: p.paper_count || 0,
        gapCount: 0, // Backend doesn't track this yet
        updatedAt: new Date(p.updated_at).toLocaleString(),
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async getProjectById(id: string): Promise<ResearchProject | null> {
    const token = localStorage.getItem('supabase.auth.token');
    const url = buildApiUrl(`/projects/${id}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const p = await response.json();
      return {
        id: p.id,
        title: p.title,
        topic: p.topic,
        description: p.description,
        tags: p.tags || [],
        status: p.status || 'active',
        progress: p.progress || 0,
        paperCount: p.paper_count || 0,
        gapCount: 0,
        updatedAt: new Date(p.updated_at).toLocaleString(),
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  async createProject(data: { title: string; topic: string; description: string }): Promise<ResearchProject | null> {
    const token = localStorage.getItem('supabase.auth.token');
    const url = buildApiUrl('/projects/');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title: data.title,
          topic: data.topic,
          description: data.description,
          tags: data.topic.split('/').map((t) => t.trim()),
        }),
      });

      if (!response.ok) {
        console.error('Failed to create project:', response.status);
        return null;
      }

      const p = await response.json();
      return {
        id: p.id,
        title: p.title,
        topic: p.topic,
        description: p.description,
        tags: p.tags || [],
        status: p.status || 'active',
        progress: p.progress || 0,
        paperCount: p.paper_count || 0,
        gapCount: 0,
        updatedAt: new Date(p.created_at).toLocaleString(),
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },

  async updateProject(id: string, updates: Partial<ResearchProject>): Promise<ResearchProject | null> {
    const token = localStorage.getItem('supabase.auth.token');
    const url = buildApiUrl(`/projects/${id}`);
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title: updates.title,
          topic: updates.topic,
          description: updates.description,
          tags: updates.tags,
          status: updates.status,
          progress: updates.progress,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const p = await response.json();
      return {
        id: p.id,
        title: p.title,
        topic: p.topic,
        description: p.description,
        tags: p.tags || [],
        status: p.status || 'active',
        progress: p.progress || 0,
        paperCount: p.paper_count || 0,
        gapCount: 0,
        updatedAt: new Date(p.updated_at).toLocaleString(),
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    const token = localStorage.getItem('supabase.auth.token');
    const url = buildApiUrl(`/projects/${id}`);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }
};
