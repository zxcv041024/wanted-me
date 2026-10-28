import { ArrowUpRight, Check, LockKeyhole, Fingerprint, Link2 } from 'lucide-react';
import { Scene } from './Scene';
import { suspects } from '../data/story';
import { assets } from '../data/assets';
export function EvidenceBoard({ completed, inspect, started }: { completed: number[]; inspect: (id: number) => void; started: boolean }) {
  return <div className={`evidence-board ${completed.includes(3) ? 'board-collision' : ''}`} style={assets.reference[0] ? {backgroundImage:`linear-gradient(#0b1018cc,#0b1018aa),url("${assets.reference[0]}")`,backgroundSize:'cover'} : undefined}>
    <div className="board-grid"/>
    <div className="board-heading"><span className="eyebrow">IDENTITY INVESTIGATION BOARD</span><span className="board-case">001 / RESTRICTED</span></div>
    <svg className="red-threads" viewBox="0 0 900 560" preserveAspectRatio="none" aria-hidden="true"><path d="M180 120 L690 405 L240 440 L670 100 L180 120"/><path d="M180 120 L445 275 L670 100 M445 275 L690 405 M445 275 L240 440"/>{completed.length>0&&<path className="thread-new" d="M220 200 L680 310 L650 120 M220 200 L245 420 L660 430"/>}{completed.length>2&&<path className="thread-new" d="M170 470 L600 50 L720 450 L170 470"/>}</svg>
    <div className="center-token"><Fingerprint size={29} strokeWidth={1.2}/><span>{completed.includes(3) ? 'SAME IDENTITY' : 'WHO IS THIS?'}</span><strong>?</strong></div>
    {suspects.map((s, i) => {const found = completed.includes(s.unlock);return <button className={`suspect-polaroid polaroid-${i} ${found ? 'discovered' : ''}`} key={s.id} onClick={() => inspect(i)} aria-label={`용의자 ${s.id} ${s.name} 기록 열람`}><span className="pin"/><div className="polaroid-photo"><Scene index={s.scene} reference={assets.reference[i+1]}/><span className="photo-id">SUBJECT {s.id}</span><span className="photo-status">{found ? <Check size={13}/> : <LockKeyhole size={12}/>}</span></div><div className="polaroid-caption"><span>SUSPECT {s.id}</span><strong>{s.name}</strong><small>{s.alias}</small></div><span className="polaroid-corner"><ArrowUpRight size={16}/></span></button>;})}
    <div className="board-paper paper-top"><span>CASE #001</span><strong>존재하지 않는<br/>네 명의 용의자</strong><span className="redacted-line"/><small>IDENTITY: UNCONFIRMED</small></div>
    <div className="board-paper paper-bottom"><span>수사 메모</span><strong>{completed.includes(3) ? '다른 기록, 같은 사람.' : '우연이라기엔,\n너무 많은 연결점.'}</strong><Link2 size={15}/></div>
    <div className="board-coordinate">{started ? `${completed.length} RECORDS RESTORED` : 'AWAITING INVESTIGATOR'}<span>TRACE MAP / 04</span></div>
  </div>;
}
