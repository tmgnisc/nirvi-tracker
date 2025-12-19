import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { metaService, ServerInfo } from '../services/metaService';
import { Server } from 'lucide-react';

export default function Servers() {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await metaService.getServers();
        setServers(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load servers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Servers</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitor server infrastructure and renewal dates
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Active Servers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Domains</TableHead>
                  <TableHead>Websites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!error && servers.map((server, index) => {
                  const websiteCount = server.websites?.length || 0;
                  return (
                    <motion.tr
                      key={server.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Server</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{server.ip}</TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {websiteCount} domains
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{websiteCount} websites</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              Active
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Server running
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{websiteCount} domains</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          Active
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
