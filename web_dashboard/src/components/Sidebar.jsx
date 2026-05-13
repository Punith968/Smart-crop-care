import React from 'react';
import { Menu } from 'antd';
import { 
  LayoutDashboard, 
  Sprout, 
  Bug, 
  CloudSun, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
    },
    {
      key: 'disease',
      icon: <Bug size={20} />,
      label: 'Disease Detection',
    },
    {
      key: 'recommendation',
      icon: <Sprout size={20} />,
      label: 'Crop Advisory',
    },
    {
      key: 'weather',
      icon: <CloudSun size={20} />,
      label: 'Weather Analysis',
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <Settings size={20} />,
      label: 'Settings',
    },
    {
      key: 'logout',
      icon: <LogOut size={20} />,
      label: 'Logout',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Sprout className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">AgriAI</span>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        items={menuItems}
        onClick={({ key }) => setActiveTab(key)}
        className="flex-1 px-2 border-none"
      />
      
      <div className="p-4 mt-auto">
        <div className="bg-sage rounded-xl p-4 border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Support</p>
          <p className="text-xs text-emerald-600">Need help with your crops? Contact an expert.</p>
          <button className="mt-3 w-full bg-white text-emerald-600 text-xs font-bold py-2 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
