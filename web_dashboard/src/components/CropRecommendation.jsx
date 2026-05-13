import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Select, Space, Row, Col, Typography, Steps } from 'antd';
import { Leaf, Thermometer, Droplets, FlaskConical, MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const CropRecommendation = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFinish = (values) => {
    setLoading(true);
    // Simulate AI prediction
    setTimeout(() => {
      setResult({
        primary: "Maize (Corn)",
        alternatives: ["Sorghum", "Soybean"],
        justification: "Based on your soil's high nitrogen and moderate phosphorus levels, combined with the current rainfall patterns, Maize is the most profitable and suitable crop for this season.",
        suitability: 92
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <Title level={2} className="!mb-0">{t('crop.title')}</Title>
          <Text type="secondary">{t('crop.subtitle')}</Text>
        </div>
      </div>

      <Row gutter={24}>
        <Col span={24} lg={15}>
          <Card className="border-none shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark="optional"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <Form.Item 
                  label={<div className="flex items-center gap-2"><FlaskConical size={16}/><span>{t('crop.nitrogen')}</span></div>}
                  name="nitrogen"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="mg/kg" min={0} />
                </Form.Item>

                <Form.Item 
                  label={<div className="flex items-center gap-2"><FlaskConical size={16}/><span>{t('crop.phosphorus')}</span></div>}
                  name="phosphorus"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="mg/kg" min={0} />
                </Form.Item>

                <Form.Item 
                  label={<div className="flex items-center gap-2"><FlaskConical size={16}/><span>{t('crop.potassium')}</span></div>}
                  name="potassium"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="mg/kg" min={0} />
                </Form.Item>

                <Form.Item 
                  label={<div className="flex items-center gap-2"><Droplets size={16}/><span>{t('crop.ph')}</span></div>}
                  name="ph"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="4.5 - 9.0" min={0} max={14} step={0.1} />
                </Form.Item>

                <Form.Item 
                  label={<div className="flex items-center gap-2"><Thermometer size={16}/><span>{t('crop.temp')}</span></div>}
                  name="temp"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="°C" />
                </Form.Item>

                <Form.Item 
                  label={<div className="flex items-center gap-2"><Droplets size={16}/><span>{t('crop.rainfall')}</span></div>}
                  name="rainfall"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" placeholder="mm/year" />
                </Form.Item>
              </div>

              <div className="mt-6 flex justify-end">
                <Space>
                  <Button onClick={() => form.resetFields()}>Reset</Button>
                  <Button type="primary" icon={<Search size={16} />} loading={loading} htmlType="submit" className="px-8">
                    {t('crop.analyze')}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Col>

        <Col span={24} lg={9}>
          {!result ? (
            <Card className="h-full flex items-center justify-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <div className="text-center p-8">
                <Leaf className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-400">Analysis results will appear here after submission.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Recommended Crop</p>
                <Title level={3} className="!text-emerald-900 !m-0">{result.primary}</Title>
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-emerald-600 font-bold text-2xl">{result.suitability}%</div>
                  <div className="text-xs text-emerald-600 leading-tight">Suitability<br/>Score</div>
                </div>
              </Card>

              <Card title="Detailed Insights" className="border-none shadow-sm">
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {result.justification}
                </p>
                
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alternative Options</h4>
                <div className="space-y-2">
                  {result.alternatives.map(alt => (
                    <div key={alt} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-700">{alt}</span>
                      <Text type="secondary" className="text-xs">Moderate suitability</Text>
                    </div>
                  ))}
                </div>

                <Button block className="mt-6 border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300">
                  Download Full Report (PDF)
                </Button>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CropRecommendation;
