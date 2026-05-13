import React from 'react';
import { Row, Col, Card, Statistic, Typography, Tag, Timeline } from 'antd';
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const DashboardHome = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="!mb-0">{t('common.welcome')}</Title>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <MapPin size={16} />
            <Text type="secondary">{t('common.region')}</Text>
            <span className="mx-1">•</span>
            <Calendar size={16} />
            <Text type="secondary">May 14, 2026</Text>
          </div>
        </div>
        <div className="flex gap-2">
          <Tag color="orange" className="flex items-center gap-1 border-none bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
            <AlertCircle size={14} />
            <span className="font-semibold">{t('common.weatherAlert')}</span>
          </Tag>
        </div>
      </div>

      {/* Weather Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Temperature</p>
                <h3 className="text-2xl font-bold text-slate-800">32°C</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Thermometer className="text-orange-500" size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Humidity</p>
                <h3 className="text-2xl font-bold text-slate-800">64%</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Droplets className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Wind Speed</p>
                <h3 className="text-2xl font-bold text-slate-800">12 km/h</h3>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl">
                <Wind className="text-slate-500" size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-cyan-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rainfall</p>
                <h3 className="text-2xl font-bold text-slate-800">0.5 mm</h3>
              </div>
              <div className="bg-cyan-100 p-3 rounded-xl">
                <CloudRain className="text-cyan-500" size={24} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card title="Market Summary" extra={<a href="#" className="text-primary font-bold">View All</a>} className="border-none shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Maize</p>
                <p className="text-lg font-bold text-emerald-900 mt-1">₹1,950</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-2 font-bold">
                  <TrendingUp size={12} />
                  <span>+5.6%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wheat</p>
                <p className="text-lg font-bold text-slate-800 mt-1">₹2,275</p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs mt-2 font-bold">
                  <TrendingUp size={12} />
                  <span>+2.4%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rice</p>
                <p className="text-lg font-bold text-slate-800 mt-1">₹4,500</p>
                <div className="flex items-center gap-1 text-red-500 text-xs mt-2 font-bold">
                  <TrendingUp size={12} className="rotate-180" />
                  <span>-1.2%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Advisory Summary</h4>
              <div className="space-y-3">
                <AlertCircle className="inline-block text-orange-500 mr-2" size={16} />
                <span className="text-sm text-slate-600">Consider planting legumes next month to improve soil nitrogen.</span>
                <div className="h-px bg-slate-100 my-2" />
                <AlertCircle className="inline-block text-emerald-500 mr-2" size={16} />
                <span className="text-sm text-slate-600">Current soil moisture is optimal for wheat maturation.</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card title="Activity Timeline" className="border-none shadow-sm">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: 'Maize price prediction updated to Bullish',
                },
                {
                  color: 'green',
                  children: 'Tomato Late Blight detected in East Section',
                },
                {
                  color: 'blue',
                  children: 'Soil analysis report generated',
                },
                {
                  children: 'System update v2.4.1 completed',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
