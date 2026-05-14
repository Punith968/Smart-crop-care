import React, { useState } from 'react';
import { Form, InputNumber, Button, Slider, Progress, Spin } from 'antd';
import { Sprout, Thermometer, Droplets, FlaskConical, MapPin, Leaf, Zap, DollarSign, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const SOILS = [
  { key: 'Sandy', icon: '🏜️', sub: 'Fast drain' },
  { key: 'Loamy', icon: '🌱', sub: 'Balanced' },
  { key: 'Clayey', icon: '🧱', sub: 'Retentive' },
  { key: 'Black', icon: '⬛', sub: 'Organic' },
  { key: 'Red', icon: '🔴', sub: 'Mineral' },
];

const PRESETS = {
  Sandy: { N:60,P:30,K:20,temp:28,humidity:65,rainfall:120,moisture:28,ph:6.2,acres:2 },
  Loamy: { N:90,P:42,K:43,temp:25,humidity:80,rainfall:200,moisture:38,ph:6.5,acres:2.5 },
  Clayey:{ N:80,P:55,K:38,temp:24,humidity:85,rainfall:220,moisture:48,ph:6.8,acres:3 },
  Black: { N:70,P:35,K:50,temp:27,humidity:70,rainfall:160,moisture:42,ph:7.2,acres:4 },
  Red:   { N:50,P:25,K:30,temp:30,humidity:60,rainfall:100,moisture:25,ph:5.8,acres:1.5 },
};

const phColor = v => v<5.5?'#ef4444':v<6.5?'#f59e0b':v<7.5?'#22c55e':v<8.5?'#3b82f6':'#8b5cf6';
const phLabel = v => v<5.5?'Strong Acid':v<6.5?'Mild Acid':v<7.5?'Neutral':v<8.5?'Mild Alkali':'Strong Alkali';

/* ── Compact input with unit badge ── */
const F = ({ icon, label, unit, name, rules, ...rest }) => (
  <div>
    <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:5 }}>
      {icon}
      <span style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)' }}>{label}</span>
    </div>
    <Form.Item name={name} rules={rules} noStyle>
      <div style={{ position:'relative' }}>
        <InputNumber style={{ width:'100%', height:44 }} {...rest} />
        {unit && <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, fontWeight:700, color:'var(--text-muted)', pointerEvents:'none', background:'var(--bg)', padding:'2px 6px', borderRadius:6 }}>{unit}</span>}
      </div>
    </Form.Item>
  </div>
);

const CropRecommendation = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [soil, setSoil] = useState('Loamy');
  const [ph, setPh] = useState(6.5);

  const pick = s => { setSoil(s); const p=PRESETS[s]; setPh(p.ph); form.setFieldsValue(p); };

  const submit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        N: values.N,
        P: values.P,
        K: values.K,
        temperature: values.temp,
        humidity: values.humidity,
        ph: ph,
        rainfall: values.rainfall,
        moisture: values.moisture,
        soil_type: soil,
        acres: values.acres
      };
      
      const response = await axios.post('/api/workspace/advisory', payload);
      const data = response.data;
      
      setResult({
        crop: data.crop.recommended_crop,
        fertilizer: data.fertilizer.recommended_fertilizer,
        totalCost: data.price.total_cost,
        revenue: data.price.expected_revenue,
        profit: data.price.expected_profit,
        costPerAcre: data.price.total_cost / values.acres,
        margin: Math.round((data.price.expected_profit / data.price.expected_revenue) * 100),
        readiness: data.summary.readiness,
        confidence: parseInt(data.top_crops[0].confidence),
        headline: data.summary.headline,
        signal: data.summary.profit_signal,
        alts: data.top_crops.slice(1).map(c => ({
          crop: c.crop,
          fit: parseInt(c.confidence),
          why: `Strong potential match for your field conditions.`
        })),
      });
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to get recommendation. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Form Card ── */}
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <p className="section-label">{t('crop.inputWorkspace')}</p>
        <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text)', margin:'4px 0 2px' }}>{t('crop.farmParams')}</h2>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{t('crop.subtitle')}</p>

        <Form form={form} layout="vertical" onFinish={submit} requiredMark={false} initialValues={PRESETS.Loamy}>
          {/* Soil chips */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{t('crop.soilClass')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:16 }}>
            {SOILS.map(s => (
              <div key={s.key} onClick={() => pick(s.key)} style={{
                textAlign:'center', padding:'10px 4px', borderRadius:12, cursor:'pointer',
                border: soil===s.key ? '2px solid var(--green)' : '1px solid var(--border)',
                background: soil===s.key ? 'var(--green-light)' : 'white',
                transition:'all 0.15s',
              }}>
                <span style={{ fontSize:18, display:'block' }}>{s.icon}</span>
                <p style={{ fontSize:10, fontWeight:700, color: soil===s.key ? 'var(--green-dark)' : 'var(--text)', margin:'4px 0 0' }}>{s.key}</p>
                <p style={{ fontSize:8, color:'var(--text-muted)', margin:0 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* NPK */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{t('crop.soilChem')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            <F name="N" icon={<FlaskConical size={11} style={{color:'#22c55e'}} />} label="N" unit="mg/kg" min={0} rules={[{required:true}]} />
            <F name="P" icon={<FlaskConical size={11} style={{color:'#3b82f6'}} />} label="P" unit="mg/kg" min={0} rules={[{required:true}]} />
            <F name="K" icon={<FlaskConical size={11} style={{color:'#8b5cf6'}} />} label="K" unit="mg/kg" min={0} rules={[{required:true}]} />
          </div>

          {/* pH */}
          <div style={{ background:`${phColor(ph)}08`, borderRadius:14, padding:'14px 16px', marginBottom:14, border:`1px solid ${phColor(ph)}20` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{t('crop.phLabel')}</p>
                <p style={{ fontSize:32, fontWeight:900, color:phColor(ph), lineHeight:1, margin:'2px 0' }}>{ph.toFixed(1)}</p>
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:phColor(ph), background:`${phColor(ph)}12`, padding:'3px 10px', borderRadius:8 }}>{phLabel(ph)}</span>
            </div>
            <Slider min={4} max={10} step={0.1} value={ph} onChange={setPh} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
              <span style={{ fontSize:9, fontWeight:600, color:'#ef4444' }}>{t('crop.acidic')}</span>
              <span style={{ fontSize:9, fontWeight:600, color:'#22c55e' }}>{t('crop.neutral')}</span>
              <span style={{ fontSize:9, fontWeight:600, color:'#8b5cf6' }}>{t('crop.alkaline')}</span>
            </div>
          </div>

          {/* Field conditions 2×2 */}
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{t('crop.fieldConditions')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            <F name="temp" icon={<Thermometer size={11} style={{color:'#f97316'}} />} label={t('crop.temp')} unit="°C" rules={[{required:true}]} />
            <F name="humidity" icon={<Droplets size={11} style={{color:'#3b82f6'}} />} label={t('crop.humidity')} unit="%" rules={[{required:true}]} />
            <F name="rainfall" icon={<Droplets size={11} style={{color:'#06b6d4'}} />} label={t('crop.rainfall')} unit="mm" rules={[{required:true}]} />
            <F name="moisture" icon={<Droplets size={11} style={{color:'#8b5cf6'}} />} label={t('crop.moisture')} unit="%" rules={[{required:true}]} />
          </div>

          {/* Acres */}
          <div style={{ marginBottom:16 }}>
            <F name="acres" icon={<MapPin size={11} style={{color:'var(--green)'}} />} label={t('crop.acres')} unit="ac" min={0.1} step={0.5} rules={[{required:true}]} />
          </div>

          {/* Submit */}
          <Button type="primary" htmlType="submit" loading={loading} block
            style={{ height:50, borderRadius:14, fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#16a34a,#15803d)', border:'none' }}>
            <Zap size={16} style={{ marginRight:6 }} /> {t('crop.initiate')}
          </Button>
        </Form>
      </div>

      {/* ── Results ── */}
      {loading && (
        <div style={{ textAlign:'center', padding:48 }}>
          <Spin size="large" />
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:14, fontWeight:600 }}>{t('crop.analyzing')}</p>
        </div>
      )}

      {result && !loading && (
        <div className="fade-in">
          {/* Hero */}
          <div style={{
            background:'linear-gradient(135deg,#0a3622,#14532d 50%,#166534)', borderRadius:16,
            padding:'20px 18px', color:'white', marginBottom:10, position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', opacity:0.5 }}>{t('crop.advisoryOutput')}</span>
                <span style={{ background:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:99, padding:'2px 10px', fontSize:10, fontWeight:700 }}>
                  ✓ {result.readiness}%
                </span>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12 }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:8, fontWeight:800, letterSpacing:'0.12em', opacity:0.4 }}>{t('crop.topCrop')}</p>
                  <p style={{ fontSize:36, fontWeight:900, margin:'2px 0', lineHeight:1, letterSpacing:'-0.02em' }}>{result.crop}</p>
                  <p style={{ fontSize:11, opacity:0.55, lineHeight:1.5, maxWidth:240 }}>{result.headline}</p>
                </div>
                <div style={{ textAlign:'center', background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'10px 16px', flexShrink:0 }}>
                  <p style={{ fontSize:8, fontWeight:800, letterSpacing:'0.1em', opacity:0.5 }}>{t('crop.modelFit')}</p>
                  <p style={{ fontSize:28, fontWeight:900, lineHeight:1 }}>{result.confidence}%</p>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:16 }}>
                <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 12px' }}>
                  <p style={{ fontSize:8, fontWeight:700, opacity:0.4, letterSpacing:'0.1em' }}>{t('crop.fertPair')}</p>
                  <p style={{ fontSize:12, fontWeight:700, marginTop:2 }}>{result.fertilizer}</p>
                </div>
                <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'8px 12px' }}>
                  <p style={{ fontSize:8, fontWeight:700, opacity:0.4, letterSpacing:'0.1em' }}>{t('crop.expectedProfit')}</p>
                  <p style={{ fontSize:18, fontWeight:900, marginTop:2, color:'#4ade80' }}>₹{result.profit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="card" style={{ padding:16, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <DollarSign size={13} style={{ color:'var(--green)' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{t('crop.financialOutlook')}</span>
            </div>
            {[
              { l:t('crop.totalCost'), v:`₹${result.totalCost.toLocaleString()}` },
              { l:t('crop.revenue'), v:`₹${result.revenue.toLocaleString()}` },
              { l:t('crop.profit'), v:`₹${result.profit.toLocaleString()}`, g:true },
              { l:t('crop.margin'), v:`${result.margin}%` },
            ].map(r => (
              <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>{r.l}</span>
                <span style={{ fontSize:13, fontWeight:700, color: r.g ? 'var(--green)' : 'var(--text)' }}>{r.v}</span>
              </div>
            ))}
          </div>

          {/* Readiness */}
          <div className="card" style={{ padding:16, marginBottom:10, textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginBottom:12 }}>
              <BarChart3 size={13} style={{ color:'var(--green)' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{t('crop.fieldReadinessTitle')}</span>
            </div>
            <Progress type="circle" percent={result.readiness} strokeColor="#22c55e" railColor="#dcfce7" size={90} strokeWidth={8}
              format={() => <span style={{ fontSize:20, fontWeight:900, color:'var(--green)' }}>{result.readiness}%</span>} />
            <div style={{ background:'var(--green-light)', borderRadius:10, padding:12, border:'1px solid var(--green-border)', marginTop:14, textAlign:'left' }}>
              <p style={{ fontSize:11, color:'var(--green-dark)', lineHeight:1.5 }}>{result.signal}</p>
            </div>
          </div>

          {/* Alternatives */}
          <div className="card" style={{ padding:16 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:10 }}>{t('crop.altCrops')}</p>
            {result.alts.map(a => (
              <div key={a.crop} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)', marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Leaf size={16} style={{ color:'#22c55e' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{a.crop}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--green)' }}>{a.fit}%</span>
                  </div>
                  <p style={{ fontSize:10, color:'var(--text-muted)', margin:'2px 0 0', lineHeight:1.4 }}>{a.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px', border:'2px dashed var(--border-strong)' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Leaf size={24} style={{ color:'#86efac' }} />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t('crop.title')}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', maxWidth:240, margin:'6px auto 0', lineHeight:1.5 }}>{t('crop.placeholder')}</p>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
