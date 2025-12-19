import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FolderKanban, Clock, CircleAlert as AlertCircle, DollarSign, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRenewalCount, getExpiredItems } from '../utils/dataLoader';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { projectService } from '../services/projectService';
import { metaService, TeamMember } from '../services/metaService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [sendWelcome, setSendWelcome] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [proj, members] = await Promise.all([
          projectService.list(),
          metaService.getTeam(),
        ]);
        setProjects(proj);
        setTeam(members);
      } catch {
        // ignore errors for now; UI will just show zeros / empty
      }
    };
    load();
  }, []);

  const sendWelcomeEmail = async () => {
    if (!selectedMember || !sendWelcome) {
      setResultMsg('Select a team member and check "Send welcome email"');
      return;
    }
    try {
      setSending(true);
      setResultMsg('');
      const res = await fetch('/api/welcome-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName: selectedMember })
      });
      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch (_) {}
      if (!res.ok) {
        setResultMsg((data && data.message) || raw || 'Request failed');
        return;
      }
      if (data && data.success) setResultMsg(`Email sent to ${selectedMember}`);
      else setResultMsg((data && data.message) || raw || 'Failed to send email');
    } catch (e: any) {
      setResultMsg(e.message || 'Network error');
    } finally {
      setSending(false);
    }
  };
  const statusData = [
    { name: 'Active', value: projects.filter((p) => p.status === 'Active').length, color: '#10b981' },
    { name: 'Under Development', value: projects.filter((p) => p.status === 'Under Development').length, color: '#3b82f6' },
    { name: 'Delivered', value: projects.filter((p) => p.status === 'Delivered').length, color: '#8b5cf6' },
    { name: 'Awaiting Renewal', value: projects.filter((p) => p.status === 'Awaiting Renewal').length, color: '#f59e0b' },
    { name: 'On Hold', value: projects.filter((p) => p.status === 'On Hold').length, color: '#ef4444' },
    { name: 'Terminated', value: projects.filter((p) => p.status === 'Terminated').length, color: '#6b7280' },
  ];

  const monthlyData = [
    { month: 'Jan', projects: 2 },
    { month: 'Feb', projects: 3 },
    { month: 'Mar', projects: 4 },
    { month: 'Apr', projects: 3 },
    { month: 'May', projects: 5 },
    { month: 'Jun', projects: 4 },
    { month: 'Jul', projects: 6 },
    { month: 'Aug', projects: 7 },
    { month: 'Sep', projects: 5 },
    { month: 'Oct', projects: 8 },
  ];

  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const pendingRenewals = getRenewalCount();
  const upcomingProjects = projects.filter((p) => p.status === 'Under Development').length;
  const totalWebsites = projects.filter((p) => p.url).length;
  const expiredItems = getExpiredItems();

  const statCards = [
    { title: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'blue', change: `${activeProjects} active` },
    { title: 'Pending Renewals', value: pendingRenewals, icon: Clock, color: 'orange', change: expiredItems.length > 0 ? `${expiredItems.length} expired` : 'Next 30 days' },
    { title: 'Active Projects', value: activeProjects, icon: Activity, color: 'green', change: 'Currently running' },
    { title: 'Live Websites', value: totalWebsites, icon: DollarSign, color: 'purple', change: `${upcomingProjects} in development` },
  ];


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Welcome back! Here's what's happening with your projects.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-950/30`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick action: Send Welcome Email */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Team Email Actions</CardTitle>
              <CardDescription>Send a welcome email to a team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">Select team member</label>
                <Select onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {team.map((m: any) => (
                      <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sendWelcome" checked={sendWelcome} onCheckedChange={(v) => setSendWelcome(!!v)} />
                <label htmlFor="sendWelcome" className="text-sm">Send welcome email</label>
              </div>
              <div className="flex items-center gap-3">
                <Button disabled={sending} onClick={sendWelcomeEmail}>{sending ? 'Sending...' : 'Send Email'}</Button>
                {resultMsg && <span className="text-sm text-slate-600 dark:text-slate-400">{resultMsg}</span>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Project Starts Over Time</CardTitle>
              <CardDescription>Monthly project initiation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="projects"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>Current project distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Expired Items Warning */}
      {expiredItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                Renewal Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  The following items have expired and need immediate renewal:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {expiredItems.map((item, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400 text-sm">
                      <strong>{item.name}</strong> ({item.type})
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
