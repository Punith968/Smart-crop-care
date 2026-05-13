import React, { useState } from 'react';
import { Layout, Button, Avatar, Badge, Dropdown, Space } from 'antd';
import { 
  Bell, 
  Search, 
  Menu as MenuIcon,
  X,
  Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import DiseaseDetection from './components/DiseaseDetection';
import CropRecommendation from './components/CropRecommendation';
import MarketAnalysis from './components/MarketAnalysis';

const { Header, Sider, Content } = Layout;

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const langMenuItems = [
    { key: 'en', label: 'English', onClick: () => changeLanguage('en') },
    { key: 'kn', label: 'ಕನ್ನಡ (Kannada)', onClick: () => changeLanguage('kn') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'disease':
        return <DiseaseDetection />;
      case 'recommendation':
        return <CropRecommendation />;
      case 'weather':
        return <div className="p-20 text-center text-slate-400">Weather detailed view coming soon...</div>;
      case 'settings':
        return <MarketAnalysis />; // Using market analysis for demo
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="hidden lg:block fixed h-screen left-0 top-0 z-50 shadow-sm"
      >
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </Sider>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed left-0 top-0 bottom-0 w-72 bg-white transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute right-4 top-4">
            <Button type="text" icon={<X size={24} />} onClick={() => setMobileMenuOpen(false)} />
          </div>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(key) => {
              setActiveTab(key);
              setMobileMenuOpen(false);
            }} 
          />
        </div>
      </div>

      <Layout className={`${!collapsed ? 'lg:ml-[260px]' : 'lg:ml-[80px]'} transition-all duration-300`}>
        <Header className="bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-40 h-16">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('common.search')}
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
              <Button type="text" icon={<Languages size={20} className="text-slate-600" />}>
                <span className="hidden sm:inline ml-1 text-sm font-medium">{i18n.language === 'kn' ? 'ಕನ್ನಡ' : 'English'}</span>
              </Button>
            </Dropdown>

            <Badge dot color="#10b981" offset={[-2, 4]}>
              <Button type="text" icon={<Bell size={20} className="text-slate-600" />} />
            </Badge>
            <div className="h-8 w-px bg-slate-100 mx-1 md:mx-2" />
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">Farmer John</p>
                <p className="text-[10px] text-slate-500 mt-1">Premium Plan</p>
              </div>
              <Avatar shape="square" className="bg-emerald-100 text-emerald-600 font-bold">FJ</Avatar>
            </div>
          </div>
        </Header>

        <Content className="p-6 lg:p-10 bg-[#f9fafb]">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
