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

## Phase 3: 로그인, 메인 리스트, 고객 상세 화면 구현
- [x] 모든 텍스트 한글화 (로그인, 메뉴, 버튼, 라벨)
- [x] 탭 네비게이션 설정 (홈, 고객, 대시보드, 설정)
- [x] 로그인 화면 구현 (Manus OAuth)
- [x] 고객 리스트 화면 구현
  - [x] 고객 리스트 FlatList 구현
  - [x] 상태 필터 탭 구현
  - [x] 고객 아이템 카드 디자인
  - [x] 다음 연락일 표시
  - [x] 상태 배지 표시
- [x] 고객 추가 모달 구현
  - [x] 이름, 전화, 직업 입력 필드
  - [x] 저장 기능
- [x] 고객 상세 화면 구현
  - [x] 고객 정보 표시
  - [x] 상담 메모 입력
  - [x] 상태 변경
- [x] 대시보드 화면 구현 (기본 통계)
- [x] 설정 화면 구현 (계정, 구독, 로그아웃)

## Phase 4: 웹 PWA 변환 및 자동 로그인 구현
- [x] PWA 설정 추가 (manifest.json, service worker)
- [x] 자동 로그인 구현 (AsyncStorage에 토큰 저장)
- [x] 오프라인 모드 지원
- [x] 설치 가능한 웹 앱 설정
- [ ] 고객 상세 화면 개선 완료
  - [x] 상태 드롭다운 (1차, 2차만 유지)
  - [x] 구매 내역 배너 추가
  - [x] 구매 내역 추가 모달
  - [x] 메모 입력 및 저장

## Phase 5: 구매 내역 통계, 사용기한 알림, AI 요약 기능 구현
- [x] 구매 내역 통계 기능
  - [x] 일별 구매 내역 요약
  - [x] 월별 구매 내역 요약
  - [x] 년간 구매 내역 요약
  - [x] 구매 내역 통계 화면 구현
- [x] 사용기한 알림 기능
  - [x] 다음 연락일 1일 전/당일 알림
  - [x] 앱 내 알림 표시
  - [x] 알림 목록 화면
- [x] AI 요약 기능 (프리미엄)
  - [x] 상담 메모 자동 요약 생성 화면
  - [x] 다음 액션 3개 자동 생성
  - [x] 요약 결과 저장 및 표시
  - [ ] 서버 LLM 호출 통합

## Phase 6: 최종 테스트 및 배포 준비
- [ ] 전체 기능 테스트
- [ ] 버그 수정
- [ ] 성능 최적화
- [ ] PWA 배포 준비
- [ ] 사용자 가이드 작성

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
