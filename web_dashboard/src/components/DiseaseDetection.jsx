import React, { useState } from 'react';
import { Card, Upload, message, Button, Progress, Tag, Alert } from 'antd';
import { Upload as UploadIcon, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Dragger } = Upload;

const DiseaseDetection = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const mockDetection = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        disease: "Tomato Late Blight",
        confidence: 94.5,
        status: "critical",
        recommendation: "Apply copper-based fungicides immediately. Remove infected leaves and improve airflow between plants.",
        treatmentDate: "2026-05-14"
      });
      setLoading(false);
    }, 2000);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
        mockDetection();
      }, 500);
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('disease.title')}</h1>
          <p className="text-slate-500">{t('disease.subtitle')}</p>
        </div>
        <Tag color="green" className="px-3 py-1 rounded-full border-emerald-200">
          <div className="flex items-center gap-1">
            <CheckCircle size={14} />
            <span>AI Model v2.4 Active</span>
          </div>
        </Tag>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm">
            <Dragger {...uploadProps} className="p-8">
              <div className="flex flex-col items-center py-10">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                  <UploadIcon className="text-primary" size={32} />
                </div>
                <p className="text-lg font-semibold text-slate-700">{t('disease.uploadText')}</p>
                <p className="text-slate-500 max-w-xs text-center mt-2">
                  {t('disease.uploadHint')}
                </p>
              </div>
            </Dragger>
          </Card>

          {result && (
            <Card title={t('disease.analysisResult')} className="border-none shadow-sm">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <AlertTriangle className="text-red-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{result.disease}</h3>
                      <Tag color="red">Critical Attention</Tag>
                    </div>
                    <p className="text-slate-600 mb-4">{result.recommendation}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-600">Model Confidence</span>
                    <span className="text-lg font-bold text-primary">{result.confidence}%</span>
                  </div>
                  <Progress 
                    percent={result.confidence} 
                    strokeColor={{ '0%': '#10b981', '100%': '#059669' }} 
                    showInfo={false}
                    className="mb-0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-100 bg-white">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Severity</p>
                    <p className="text-sm font-bold text-red-600 mt-1">High (Type B)</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-100 bg-white">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Suggested Spray</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Chlorothalonil</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Guidelines" className="border-none shadow-sm h-full">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-600 mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <p className="text-sm text-slate-600">Ensure the leaf is centered and flat.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-600 mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <p className="text-sm text-slate-600">Avoid strong shadows or over-exposure.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-100 p-1.5 rounded text-emerald-600 mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <p className="text-sm text-slate-600">Upload images of individual leaves for best results.</p>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Recently Detected</h4>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-10 h-10 bg-slate-200 rounded-md overflow-hidden">
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                        <ImageIcon size={16} className="text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Leaf Spot</p>
                      <p className="text-[10px] text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
