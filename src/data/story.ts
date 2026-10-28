export const suspects = [
  { id: 'A', name: '이방인', alias: 'THE TRAVELER', tag: '이동 기록', scene: 0, file: 'TR-003', evidence: '방콕에서 시작된 기록. 세 살까지 그곳에서 살다가 한국으로 이동했다.', unlock: 1 },
  { id: 'B', name: '연구자', alias: 'THE RESEARCHER', tag: '연구 기록', scene: 1, file: 'RS-019', evidence: '한국바이오마이스터고등학교 바이오제약과. 감피 탄닌 공동연구, 그리고 19살 한미약품 취업.', unlock: 2 },
  { id: 'C', name: '공군', alias: 'THE AIRMAN', tag: '복무 기록', scene: 2, file: 'AF-021', evidence: '21살 공군 입대. 군산의 미군 관련 부대에서 복무한 경험이 확인되었다.', unlock: 3 },
  { id: 'D', name: '개발자', alias: 'THE DEVELOPER', tag: '현재 기록', scene: 3, file: 'CS-023', evidence: '23살 가천대학교 컴퓨터공학과 입학. 과 학생회에서 사람들과 관계를 이어가고 있다.', unlock: 4 },
];

export const traces = [
  { id: 'piano', title: '피아노 악보', note: '반복해서 접힌 연습 페이지', icon: 'piano', answer: '일상' },
  { id: 'film', title: '영화 티켓', note: '일상의 작은 장면을 모으다', icon: 'film', answer: '일상' },
  { id: 'music', title: '헤드폰', note: '음악 감상 기록', icon: 'music', answer: '일상' },
  { id: 'walk', title: '산책 지도', note: '천천히 걷는 시간', icon: 'walk', answer: '일상' },
  { id: 'friends', title: '모임 메모', note: '친구들, 새로운 사람들', icon: 'people', answer: '일상' },
  { id: 'key', title: '자동차 키', note: '차종: POLESTAR 2', icon: 'key', answer: '일상' },
  { id: 'badge', title: '훼손된 사원증', note: '소속은 아직 읽을 수 없다', icon: 'badge', answer: '직업' },
  { id: 'redacted', title: '봉인된 기록', note: '내용을 확인할 수 없다', icon: 'file', answer: '불명' },
];

export const migration = [
  { id: 'bangkok', title: '방콕 출생', note: '첫 번째 입국 기록 이전의 시작점' },
  { id: 'three', title: '3살까지 방콕 거주', note: '어린 시절의 체류 기록' },
  { id: 'korea', title: '한국 이주', note: '국경을 넘은 다음 기록' },
  { id: 'pangyo', title: '현재 판교 생활권', note: '한국에서 자취하며 생활 중' },
];

export const research = [
  { id: 'reuse', title: '감피를 재활용한다', note: '버려지는 감 껍질을 연구 소재로 삼았다.', answer: '연구 동기' },
  { id: 'tannin', title: '탄닌 살균소독제 제조·평가', note: '감피 속 탄닌을 활용한 소독제의 가능성을 탐구했다.', answer: '연구 목표' },
  { id: 'trial', title: '제조와 평가의 시행착오', note: '실험 과정에서 시도하고 수정하는 과정을 거쳤다.', answer: '실험 과정' },
  { id: 'limit', title: '효능·안전성 평가의 한계', note: '완전한 입증이나 상용화 성공으로 해석할 수 없다.', answer: '관찰된 한계' },
];

export const timeline = [
  { id: 'birth', title: '방콕 출생', note: '시작점' },
  { id: 'move', title: '한국 이주', note: '방콕에서 생활한 뒤' },
  { id: 'school', title: '바이오 고등학교', note: '한국바이오마이스터고등학교 바이오제약과' },
  { id: 'project', title: '감피 탄닌 공동연구', note: '고등학교 재학 중' },
  { id: 'job', title: '한미약품 취업', note: '취업 기록' },
  { id: 'air', title: '공군 입대·복무', note: '군산의 미군 관련 부대 복무 경험' },
  { id: 'college', title: '가천대 컴퓨터공학과 입학', note: '대학 진학 기록' },
];

export const motives = [
  { id: 'degree', title: '4년제 대학 진학 희망', note: '더 넓은 배움의 기회를 원했다.', fact: true },
  { id: 'impulse', title: '그냥 충동적으로 바꿨다', note: '기록에서 확인되지 않은 추정', fact: false },
  { id: 'growth', title: '고졸 제약 생산 직군의 성장 한계', note: '현재 조건에서의 성장 가능성을 돌아봤다.', fact: true },
  { id: 'hate', title: '바이오를 완전히 싫어했다', note: '기록에서 확인되지 않은 추정', fact: false },
  { id: 'ecosystem', title: '판교 IT 생태계의 영향', note: '생활권에서 다른 진로의 가능성을 접했다.', fact: true },
  { id: 'choice', title: '컴퓨터공학 진학', note: '23살, 새로운 전공을 선택했다.', fact: true },
  { id: 'hero', title: '세상을 구하기 위해 IT를 택했다', note: '기록에서 확인되지 않은 추정', fact: false },
  { id: 'environment', title: '사무 환경과 높은 보수에 대한 기대', note: '무균 생산시설과 비교하며 원하는 생활 조건을 생각했다.', fact: true },
];

export const values = [
  { id: 'title', title: '한 번 정한 직업을 지키는 것', note: '직함이 바뀌면, 정체도 사라지는가?' },
  { id: 'people', title: '함께하는 사람들과 즐거운 하루', note: '새로운 사람을 만나고, 웃고 떠들고, 서로를 챙기는 시간.' },
  { id: 'perfect', title: '실패 없는 완벽한 결과', note: '기록 속에는 시행착오도 남아 있다.' },
];

export const finalProfile = {
  name: '박 정', age: 23, school: '가천대학교 컴퓨터공학과',
  message: '다른 길을 걸어도, 사람을 향하는 마음은 그대로.',
  text: '방콕에서 시작해 연구실과 제약회사, 공군을 거쳐 컴퓨터공학으로. 환경과 전공은 바뀌었지만, 사람들과 함께 웃고 서로를 챙기는 하루를 좋아하는 마음은 남아 있습니다.',
};

export const findings = [
  '피아노, 영화, 음악, 산책. 그리고 사람들과 함께하는 시간. 첫 단서는 일상에 있었다.',
  '방콕 출생 → 3살까지 거주 → 한국 이주 → 현재 판교 생활권. 이방인의 기록이 복원되었다.',
  '감피 탄닌 연구는 가능성을 탐구한 시도였다. 시행착오와 한계도 이 기록의 일부다. 이후 19살, 한미약품에 취업했다.',
  '이방인, 연구자, 공군, 개발자. 네 명은 서로 다른 사람이 아니라 한 사람의 삶을 나눈 기록이다.',
  '그는 과거를 부정한 것이 아니라, 자신이 원하는 미래 조건을 다시 선택했다.',
  '전공도, 직장도, 환경도 달라졌다. 끝까지 남은 것은 관계를 소중히 여기는 태도였다.',
];
