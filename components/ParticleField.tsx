'use client';

// Fixed particles — no Math.random to avoid hydration mismatch
const PARTICLES = [
  { left:'5%',  top:'10%', s:2,   del:'0s',    dur:'20s', op:.12, cls:'p-f1', c:'#D61E23' },
  { left:'18%', top:'68%', s:1.5, del:'2s',    dur:'24s', op:.07, cls:'p-f2', c:'#fff'    },
  { left:'33%', top:'25%', s:1,   del:'5s',    dur:'18s', op:.09, cls:'p-f3', c:'#7C3AED' },
  { left:'47%', top:'82%', s:2,   del:'1s',    dur:'22s', op:.06, cls:'p-f1', c:'#fff'    },
  { left:'62%', top:'35%', s:1.5, del:'7s',    dur:'26s', op:.10, cls:'p-f2', c:'#D61E23' },
  { left:'75%', top:'55%', s:1,   del:'3s',    dur:'20s', op:.08, cls:'p-f3', c:'#fff'    },
  { left:'88%', top:'18%', s:2,   del:'4s',    dur:'19s', op:.11, cls:'p-f1', c:'#7C3AED' },
  { left:'12%', top:'45%', s:1,   del:'6s',    dur:'23s', op:.07, cls:'p-f2', c:'#fff'    },
  { left:'55%', top:'72%', s:2,   del:'1.5s',  dur:'21s', op:.09, cls:'p-f3', c:'#D61E23' },
  { left:'92%', top:'42%', s:1.5, del:'8s',    dur:'17s', op:.06, cls:'p-f1', c:'#fff'    },
  { left:'28%', top:'88%', s:1,   del:'0.5s',  dur:'25s', op:.10, cls:'p-f2', c:'#D61E23' },
  { left:'70%', top:'8%',  s:2,   del:'3.5s',  dur:'22s', op:.07, cls:'p-f3', c:'#fff'    },
  { left:'40%', top:'60%', s:1.5, del:'9s',    dur:'20s', op:.08, cls:'p-f1', c:'#7C3AED' },
  { left:'82%', top:'78%', s:1,   del:'2.5s',  dur:'24s', op:.12, cls:'p-f2', c:'#D61E23' },
  { left:'15%', top:'92%', s:2,   del:'7.5s',  dur:'18s', op:.06, cls:'p-f3', c:'#fff'    },
  { left:'95%', top:'65%', s:1.5, del:'4.5s',  dur:'21s', op:.09, cls:'p-f1', c:'#D61E23' },
  { left:'50%', top:'20%', s:1,   del:'6.5s',  dur:'23s', op:.07, cls:'p-f2', c:'#fff'    },
  { left:'38%', top:'95%', s:2,   del:'1.8s',  dur:'19s', op:.10, cls:'p-f3', c:'#7C3AED' },
  { left:'77%', top:'30%', s:1.5, del:'5.5s',  dur:'26s', op:.06, cls:'p-f1', c:'#fff'    },
  { left:'22%', top:'52%', s:1,   del:'8.5s',  dur:'22s', op:.10, cls:'p-f2', c:'#D61E23' },
];

export default function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${p.cls}`}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.s}px`,
            height: `${p.s}px`,
            background: p.c,
            opacity: p.op,
            boxShadow: p.c === '#D61E23' ? `0 0 ${p.s * 3}px ${p.c}` : 'none',
            '--dur': p.dur,
            '--del': p.del,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
