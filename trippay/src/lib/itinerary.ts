import type { CategoryId, Destination, ItineraryDay } from "./types";

interface Slot {
  time: string;
  title: string;
  place: string;
  category: CategoryId;
  cost: number;
  note?: string;
  koreanReview?: string;
  /** 지도 표시용 좌표. 장소·건물 수준의 근사값이다 */
  lat?: number;
  lng?: number;
}

/**
 * 여행지별 3박 4일 대표 코스. 일차별 배열이고, 여행이 더 길면 순환해서 채운다.
 * 금액은 1인 기준 원화 환산값이며 "개인차"로 적힌 항목은 0으로 두고 note에 남긴다.
 * 좌표는 주소를 옮긴 근사값이라 동선의 모양을 보는 용도다.
 */
const LIBRARY: Record<string, Slot[][]> = {
  osaka: [
    [
      { time: "12:00", title: "하루카 열차로 우메다 이동", place: "간사이공항역 → JR 오사카역", category: "transport", cost: 20700, lat: 34.7025, lng: 135.4959, koreanReview: "공항에서 우메다까지 환승 없이 45분 만에 갈 수 있어 편리해요" },
      { time: "13:30", title: "숙소 체크인", place: "호텔 비스키오 오사카", category: "travel", cost: 0, lat: 34.702, lng: 135.4985, note: "1박 약 12,000엔 · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "오사카역 도보 5분, 주변 편의점·드럭스토어 접근성이 좋아요" },
      { time: "14:00", title: "점심: 하나다코 타코야키", place: "9-26 Kakudacho, Kita Ward", category: "food", cost: 7500, lat: 34.7035, lng: 135.5, koreanReview: "파가 듬뿍 올라간 네기마요 타코야키, 서서 먹는 감성이 제대로예요" },
      { time: "15:30", title: "한큐백화점 & HEP FIVE 관람차", place: "8-7 Kakudacho, Kita Ward", category: "shopping", cost: 5700, lat: 34.7045, lng: 135.5005, note: "관람차 600엔 · 쇼핑비는 개인차예요", koreanReview: "빨간 관람차에서 우메다 전경을 볼 수 있어요" },
      { time: "18:30", title: "저녁: 키타신치 야키니쿠", place: "Sonezaki Shinchi, Kita Ward", category: "food", cost: 47100, lat: 34.6975, lng: 135.496, koreanReview: "고급스러운 야키니쿠를 우메다 근처에서 분위기 있게 즐길 수 있어요" },
      { time: "20:30", title: "우메다 스카이빌딩 공중정원", place: "1-1-88 Oyodonaka, Kita Ward", category: "culture", cost: 14100, lat: 34.7053, lng: 135.4903, koreanReview: "360도 야경 스팟, 바람 쐬며 오사카 야경 보기에 완벽해요" },
    ],
    [
      { time: "09:00", title: "아침: 카페 델라세라", place: "우메다역 지하상가", category: "cafe", cost: 6600, lat: 34.702, lng: 135.497, koreanReview: "모닝 세트 가성비가 좋아 토스트와 커피로 아침 열기 좋아요" },
      { time: "10:30", title: "오사카성 천수각 & 공원", place: "1-1 Osakajo, Chuo Ward", category: "culture", cost: 5700, lat: 34.6873, lng: 135.5259, koreanReview: "오사카 필수 코스, 성 주변 산책과 랜드마크 사진 남기기 좋아요" },
      { time: "13:00", title: "점심: 덴푸라 마키노 우메다점", place: "1-1-3 Shibata, Kita Ward", category: "food", cost: 17000, lat: 34.7015, lng: 135.498, koreanReview: "눈앞에서 튀겨주는 바삭한 텐동 맛집, 오픈런을 추천해요" },
      { time: "15:00", title: "그랑 프론트 오사카 & 루쿠아", place: "3-1 Ofukacho, Kita Ward", category: "shopping", cost: 0, lat: 34.7045, lng: 135.494, note: "쇼핑비는 개인차예요", koreanReview: "대형 쇼핑몰이라 잡화·의류·캐릭터 숍까지 구경거리가 많아요" },
      { time: "18:30", title: "저녁: 아부리야 한큐우메다점", place: "1-1-3 Shibata, Kita Ward", category: "food", cost: 47100, lat: 34.7018, lng: 135.4975, koreanReview: "국내산 소고기 야키니쿠 무한리필, 고기 질이 좋아요" },
      { time: "21:00", title: "우메다 돈키호테", place: "4-16 Doyama-cho, Kita Ward", category: "shopping", cost: 0, lat: 34.7045, lng: 135.502, note: "쇼핑비는 개인차예요", koreanReview: "24시간 운영이라 밤에 느긋하게 쇼핑 리스트를 채우기 좋아요" },
    ],
    [
      { time: "09:00", title: "아침: 우메다 베이커리 카페", place: "우메다 지하상가", category: "cafe", cost: 7500, lat: 34.7025, lng: 135.4975, koreanReview: "체크아웃 전 갓 구운 빵과 커피로 아침을 해결할 수 있어요" },
      { time: "10:30", title: "난바 이동 & 체크인", place: "소테츠 그랜드 프레사 오사카 난바", category: "travel", cost: 0, lat: 34.666, lng: 135.5065, note: "1박 약 11,000엔 · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "도톤보리·쿠로몬 시장 바로 앞이라 위치가 최고예요" },
      { time: "11:30", title: "쿠로몬 시장 탐방", place: "2-4-1 Nipponbashi, Chuo Ward", category: "food", cost: 12000, lat: 34.665, lng: 135.5065, koreanReview: "해산물·꼬치구이 등 거리 음식을 즐길 수 있는 오사카의 부엌이에요" },
      { time: "13:00", title: "점심: 스시토후지", place: "Namba area, Chuo Ward", category: "food", cost: 23500, lat: 34.665, lng: 135.501, koreanReview: "셰프가 직접 쥐어주는 가성비 훌륭한 스시 맛집이에요" },
      { time: "15:00", title: "난바 파크스 & 신사이바시스지", place: "2-10-70 Nanbanaka, Naniwa Ward", category: "shopping", cost: 0, lat: 34.6595, lng: 135.502, note: "쇼핑비는 개인차예요", koreanReview: "쇼핑가와 파크스 정원이 예뻐 사진 찍고 쇼핑하기 좋아요" },
      { time: "18:30", title: "저녁: 와규 야키니쿠 하나미치", place: "Dotonbori, Chuo Ward", category: "food", cost: 51800, lat: 34.669, lng: 135.502, koreanReview: "도톤보리 근처 와규 구이 맛집, 입에서 녹는 고기 맛이 예술이에요" },
      { time: "20:30", title: "도톤보리 밤거리 & 글리코상", place: "1 Chome Dotonbori, Chuo Ward", category: "culture", cost: 0, lat: 34.6687, lng: 135.5013, koreanReview: "오사카 인증샷 필수 코스, 밤 네온사인이 매력적이에요" },
    ],
    [
      { time: "08:30", title: "아침: 이치란 라멘 도톤보리점", place: "7-18 Souemoncho, Chuo Ward", category: "food", cost: 10400, lat: 34.67, lng: 135.502, koreanReview: "아침 일찍 가면 대기 없이 돈코츠 라멘으로 해장할 수 있어요" },
      { time: "10:00", title: "난바 야사카 신사 산책", place: "2-9-19 Motomachi, Naniwa Ward", category: "culture", cost: 0, lat: 34.662, lng: 135.496, koreanReview: "사자머리 모양의 독특한 신사, 공항 가기 전 가볍게 둘러보기 좋아요" },
      { time: "11:00", title: "체크아웃 & 텐노지 이동", place: "난바역 → 텐노지역", category: "transport", cost: 1800, lat: 34.6465, lng: 135.5133, koreanReview: "난바에서 텐노지역으로 이동해 하루카 탑승을 준비해요" },
      { time: "11:50", title: "하루카 타고 공항 이동", place: "JR 텐노지역 → 간사이공항", category: "transport", cost: 17000, lat: 34.4342, lng: 135.2328, koreanReview: "텐노지에서 하루카를 타면 공항까지 약 35분이에요" },
    ],
  ],

  kyoto: [
    [
      { time: "12:00", title: "하루카 특급으로 교토 이동", place: "간사이공항 → 교토역", category: "transport", cost: 20700, lat: 34.9858, lng: 135.7588, koreanReview: "간사이 공항에서 교토까지 하루카로 75분 만에 도착해요" },
      { time: "14:00", title: "숙소 체크인", place: "소테츠 프레사 인 교토 가와라마치", category: "travel", cost: 0, lat: 35.004, lng: 135.769, note: "1박 약 10,000엔 · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "가와라마치역 도보 3분, 주변 맛집 접근성이 좋아요" },
      { time: "14:30", title: "점심: 혼케 폰타 장어덮밥", place: "폰토초 / 가와라마치", category: "food", cost: 33000, lat: 35.0075, lng: 135.771, koreanReview: "겉은 바삭 속은 부드러운 정통 교토식 장어덮밥이에요" },
      { time: "16:00", title: "폰토초 골목 & 카모강 산책", place: "Pontocho Alley, Nakagyo Ward", category: "culture", cost: 0, lat: 35.006, lng: 135.7715, koreanReview: "붉은 등불 골목과 카모강 변에서 교토 특유의 감성을 느낄 수 있어요" },
      { time: "18:30", title: "저녁: 가츠쿠라 삼조 본점", place: "Sanjo-dori, Nakagyo Ward", category: "food", cost: 23500, lat: 35.0085, lng: 135.769, koreanReview: "두툼한 돈카츠와 직접 갈아 만드는 참깨 소스가 별미예요" },
      { time: "20:00", title: "야사카 신사 야경", place: "625 Gionmachi Kitagawa, Higashiyama", category: "culture", cost: 0, lat: 35.0036, lng: 135.7785, koreanReview: "라이트업된 등불이 장관이고 밤 산책하기 안전해요" },
    ],
    [
      { time: "08:30", title: "아침: 이노다 커피 본점", place: "Doshicho, Nakagyo Ward", category: "cafe", cost: 11300, lat: 35.009, lng: 135.762, koreanReview: "교토 3대 레트로 다방, 아라비아의 진주 커피와 드럼 샌드위치를 추천해요" },
      { time: "10:00", title: "청수사 & 산넨자카·닌넨자카", place: "1-294 Kiyomizu, Higashiyama Ward", category: "culture", cost: 3800, lat: 34.9949, lng: 135.785, koreanReview: "고풍스러운 목조 무대 전경과 아기자기한 상점가 구경이 재밌어요" },
      { time: "13:00", title: "점심: 멘야 이노이치", place: "Shimogyo Ward, Kyoto", category: "food", cost: 14100, lat: 34.9975, lng: 135.7625, koreanReview: "미슐랭 빕구르망 소바·라멘 맛집, 깊은 다시 국물이 인상적이에요" },
      { time: "15:00", title: "후시미 이나리 신사", place: "68 Yabunouchicho, Fushimi Ward", category: "culture", cost: 0, lat: 34.9671, lng: 135.7727, koreanReview: "끝없이 펼쳐진 주황색 센본 토리이 터널이 교토 대표 명소예요" },
      { time: "18:30", title: "저녁: 이즈우 고등어 봉초밥", place: "Gionmachi Kitagawa, Higashiyama", category: "food", cost: 33000, lat: 35.0038, lng: 135.777, koreanReview: "200년 전통 사바스시 맛집, 교토 전통의 풍미를 제대로 느낄 수 있어요" },
    ],
    [
      { time: "08:30", title: "아침: % 아라비카 교토", place: "Sagatenryuji, Ukyo Ward", category: "cafe", cost: 6600, lat: 35.013, lng: 135.677, koreanReview: "도게츠교와 강을 보며 마시는 라떼, 부드러운 맛이 좋아요" },
      { time: "09:30", title: "아라시야마 치쿠린 & 텐류지", place: "Sagaogurayama, Ukyo Ward", category: "culture", cost: 4700, lat: 35.017, lng: 135.672, koreanReview: "울창한 대나무 숲길과 세계유산 텐류지 정원이 평온해요" },
      { time: "13:00", title: "점심: 아라시야마 요시무라", place: "Sagatenryuji, Ukyo Ward", category: "food", cost: 23500, lat: 35.013, lng: 135.6785, koreanReview: "도게츠교 강변 뷰를 보며 즐기는 메밀소바와 튀김 정식이에요" },
      { time: "15:30", title: "금각사 (킨카쿠지)", place: "1 Kinkakujicho, Kita Ward", category: "culture", cost: 4700, lat: 35.0394, lng: 135.7292, koreanReview: "연못에 비친 금박 사찰의 반사 뷰가 완벽한 포토존이에요" },
      { time: "18:30", title: "저녁: 동양정 본점", place: "Kita Ward, Kyoto", category: "food", cost: 28300, lat: 35.04, lng: 135.748, koreanReview: "함박스테이크와 토마토 샐러드가 유명한 100년 전통 맛집이에요" },
    ],
    [
      { time: "08:30", title: "아침: 스마트 커피", place: "Teramachi-dori, Nakagyo Ward", category: "cafe", cost: 10400, lat: 35.01, lng: 135.767, koreanReview: "폭신한 프렌치토스트와 핫케이크가 대표 메뉴인 레트로 카페예요" },
      { time: "10:00", title: "니조성", place: "541 Nijojocho, Nakagyo Ward", category: "culture", cost: 7500, lat: 35.0142, lng: 135.7481, koreanReview: "휘파람새 복도 소리와 화려한 주거 공간에서 일본 성채를 경험할 수 있어요" },
      { time: "12:00", title: "교토역 이세탄 기념품 쇼핑", place: "Higashishiokoji, Shimogyo Ward", category: "shopping", cost: 0, lat: 34.9855, lng: 135.759, note: "쇼핑비는 개인차예요", koreanReview: "교토 마차 과자, 야츠하시 떡 등 대표 기념품을 살 수 있어요" },
      { time: "13:30", title: "하루카 타고 공항 이동", place: "교토역 → 간사이공항", category: "transport", cost: 20700, lat: 34.4342, lng: 135.2328, koreanReview: "하루카로 간사이 공항까지 이동해 여유 있게 출국해요" },
    ],
  ],

  danang: [
    [
      { time: "12:00", title: "그랩 택시로 시내 이동", place: "다낭 국제공항 → 미케비치", category: "transport", cost: 6400, lat: 16.0439, lng: 108.1994, koreanReview: "공항에서 미케비치까지 그랩으로 15분이면 도착해요" },
      { time: "13:00", title: "숙소 체크인", place: "살말리아 부티크 호텔 & 스파", category: "travel", cost: 0, lat: 16.053, lng: 108.244, note: "1박 약 60,000원~ · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "미케비치 도보 3분, 감성적인 수영장과 깔끔한 객실이 좋아요" },
      { time: "13:30", title: "점심: 포홍 쌀국수", place: "118 Hùng Vương, Hải Châu", category: "food", cost: 4300, lat: 16.068, lng: 108.218, koreanReview: "깊은 국물의 쌀국수 맛집, 튀긴 빵을 국물에 적셔 먹으면 일품이에요" },
      { time: "15:00", title: "미케비치 산책 & 해변 카페", place: "Vo Nguyen Giap St, Son Tra", category: "cafe", cost: 2700, lat: 16.057, lng: 108.247, koreanReview: "세계 6대 해변다운 넓은 백사장, 해변가 야외 카페 뷰가 최고예요" },
      { time: "18:30", title: "저녁: 목 해산물 식당", place: "26 Tô Hiến Thành, Phước Mỹ", category: "food", cost: 18700, lat: 16.0525, lng: 108.242, koreanReview: "칠리새우와 치즈가리비 구이가 인기고 에어컨 존이 있어 쾌적해요" },
      { time: "20:30", title: "손트라 야시장 & 용다리 불쇼", place: "Lý Nam Đế, An Hải Tây, Sơn Trà", category: "culture", cost: 5300, lat: 16.0625, lng: 108.229, koreanReview: "주말 밤 9시 용다리 불쇼를 본 뒤 야시장에서 기념품을 사기 좋아요" },
    ],
    [
      { time: "08:30", title: "아침: 반미프엉 / 아이러브반미", place: "미케비치 근처 반미 전문점", category: "food", cost: 2100, lat: 16.068, lng: 108.22, koreanReview: "바삭한 바게트와 고기, 소스의 조화로 아침 한 끼 해결하기 좋아요" },
      { time: "10:00", title: "바나힐 & 골든브릿지", place: "Hòa Phú, Hòa Vang, Da Nang", category: "activity", cost: 48000, lat: 15.995, lng: 107.996, koreanReview: "손바닥 모양 골든 브릿지와 프랑스 마을, 알파인 루지까지 즐길 거리가 많아요" },
      { time: "12:30", title: "점심: 바나힐 뷔페", place: "Ba Na Hills 내 식당가", category: "food", cost: 18700, lat: 15.9955, lng: 107.9965, koreanReview: "세계 요리와 베트남 현지식을 케이블카 전경과 함께 즐길 수 있어요" },
      { time: "16:30", title: "스파 & 1일 1마사지", place: "라스파 / 아지트 스파 등 시내 주요 샵", category: "beauty", cost: 21300, lat: 16.06, lng: 108.23, koreanReview: "픽업 서비스와 함께 지친 발과 몸을 완벽히 힐링할 수 있어요" },
      { time: "18:30", title: "저녁: 마담란", place: "4 Bình Minh 1, Hải Châu", category: "food", cost: 13300, lat: 16.077, lng: 108.224, koreanReview: "반쎄오·분짜·스프링롤이 정갈한 베트남 고급 가성비 레스토랑이에요" },
    ],
    [
      { time: "09:00", title: "아침: 콩카페 1호점", place: "98B Bạch Đằng, Hải Châu", category: "cafe", cost: 3200, lat: 16.07, lng: 108.2245, koreanReview: "코코넛 스무디 커피 원조, 테라스석에서 한강 뷰를 볼 수 있어요" },
      { time: "10:00", title: "핑크성당 & 한시장 쇼핑", place: "156 Trần Phú, Đà Nẵng", category: "shopping", cost: 0, lat: 16.067, lng: 108.2225, note: "쇼핑비는 개인차예요", koreanReview: "핑크성당 사진을 찍고 한시장에서 아오자이 맞춤과 망고 쇼핑을 해요" },
      { time: "13:00", title: "점심: 안방비치 덱하우스", place: "An Bang Beach, Hoi An", category: "food", cost: 16000, lat: 15.911, lng: 108.332, koreanReview: "바다 바로 앞 감성 휴양지 느낌, 버거와 해산물 요리를 추천해요" },
      { time: "15:00", title: "호이안 올드타운 산책", place: "Minh An, Hội An, Quảng Nam", category: "culture", cost: 6400, lat: 15.8801, lng: 108.326, koreanReview: "유네스코 세계문화유산 노란 건물 골목길과 아기자기한 카페들이 있어요" },
      { time: "18:30", title: "저녁: 모닝글로리", place: "106 Nguyễn Thái Học, Hoi An", category: "food", cost: 10700, lat: 15.877, lng: 108.327, koreanReview: "화이트로즈·까오라우·완탕 등 호이안 3대 전통 음식을 맛볼 수 있어요" },
      { time: "20:30", title: "호이안 야시장 & 소원배", place: "Nguyễn Hoàng, Minh An, Hội An", category: "culture", cost: 8000, lat: 15.877, lng: 108.3245, koreanReview: "투본강에 소원 등불을 띄우고 등불 야시장에서 사진을 남기기 좋아요" },
    ],
    [
      { time: "08:30", title: "아침: 냐베트남 해장 쌀국수", place: "미케비치 / 시내 주변", category: "food", cost: 4800, lat: 16.057, lng: 108.244, koreanReview: "깔끔한 매장과 담백한 육수로 마지막 아침을 든든하게 해결해요" },
      { time: "10:00", title: "영응사 해수관음상", place: "Hoàng Sa, Thọ Quang, Sơn Trà", category: "culture", cost: 0, lat: 16.1, lng: 108.278, koreanReview: "67m 높이 동양 최대 해수관음상, 다낭 바다와 시내가 한눈에 보여요" },
      { time: "11:30", title: "롯데마트 다낭점 기념품 쇼핑", place: "6 Nguyễn Hữu Thọ, Hòa Cường Bắc", category: "shopping", cost: 0, lat: 16.037, lng: 108.22, note: "쇼핑비는 개인차예요", koreanReview: "망고푸딩, 아치카페 커피, 과자 등 귀국 선물을 사기 좋아요" },
      { time: "12:30", title: "다낭 국제공항 이동 & 출국", place: "다낭 국제공항", category: "transport", cost: 5300, lat: 16.0439, lng: 108.1994, koreanReview: "점심 시간대 공항에 도착해 여유 있게 수속할 수 있어요" },
    ],
  ],

  singapore: [
    [
      { time: "12:00", title: "MRT / 그랩으로 시내 이동", place: "창이 공항 → 시내 중심가", category: "transport", cost: 10000, lat: 1.3644, lng: 103.9915, koreanReview: "그랩이면 숙소까지 바로 갈 수 있고 MRT도 쾌적해요" },
      { time: "13:30", title: "숙소 체크인", place: "칼튼 호텔 싱가포르 (76 Bras Basah Rd)", category: "travel", cost: 0, lat: 1.295, lng: 103.852, note: "1박 SGD 250~ · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "시내 중심가라 차이나타운과 마리나 베이 모두 이동하기 편해요" },
      { time: "14:00", title: "점심: 야쿤 카야 토스트 본점", place: "18 China St, #01-01", category: "cafe", cost: 6300, lat: 1.284, lng: 103.848, koreanReview: "바삭한 토스트와 수란, 카야잼의 단짠 조합이 최고예요" },
      { time: "15:30", title: "머라이언 파크 & 시내 산책", place: "1 Fullerton Rd", category: "culture", cost: 0, lat: 1.2868, lng: 103.8545, koreanReview: "머라이언 동상 인증샷 필수 코스, 건너편 샌즈 호텔 뷰가 환상적이에요" },
      { time: "18:30", title: "저녁: 송파 바쿠테 클락키점", place: "11 New Bridge Rd, #01-01", category: "food", cost: 15700, lat: 1.2885, lng: 103.8465, koreanReview: "진한 갈비탕 맛이라 한국인 입맛에 잘 맞고 육수 리필이 돼요" },
      { time: "20:30", title: "가든스 바이 더 베이 슈퍼트리쇼", place: "18 Marina Gardens Dr", category: "culture", cost: 0, lat: 1.2816, lng: 103.8636, koreanReview: "밤 7:45, 8:45 두 차례 열리는 슈퍼트리 라이트 쇼가 웅장해요" },
    ],
    [
      { time: "08:30", title: "아침: 토스트 박스", place: "VivoCity, Singapore", category: "cafe", cost: 6300, lat: 1.2644, lng: 103.8222, koreanReview: "카야토스트와 락사 등 대중적인 싱가포르식 모닝 메뉴가 좋아요" },
      { time: "10:00", title: "유니버설 스튜디오 싱가포르", place: "8 Sentosa Gateway", category: "activity", cost: 85700, lat: 1.254, lng: 103.8238, koreanReview: "규모는 아담해도 트랜스포머 등 핵심 라이드가 알차게 들어 있어요" },
      { time: "15:00", title: "점심: 딤타이펑 (센토사)", place: "Resorts World Sentosa", category: "food", cost: 31400, lat: 1.255, lng: 103.822, koreanReview: "놀이기구로 지친 몸을 딤섬과 볶음밥으로 충전할 수 있어요" },
      { time: "17:30", title: "실로소 비치 & 루지", place: "Siloso Beach Walk, Sentosa", category: "activity", cost: 31400, lat: 1.256, lng: 103.81, koreanReview: "노을 지는 해변 산책 후 루지를 타고 내려오는 재미가 쏠쏠해요" },
      { time: "20:00", title: "저녁: 사테거리 (라우파삿)", place: "18 Raffles Quay", category: "food", cost: 26100, lat: 1.2807, lng: 103.8504, koreanReview: "야외에서 닭·쇠고기·새우 사테에 시원한 맥주 한잔하기 좋아요" },
    ],
    [
      { time: "09:00", title: "아침: 차이나타운 브런치", place: "195 New Bridge Rd", category: "food", cost: 10500, lat: 1.283, lng: 103.843, koreanReview: "가성비 뛰어난 꿔바로우와 만두 맛집, 아침 겸 점심으로 추천해요" },
      { time: "10:30", title: "아랍스트리트 & 하지레인", place: "Arab St / Haji Ln", category: "culture", cost: 0, lat: 1.302, lng: 103.859, koreanReview: "화려한 모스크와 감성 넘치는 골목 벽화에서 사진 남기기 좋아요" },
      { time: "13:00", title: "점심: Zam Zam", place: "697-699 North Bridge Rd", category: "food", cost: 12500, lat: 1.3022, lng: 103.8595, koreanReview: "대형 무르타박과 커리 조합이 이국적이고 풍부한 맛이에요" },
      { time: "15:00", title: "가든스 바이 더 베이 돔 관람", place: "18 Marina Gardens Dr", category: "culture", cost: 55400, lat: 1.2816, lng: 103.8636, koreanReview: "플라워 돔과 클라우드 포레스트의 실내 대형 폭포는 필수 코스예요" },
      { time: "18:30", title: "저녁: 점보 씨푸드 리버사이드점", place: "30 Merchant Rd, #01-01/02", category: "food", cost: 94100, lat: 1.2882, lng: 103.8455, koreanReview: "칠리크랩 소스에 튀긴 번을 찍어 먹는 맛이 일품이에요" },
      { time: "20:30", title: "클락키 리버크루즈 야경", place: "Clarke Quay Jetty", category: "culture", cost: 29300, lat: 1.29, lng: 103.8465, koreanReview: "강바람을 맞으며 마리나 베이 샌즈 야경을 한눈에 담을 수 있어요" },
    ],
    [
      { time: "08:30", title: "아침: 차이나타운 딤섬", place: "차이나타운 / 시내 지하상가", category: "food", cost: 10500, lat: 1.283, lng: 103.844, koreanReview: "체크아웃 전 가볍고 따뜻한 만두와 딤섬으로 아침을 해결해요" },
      { time: "10:00", title: "오차드 로드 쇼핑몰", place: "Orchard Rd, Singapore", category: "shopping", cost: 0, lat: 1.304, lng: 103.832, note: "쇼핑비는 개인차예요", koreanReview: "바샤커피, 찰스앤키스 쇼핑하기 좋은 럭셔리 거리예요" },
      { time: "11:00", title: "체크아웃 & 공항 이동", place: "시내 → 창이 국제공항", category: "transport", cost: 20900, lat: 1.3644, lng: 103.9915, koreanReview: "그랩이나 MRT로 여유 있게 공항으로 이동해요" },
      { time: "11:45", title: "쥬얼 창이 구경", place: "78 Airport Blvd.", category: "culture", cost: 0, lat: 1.3601, lng: 103.9895, koreanReview: "세계 최대 실내 폭포와 실내 정원은 사진 찍기 최고의 장소예요" },
    ],
  ],

  taipei: [
    [
      { time: "12:00", title: "공항 MRT로 시내 이동", place: "타오위안 공항 → 타이베이 메인역", category: "transport", cost: 6700, lat: 25.0777, lng: 121.2328, koreanReview: "급행을 타면 35분 만에 시내에 도착해서 빠르고 편해요" },
      { time: "13:30", title: "숙소 체크인", place: "시티즌M 타이베이 노스게이트", category: "travel", cost: 0, lat: 25.0435, lng: 121.509, note: "1박 TWD 3,000~ · 숙박비는 예산의 숙박 항목에 따로 잡혀 있어요", koreanReview: "메인역·시먼딩 도보 이동이 가능하고 창밖 시티뷰가 예뻐요" },
      { time: "14:00", title: "점심: 아종면선 (곱창국수)", place: "No. 8-1, Emei St, Wanhua District", category: "food", cost: 3400, lat: 25.044, lng: 121.5065, koreanReview: "칠리소스와 고수를 살짝 넣으면 가쓰오부시 육수 풍미가 최고예요" },
      { time: "15:30", title: "시먼딩 거리 & 용산사", place: "No. 211, Guangzhou St, Wanhua District", category: "culture", cost: 0, lat: 25.0365, lng: 121.4998, koreanReview: "낮과 밤 모두 활기찬 젊음의 거리, 용산사 야경도 추천해요" },
      { time: "18:30", title: "저녁: 마라훠궈 시먼점", place: "No. 62, Xining Rd, Wanhua District", category: "food", cost: 40300, lat: 25.045, lng: 121.506, koreanReview: "고기 품질이 좋고 아이스크림 무한리필이라 본전을 뽑을 수 있어요" },
      { time: "20:30", title: "라오허제 야시장", place: "Raohe St, Songshan District", category: "culture", cost: 9000, lat: 25.051, lng: 121.577, koreanReview: "입구 화덕만두는 필수고 스린보다 동선이 편해요" },
    ],
    [
      { time: "08:30", title: "아침: 푸항두장", place: "No. 108, Sec 1, Zhongxiao E Rd", category: "food", cost: 4500, lat: 25.0446, lng: 121.522, koreanReview: "또우장과 요우티아오 조합이 최고, 오픈런 안 하면 대기가 길어요" },
      { time: "10:00", title: "예류 지질공원", place: "No. 167-1, Kangtai Rd, Wanli District", category: "culture", cost: 5400, lat: 25.2065, lng: 121.69, koreanReview: "여왕머리 바위 등 희귀한 해안 지형을 볼 수 있고 모자가 필수예요" },
      { time: "13:00", title: "스펀 옛거리 & 천등 날리기", place: "Shifen Old Street, Pingxi District", category: "activity", cost: 14600, lat: 25.041, lng: 121.775, koreanReview: "기찻길에서 천등 날리는 감성이 좋고 닭날개 볶음밥도 꼭 먹어야 해요" },
      { time: "15:30", title: "지우펀 홍등거리", place: "Jishan St, Ruifang District", category: "culture", cost: 13400, lat: 25.109, lng: 121.844, koreanReview: "홍등이 켜지는 노을~밤 시간대가 완벽해요" },
      { time: "19:30", title: "저녁: 키키레스토랑 신이점", place: "4F, No. 11, Songgao Rd, Xinyi District", category: "food", cost: 35800, lat: 25.039, lng: 121.568, koreanReview: "부두아스파라거스 볶음과 두부튀김이 한국인 입맛에 딱 맞아요" },
    ],
    [
      { time: "09:00", title: "아침: 진펑 루로우판", place: "No. 10, Sec 1, Roosevelt Rd", category: "food", cost: 3600, lat: 25.0325, lng: 121.5185, koreanReview: "짭조름한 돼지고기 덮밥에 계란 추가 조합이 가성비 끝판왕이에요" },
      { time: "10:30", title: "국립고궁박물원", place: "No. 221, Sec 2, Zhi Shan Rd, Shilin", category: "culture", cost: 15700, lat: 25.1024, lng: 121.5485, koreanReview: "취옥배추와 동파육 돌은 꼭 봐야 하고 유물 규모에 감탄하게 돼요" },
      { time: "13:30", title: "점심: 딘타이펑 본점 (융캉제)", place: "No. 194, Sec 2, Xinyi Rd, Da'an", category: "food", cost: 26900, lat: 25.033, lng: 121.529, koreanReview: "샤오롱바오와 갈비볶음밥이 명불허전, 앱으로 사전 대기가 필수예요" },
      { time: "15:00", title: "융캉제 카페거리 & 쇼핑", place: "Yongkang St, Da'an District", category: "shopping", cost: 9000, lat: 25.0325, lng: 121.5295, koreanReview: "누가크래커와 스무시하우스 망고빙수를 먹기 좋은 거리예요" },
      { time: "18:00", title: "타이베이 101타워 전망대", place: "No. 7, Sec 5, Xinyi Rd, Xinyi District", category: "culture", cost: 26900, lat: 25.0338, lng: 121.5645, koreanReview: "시내 360도 전경을 볼 수 있고 해질녘에 올라가는 걸 강력 추천해요" },
      { time: "20:30", title: "저녁: 황지아 훠궈", place: "Zhongzheng / Wanhua District", category: "food", cost: 31400, lat: 25.043, lng: 121.507, koreanReview: "다양한 육수와 신선한 해산물로 마지막 밤을 든든하게 마무리해요" },
    ],
    [
      { time: "08:30", title: "아침: 대만식 모닝 카페", place: "시먼딩 / 타이베이 메인역 주변", category: "cafe", cost: 5400, lat: 25.044, lng: 121.507, koreanReview: "딴빙과 따뜻한 두유로 여유롭게 아침을 시작할 수 있어요" },
      { time: "10:00", title: "까르푸 시먼점 기념품 쇼핑", place: "No. 1, Guilin Rd, Wanhua District", category: "shopping", cost: 0, lat: 25.04, lng: 121.503, note: "쇼핑비는 개인차예요", koreanReview: "3시15분 밀크티, 곰돌이 방향제, 망고젤리를 한 번에 살 수 있어요" },
      { time: "11:00", title: "체크아웃 & 타이베이역 이동", place: "숙소 → 타이베이 메인역", category: "transport", cost: 900, lat: 25.0478, lng: 121.517, koreanReview: "메인역으로 이동해 공항 MRT 탑승을 준비해요" },
      { time: "11:30", title: "공항 MRT 타고 이동", place: "타이베이 메인역 → 타오위안 공항", category: "transport", cost: 6700, lat: 25.0777, lng: 121.2328, koreanReview: "급행을 타고 공항까지 편하게 이동해요" },
    ],
  ],
};

const FALLBACK: Slot[][] = [
  [
    { time: "10:00", title: "도심 워킹 투어", place: "시내 중심가", category: "culture", cost: 10000 },
    { time: "13:00", title: "현지 인기 식당 점심", place: "로컬 레스토랑", category: "food", cost: 18000 },
    { time: "16:00", title: "카페 휴식", place: "동네 로스터리", category: "cafe", cost: 8000 },
    { time: "19:00", title: "야시장 저녁", place: "나이트 마켓", category: "food", cost: 20000 },
  ],
  [
    { time: "09:30", title: "대표 명소 방문", place: "랜드마크", category: "culture", cost: 15000 },
    { time: "12:30", title: "현지식 점심", place: "로컬 식당", category: "food", cost: 15000 },
    { time: "15:30", title: "쇼핑 스트리트", place: "쇼핑 거리", category: "shopping", cost: 40000 },
  ],
  [
    { time: "10:00", title: "근교 반나절 투어", place: "근교 명소", category: "activity", cost: 35000 },
    { time: "14:00", title: "브런치", place: "브런치 카페", category: "cafe", cost: 14000 },
    { time: "18:00", title: "마지막 저녁", place: "인기 레스토랑", category: "food", cost: 28000 },
  ],
];

export function buildItinerary(dest: Destination, nights: number, startDate: string): ItineraryDay[] {
  const slots = LIBRARY[dest.id] ?? FALLBACK;
  const days = nights + 1;
  const start = new Date(startDate + "T00:00:00Z");

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const src = slots[i % slots.length];
    return {
      day: i + 1,
      date: d.toISOString().slice(0, 10),
      items: src.map((s) => ({
        time: s.time,
        title: s.title,
        place: s.place,
        category: s.category,
        estCost: s.cost,
        note: s.note,
        koreanReview: s.koreanReview,
        lat: s.lat,
        lng: s.lng,
      })),
    };
  });
}
