import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Calendar, Code } from 'lucide-react';
import { upcomingProjectService, UpcomingProject, CreateUpcomingProjectData } from '../services/upcomingProjectService';
import { useToast } from '../hooks/use-toast';
import { metaService, TeamMember } from '../services/metaService';

interface UpcomingProjectManagementProps {
  onProjectUpdate?: () => void;
}

export default function UpcomingProjectManagement({ onProjectUpdate }: UpcomingProjectManagementProps) {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // global action loader for CRUD
  const [selectedProject, setSelectedProject] = useState<UpcomingProject | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUpcomingProjectData>({
    name: '',
    client: '',
    description: '',
    techStack: [],
    status: 'Upcoming',
    deadline: '',
    assignedTo: []
  });
  const [techStackInput, setTechStackInput] = useState('');
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);

  const statusColors = {
    'Upcoming': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'Under Development': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
    'Planning': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  };

  const projectSections = {
    'Upcoming': projects.filter(p => p.status === 'Upcoming'),
    'Under Development': projects.filter(p => p.status === 'Under Development'),
    'Planning': projects.filter(p => p.status === 'Planning'),
    'Cancelled': projects.filter(p => p.status === 'Cancelled'),
    'Completed': projects.filter(p => p.status === 'Completed'),
  };

  useEffect(() => {
    loadProjects();
    loadTeam();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await upcomingProjectService.getUpcomingProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load upcoming projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async () => {
    try {
      const members = await metaService.getTeam();
      setTeam(members);
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      setBusy(true);
      await upcomingProjectService.createUpcomingProject(formData);
      await loadProjects();
      setIsCreateDialogOpen(false);
      resetForm();
      onProjectUpdate?.();
      toast({ title: 'Project created', description: `${formData.name} has been created successfully.` });
    } catch (error) {
      console.error('Failed to create upcoming project:', error);
      toast({ title: 'Create failed', description: 'Could not create project.', variant: 'destructive' as any });
    } finally { setBusy(false); }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    
    try {
      setBusy(true);
      await upcomingProjectService.updateUpcomingProject(selectedProject.id, formData);
      await loadProjects();
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
      onProjectUpdate?.();
      toast({ title: 'Project updated', description: `${formData.name} has been updated.` });
    } catch (error) {
      console.error('Failed to update upcoming project:', error);
      toast({ title: 'Update failed', description: 'Could not update project.', variant: 'destructive' as any });
    } finally { setBusy(false); }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setBusy(true);
      await upcomingProjectService.deleteUpcomingProject(projectId);
      await loadProjects();
      onProjectUpdate?.();
      toast({ title: 'Project deleted', description: 'The project has been removed.' });
    } catch (error) {
      console.error('Failed to delete upcoming project:', error);
      toast({ title: 'Delete failed', description: 'Could not delete project.', variant: 'destructive' as any });
    } finally { setBusy(false); }
  };

  const handleEditProject = (project: UpcomingProject) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      client: project.client,
      description: project.description,
      techStack: project.techStack,
      status: project.status,
      deadline: project.deadline,
      assignedTo: project.assignedTo
    });
    setTechStackInput(project.techStack.join(', '));
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client: '',
      description: '',
      techStack: [],
      status: 'Upcoming',
      deadline: '',
      assignedTo: []
    });
    setTechStackInput('');
  };

  const handleTechStackInputChange = useCallback((value: string) => {
    setTechStackInput(value);
    // Update formData techStack when user finishes typing
    const techStack = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setFormData(prev => ({ ...prev, techStack }));
  }, []);

  const handleTeamChange = useCallback((memberName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: checked 
        ? [...prev.assignedTo, memberName]
        : prev.assignedTo.filter(name => name !== memberName)
    }));
  }, []);

  // Form JSX - moved inline to prevent re-rendering issues
  const renderProjectForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter project name"
          />
        </div>
        <div>
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            value={formData.client}
            onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Under Development">Under Development</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
        <Input
          id="techStack"
          value={techStackInput}
          onChange={(e) => handleTechStackInputChange(e.target.value)}
          placeholder="Java, React, MySQL"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter project description"
          rows={3}
        />
      </div>

      <div>
        <Label>Assign Team Members</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {team.map((member) => (
            <div key={member.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`member-${member.name}`}
                checked={formData.assignedTo.includes(member.name)}
                onChange={(e) => handleTeamChange(member.name, e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={`member-${member.name}`} className="text-sm">
                {member.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {busy && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-slate-700 dark:text-slate-200">Processing...</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Projects Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, edit, and manage upcoming projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Upcoming Project</DialogTitle>
            </DialogHeader>
            {renderProjectForm()}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(projectSections).map(([status, sectionProjects]) => (
        sectionProjects.length > 0 && (
          <div key={status} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{status} Projects</h3>
              <Badge className={statusColors[status as keyof typeof statusColors]}>
                {sectionProjects.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {project.client}
                          </p>
                        </div>
                        <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{project.assignedTo.length} member{project.assignedTo.length !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Code className="w-4 h-4" />
                        <span>{project.techStack.slice(0, 2).join(', ')}{project.techStack.length > 2 ? '...' : ''}</span>
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {project.description}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the upcoming project.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )
      ))}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Upcoming Project</DialogTitle>
          </DialogHeader>
          {renderProjectForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Update Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
