import React from 'react';
import { Menu } from 'antd';
import { Sprout, Bug, FileText, LogOut, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const { t } = useTranslation();

  const menuItems = [
    { key: 'advisory', icon: <Sprout size={18} />, label: t('common.advisory') },
    { key: 'disease', icon: <Bug size={18} />, label: t('common.disease') },
    { key: 'reports', icon: <FileText size={18} />, label: t('common.reports') },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={18} />, label: t('common.logout'), danger: true },
  ];

  const handleClick = ({ key }) => {
    if (key === 'logout') {
      onLogout?.();
    } else {
      setActiveTab(key);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: 8, borderRadius: 10, display: 'flex' }}>
          <Sprout size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>FCA</span>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>{t('common.appName')}</span>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '12px 10px' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={handleClick}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>

      {/* Help */}
      <div style={{ padding: 14 }}>
        <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 16, border: '1px solid #dcfce7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <HelpCircle size={14} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('common.support')}</span>
          </div>
          <p style={{ fontSize: 11, color: '#4ade80', lineHeight: 1.5, margin: 0 }}>{t('common.supportDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
