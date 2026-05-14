import React, { useState, useEffect } from 'react';
import { Button, Tag } from 'antd';
import { Download, Trash2, Clock, Sprout, Bug, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReportsPage = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports([
      { id:'1', module:'advisory', title:'Advisory — Rice', ts:'2026-05-14T10:00:00Z', note:'Generated from advisory workspace.', extra:'Profit: ₹38,700' },
      { id:'2', module:'disease', title:'Disease — Tomato', ts:'2026-05-13T15:30:00Z', note:'Generated from disease diagnostics.', extra:'Risk: 78/100' },
      { id:'3', module:'advisory', title:'Advisory — Maize', ts:'2026-05-12T09:15:00Z', note:'Generated from advisory workspace.', extra:'Profit: ₹22,100' },
    ]);
  }, []);

  const mc = {
    advisory: { icon:<Sprout size={16} style={{color:'var(--green)'}}/>, bg:'var(--green-light)', color:'var(--green)', border:'var(--green-border)', label:t('reports.advisory') },
    disease:  { icon:<Bug size={16} style={{color:'var(--amber)'}}/>, bg:'var(--amber-light)', color:'var(--amber)', border:'var(--amber-border)', label:t('reports.disease') },
  };
  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div>
      <p className="section-label">{t('reports.eyebrow')}</p>
      <h2 style={{ fontSize:17, fontWeight:800, color:'var(--text)', margin:'4px 0 2px' }}>{t('reports.title')}</h2>
      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{t('reports.subtitle')}</p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
        {[
          { l:t('reports.totalReports'), v:reports.length, icon:<Archive size={16} style={{color:'#3b82f6'}}/>, bg:'#eff6ff' },
          { l:t('reports.advisory'), v:reports.filter(r=>r.module==='advisory').length, icon:<Sprout size={16} style={{color:'var(--green)'}}/>, bg:'var(--green-light)' },
          { l:t('reports.disease'), v:reports.filter(r=>r.module==='disease').length, icon:<Bug size={16} style={{color:'var(--amber)'}}/>, bg:'var(--amber-light)' },
        ].map(k => (
          <div key={k.l} className="card" style={{ padding:'12px 10px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {k.icon}
            </div>
            <div>
              <p style={{ fontSize:8, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{k.l}</p>
              <p style={{ fontSize:18, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{k.v}</p>
            </div>
          </div>
        ))}
      </div>

      <Button type="primary" icon={<Download size={14} />} style={{ height:40, borderRadius:12, marginBottom:14, fontWeight:600, background:'linear-gradient(135deg,#16a34a,#15803d)', border:'none' }}>
        {t('reports.downloadAll')}
      </Button>

      {/* Cards */}
      {reports.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {reports.map(rpt => {
            const m = mc[rpt.module] || mc.advisory;
            return (
              <div key={rpt.id} className="card" style={{ padding:'14px 14px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:11, background:m.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${m.border}` }}>
                  {m.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{rpt.title}</span>
                    <Tag style={{ borderRadius:6, background:m.bg, color:m.color, border:`1px solid ${m.border}`, fontWeight:600, fontSize:9, padding:'0 5px', lineHeight:'16px', margin:0 }}>
                      {m.label}
                    </Tag>
                  </div>
                  <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rpt.note}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <Clock size={10} style={{ color:'var(--text-muted)' }} />
                    <span style={{ fontSize:10, color:'var(--text-muted)' }}>{fmtDate(rpt.ts)}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  <button style={{ width:34, height:34, borderRadius:9, border:'1px solid var(--border)', background:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}>
                    <Download size={13} />
                  </button>
                  <button style={{ width:34, height:34, borderRadius:9, border:'1px solid var(--red-border)', background:'var(--red-light)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--red)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign:'center', padding:'40px 20px', border:'2px dashed var(--border-strong)' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Archive size={24} style={{ color:'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t('reports.title')}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', maxWidth:240, margin:'6px auto 0', lineHeight:1.5 }}>{t('reports.empty')}</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
