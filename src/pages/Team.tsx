import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { team, projects } from '../utils/dataLoader';
import { Users, Briefcase } from 'lucide-react';


export default function Team() {
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const getMemberProjects = (memberName: string) => {
    return projects.filter((p) => {
      if (!p.handledBy) return false;
      // Handle cases where handledBy contains multiple names separated by " & "
      const handlers = p.handledBy.split(' & ');
      return handlers.some(handler => handler.trim().includes(memberName.split(' ')[0]));
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Meet our talented team members and their expertise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
          >
            <Card
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <CardHeader className="text-center pb-4">
                <motion.img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-slate-100 dark:ring-slate-800"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <Badge variant="outline">{getMemberProjects(member.name).length} projects</Badge>
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <DialogTitle className="text-2xl">{selectedMember.name}</DialogTitle>
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedMember.role}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">

                  <div>
                    <h4 className="font-semibold mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>


                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned Projects ({getMemberProjects(selectedMember.name).length})
                    </h4>
                    <div className="space-y-3">
                      {getMemberProjects(selectedMember.name).map((project) => (
                        <div
                          key={project.name}
                          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{project.name}</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {project.type}
                              </p>
                            </div>
                            <Badge
                              className={
                                project.status === 'Active'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                                  : project.status === 'Under Development'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                    : project.status === 'Delivered'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              }
                            >
                              {project.status}
                            </Badge>
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
