import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Statistic } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const priceData = [
  { name: 'Jan', price: 2100 },
  { name: 'Feb', price: 2350 },
  { name: 'Mar', price: 2200 },
  { name: 'Apr', price: 2600 },
  { name: 'May', price: 2800 },
  { name: 'Jun', price: 3100 },
];

const MarketAnalysis = () => {
  const { t } = useTranslation();

  const columns = [
    { title: t('market.commodity'), dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 700 }}>{v}</span> },
    { title: t('market.price'), dataIndex: 'price', key: 'price', render: (v) => `₹${v}/quintal` },
    { title: t('market.change'), dataIndex: 'change', key: 'change', render: (v) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: v >= 0 ? '#16a34a' : '#ef4444', fontWeight: 700, fontSize: '13px' }}>
        {v >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(v)}%
      </span>
    )},
    { title: t('market.status'), dataIndex: 'status', key: 'status', render: (v) => <Tag color={v === 'Stable' ? 'blue' : 'green'}>{v}</Tag> },
  ];

  const tableData = [
    { key: '1', name: t('dashboard.wheat'), price: 2275, change: 2.4, status: 'Bullish' },
    { key: '2', name: t('dashboard.rice'), price: 4500, change: -1.2, status: 'Stable' },
    { key: '3', name: t('dashboard.maize'), price: 1950, change: 5.6, status: 'Bullish' },
    { key: '4', name: 'Cotton', price: 6800, change: 0.8, status: 'Stable' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={2} style={{ marginBottom: '4px', fontWeight: 800, color: '#0f172a' }}>{t('market.title')}</Title>
          <Text style={{ color: '#94a3b8', fontSize: '14px' }}>{t('market.subtitle')}</Text>
        </div>
        <button style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#334155' }}>
          <Globe size={16} style={{ color: '#16a34a' }} />
          {t('market.global')}
        </button>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card title={t('market.trendTitle')} style={{ border: 'none', borderRadius: '16px' }}>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#priceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card style={{ border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7, marginBottom: '4px' }}>{t('market.sentiment')}</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 10px 0' }}>{t('market.bullish')}</h3>
                  <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6 }}>{t('market.sentimentDesc')}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '12px' }}>
                  <TrendingUp size={22} />
                </div>
              </div>
            </Card>

            <Card style={{ border: 'none', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>{t('market.stats')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#94a3b8' }}>{t('market.gainer')}</span>}
                  value={t('dashboard.maize')} 
                  valueStyle={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}
                  prefix={<ArrowUpRight size={16} style={{ color: '#16a34a' }} />}
                />
                <Statistic 
                  title={<span style={{ fontSize: '12px', color: '#94a3b8' }}>{t('market.volume')}</span>}
                  value={45600} 
                  valueStyle={{ fontSize: 16, fontWeight: 800 }}
                  suffix="MT"
                />
              </div>
            </Card>
          </div>
        </Col>

        <Col span={24}>
          <Card title={t('market.livePrices')} style={{ border: 'none', borderRadius: '16px' }}>
            <Table columns={columns} dataSource={tableData} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MarketAnalysis;
