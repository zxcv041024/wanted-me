import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanSave, isOrdered, isMatched, isFactSelection, moveItem } from '../src/data/rules.mjs';

test('timeline requires every record exactly once and in chronological order', () => {
  assert.equal(isOrdered(['b','a'], ['a','b']), false);
  assert.equal(isOrdered(['a'], ['a','b']), false);
  assert.equal(isOrdered(['a','b'], ['a','b']), true);
});
test('research matching checks meaning and rejects incomplete evidence', () => {
  const cards = [{id:'reuse',answer:'motive'},{id:'limit',answer:'limits'}];
  assert.equal(isMatched({reuse:'motive'}, cards),false);
  assert.equal(isMatched({reuse:'limits',limit:'motive'}, cards),false);
  assert.equal(isMatched({reuse:'motive',limit:'limits'}, cards),true);
});
test('fact report rejects unsupported speculation and missing facts', () => {
  const cards = [{id:'growth',fact:true},{id:'degree',fact:true},{id:'impulse',fact:false}];
  assert.equal(isFactSelection(['growth','impulse'],cards),false);
  assert.equal(isFactSelection(['growth'],cards),false);
  assert.equal(isFactSelection(['growth','degree','degree'],cards),false);
  assert.equal(isFactSelection(['degree','growth'],cards),true);
});
test('accessible reorder moves a record without mutating original', () => {
  const original=['a','b','c'];
  assert.deepEqual(moveItem(original,2,0),['c','a','b']);
  assert.deepEqual(original,['a','b','c']);
  assert.deepEqual(moveItem(original,0,-1),original);
});
test('invalid saves cannot unlock chapters or reveal identity', () => {
  assert.equal(cleanSave(null).chapter,0);
  const corrupt=cleanSave({chapter:99,completed:[0,3,5,900,'1'],ended:true,bgm:8,sfx:-1});
  assert.deepEqual(corrupt.completed,[0]); assert.equal(corrupt.chapter,1); assert.equal(corrupt.ended,false);
  assert.equal(corrupt.bgm,1);assert.equal(corrupt.sfx,0);
});
test('valid saves preserve completed investigation and presentation settings', () => {
  const saved=cleanSave({chapter:5,completed:[0,1,2,3,4,5],ended:true,started:true,presentation:true,sound:false,bgm:.25,sfx:.3,drafts:{'1':{order:['bangkok']}}});
  assert.equal(saved.ended,true);assert.equal(saved.presentation,true);assert.equal(saved.sound,false);
  assert.deepEqual(saved.drafts['1'],{order:['bangkok']});
});
test('corrupt draft data is filtered before components read it', () => {
  const result=cleanSave({drafts:{'0':{assignments:'invalid'},'1':{order:['bangkok','bangkok',null,'unknown']},'4':{selected:'degree'},'5':{value:'leaked'},'9':{order:['birth']}}});
  assert.deepEqual(result.drafts,{'0':{},'1':{order:['bangkok']},'4':{},'5':{}});
});
