import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Eye, FileText, Fingerprint, FolderClosed, Grid2X2, HelpCircle, Lightbulb, LockKeyhole, Pause, Play, Radio, RotateCcw, Settings2, Shield, SkipForward, Volume2, VolumeX, Users } from 'lucide-react';
import { chapters, presentationTotal } from './data/chapters';
import { finalProfile, findings, suspects } from './data/story';
import { assets } from './data/assets';
import { useCase } from './hooks/useCase';
import { useAudio } from './hooks/useAudio';
import { EvidenceBoard } from './components/EvidenceBoard';
import { Modal } from './components/Modal';
import { Puzzle, type Draft } from './components/Puzzle';
import { Scene } from './components/Scene';

type Panel = 'none' | 'prologue' | 'puzzle' | 'settings' | 'help' | 'evidence' | 'jump' | 'reset' | 'suspect' | 'ending' | 'bonus';

export default function App() {
  const { state, setState, saveError } = useCase();
  const { play, start, status } = useAudio(state.sound, state.bgm, state.sfx, state.chapter);
  const [panel, setPanel] = useState<Panel>('none');
  const [inspected, setInspected] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [notice, setNotice] = useState('');
  const [solved, setSolved] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [introSkip, setIntroSkip] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(!assets.portrait);
  const [bonusFailed, setBonusFailed] = useState<boolean[]>(assets.couple.map(path=>!path));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chapter = chapters[state.chapter];
  const musicActive = state.sound && (status === 'playing' || status === 'loading');
  const enableMusic = () => { setState(s => ({...s, sound: true})); start(true); };
  const toggleMusic = () => { if (musicActive) setState(s => ({...s, sound: false})); else enableMusic(); };
  const audioMessage = !state.sound ? '사운드가 꺼져 있습니다.' : state.bgm === 0 ? 'BGM 음량이 0%입니다. 슬라이더를 올려주세요.' : status === 'playing' ? 'BGM 재생 중 · 드론 / 피아노 / 앰비언트' : status === 'loading' ? '배경음을 불러오는 중입니다.' : status === 'blocked' ? '브라우저가 재생을 막았습니다. 아래 BGM 재생 버튼을 눌러주세요.' : status === 'error' ? '배경음 재생에 실패했습니다. 아래 버튼으로 다시 시도하세요.' : '아래 BGM 재생 버튼이나 수사 시작을 누르면 음악이 시작됩니다.';
  const progress = Math.round(state.completed.length / chapters.length * 100);
  const close = () => setPanel('none');

  useEffect(() => {
    if (!state.presentation || !state.started || timerPaused || state.ended) return;
    const id = setInterval(() => setElapsed(t => t + 1), 1000); return () => clearInterval(id);
  }, [state.presentation, state.started, timerPaused, state.ended]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (text: string) => { setNotice(text); clearTimeout(timer.current); timer.current = setTimeout(() => setNotice(''), 3800); };
  const openPanel = (p: Panel) => { setPanel(p); play('paper'); };
  const openPuzzle = (index = state.chapter) => {
    setState(s => ({...s, chapter: index})); setHintLevel(0); setSolved(false); setPanel('puzzle'); play('paper');
  };
  const finish = () => {
    play(state.chapter === 5 ? 'closed' : 'stamp');
    setState(s => ({...s, completed: Array.from(new Set([...s.completed, s.chapter])).sort((a,b)=>a-b), ended: s.chapter === 5 || s.ended}));
    setSolved(true); notify('기록 복원 완료 · 증거 보드에 연결되었습니다.');
  };
  const nextChapter = () => {
    if (state.chapter === 5) { setPanel('ending'); return; }
    setState(s => ({...s, chapter: s.chapter + 1})); setHintLevel(0); setSolved(false); setPanel('puzzle'); play('paper');
  };
  const presentationNext = () => {
    if (!state.started) {start();setState(s => ({...s, started: true}));openPuzzle(0);return;}
    if (panel === 'puzzle' && solved) {nextChapter();return;}
    if (state.completed.includes(state.chapter)) {
      if (state.chapter === 5) setPanel('ending'); else openPuzzle(state.chapter + 1);
      return;
    }
    finish(); setPanel('puzzle');
  };
  const restartChapter = () => {
    setState(s => {const drafts = {...s.drafts};delete drafts[String(s.chapter)];return {...s, drafts};});
    setHintLevel(0);setSolved(false);setPanel('puzzle');play('click');
  };
  const reset = () => { setState(s => ({chapter:0,completed:[],started:false,presentation:s.presentation,sound:s.sound,bgm:s.bgm,sfx:s.sfx,drafts:{},ended:false}));setElapsed(0);setTimerPaused(false);setHintLevel(0);setSolved(false);setIntroSkip(false);close();notify('사건 파일을 초기화했습니다.'); };
  const time = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const draft = (state.drafts[String(state.chapter)] || {}) as Draft;

  return <div className="app-shell">
    <a className="skip-link" href="#main">본문으로 이동</a>
    <aside className="rail" aria-label="주 메뉴"><button className="brand-mark" aria-label="수사실 홈" onClick={close}>W<span>.</span></button><div className="rail-tools"><button className={`rail-button ${panel === 'none' ? 'active' : ''}`} aria-label="수사 보드" onClick={close}><Grid2X2 size={21}/><span>수사실</span></button><button className={`rail-button ${panel === 'evidence' ? 'active' : ''}`} aria-label="수집한 증거" onClick={() => openPanel('evidence')}><FolderClosed size={21}/><span>증거</span>{state.completed.length>0&&<b>{state.completed.length}</b>}</button><button className="rail-button" aria-label="게임 방법" onClick={() => openPanel('help')}><HelpCircle size={21}/><span>안내</span></button></div><div className="rail-bottom"><button className="rail-button" aria-label="사운드 및 설정" onClick={() => openPanel('settings')}><Settings2 size={20}/></button><span className="rail-line"/><span className="vertical-word">CLASSIFIED</span></div></aside>

    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><span>사건 기록실</span><ChevronRight size={12}/><strong>CASE #001</strong><span className="topbar-divider"/><span className="case-status"><span className="status-dot"/>{state.ended ? '수사 종결' : state.started ? '수사 진행 중' : '수사 대기 중'}</span></div><div className="header-controls"><button className={`presentation-toggle ${state.presentation ? 'enabled' : ''}`} aria-pressed={state.presentation} onClick={() => {setState(s=>({...s,presentation:!s.presentation}));play('click');}}><Play size={12}/><span>발표 모드</span><span className="switch"><i/></span></button><button className="sound-button" data-audio-control aria-label={musicActive ? '사운드 끄기' : '배경음 시작'} aria-pressed={musicActive} onClick={toggleMusic}>{state.sound ? <Volume2 size={17}/> : <VolumeX size={17}/>}<span>{!state.sound ? '사운드 OFF' : status === 'playing' ? 'BGM 재생 중' : status === 'loading' ? 'BGM 준비 중' : 'BGM 재생'}</span></button></div></header>
      <main id="main">
        <section className="case-intro"><div className="intro-kicker"><span className="red-line"/><span>기밀 사건 파일</span><span className="case-number">NO. 001</span></div><div className="intro-title-row"><div><h1>WANTED<span>:</span> ME<span className="title-period">.</span></h1><p className="subtitle">존재하지 않는 네 명의 용의자</p></div><div className="classified-stamp">TOP SECRET<span>AUTHORIZED PERSONNEL ONLY</span></div></div><div className="case-meta"><span><FileText size={13}/> 심리 스릴러 수사 게임</span><span><Clock3 size={13}/> 약 5–10분</span><span><Fingerprint size={13}/> 신원 미확인</span></div></section>

        <section className="investigation-section" aria-label="수사 브리핑과 증거 보드"><div className="briefing"><div className="section-label"><span className="eyebrow">CASE BRIEFING</span><span className="small-rule"/></div><h2>{state.ended ? <>하나의 삶.<br/><span>남아 있는 본질.</span></> : state.started ? <>기록은 연결된다.<br/><span>질문은 깊어진다.</span></> : <>네 개의 기록.<br/><span>하나의 정체.</span></>}</h2><p className="briefing-description">{state.ended ? '모든 기록이 한 사람으로 복원되었습니다. 그가 지나온 길과 변하지 않은 마음을 확인하세요.' : state.started ? chapter.brief : '신원 데이터베이스에서 비정상적인 기록 4건이 발견되었습니다. 서로 다른 삶처럼 보이는 이 기록들은, 이상하게도 하나의 신원을 가리킵니다.'}</p><div className="briefing-question"><span>YOUR MISSION</span><p>{state.started ? chapter.task : <>단서를 수집하고, 기록을 연결하세요.<br/>그가 누구인지 밝혀내는 건 당신입니다.</>}</p></div><button className="primary start-button" onClick={() => {start();if(state.ended){setPanel('ending');}else if(state.started){openPuzzle();}else{setIntroSkip(false);openPanel('prologue');}}}>{state.ended ? '복원된 신원 확인' : state.started ? '수사 계속하기' : '수사 시작'}<ArrowRight size={18}/></button><div className="warning-note"><Eye size={14}/><span>누군가 이 기록을 지켜보고 있습니다.</span></div><div className="briefing-bottom"><span className="signal-bars"><i/><i/><i/><i/><i/></span><span>SECURE CONNECTION ESTABLISHED</span></div></div><EvidenceBoard completed={state.completed} inspect={index => {setInspected(index);openPanel('suspect');}} started={state.started}/></section>

        <section className="chapter-section" aria-label="수사 경로"><div className="chapter-section-top"><h2>수사 경로 <span>INVESTIGATION PATH</span></h2><div className="overall-progress"><span>신원 복원</span><strong>{progress}%</strong><div><i style={{width:`${progress}%`}}/></div></div></div><div className="chapter-grid">{chapters.map((c,i)=>{const complete=state.completed.includes(i),available=i===0||state.completed.includes(i-1)||state.presentation;return <button key={c.id} className={`chapter-card ${complete?'complete':''} ${state.chapter===i?'current':''}`} disabled={!available} onClick={()=>{if(!state.started){setState(s=>({...s,started:true}));start();}openPuzzle(i);}}><span className="chapter-top"><span>{i===5?'FINAL CHAPTER':`CHAPTER 0${i+1}`}</span>{complete?<Check size={14}/>:available?<ArrowUpRight size={14}/>:<LockKeyhole size={12}/>}</span><h3>{c.title}</h3><span className="chapter-type">{c.label}</span><div className="chapter-bottom"><span>{complete?'복원 완료':state.chapter===i?'조사 가능':'기록 잠김'}</span><span>{String(i+1).padStart(2,'0')}</span></div></button>;})}</div></section>
      </main>
      <footer className="footer"><span><span className="status-dot"/> {saveError ? '저장 공간 접근 불가 · 현재 창에서 플레이 가능' : '진행 상황이 이 브라우저에 자동 저장됩니다.'}</span><span>이 게임의 사건 설정은 허구이며, 삶의 기록은 실제입니다.<span className="footer-case">W:M / 001</span></span></footer>
    </div>
    {state.presentation&&<div className="presentation-bar"><span className="presentation-label"><Radio size={15}/> PRESENTATION</span><button className="timer-button" onClick={()=>setTimerPaused(p=>!p)} aria-label={timerPaused?'발표 타이머 재개':'발표 타이머 일시정지'}>{timerPaused?<Play size={12}/>:<Pause size={12}/>} {time(elapsed)} <span>/ 04:30</span></button><span className="presentation-target">권장 {chapter.target}초 · 핵심 흐름 {time(presentationTotal)}</span><button onClick={()=>openPanel('jump')}><Grid2X2 size={14}/> 빠른 이동</button><button onClick={restartChapter}><RotateCcw size={14}/> 현재 챕터 재시작</button><button onClick={()=>{if(panel!=='puzzle')openPuzzle();setHintLevel(v=>Math.min(v+1,2));}}><Lightbulb size={14}/> 힌트</button><button className="presentation-next" onClick={presentationNext}>{panel==='puzzle'&&!solved&&!state.completed.includes(state.chapter)?'풀이 건너뛰기':'다음 챕터'}<SkipForward size={15}/></button></div>}
    <div className="toast" role="status" aria-live="polite">{notice&&<><Shield size={16}/>{notice}</>}</div>

    {panel==='prologue'&&<Modal title="신원 충돌이 감지되었습니다." label="CASE #001 — IDENTITY COLLISION" close={close}><div className={`prologue ${introSkip?'skip-animation':''}`}><div className="prologue-eye"><Fingerprint size={64} strokeWidth={1}/><span className="scanline"/></div><p className="prologue-text">신원 데이터베이스에서 비정상적인 기록 4건이 발견되었습니다.<br/><br/>서로 다른 네 명의 인물이 하나의 신원과 연결될 가능성이 있습니다.<br/><br/>누가 이 기록을 숨기고 있는지, 그리고 왜 이런 충돌이 발생했는지 조사하십시오.</p><span className="observer-text"><span className="status-dot"/> REMOTE OBSERVER DETECTED</span><p className="quiet-note">사건과 감시 경고는 게임 속 연출입니다.</p><div className="modal-actions"><button className="text-button" onClick={()=>setIntroSkip(true)}><SkipForward size={14}/> 연출 스킵</button><button className="primary" onClick={()=>{setState(s=>({...s,started:true}));openPuzzle(0);}}>조사 시작 <ArrowRight size={17}/></button></div></div></Modal>}

    {panel==='puzzle'&&<Modal title={chapter.title} label={`${state.chapter===5?'FINAL CHAPTER':`CHAPTER 0${state.chapter+1}`} / ${chapter.english}`} close={close} wide><div className="chapter-banner"><Scene index={chapter.scene} reference={assets.reference[chapter.scene+1]}/><div><span className="eyebrow">INVESTIGATION LOG</span><p>{chapter.brief}</p></div><span className="banner-number">0{state.chapter+1}</span></div><div className="puzzle-content" style={assets.reference[6] ? {backgroundImage:`linear-gradient(#121a22ed,#121a22ed),url("${assets.reference[6]}")`,backgroundSize:"cover"} : undefined}>{solved?<div className="result-panel"><span className={`result-stamp ${state.chapter===1?'passport-stamp':''}`}>{state.chapter===1?'BANGKOK → KOREA':state.chapter===5?'IDENTITY RESTORED':'EVIDENCE ACQUIRED'}</span><h3>{state.chapter===4?'다른 미래를 선택한 이유.':state.chapter===3?'네 명은, 한 사람이었다.':'기록이 복원되었습니다.'}</h3><p>{findings[state.chapter]}</p>{state.chapter===2&&<div className="employment-record"><Shield size={22}/><div><span className="eyebrow">EMPLOYMENT RECORD</span><strong>19살 · 한미약품 취업</strong><small>연구실을 지나, 첫 직장으로 이어진 기록.</small></div></div>}<div className="result-actions"><button className="secondary" onClick={close}>증거 보드로 <ArrowUpRight size={15}/></button><button className="primary" onClick={nextChapter}>{state.chapter===5?'최종 신원 공개':'다음 기록 조사'}<ArrowRight size={17}/></button></div></div>:<><div className="puzzle-instructions"><span><Fingerprint size={17}/>{chapter.task}</span><button className="hint-button" onClick={()=>{setHintLevel(v=>Math.min(v+1,2));play('click');}}><Lightbulb size={15}/> 힌트 {hintLevel}/2</button></div>{hintLevel>0&&<div className="hint-box" role="status"><Lightbulb size={16}/><p>{chapter.hints[hintLevel-1]}</p></div>}<Puzzle key={state.chapter} chapter={state.chapter} draft={draft} update={value=>setState(s=>({...s,drafts:{...s.drafts,[String(s.chapter)]:value}}))} finish={finish} sound={play}/></>}</div></Modal>}

    {panel==='suspect'&&<Modal title={`용의자 ${suspects[inspected].id} — ${suspects[inspected].name}`} label={`RESTRICTED / ${suspects[inspected].file}`} close={close}><div className="suspect-detail"><Scene index={suspects[inspected].scene} reference={assets.reference[inspected+1]}/><span className="suspect-detail-label">{suspects[inspected].alias}</span></div><div className="detail-copy"><span className="eyebrow">{state.completed.includes(suspects[inspected].unlock)?'RECORD RESTORED':'IDENTITY UNCONFIRMED'}</span><p>{state.completed.includes(suspects[inspected].unlock)?suspects[inspected].evidence:'이 기록의 신원은 아직 확인되지 않았습니다. 수사 경로를 따라 단서를 모으면 봉인이 해제됩니다.'}</p><div className="observer-text"><Eye size={13}/> 기록 열람됨 · UNKNOWN OBSERVER ACTIVE</div><p className="quiet-note">장면 이미지는 분위기를 위한 AI 생성 이미지입니다.</p><button className="secondary full" onClick={close}>수사 보드로 돌아가기</button></div></Modal>}

    {panel==='settings'&&<Modal title="수사 환경 설정" close={close}><div className="settings-content"><div className="setting-row"><div><strong>사운드</strong><p>음산한 드론과 피아노, 희미한 노이즈</p></div><button data-audio-control className={`switch-button ${state.sound?'on':''}`} aria-pressed={state.sound} onClick={()=>{setState(s=>({...s,sound:!s.sound}));if(!state.sound) start(true);}}>{state.sound?'ON':'OFF'}</button></div><p className="quiet-note" role="status" aria-live="polite">{audioMessage}</p><button className="secondary full" data-audio-control onClick={enableMusic}>{status === 'playing' ? 'BGM 재생 중' : 'BGM 재생 / 다시 시도'}<Volume2 size={15}/></button><label className="slider-label"><span>배경음 BGM <b>{Math.round(state.bgm*100)}%</b></span><input type="range" min="0" max="1" step="0.01" value={state.bgm} onChange={e=>{setState(s=>({...s,bgm:Number(e.target.value)}));start();}}/></label><label className="slider-label"><span>효과음 SFX <b>{Math.round(state.sfx*100)}%</b></span><input type="range" min="0" max="1" step="0.01" value={state.sfx} onChange={e=>setState(s=>({...s,sfx:Number(e.target.value)}))} onPointerUp={()=>play('stamp')}/></label><p className="quiet-note">사운드는 첫 상호작용 이후 재생됩니다. 48초 길이의 오리지널 앰비언트를 반복 재생하며, 효과음은 브라우저에서 합성합니다. 기본 음량은 30%입니다.</p><div className="settings-divider"/><div className="setting-row"><div><strong>발표 모드</strong><p>빠른 이동 · 두 단계 힌트 · 풀이 건너뛰기</p></div><button className={`switch-button ${state.presentation?'on':''}`} aria-pressed={state.presentation} onClick={()=>setState(s=>({...s,presentation:!s.presentation}))}>{state.presentation?'ON':'OFF'}</button></div><button className="danger-button full" onClick={()=>setPanel('reset')}><RotateCcw size={15}/> 발표 전, 모든 수사 기록 초기화</button></div></Modal>}

    {panel==='reset'&&<Modal title="사건을 처음부터 다시 조사할까요?" close={close}><div className="detail-copy"><p>이 브라우저에 저장된 퍼즐 답안과 획득 증거를 지웁니다. 발표 모드와 사운드 설정은 유지됩니다.</p><div className="modal-actions"><button className="secondary" onClick={close}>취소</button><button className="danger-button" onClick={reset}>모든 기록 초기화</button></div></div></Modal>}

    {panel==='help'&&<Modal title="수사관을 위한 안내" close={close}><div className="help-content">{[['01','단서를 직접 연결하세요.','카드를 눌러 선택한 뒤 분류 항목을 누르세요. 드래그 없이 모든 퍼즐을 풀 수 있습니다.'],['02','기록의 순서를 복원하세요.','타임라인은 기록을 선택해 추가하고 위·아래 화살표로 정렬합니다. 자료는 언제든 제거할 수 있습니다.'],['03','근거로 판단하세요.','틀려도 불이익은 없습니다. 힌트는 방향 안내와 구체적인 안내, 두 단계로 제공됩니다.'],['04','발표에서는 자유롭게 이동하세요.','발표 모드를 켜면 모든 장면에 빠르게 이동하고 풀이를 건너뛸 수 있습니다. 4분 30초 안의 핵심 진행을 지원합니다.']].map(([n,title,text])=><div key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}<p className="quiet-note">Tab으로 이동 · Enter 또는 Space로 선택 · Esc로 창 닫기<br/>감시 경고와 신원 데이터베이스 오류는 허구적 연출입니다. 실제 감시나 데이터 전송 기능은 없습니다.</p></div></Modal>}

    {panel==='evidence'&&<Modal title="수집한 증거" label={`EVIDENCE ARCHIVE / ${state.completed.length} RECORDS`} close={close}><div className="evidence-list" style={assets.reference[5] ? {backgroundImage:`linear-gradient(#121a22e8,#121a22ed),url("${assets.reference[5]}")`,backgroundSize:"cover"} : undefined}>{state.completed.length===0?<div className="empty-state"><FolderClosed size={44} strokeWidth={1}/><h3>아직 열리지 않은 사건 파일.</h3><p>첫 수사를 마치면 이곳에 증거가 연결됩니다.</p><button className="primary" onClick={()=>{setState(s=>({...s,started:true}));openPuzzle(0);}}>첫 기록 조사 <ArrowRight size={16}/></button></div>:state.completed.map(id=><div className="evidence-entry" key={id}><span>0{id+1}</span><div><h3>{chapters[id].title}</h3><p>{findings[id]}</p></div><Check size={17}/></div>)}</div></Modal>}

    {panel==='jump'&&<Modal title="빠른 이동" label="PRESENTATION / SCENE SELECT" close={close}><div className="jump-list">{chapters.map((c,i)=><button key={c.id} onClick={()=>{setState(s=>({...s,started:true,completed:Array.from(new Set([...s.completed,...Array.from({length:i},(_,j)=>j)])).sort((a,b)=>a-b)}));openPuzzle(i);}}><span>0{i+1}</span><div><strong>{c.title}</strong><small>{c.english}</small></div><ChevronRight size={16}/></button>)}</div><p className="jump-note">발표용 이동은 이전 챕터의 증거를 복원합니다. 현재 챕터의 퍼즐은 직접 풀거나 건너뛸 수 있습니다.</p></Modal>}

    {panel==='ending'&&<Modal title="수사 종결" label="CASE #001 / IDENTITY RESTORED" close={close} wide><div className="ending"><div className="ending-portrait">{!portraitFailed?<img src={assets.portrait} alt="복원된 인물의 프로필 사진" onError={()=>setPortraitFailed(true)}/>:<Scene index={3} reference={assets.reference[4]}/>}<span className="ending-scan"/><span className="ending-id">IDENTITY / ME-001</span><div className="ending-stamp">CASE<br/>CLOSED</div></div><div className="ending-copy"><span className="eyebrow">당신이 조사한 사람은</span><h3>{finalProfile.name}<span>{finalProfile.age}세</span></h3><p className="ending-school">{finalProfile.school}</p><h4>{finalProfile.message}</h4><p>{finalProfile.text}</p><div className="ending-tags"><span>ESFJ</span><span>과 학생회</span><span>피아노</span><span>영화 · 음악</span><span>산책</span><span>사람들과 함께</span></div><div className="ending-actions"><button className="secondary" onClick={()=>setPanel('bonus')}>보너스 기록 <ArrowUpRight size={14}/></button><button className="primary" onClick={close}>사건 파일 보관 <Check size={16}/></button></div><p className="quiet-note">게임 속 경고는 허구입니다. 여기 남은 삶의 조각들은 실제 기록입니다.</p></div></div></Modal>}

    {panel==='bonus'&&<Modal title="사건 파일 뒤의 일상" label="BONUS EVIDENCE / OPTIONAL" close={()=>setPanel('ending')}><div className="detail-copy"><p>판교에서 자취하며, 폴스타 2와 함께하는 일상. 피아노와 영화, 음악, 산책, 친구들. 과 학생회에서 만난 연인과의 관계도 이 삶의 일부입니다.</p><div className="bonus-gallery">{assets.couple.map((path,i)=><div key={`couple-${i}`}>{!bonusFailed[i]?<img src={path} alt={`얼굴 없는 선택적 커플 사진 ${i+1}`} onError={()=>setBonusFailed(prev=>{const next=[...prev];next[i]=true;return next;})}/>:<><Users size={26} strokeWidth={1}/><span>둘이 함께한 순간</span><small>선택적 사진 슬롯 0{i+1}</small></>}</div>)}</div><p className="quiet-note">개인 사진은 선택 사항입니다. 현재의 장면 이미지들은 실제 개인 사진이 아닙니다.</p><button className="secondary full" onClick={()=>setPanel('ending')}><ArrowLeft size={15}/> 복원된 신원으로</button></div></Modal>}
    <div className="global-grain" aria-hidden="true"/>
  </div>;
}



