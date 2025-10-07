import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { projects, team } from '../utils/dataLoader';
import { useToast } from '../hooks/use-toast';
import { projectService } from '../services/projectService';
import { useApp } from '../contexts/AppContext';

const techIcons: Record<string, string> = {
  'React': '⚛️',
  'Vue.js': '💚',
  'Angular': '🅰️',
  'Next.js': '▲',
  'Node.js': '🟢',
  'Python': '🐍',
  'Django': '🎸',
  'FastAPI': '⚡',
  'Spring Boot': '🍃',
  'Go': '🐹',
  'MongoDB': '🍃',
  'PostgreSQL': '🐘',
  'MySQL': '🐬',
  'Redis': '🔴',
  'Oracle': '🔶',
  'Firebase': '🔥',
  'AWS': '☁️',
  'Docker': '🐳',
  'Kubernetes': '☸️',
  'React Native': '📱',
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Under Development': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  'Planning': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  'On Hold': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  'Maintenance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
};

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const { searchQuery } = useApp();
  const [statusByName, setStatusByName] = useState<Record<string, string>>({});
  const [editsByName, setEditsByName] = useState<Record<string, any>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({
    name: '',
    client: '',
    description: '',
    techStack: '',
    assignedTo: '',
    url: '',
    type: '',
    renewalDate: '',
    deadline: '',
    status: 'Active',
  });
  const [extraProjects, setExtraProjects] = useState<any[]>([]);
  const { toast } = useToast();
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [creating, setCreating] = useState(false);

  const allTechStacks = Array.from(
    new Set(projects.flatMap((p) => {
      // Handle both string and array techStack formats
      if (typeof p.techStack === 'string') {
        return [p.techStack];
      }
      return p.techStack || [];
    }))
  ).sort();

  const getEffectiveProject = (project: any) => {
    const edits = editsByName[project.name] || {};
    return { ...project, ...edits };
  };

  const allProjects = useMemo(() => {
    return [...projects, ...extraProjects];
  }, [extraProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const effective = getEffectiveProject(project);
      const matchesSearch =
        effective.name.toLowerCase().includes(searchTerm.toLowerCase() || searchQuery.toLowerCase()) ||
        ((effective as any).client && (effective as any).client.toLowerCase().includes(searchTerm.toLowerCase() || searchQuery.toLowerCase()));
      const effectiveStatus = statusByName[effective.name] || effective.status;
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
      
      // Handle tech stack filtering for both string and array formats
      let projectTechStack: string[] = [];
      if (typeof effective.techStack === 'string') {
        projectTechStack = [effective.techStack];
      } else if (Array.isArray(effective.techStack)) {
        projectTechStack = effective.techStack;
      }
      
      const matchesTech = techFilter === 'all' || projectTechStack.includes(techFilter);

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [searchTerm, statusFilter, techFilter, searchQuery, statusByName, editsByName, allProjects]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and track all your active projects
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search projects or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by tech" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tech</SelectItem>
                {allTechStacks.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all' || techFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTechFilter('all');
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button onClick={() => setIsCreateOpen(true)}>Add Project</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={(project as any).id || project.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card
              className="border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full"
              onClick={() => setSelectedProject(getEffectiveProject(project))}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold line-clamp-2">
                    {getEffectiveProject(project).name}
                  </CardTitle>
                  <Badge className={statusColors[statusByName[getEffectiveProject(project).name] || getEffectiveProject(project).status]}>
                    {statusByName[getEffectiveProject(project).name] || getEffectiveProject(project).status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {(getEffectiveProject(project) as any).client || getEffectiveProject(project).type}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const base = getEffectiveProject(project);
                    const techStack = typeof base.techStack === 'string' ? [base.techStack] : (base.techStack || []);
                    return techStack.slice(0, 4).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center gap-1"
                      >
                        <span>{techIcons[tech] || '📦'}</span>
                        <span>{tech}</span>
                      </span>
                    ));
                  })()}
                  {(() => {
                    const base = getEffectiveProject(project);
                    const techStack = typeof base.techStack === 'string' ? [base.techStack] : (base.techStack || []);
                    return techStack.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        +{techStack.length - 4}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{getEffectiveProject(project).type || 'Project'}</span>
                  <span>{getEffectiveProject(project).handledBy || 'Unassigned'}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Filter className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your filters or search terms
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                  <DialogDescription>{selectedProject.client || selectedProject.type}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[statusByName[selectedProject.name] || selectedProject.status] || statusColors['Active']}>
                      {statusByName[selectedProject.name] || selectedProject.status}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedProject.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Change Status</h4>
                    <Select
                      value={statusByName[selectedProject.name] || selectedProject.status}
                      onValueChange={(value) =>
                        setStatusByName((prev) => ({ ...prev, [selectedProject.name]: value }))
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Under Development">Under Development</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        disabled={savingStatus}
                        onClick={async () => {
                          try {
                            setSavingStatus(true);
                            const name = selectedProject.name;
                            const newStatus = statusByName[name] || selectedProject.status;
                            await projectService.update(name, { status: newStatus });
                            setEditsByName((prev) => ({ ...prev, [name]: { ...(prev[name] || {}), status: newStatus } }));
                            toast({ title: 'Status saved', description: `${name} set to ${newStatus}.` });
                          } catch (e) {
                            console.error(e);
                          } finally { setSavingStatus(false); }
                        }}
                      >
                        Save Status
                      </Button>
                    </div>
                  </div>

                  {selectedProject.url && (
                    <div>
                      <h4 className="font-semibold mb-2">Website URL</h4>
                      <a 
                        href={selectedProject.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {selectedProject.url}
                      </a>
                    </div>
                  )}

                  {selectedProject.renewalDate && (
                    <div>
                      <h4 className="font-semibold mb-2">Renewal Date</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedProject.renewalDate}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-3">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const techStack = typeof selectedProject.techStack === 'string' 
                          ? [selectedProject.techStack] 
                          : (selectedProject.techStack || []);
                        return techStack.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm flex items-center gap-2"
                          >
                            <span>{techIcons[tech] || '📦'}</span>
                            <span>{tech}</span>
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Handled By</h4>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="font-medium text-sm">{selectedProject.handledBy || 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit Project</Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditOpen && selectedProject && (
          <Dialog open={isEditOpen} onOpenChange={() => setIsEditOpen(false)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.name) ?? selectedProject.name}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.client) ?? (selectedProject.client || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], client: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.description) ?? (selectedProject.description || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], description: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.techStackText) ?? (
                        Array.isArray(selectedProject.techStack)
                          ? selectedProject.techStack.join(', ')
                          : (selectedProject.techStack || '')
                      )}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], techStackText: e.target.value,
                          techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned To</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {team.map((member) => (
                        <label key={member.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={
                              (editsByName[selectedProject.name]?.assignedTo ?? selectedProject.assignedTo ?? [])
                                .includes(member.name)
                            }
                            onChange={(e) => {
                              const current: string[] = (editsByName[selectedProject.name]?.assignedTo ?? selectedProject.assignedTo ?? []).slice();
                              const next = e.target.checked
                                ? Array.from(new Set([...current, member.name]))
                                : current.filter((n) => n !== member.name);
                              setEditsByName((p) => ({
                                ...p,
                                [selectedProject.name]: { ...p[selectedProject.name], assignedTo: next }
                              }));
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.url) ?? (selectedProject.url || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], url: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.type) ?? (selectedProject.type || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], type: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Renewal Date</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.renewalDate) ?? (selectedProject.renewalDate || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], renewalDate: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deadline</label>
                    <Input
                      value={(editsByName[selectedProject.name]?.deadline) ?? (selectedProject.deadline || '')}
                      onChange={(e) => setEditsByName((p) => ({
                        ...p,
                        [selectedProject.name]: { ...p[selectedProject.name], deadline: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusByName[selectedProject.name] || selectedProject.status}
                      onValueChange={(value) => setStatusByName((prev) => ({ ...prev, [selectedProject.name]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button disabled={savingEdit} onClick={async () => {
                    try {
                      setSavingEdit(true);
                      const originalName = selectedProject.name;
                      const pending = editsByName[originalName] || {};
                      const effectiveStatus = statusByName[originalName] || selectedProject.status;
                      const payload: any = {
                        ...selectedProject,
                        ...pending,
                        status: effectiveStatus,
                      };
                      if (pending.techStackText && !pending.techStack) {
                        payload.techStack = String(pending.techStackText)
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean);
                      }
                      if (pending.assignedToText && !pending.assignedTo) {
                        payload.assignedTo = String(pending.assignedToText)
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean);
                      }
                      await projectService.update(originalName, payload);
                      // Optimistic local overlay
                      setEditsByName((prev) => ({ ...prev, [originalName]: payload }));
                      setIsEditOpen(false);
                      toast({ title: 'Project updated', description: `${payload.name || originalName} has been updated.` });
                    } catch (e) {
                      console.error(e);
                      setIsEditOpen(false);
                    } finally { setSavingEdit(false); }
                  }}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateOpen && (
          <Dialog open={isCreateOpen} onOpenChange={() => setIsCreateOpen(false)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create New Project</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client</label>
                    <Input value={createForm.client} onChange={(e) => setCreateForm({ ...createForm, client: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                    <Input value={createForm.techStack} onChange={(e) => setCreateForm({ ...createForm, techStack: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Assigned To</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {team.map((member) => {
                        const selected = Array.isArray(createForm.assignedTo) ? createForm.assignedTo as string[] : String(createForm.assignedTo || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                        const isChecked = selected.includes(member.name);
                        return (
                          <label key={member.name} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = selected.slice();
                                const next = e.target.checked
                                  ? Array.from(new Set([...current, member.name]))
                                  : current.filter((n) => n !== member.name);
                                setCreateForm({ ...createForm, assignedTo: next });
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{member.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input value={createForm.url} onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Input value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Renewal Date</label>
                    <Input value={createForm.renewalDate} onChange={(e) => setCreateForm({ ...createForm, renewalDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deadline</label>
                    <Input value={createForm.deadline} onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button disabled={creating} onClick={async () => {
                    try {
                      setCreating(true);
                      const payload: any = {
                        name: createForm.name,
                        client: createForm.client,
                        description: createForm.description,
                        techStack: String(createForm.techStack)
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                        assignedTo: Array.isArray(createForm.assignedTo)
                          ? createForm.assignedTo
                          : String(createForm.assignedTo)
                              .split(',')
                              .map((s: string) => s.trim())
                              .filter(Boolean),
                        url: createForm.url,
                        type: createForm.type,
                        renewalDate: createForm.renewalDate,
                        deadline: createForm.deadline,
                        status: createForm.status || 'Active',
                      };
                      const saved = await projectService.create(payload);
                      setExtraProjects((prev) => [...prev, saved]);
                      setIsCreateOpen(false);
                      setCreateForm({
                        name: '', client: '', description: '', techStack: '', assignedTo: '', url: '', type: '', renewalDate: '', deadline: '', status: 'Active'
                      });
                      toast({ title: 'Project created', description: `${saved.name} has been created.` });
                    } catch (e) {
                      console.error(e);
                      setIsCreateOpen(false);
                    } finally { setCreating(false); }
                  }}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
