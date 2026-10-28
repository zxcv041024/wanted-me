import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';

// Component tests run in Node. No browser, HTTP request, or UI automation is used.
const require = createRequire(import.meta.url);
const fromVite = createRequire(require.resolve('vite'));
const { build } = fromVite('esbuild');
let App;
let renderer;
const storage = new Map();
const original = {};
before(async () => {
  for (const key of ['document','localStorage','IS_REACT_ACT_ENVIRONMENT']) original[key] = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, 'document', {configurable:true,value:{body:{style:{overflow:''}},activeElement:null,hidden:false,addEventListener(){},removeEventListener(){}}});
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)}});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const result = await build({entryPoints:['src/App.tsx'],bundle:true,write:false,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react-test-renderer','lucide-react'],define:{'import.meta.env.BASE_URL':JSON.stringify('./')},logLevel:'silent'});
  const dir = resolve('node_modules/.cache/wanted-me-tests');mkdirSync(dir,{recursive:true});
  const file=resolve(dir,'App.mjs');writeFileSync(file,result.outputFiles[0].text);
  App=(await import(pathToFileURL(file).href)).default;
});
after(async()=>{
  if(renderer) await act(async()=>renderer.unmount());
  for(const key of Object.keys(original)){if(original[key])Object.defineProperty(globalThis,key,original[key]);else delete globalThis[key];}
});
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : (node.children||[]).map(text).join('');
const allText=()=>text(renderer.root);
const buttons=()=>renderer.root.findAllByType('button');
async function mount(){await act(async()=>{renderer=create(React.createElement(App));});}
async function click(label){const target=buttons().find(button=>text(button).trim()===label||button.props['aria-label']===label);assert.ok(target,`button exists: ${label}`);assert.notEqual(target.props.disabled,true,`button enabled: ${label}`);await act(async()=>target.props.onClick());}
async function clickCard(cls,title){const target=buttons().find(button=>button.props.className?.split(' ').includes(cls)&&text(button).includes(title));assert.ok(target,`${cls}: ${title}`);await act(async()=>target.props.onClick());}
const saved=()=>JSON.parse(storage.get('wanted-me-case001-v1'));

test('complete investigation: five puzzles, collision, false claims, final identity, bonus',async()=>{
  await mount();
  assert.equal(allText().includes('박 정'),false,'identity hidden before ending');
  assert.equal(buttons().find(b=>text(b).includes('CHAPTER 02')).props.disabled,true,'later chapters locked');
  await click('수사 시작');assert.match(allText(),/신원 충돌이 감지/);
  await click('연출 스킵');await click('조사 시작');
  await click('분류 결과 확인');assert.match(allText(),/근거가 부족/);
  await clickCard('clue-card','피아노 악보');await clickCard('category-slot','직업');
  for(const title of ['피아노 악보','영화 티켓','헤드폰','산책 지도','모임 메모','자동차 키']){await clickCard('clue-card',title);await clickCard('category-slot','일상');}
  await clickCard('clue-card','훼손된 사원증');await clickCard('category-slot','직업');
  await clickCard('clue-card','봉인된 기록');await clickCard('category-slot','불명');
  await click('분류 결과 확인');assert.deepEqual(saved().completed,[0]);
  await click('다음 기록 조사');
  for(const title of ['방콕 출생','3살까지 방콕 거주','한국 이주','현재 판교 생활권'])await clickCard('record-card',title);
  await click('방콕 출생 아래로');await click('출입국 기록 복원');assert.match(allText(),/근거가 부족/);
  await click('방콕 출생 위로');await click('출입국 기록 복원');assert.match(allText(),/BANGKOK → KOREA/);
  await click('다음 기록 조사');
  for(const [title,category] of [['감피를 재활용한다','연구 동기'],['탄닌 살균소독제 제조·평가','연구 목표'],['제조와 평가의 시행착오','실험 과정'],['효능·안전성 평가의 한계','관찰된 한계']]){await clickCard('clue-card',title);await clickCard('category-slot',category);}
  await click('연구 기록 복원');assert.match(allText(),/19살 · 한미약품 취업/);assert.match(allText(),/시행착오와 한계/);
  await click('다음 기록 조사');
  for(const title of ['방콕 출생','한국 이주','바이오 고등학교','감피 탄닌 공동연구','한미약품 취업','공군 입대·복무','가천대 컴퓨터공학과 입학'])await clickCard('record-card',title);
  await click('타임라인 검증');assert.match(allText(),/동일한 신원 토큰/);
  assert.equal(buttons().find(b=>text(b).includes('네 명은 한 사람의 기록이다')).props.disabled,true);
  for(const title of ['이방인','연구자','공군','개발자']){const target=buttons().find(b=>b.parent?.props.className==='identity-cards'&&text(b).includes(title));assert.ok(target);await act(async()=>target.props.onClick());}
  await click('네 명은 한 사람의 기록이다');assert.deepEqual(saved().completed,[0,1,2,3]);
  await click('다음 기록 조사');
  await clickCard('fact-card','그냥 충동적으로 바꿨다');await click('진로 전환 보고서 확정');assert.match(allText(),/근거가 부족/);await clickCard('fact-card','그냥 충동적으로 바꿨다');
  for(const title of ['4년제 대학 진학 희망','고졸 제약 생산 직군의 성장 한계','판교 IT 생태계의 영향','컴퓨터공학 진학','사무 환경과 높은 보수에 대한 기대'])await clickCard('fact-card',title);
  await click('진로 전환 보고서 확정');assert.match(allText(),/과거를 부정한 것이 아니라/);
  await click('다음 기록 조사');assert.equal(allText().includes('박 정'),false);
  const valueButton=buttons().find(b=>text(b).includes('함께하는 사람들과 즐거운 하루'));assert.ok(valueButton);await act(async()=>valueButton.props.onClick());
  await click('최종 신원 복원');await click('최종 신원 공개');
  assert.match(allText(),/박 정/);assert.match(allText(),/23세/);assert.match(allText(),/CASECLOSED/);assert.equal(saved().ended,true);
  await click('보너스 기록');assert.match(allText(),/과 학생회에서 만난 연인/);assert.match(allText(),/선택적 사진 슬롯/);
  await click('복원된 신원으로');await click('사건 파일 보관');
  assert.match(allText(),/100%/);
});

test('reload, audio settings, presentation jump, two-stage hint, and confirmed reset',async()=>{
  await act(async()=>renderer.unmount());renderer=null;await mount();
  assert.match(allText(),/복원된 신원 확인/,'ending persists across reload');
  await click('사운드 및 설정');
  const ranges=renderer.root.findAllByType('input').filter(n=>n.props.type==='range');
  await act(async()=>{ranges[0].props.onChange({target:{value:'0.25'}});ranges[1].props.onChange({target:{value:'0.42'}});});
  assert.equal(saved().bgm,.25);assert.equal(saved().sfx,.42);
  const soundToggle=buttons().find(b=>b.props.className?.includes('switch-button'));await act(async()=>soundToggle.props.onClick());assert.equal(saved().sound,false);
  await click('발표 전, 모든 수사 기록 초기화');assert.match(allText(),/저장된 퍼즐 답안/);await click('모든 기록 초기화');
  assert.equal(saved().started,false);assert.deepEqual(saved().completed,[]);assert.equal(saved().bgm,.25);
  await click('발표 모드');await click('빠른 이동');
  const jump=buttons().find(b=>b.parent?.props.className==='jump-list'&&text(b).includes('연구소의 의문'));await act(async()=>jump.props.onClick());
  assert.deepEqual(saved().completed,[0,1]);assert.equal(saved().chapter,2);
  await click('힌트 0/2');assert.match(allText(),/무엇을 하려 했는지/);
  await click('힌트 1/2');assert.match(allText(),/감피 재활용=동기/);
  await click('현재 챕터 재시작');assert.equal(saved().drafts['2'],undefined);
  await click('풀이 건너뛰기');assert.deepEqual(saved().completed,[0,1,2]);assert.match(allText(),/EVIDENCE ACQUIRED/);
  await click('다음 챕터');assert.equal(saved().chapter,3);
});

