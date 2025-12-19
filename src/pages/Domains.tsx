import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getDaysUntil } from '../utils/dataLoader';
import { metaService, Domain } from '../services/metaService';
import { Globe, TriangleAlert as AlertTriangle } from 'lucide-react';

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  'Awaiting Renewal': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  'Delivered': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  'On Hold': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await metaService.getDomains();
        setDomains(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load domains');
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Domains</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track domain renewals and manage your website domains
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Domain Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!error && domains.map((domain, index) => {
                  const daysUntil = getDaysUntil(domain.renewalDate);
                  const isCritical = daysUntil <= 30 && daysUntil >= 0;
                  const percentage = Math.max(0, Math.min(100, (daysUntil / 365) * 100));

                  return (
                    <motion.tr
                      key={domain.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${
                        isCritical
                          ? 'bg-orange-50 dark:bg-orange-950/10 border-l-4 border-orange-500'
                          : ''
                      }`}
                    >
                      <TableCell className="font-medium font-mono">{domain.name}</TableCell>
                      <TableCell>
                        <a 
                          href={`https://${domain.name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                          https://{domain.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {domain.renewalDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {isCritical && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          <div className="flex-1">
                            <div
                              className={`text-sm font-semibold mb-1 ${
                                isCritical
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {daysUntil > 0 ? `${daysUntil} days` : 'Expired'}
                            </div>
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  percentage > 30
                                    ? 'bg-green-500'
                                    : percentage > 10
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[domain.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}>
                          {domain.status}
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
