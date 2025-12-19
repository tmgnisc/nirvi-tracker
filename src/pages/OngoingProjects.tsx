import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Search, Calendar, Users, FileText } from 'lucide-react';
import { upcomingProjectService, UpcomingProject } from '../services/upcomingProjectService';
import { projectService } from '../services/projectService';
import { metaService, TeamMember } from '../services/metaService';

export default function OngoingProjects() {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [mainProjects, setMainProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<UpcomingProject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadOngoingProjects();
    loadTeam();
  }, []);

  const loadOngoingProjects = async () => {
    try {
      setLoading(true);
      const data = await upcomingProjectService.getOngoingUpcomingProjects();
      setProjects(data);
      const allMain = await projectService.list();
      const activeMain = allMain.filter((p: any) => p.status === 'Under Development' || p.status === 'Maintenance');
      setMainProjects(activeMain);
    } catch (error) {
      console.error('Failed to load ongoing projects:', error);
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

  const filteredProjects = [
    ...projects,
    ...mainProjects,
  ].filter((project: any) =>
    (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamMembers = (assignedTo: string[]) => {
    return team.filter((member) => assignedTo.includes(member.name));
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-orange-600 dark:text-orange-400';
    if (days <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ongoing Projects</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Projects currently under development and active work
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search ongoing projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredProjects.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No ongoing projects found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No projects are currently under development'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any, index) => {
            const hasDeadline = Boolean(project.deadline);
            const daysUntilDeadline = hasDeadline ? getDaysUntilDeadline(project.deadline) : 0;
            return (
              <motion.div
                key={project.id || project.name}
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
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                        {project.status || 'Under Development'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {project.client || project.type || ''}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {project.description}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(project.techStack) ? project.techStack : (project.techStack ? [project.techStack] : [])).slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                      {(Array.isArray(project.techStack) ? project.techStack.length : 0) > 4 && (
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          +{(project.techStack as string[]).length - 4}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {hasDeadline && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Deadline</span>
                          <span className={`font-semibold ${getDeadlineColor(daysUntilDeadline)}`}>
                            {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} days overdue` :
                             daysUntilDeadline === 0 ? 'Due today' :
                             `${daysUntilDeadline} days left`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Team Members</span>
                        <span className="font-semibold">{(project.assignedTo || []).length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {project.id && <span>ID: {project.id}</span>}
                      {hasDeadline && <span>{new Date(project.deadline).toLocaleDateString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
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
                  <DialogDescription>{selectedProject.client}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                      Under Development
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      ID: {selectedProject.id}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Deadline
                      </h4>
                      <p className={`font-semibold ${getDeadlineColor(getDaysUntilDeadline(selectedProject.deadline))}`}>
                        {new Date(selectedProject.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(() => {
                          const days = getDaysUntilDeadline(selectedProject.deadline);
                          return days < 0 ? `${Math.abs(days)} days overdue` :
                                 days === 0 ? 'Due today' :
                                 `${days} days left`;
                        })()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned Team Members
                    </h4>
                    <div className="space-y-2">
                      {getTeamMembers(selectedProject.assignedTo).map((member) => (
                        <div
                          key={member.name}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
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
