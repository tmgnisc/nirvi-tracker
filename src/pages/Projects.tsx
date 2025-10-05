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
import { projects } from '../utils/dataLoader';
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
  'Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  'Planning': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  'On Hold': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const { searchQuery } = useApp();

  const allTechStacks = Array.from(
    new Set(projects.flatMap((p) => {
      // Handle both string and array techStack formats
      if (typeof p.techStack === 'string') {
        return [p.techStack];
      }
      return p.techStack || [];
    }))
  ).sort();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase() || searchQuery.toLowerCase()) ||
        ((project as any).client && (project as any).client.toLowerCase().includes(searchTerm.toLowerCase() || searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      // Handle tech stack filtering for both string and array formats
      let projectTechStack: string[] = [];
      if (typeof project.techStack === 'string') {
        projectTechStack = [project.techStack];
      } else if (Array.isArray(project.techStack)) {
        projectTechStack = project.techStack;
      }
      
      const matchesTech = techFilter === 'all' || projectTechStack.includes(techFilter);

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [searchTerm, statusFilter, techFilter, searchQuery]);


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
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold line-clamp-2">
                    {project.name}
                  </CardTitle>
                  <Badge className={statusColors[project.status]}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {(project as any).client || project.type}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const techStack = typeof project.techStack === 'string' ? [project.techStack] : (project.techStack || []);
                    return techStack.slice(0, 4).map((tech) => (
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
                    const techStack = typeof project.techStack === 'string' ? [project.techStack] : (project.techStack || []);
                    return techStack.length > 4 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        +{techStack.length - 4}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{project.type || 'Project'}</span>
                  <span>{project.handledBy || 'Unassigned'}</span>
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
                    <Badge className={statusColors[selectedProject.status] || statusColors['Active']}>
                      {selectedProject.status}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedProject.type}
                    </span>
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
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
