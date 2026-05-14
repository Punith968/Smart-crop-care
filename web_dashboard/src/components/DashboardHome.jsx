import React from 'react';
import { Row, Col, Card, Typography, Tag, Timeline } from 'antd';
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const WeatherCard = ({ icon: Icon, label, value, color, bg }) => (
  <Card style={{ border: 'none', borderRadius: '16px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</p>
        <p style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{ background: bg, padding: '14px', borderRadius: '14px' }}>
        <Icon style={{ color }} size={22} />
      </div>
    </div>
  </Card>
);

const DashboardHome = () => {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={2} style={{ marginBottom: '4px', fontWeight: 800, color: '#0f172a' }}>{t('common.welcome')}</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
            <MapPin size={15} />
            <span style={{ fontSize: '14px' }}>{t('common.region')}</span>
            <span style={{ margin: '0 4px', color: '#e2e8f0' }}>·</span>
            <Calendar size={15} />
            <span style={{ fontSize: '14px' }}>May 14, 2026</span>
          </div>
        </div>
        <Tag color="orange" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '10px', border: 'none', background: '#fff7ed', color: '#ea580c', fontWeight: 600, fontSize: '13px' }}>
          <AlertCircle size={14} />
          {t('common.weatherAlert')}
        </Tag>
      </div>

      {/* Weather Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '28px' }}>
        <Col xs={12} sm={12} lg={6}>
          <WeatherCard icon={Thermometer} label={t('dashboard.temp')} value="32°C" color="#f97316" bg="#fff7ed" />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <WeatherCard icon={Droplets} label={t('dashboard.humidity')} value="64%" color="#3b82f6" bg="#eff6ff" />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <WeatherCard icon={Wind} label={t('dashboard.wind')} value="12 km/h" color="#64748b" bg="#f1f5f9" />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <WeatherCard icon={CloudRain} label={t('dashboard.rainfall')} value="0.5 mm" color="#06b6d4" bg="#ecfeff" />
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card 
            title={t('dashboard.marketTitle')} 
            extra={<a style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>{t('dashboard.viewAll')}</a>}
            style={{ border: 'none', borderRadius: '16px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { name: t('dashboard.maize'), price: '₹1,950', change: '+5.6%', up: true, highlight: true },
                { name: t('dashboard.wheat'), price: '₹2,275', change: '+2.4%', up: true },
                { name: t('dashboard.rice'), price: '₹4,500', change: '-1.2%', up: false },
              ].map((item) => (
                <div key={item.name} style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: item.highlight ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${item.highlight ? '#bbf7d0' : '#f1f5f9'}`,
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: item.highlight ? '#15803d' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.name}</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{item.price}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: item.up ? '#16a34a' : '#ef4444', fontSize: '12px', fontWeight: 700 }}>
                    <TrendingUp size={12} style={item.up ? {} : { transform: 'rotate(180deg)' }} />
                    {item.change}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '28px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>{t('dashboard.advisory')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '12px', background: '#fffbeb' }}>
                  <Leaf size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{t('dashboard.alert1')}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '12px', background: '#f0fdf4' }}>
                  <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{t('dashboard.alert2')}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card title={t('dashboard.timeline')} style={{ border: 'none', borderRadius: '16px' }}>
            <Timeline
              style={{ marginTop: '8px' }}
              items={[
                { color: 'green', children: <span style={{ fontSize: '13px', color: '#475569' }}>{t('dashboard.event1')}</span> },
                { color: 'red', children: <span style={{ fontSize: '13px', color: '#475569' }}>{t('dashboard.event2')}</span> },
                { color: 'blue', children: <span style={{ fontSize: '13px', color: '#475569' }}>{t('dashboard.event3')}</span> },
                { color: 'gray', children: <span style={{ fontSize: '13px', color: '#475569' }}>{t('dashboard.event4')}</span> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
