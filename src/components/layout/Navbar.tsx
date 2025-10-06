import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getRenewalCount, getExpiredItems, getDaysUntil, projects, domains } from '../../utils/dataLoader';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);  // New state for logout dialog

  const renewalCount = getRenewalCount();
  const expiredItems = getExpiredItems();
  const totalAlerts = expiredItems.length > 0 ? expiredItems.length : renewalCount;

  // Get urgent renewals (within 7 days)
  const getUrgentRenewals = () => {
    const urgentItems: Array<{
      name: string;
      type: string;
      renewalDate: string;
      daysUntil: number;
      status: string;
    }> = [];
    
    projects.forEach((project) => {
      if (project.renewalDate && project.renewalDate !== "Expired" && project.renewalDate !== "Not purchased yet" && project.renewalDate !== "No Renewal (Handover Complete)") {
        const daysUntil = getDaysUntil(project.renewalDate);
        if (daysUntil <= 7 && daysUntil >= 0) {
          urgentItems.push({
            name: project.name,
            type: 'Project',
            renewalDate: project.renewalDate,
            daysUntil,
            status: 'urgent'
          });
        }
      }
    });

    domains.forEach((domain) => {
      if (domain.renewalDate && domain.renewalDate !== "Expired") {
        const daysUntil = getDaysUntil(domain.renewalDate);
        if (daysUntil <= 7 && daysUntil >= 0) {
          urgentItems.push({
            name: domain.name,
            type: 'Domain',
            renewalDate: domain.renewalDate,
            daysUntil,
            status: 'urgent'
          });
        }
      }
    });

    return urgentItems;
  };

  const urgentRenewals = getUrgentRenewals();

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');  // Now safe to navigate after confirm—sidebar hides only after dialog closes
    setShowLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 left-64 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-end px-6"
    >
      <div className="flex items-center gap-3">  
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell className="w-5 h-5" />
          {totalAlerts > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-500 text-xs">
              {totalAlerts}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">{user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.username}</span>
                <span className="text-xs font-normal text-slate-500">{user?.role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowLogoutDialog(true)}  // Open dialog instead of direct logout
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notification Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-6 w-96 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-40"
          >
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {expiredItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Expired Items</span>
                    </div>
                    {expiredItems.map((item, index) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-200">{item.name}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">{item.type}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            Expired
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {urgentRenewals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Urgent Renewals</span>
                    </div>
                    {urgentRenewals.map((item, index) => (
                      <div key={index} className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-orange-800 dark:text-orange-200">{item.name}</p>
                            <p className="text-sm text-orange-600 dark:text-orange-400">{item.type}</p>
                            <p className="text-xs text-orange-500 dark:text-orange-500">{item.renewalDate}</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            {item.daysUntil} days
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {expiredItems.length === 0 && urgentRenewals.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No notifications</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">All renewals are up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Dialog - Similar to bell drawer for stable layout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleLogoutCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.nav>
  );
}