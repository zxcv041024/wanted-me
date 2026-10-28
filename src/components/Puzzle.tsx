import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, CheckCircle2, ChevronRight, FileText, Film, Fingerprint, GripVertical, KeyRound, Music2, Piano, Shield, Users, Footprints, X, Link2 } from 'lucide-react';
import { traces, migration, research, timeline, motives, values, suspects } from '../data/story';
import { isOrdered, isMatched, isFactSelection, moveItem } from '../data/rules.mjs';
import { assets } from '../data/assets';

export type Draft = { assignments?: Record<string, string>; order?: string[]; selected?: string[]; value?: string };
type Props = { chapter: number; draft: Draft; update: (draft: Draft) => void; finish: () => void; sound: (kind?: 'click' | 'paper' | 'stamp' | 'warning' | 'closed') => void };
const icons = { piano: Piano, film: Film, music: Music2, walk: Footprints, people: Users, key: KeyRound, badge: Shield, file: FileText };

export function Puzzle({ chapter, draft, update, finish, sound }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [collision, setCollision] = useState(false);
  const [linked, setLinked] = useState<string[]>([]);
  useEffect(() => { setActive(null); setFeedback(''); setCollision(false); setLinked([]); }, [chapter]);
  const fail = () => { sound('warning'); setFeedback('이 가설은 아직 근거가 부족합니다. 단서를 다시 살펴보세요.'); };
  const choose = (id: string) => { setActive(active === id ? null : id); sound('click'); setFeedback(''); };
  const assign = (category: string, id = active) => {
    if (!id) { setFeedback('먼저 연결할 자료를 선택하세요.'); return; }
    update({ ...draft, assignments: { ...draft.assignments, [id]: category } }); setActive(null); setFeedback(''); sound('paper');
  };
  const assignments = draft.assignments || {};
  const order = Array.isArray(draft.order) ? draft.order : [];
  const selected = Array.isArray(draft.selected) ? draft.selected : [];

  if (chapter === 0 || chapter === 2) {
    const cards = chapter === 0 ? traces : [research[2], research[0], research[3], research[1]];
    const categories = chapter === 0 ? ['일상', '직업', '불명'] : ['연구 동기', '연구 목표', '실험 과정', '관찰된 한계'];
    return <div className="matching-puzzle">
      <div className="desk-label"><span>자료 보관함</span><span>{Object.keys(assignments).length} / {cards.length} 연결</span></div>
      <div className={`clue-grid ${chapter === 2 ? 'research-grid' : ''}`}>
        {cards.map((card, i) => {
          const Icon = 'icon' in card ? icons[card.icon as keyof typeof icons] : FileText;
          return <button key={card.id} draggable onDragStart={e => { e.dataTransfer.setData('text/plain', card.id); setActive(card.id); }}
            className={`clue-card ${active === card.id ? 'selected' : ''} ${assignments[card.id] ? 'assigned' : ''}`} aria-pressed={active === card.id} onClick={() => choose(card.id)}>
            <span className="clue-code">E-{String(i + 1).padStart(2, '0')} <GripVertical size={12} /></span>
            {assets.memories[({piano:0,friends:1,reuse:2,key:3} as Record<string,number>)[card.id]] ? <img className="clue-memory" src={assets.memories[({piano:0,friends:1,reuse:2,key:3} as Record<string,number>)[card.id]]} alt="" onError={e=>{e.currentTarget.style.display='none';}}/> : <Icon className="clue-icon" size={chapter === 2 ? 25 : 30} strokeWidth={1.2}/>}<strong>{card.title}</strong><small>{card.note}</small>
            <span className="clue-assignment">{assignments[card.id] ? <><Check size={12}/>{assignments[card.id]}</> : '분류 대기'}</span>
          </button>;
        })}
      </div>
      <div className={`category-grid count-${categories.length}`}>
        {categories.map(category => <button key={category} className="category-slot" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (cards.some(c => c.id === id)) assign(category, id); }} onClick={() => assign(category)}>
          <span className="eyebrow">CONNECT TO</span><strong>{category}</strong><span>{Object.values(assignments).filter(x => x === category).length}개 자료 <Link2 size={14}/></span>
        </button>)}
      </div>
      {chapter === 2 && <div className="document-note"><Shield size={16}/><p>연구 노트 원본은 아직 첨부되지 않았습니다. 현재 자료는 개발요청서에서 확인된 핵심 사실만 재구성했습니다.</p></div>}
      <PuzzleFooter feedback={feedback} onVerify={() => isMatched(assignments, cards) ? finish() : fail()} label={chapter === 2 ? '연구 기록 복원' : '분류 결과 확인'} />
    </div>;
  }

  if (chapter === 1 || chapter === 3) {
    const cards = chapter === 1 ? migration : timeline;
    const shuffled = chapter === 1 ? [2, 0, 3, 1] : [4, 1, 6, 0, 5, 3, 2];
    if (collision) return <div className="collision-panel">
      <span className="alert-pill"><span className="status-dot"/> IDENTITY COLLISION</span>
      <h3>네 개의 기록.<br/><em>동일한 신원 토큰.</em></h3>
      <p>각 기록을 눌러 중앙의 신원 토큰에 연결하세요.</p>
      <div className="identity-network"><svg viewBox="0 0 600 170" preserveAspectRatio="none" aria-hidden="true">{[75,225,375,525].map((x,i)=><line key={x} x1={x} y1="10" x2="300" y2="150" className={linked.includes(suspects[i].id) ? 'lit' : ''}/>)}</svg>
        <div className="identity-cards">{suspects.map(s => <button key={s.id} aria-pressed={linked.includes(s.id)} className={linked.includes(s.id) ? 'connected' : ''} onClick={() => {setLinked(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]); sound('click');}}><span>{s.id}</span><strong>{s.name}</strong><small>{linked.includes(s.id) ? '연결됨' : '토큰 연결'}</small></button>)}</div>
        <span className="identity-token"><Fingerprint size={28}/> ME-001</span>
      </div>
      <button className="primary full" disabled={linked.length !== 4} onClick={finish}>네 명은 한 사람의 기록이다 <ChevronRight size={17}/></button>
      <p className="quiet-note">신원 충돌과 토큰은 게임을 위한 허구적 설정입니다.</p>
    </div>;
    return <div className="order-puzzle">
      <div className="record-bank">{shuffled.map(i => cards[i]).filter(c => !order.includes(c.id)).map(card => <button key={card.id} draggable onDragStart={e => {e.dataTransfer.setData('text/plain', card.id);}} className="record-card" onClick={() => { update({ ...draft, order: [...order, card.id] }); sound('paper'); setFeedback(''); }}><span className="eyebrow">복원되지 않은 기록</span><strong>{card.title}</strong><small>{card.note}</small><span className="record-add">기록 추가 +</span></button>)}{order.length === cards.length && <p className="bank-empty"><CheckCircle2 size={22}/> 모든 기록을 배치했습니다.<br/>순서를 검증하세요.</p>}</div>
      <div className="timeline-desk" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (cards.some(c => c.id === id) && !order.includes(id)) update({...draft, order: [...order, id]});}}>
        <div className="desk-label"><span>기록 복원 타임라인</span><span>{order.length} / {cards.length}</span></div>
        {order.length === 0 && <div className="timeline-placeholder"><Fingerprint size={40} strokeWidth={1}/><p>자료를 순서대로 선택하거나<br/>이곳에 드래그하세요.</p></div>}
        {order.map((id, i) => { const card = cards.find(c => c.id === id); if (!card) return null; return <div key={id} className="timeline-row" draggable onDragStart={e => e.dataTransfer.setData('text/plain', id)} onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault();e.stopPropagation();const from = order.indexOf(e.dataTransfer.getData('text/plain'));if (from >= 0) update({...draft, order: moveItem(order, from, i)});}}><span className="timeline-index">{String(i+1).padStart(2,'0')}</span><div><strong>{card.title}</strong><small>{card.note}</small></div><div className="order-actions"><button aria-label={`${card.title} 위로`} disabled={i === 0} onClick={() => update({ ...draft, order: moveItem(order, i, i-1) })}><ArrowUp size={14}/></button><button aria-label={`${card.title} 아래로`} disabled={i === order.length - 1} onClick={() => update({ ...draft, order: moveItem(order, i, i+1) })}><ArrowDown size={14}/></button><button aria-label={`${card.title} 제거`} onClick={() => update({ ...draft, order: order.filter(x => x !== id) })}><X size={14}/></button></div></div>;})}
      </div>
      <PuzzleFooter feedback={feedback} onVerify={() => {if (!isOrdered(order, cards.map(c => c.id))) return fail(); if (chapter === 3) {setCollision(true);sound('warning');} else finish();}} label={chapter === 1 ? '출입국 기록 복원' : '타임라인 검증'} />
    </div>;
  }

  if (chapter === 4) return <div className="fact-puzzle">
    <div className="desk-label"><span>진로 전환 근거 자료</span><span>{selected.length} / 5 선택</span></div>
    <div className="fact-grid">{motives.map((card, i) => <button key={card.id} aria-pressed={selected.includes(card.id)} className={`fact-card ${selected.includes(card.id) ? 'selected' : ''}`} onClick={() => {update({...draft, selected: selected.includes(card.id) ? selected.filter(x => x !== card.id) : [...selected, card.id]}); sound('click'); setFeedback('');}}><span className="fact-top"><span className="eyebrow">STATEMENT 0{i + 1}</span><span className="checkbox">{selected.includes(card.id) && <Check size={13}/>}</span></span><strong>{card.title}</strong><small>{card.note}</small></button>)}</div>
    <PuzzleFooter feedback={feedback} onVerify={() => isFactSelection(selected, motives) ? finish() : fail()} label="진로 전환 보고서 확정" />
  </div>;

  return <div className="value-puzzle"><div className="value-evidence">{['피아노 · 영화 · 음악 · 산책', '과 학생회 활동', '외향적 · ESFJ', '남을 챙기는 성향', '상호적인 관계'].map(text => <span key={text}>{text}</span>)}</div><blockquote>“많은 것이 달라졌어도,<br/>내가 좋아하는 하루는 달라지지 않았다.”</blockquote><div className="value-options">{values.map(v => <button key={v.id} className={draft.value === v.id ? 'selected' : ''} aria-pressed={draft.value === v.id} onClick={() => {update({...draft, value: v.id});setFeedback('');sound('click');}}><span className="radio">{draft.value === v.id && <span/>}</span><div><strong>{v.title}</strong><small>{v.note}</small></div></button>)}</div><PuzzleFooter feedback={feedback} onVerify={() => draft.value === 'people' ? finish() : fail()} label="최종 신원 복원" /></div>;
}

function PuzzleFooter({ feedback, onVerify, label }: { feedback: string; onVerify: () => void; label: string }) {
  return <div className="puzzle-footer"><p role="status" className={feedback ? 'feedback' : 'quiet-note'}>{feedback || '모든 자료는 다시 선택하거나 순서를 바꿀 수 있습니다.'}</p><button className="primary" onClick={onVerify}>{label}<ChevronRight size={17}/></button></div>;
}
