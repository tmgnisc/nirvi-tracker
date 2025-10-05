import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
