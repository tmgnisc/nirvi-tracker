import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { servers } from '../utils/dataLoader';
import { Server } from 'lucide-react';

export default function Servers() {
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
                {servers.map((server, index) => {

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
                        {server.websites.length} domains
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{server.websites.length} websites</Badge>
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
                      <TableCell className="font-semibold">{server.websites.length} domains</TableCell>
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
