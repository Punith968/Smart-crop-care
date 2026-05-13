import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, Globe } from 'lucide-react';

const { Title, Text } = Typography;

const data = [
  { name: 'Jan', price: 2100 },
  { name: 'Feb', price: 2350 },
  { name: 'Mar', price: 2200 },
  { name: 'Apr', price: 2600 },
  { name: 'May', price: 2800 },
  { name: 'Jun', price: 3100 },
];

const MarketAnalysis = () => {
  const columns = [
    {
      title: 'Commodity',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-bold">{text}</span>,
    },
    {
      title: 'Market Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `₹${val}/quintal`,
    },
    {
      title: '24h Change',
      dataIndex: 'change',
      key: 'change',
      render: (val) => (
        <span className={val >= 0 ? 'text-emerald-500 flex items-center gap-1' : 'text-red-500 flex items-center gap-1'}>
          {val >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(val)}%
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'Stable' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  const tableData = [
    { key: '1', name: 'Wheat', price: 2275, change: 2.4, status: 'Bullish' },
    { key: '2', name: 'Rice (Basmati)', price: 4500, change: -1.2, status: 'Stable' },
    { key: '3', name: 'Maize', price: 1950, change: 5.6, status: 'Bullish' },
    { key: '4', name: 'Cotton', price: 6800, change: 0.8, status: 'Stable' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="!mb-0">Market Analysis</Title>
          <Text type="secondary">Real-time commodity prices and AI-driven market trend forecasting.</Text>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Globe size={18} />
          <span className="text-sm font-semibold">Global Markets</span>
        </button>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card title="Price Trend - Wheat (2026)" className="border-none shadow-sm">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Market Sentiment</p>
                  <h3 className="text-2xl font-bold">Strong Bullish</h3>
                  <p className="text-emerald-100 text-sm mt-2">Expect 12% price increase in next 30 days for food grains.</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <TrendingUp size={24} />
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Market Statistics</h4>
              <div className="space-y-4">
                <Statistic 
                  title="Highest Gainer" 
                  value="Maize" 
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                  prefix={<ArrowUpRight size={16} className="text-emerald-500" />}
                />
                <Statistic 
                  title="Average Volume" 
                  value={45600} 
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                  suffix="MT"
                />
              </div>
            </Card>
          </div>
        </Col>

        <Col span={24}>
          <Card title="Live Commodity Prices" className="border-none shadow-sm" bodyStyle={{ padding: 0 }}>
            <Table 
              columns={columns} 
              dataSource={tableData} 
              pagination={false} 
              className="border-t border-slate-100"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MarketAnalysis;
