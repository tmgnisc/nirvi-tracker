import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Search, Calendar, Users, FileText } from 'lucide-react';
import { upcomingProjectService, UpcomingProject } from '../services/upcomingProjectService';
import UpcomingProjectManagement from '../components/UpcomingProjectManagement';

export default function UpcomingProjects() {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
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

  const upcomingProjects = projects.filter(p => p.status === 'Upcoming');
  const filteredProjects = upcomingProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upcoming Projects</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track potential projects and new business opportunities
        </p>
      </div>

      <Tabs defaultValue="view" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Projects</TabsTrigger>
          <TabsTrigger value="manage">Manage Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search upcoming projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No upcoming projects found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm ? 'Try adjusting your search terms' : 'No projects are currently upcoming'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </CardTitle>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1">
                            Upcoming
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {project.client}
                          </p>
                        </div>

                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {project.description}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Team Members */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">ASSIGNED TO</p>
                          <div className="flex flex-wrap gap-2">
                            {project.assignedTo.map((memberName, idx) => {
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {memberName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tech Stack */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">TECHNOLOGY</p>
                          <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-full flex items-center gap-1.5 font-medium text-green-700 dark:text-green-300"
                              >
                                <span>⚡</span>
                                <span>{tech}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Deadline */}
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">DEADLINE</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="manage">
          <UpcomingProjectManagement onProjectUpdate={loadProjects} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
