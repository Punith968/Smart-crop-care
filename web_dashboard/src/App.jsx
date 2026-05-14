import React, { useState } from 'react';
import { Avatar, Dropdown, Button } from 'antd';
import { Sprout, Bug, FileText, Languages, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'antd';
import { LogOut, HelpCircle } from 'lucide-react';
import DiseaseDetection from './components/DiseaseDetection';
import CropRecommendation from './components/CropRecommendation';
import ReportsPage from './components/ReportsPage';
import Login from './components/Login';

/* ────────── Sidebar (desktop only) ────────── */
const DesktopSidebar = ({ activeTab, setActiveTab, onLogout, t }) => {
  const items = [
    { key: 'advisory', icon: <Sprout size={18} />, label: t('common.advisory') },
    { key: 'disease', icon: <Bug size={18} />, label: t('common.disease') },
    { key: 'reports', icon: <FileText size={18} />, label: t('common.reports') },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={18} />, label: t('common.logout'), danger: true },
  ];

  return (
    <>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: 7, borderRadius: 10, display: 'flex' }}>
          <Sprout size={18} style={{ color: 'white' }} />
        </div>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'block', lineHeight: 1 }}>FCA</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{t('common.appName')}</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '8px 6px' }}>
        <Menu mode="inline" selectedKeys={[activeTab]} items={items}
          onClick={({ key }) => key === 'logout' ? onLogout() : setActiveTab(key)}
          style={{ border: 'none', background: 'transparent' }} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 14, border: '1px solid var(--green-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <HelpCircle size={12} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green-dark)' }}>{t('common.support')}</span>
          </div>
          <p style={{ fontSize: 10, color: '#4ade80', lineHeight: 1.5 }}>{t('common.supportDesc')}</p>
        </div>
      </div>
    </>
  );
};

/* ────────── App ────────── */
function App() {
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('advisory');

  const onLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const changeLanguage = (lng) => i18n.changeLanguage(lng);
  const langMenu = [
    { key: 'en', label: 'English', onClick: () => changeLanguage('en') },
    { key: 'kn', label: 'ಕನ್ನಡ', onClick: () => changeLanguage('kn') },
  ];

  const tabs = [
    { key: 'advisory', icon: <Sprout size={20} />, label: t('common.advisory') },
    { key: 'disease', icon: <Bug size={20} />, label: t('common.disease') },
    { key: 'reports', icon: <FileText size={20} />, label: t('common.reports') },
  ];

  const page = () => {
    switch (activeTab) {
      case 'advisory': return <CropRecommendation />;
      case 'disease': return <DiseaseDetection />;
      case 'reports': return <ReportsPage />;
      default: return <CropRecommendation />;
    }
  };

  /* ── Login ── */
  if (!isLoggedIn) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 50 }}>
          <Dropdown menu={{ items: langMenu }} placement="bottomRight">
            <Button size="small" style={{
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
              border: 'none', borderRadius: 10, height: 36, padding: '0 12px',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)', fontWeight: 700, fontSize: 12,
            }}>
              <Languages size={14} style={{ color: '#16a34a' }} />
              {i18n.language === 'kn' ? 'ಕನ್ನಡ' : 'EN'}
            </Button>
          </Dropdown>
        </div>
        <Login onLogin={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  /* ── Main App ── */
  return (
    <div className="shell">
      {/* ── Desktop sidebar ── */}
      <div className="desktop-sidebar">
        <DesktopSidebar activeTab={activeTab} setActiveTab={setActiveTab}
          onLogout={onLogout} t={t} />
      </div>

      {/* ── Desktop topbar ── */}
      <div className="desktop-topbar">
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('common.appName')}</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{tabs.find(tb => tb.key === activeTab)?.label}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Dropdown menu={{ items: langMenu }} placement="bottomRight">
            <Button size="small" style={{ borderRadius: 8, border: '1px solid var(--border-strong)', fontWeight: 600, fontSize: 12, height: 32 }}>
              <Languages size={14} style={{ marginRight: 4 }} />
              {i18n.language === 'kn' ? 'ಕನ್ನಡ' : 'EN'}
              <ChevronDown size={10} style={{ marginLeft: 2, color: 'var(--text-muted)' }} />
            </Button>
          </Dropdown>
          <div onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            background: 'var(--bg)', padding: '4px 12px 4px 4px', borderRadius: 10, border: '1px solid var(--border)',
          }}>
            <Avatar size={28} style={{ background: 'var(--green)', borderRadius: 7, fontWeight: 800, fontSize: 11 }}>F</Avatar>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{t('common.logout')}</span>
          </div>
        </div>
      </div>

      {/* ── Mobile header ── */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: 5, borderRadius: 7, display: 'flex' }}>
            <Sprout size={14} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>SmartCrop</p>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{tabs.find(tb => tb.key === activeTab)?.label}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Dropdown menu={{ items: langMenu }} placement="bottomRight">
            <button style={{
              border: '1px solid var(--border-strong)', background: 'white', borderRadius: 8,
              height: 30, padding: '0 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              {i18n.language === 'kn' ? 'ಕ' : 'EN'}
            </button>
          </Dropdown>
          <Avatar size={30} style={{ background: 'var(--green)', borderRadius: 8, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
            onClick={onLogout}>F</Avatar>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="page-scroll">
        <div className="fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
          {page()}
        </div>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <div className="bottom-nav">
        {tabs.map(tab => (
          <button key={tab.key} className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}>
            <div className="icon-wrap">{tab.icon}</div>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
