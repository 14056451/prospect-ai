# ProspectAI - 프로젝트 TODO

## Phase 1: 프로젝트 초기화 및 스캐폴드 설정
- [x] 프로젝트 초기화 (webdev_init_project)
- [x] 디자인 문서 작성 (design.md)
- [x] 앱 로고 생성 및 설정
- [x] 앱 이름 및 브랜딩 업데이트 (app.config.ts)

## Phase 2: 앱 핵심 구조 및 데이터 모델 설계
- [x] 데이터 모델 정의 (고객, 상담, 메모, 통계)
- [x] 데이터베이스 스키마 설계 (Drizzle ORM)
- [x] 데이터베이스 마이그레이션 생성 및 적용
- [x] 데이터베이스 쿼리 헬퍼 함수 작성 (server/db.ts)
- [x] tRPC 라우터 구현 (고객, 메모, 통계, 구독 API)
- [x] 공유 타입 및 상수 정의 (shared/types.ts)

## Phase 3: 메인 화면 및 가망 고객 리스트 구현
- [x] 모든 텍스트 한글화 (로그인, 메뉴, 버튼, 라벨)
- [ ] 탭 네비게이션 설정 (홈, 고객, 대시보드, 설정)
- [ ] 메인 리스트 화면 구현
  - [ ] 고객 리스트 FlatList 구현
  - [ ] 상태 필터 탭 구현
  - [ ] 고객 아이템 카드 디자인
  - [ ] 다음 연락일 표시
  - [ ] 상태 배지 표시
- [ ] 고객 추가 모달 구현
  - [ ] 이름, 전화, 직업 입력 필드
  - [ ] 저장 기능
- [ ] 알림 아이콘 구현 (다음 연락일 고객 수)
- [ ] 로그인 스크린 구현 (기본 기능)

## Phase 4: 상담 상세 화면 및 상태 관리 구현
- [ ] 고객 상세 화면 구현
  - [ ] 고객 정보 표시 (이름, 전화, 직업, 회사)
  - [ ] 상태 드롭다운 (1차, 2차, 소비자, 사업자)
  - [ ] 다음 연락일 선택 (캘린더 피커)
  - [ ] 상담 일시 표시
  - [ ] 수정/삭제 버튼
- [ ] 메모 섹션 구현
  - [ ] 메모 리스트 표시
  - [ ] 메모 추가 버튼
  - [ ] 메모 상세/수정 화면
- [ ] 상담 메모 입력 화면 구현
  - [ ] 다중행 텍스트 입력 필드
  - [ ] 저장 버튼
  - [ ] AI 요약 생성 버튼 (프리미엄)

## Phase 5: AI 요약/메모 화면 및 통계 대시보드 구현
- [ ] AI 요약 결과 화면 구현 (프리미엄)
  - [ ] 요점 3줄 표시
  - [ ] 다음 액션 3개 표시
  - [ ] 저장 버튼
  - [ ] 다시 생성 버튼
- [ ] AI 요약 생성 API 통합
  - [ ] 서버 LLM 호출 (server/routers.ts)
  - [ ] 프롬프트 엔지니어링
  - [ ] 결과 파싱 및 저장
- [ ] 통계 대시보드 구현 (프리미엄)
  - [ ] 월별 상담 건수 그래프
  - [ ] 전환율 계산 및 표시
  - [ ] 메모 키워드 분석
  - [ ] 상담 상태별 분포 (파이 차트)

## Phase 6: 알림/캘린더 화면 및 프리미엄 기능 완성
- [ ] 알림 기능 구현
  - [ ] 다음 연락일 1일 전 알림
  - [ ] 다음 연락일 당일 알림
  - [ ] 앱 내 알림 표시
  - [ ] 푸시 알림 (선택사항)
- [ ] 캘린더 화면 구현
  - [ ] 월별 상담 일정 표시
  - [ ] 다음 연락일 표시
- [ ] 프리미엄 기능 제어
  - [ ] 무료 사용자 제한 (고객 50명, 메모 100개)
  - [ ] 프리미엄 기능 잠금 UI
  - [ ] 프리미엄 구독 화면 (선택사항)
- [ ] 설정 화면 구현
  - [ ] 앱 정보
  - [ ] 알림 설정
  - [ ] 다크 모드 토글
  - [ ] 데이터 내보내기 (CSV/Excel)

## Phase 7: 결과 전달
- [ ] 최종 테스트 및 버그 수정
- [ ] 체크포인트 생성
- [ ] 사용자에게 앱 전달

---

## 주요 기능별 우선순위

### MVP (필수)
1. 메인 리스트 화면 + 고객 추가
2. 고객 상세 화면 + 상태 관리
3. 상담 메모 입력 + 저장
4. 다음 연락일 자동 계산

### 프리미엄 (선택)
1. AI 요약 생성
2. 통계 대시보드
3. 알림 기능
4. 데이터 내보내기

---

## 데이터 모델 (초안)

### Customer (가망 고객)
- id: number (PK)
- userId: number (FK)
- name: string
- phone: string
- occupation: string
- company: string
- status: enum (1차상담, 2차, 소비자, 사업자)
- nextContactDate: date
- purchaseItem: string
- purchaseQuantity: number
- purchasePrice: number
- createdAt: timestamp
- updatedAt: timestamp

### ConsultationMemo (상담 메모)
- id: number (PK)
- customerId: number (FK)
- userId: number (FK)
- content: text
- aiSummary: text (nullable, 프리미엄)
- aiActions: text (nullable, 프리미엄)
- consultationDate: timestamp
- createdAt: timestamp
- updatedAt: timestamp

### Statistics (통계)
- id: number (PK)
- userId: number (FK)
- month: date
- consultationCount: number
- conversionRate: number
- topKeywords: text (JSON)
- createdAt: timestamp
- updatedAt: timestamp
