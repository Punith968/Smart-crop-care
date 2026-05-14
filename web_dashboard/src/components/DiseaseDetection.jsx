import React, { useState, useRef } from 'react';
import { Input, Button, Progress, Spin } from 'antd';
import { AlertTriangle, Leaf, Camera, X, Shield, FileText, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const DiseaseDetection = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cropName, setCropName] = useState('tomato');
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const risk = (d) => { const l=d.toLowerCase(); return l.includes('blight')||l.includes('wilt')?78 : l.includes('spot')?55 : 10; };
  const rColor = s => s>=70?'#ef4444':s>=40?'#f59e0b':'#22c55e';
  const sev = s => s>=70?t('disease.highSev'):s>=40?t('disease.modSev'):t('disease.lowSev');

  const onFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name);
    const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f);
  };
  const clearImg = () => { setPreview(null); setFileName(''); if(fileRef.current) fileRef.current.value=''; };

  const analyze = async () => {
    if (!cropName.trim()) return;
    setLoading(true);
    try {
      const payload = {
        crop_name: cropName,
        image_data: preview // This is base64
      };
      
      const response = await axios.post('/api/workspace/disease', payload);
      const data = response.data;
      
      setResult({
        cropName, 
        disease: data.likely_disease,
        reco: data.recommendation,
        basis: data.justification || 'AI model analysis of leaf patterns.',
        source: data.prediction_source,
        risk: data.risk_score || risk(data.likely_disease),
        plan: data.treatment_steps || [
          { name: 'Apply recommended fungicide', when: 'Immediate', type: 'Chemical' },
          { name: 'Remove infected parts', when: 'Today', type: 'Manual' },
          { name: 'Monitor surrounding plants', when: 'Next 3 days', type: 'Prevention' },
        ],
      });
    } catch (error) {
      console.error('API Error:', error);
      alert('Diagnosis failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const r = result ? result.risk : 0;

  return (
    <div>
      {/* ── Input ── */}
      <div className="card" style={{ padding:16, marginBottom:12 }}>
        <p className="section-label">{t('disease.diagnosticIntake')}</p>
        <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text)', margin:'4px 0 2px' }}>{t('disease.title')}</h2>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{t('disease.subtitle')}</p>

        {/* Image upload */}
        {preview ? (
          <div style={{ position:'relative', borderRadius:14, overflow:'hidden', marginBottom:14, border:'1px solid var(--border)' }}>
            <img src={preview} alt="Leaf" style={{ width:'100%', height:180, objectFit:'cover', display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 50%)' }} />
            <div style={{ position:'absolute', bottom:10, left:12, display:'flex', alignItems:'center', gap:5 }}>
              <Shield size={12} style={{ color:'#4ade80' }} />
              <span style={{ color:'white', fontSize:11, fontWeight:700 }}>{fileName}</span>
            </div>
            <button onClick={clearImg} style={{
              position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.5)', border:'none',
              borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'white',
            }}><X size={14} /></button>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()} style={{
            borderRadius:14, padding:'32px 16px', textAlign:'center', cursor:'pointer', marginBottom:14,
            background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'2px dashed #fde68a',
          }}>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display:'none' }} />
            <div style={{ width:48, height:48, borderRadius:14, background:'white', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <Camera size={22} style={{ color:'#d97706' }} />
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', margin:'0 0 3px' }}>{t('disease.uploadText')}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{t('disease.uploadHint')}</p>
          </div>
        )}

        {/* Crop name */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:5 }}>
            <Leaf size={11} style={{ color:'var(--green)' }} />
            <span style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)' }}>{t('disease.cropLabel')}</span>
          </div>
          <Input value={cropName} onChange={e => setCropName(e.target.value)}
            style={{ height:44, borderRadius:12, borderColor:'var(--border-strong)', fontSize:14, fontWeight:600 }}
            placeholder={t('disease.cropPlaceholder')} />
        </div>

        <Button type="primary" block loading={loading} onClick={analyze} disabled={!cropName.trim()}
          style={{ height:50, borderRadius:14, fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#d97706,#b45309)', border:'none' }}>
          <Shield size={16} style={{ marginRight:6 }} /> {t('disease.analyzeBtn')}
        </Button>
        <Button type="text" block onClick={() => { setCropName('tomato'); clearImg(); setResult(null); }}
          style={{ marginTop:6, color:'var(--text-muted)', fontWeight:600, fontSize:12 }}>
          {t('disease.clearIntake')}
        </Button>
      </div>

      {/* ── Results ── */}
      {loading && (
        <div style={{ textAlign:'center', padding:48 }}>
          <Spin size="large" />
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:14, fontWeight:600 }}>{t('disease.analyzing')}</p>
        </div>
      )}

      {result && !loading && (
        <div className="fade-in">
          {/* Hero */}
          <div style={{
            background:`linear-gradient(135deg, ${r>=70?'#7f1d1d':r>=40?'#78350f':'#14532d'}, ${r>=70?'#991b1b':r>=40?'#92400e':'#166534'})`,
            borderRadius:16, padding:'20px 18px', color:'white', marginBottom:10, position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ background:`${rColor(r)}30`, border:`1px solid ${rColor(r)}50`, borderRadius:99, padding:'2px 10px', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                  <AlertTriangle size={11} /> {sev(r)}
                </span>
                <span style={{ fontSize:9, fontWeight:700, opacity:0.5, letterSpacing:'0.1em' }}>{t('disease.activeScan')}</span>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:8, fontWeight:800, letterSpacing:'0.12em', opacity:0.4 }}>{t('disease.likelyDisease')}</p>
                  <p style={{ fontSize:24, fontWeight:900, margin:'2px 0 6px', lineHeight:1.1 }}>{result.disease}</p>
                  <p style={{ fontSize:11, opacity:0.55, lineHeight:1.5 }}>{result.reco}</p>
                </div>
                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <Progress type="circle" percent={r} size={72} strokeWidth={8}
                    strokeColor={rColor(r)} trailColor="rgba(255,255,255,0.1)"
                    format={() => <span style={{ fontSize:20, fontWeight:900, color:'white' }}>{r}</span>} />
                  <p style={{ fontSize:9, opacity:0.5, marginTop:3, fontWeight:600 }}>{t('disease.riskLabel')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action plan */}
          <div className="card" style={{ padding:16, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <Zap size={13} style={{ color:'var(--red)' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{t('disease.actionPlan')}</span>
            </div>
            {result.plan.map((tr,i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginBottom:6,
                background: i===0 ? 'var(--red-light)' : 'var(--bg)', borderRadius:12,
                border: `1px solid ${i===0 ? 'var(--red-border)' : 'var(--border)'}`,
              }}>
                <div style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  background: i===0 ? 'var(--red-border)' : 'var(--border)', fontSize:12, fontWeight:800,
                  color: i===0 ? 'var(--red)' : 'var(--text-secondary)' }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{tr.name}</p>
                  <p style={{ fontSize:10, color:'var(--text-muted)' }}>{tr.when} · {tr.type}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic details */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <FileText size={13} style={{ color:'var(--blue)' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{t('disease.diagnosticDetails')}</span>
            </div>
            {[
              { l:t('disease.cropLabel'), v:result.cropName },
              { l:t('disease.analysisMethod'), v:result.source==='cnn_model'?t('disease.aiModelLabel'):t('disease.heuristicLabel') },
            ].map(x => (
              <div key={x.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{x.l}</span>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{x.v}</span>
              </div>
            ))}
            <div style={{ background:'var(--bg)', borderRadius:10, padding:12, border:'1px solid var(--border)', marginTop:10 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'var(--text)', marginBottom:3 }}>{t('disease.technicalBasis')}</p>
              <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6 }}>{result.basis}</p>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px', border:'2px dashed var(--border-strong)' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--amber-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Shield size={24} style={{ color:'#d97706' }} />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t('disease.title')}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', maxWidth:240, margin:'6px auto 0', lineHeight:1.5 }}>{t('disease.placeholder')}</p>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
