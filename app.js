// Mock Data
const notices = [
    {
        id: 1,
        platform: 'naver',
        category: 'product',
        productType: 'search',
        title: '[데모 샘플] 모바일 통합검색 패션 질의 개선 (이 데이터는 가짜입니다)',
        desc: '모바일 통합검색 내 일부 패션 질의에 대해 가격 비교와 네이버플러스 스토어 컬렉션이 단일 컬렉션으로 통합됩니다.',
        content: '안녕하세요. 네이버 검색광고 운영자입니다.\n\n이 화면은 실시간 데이터가 연동되지 않은 독립된 [테스트 시안용] 페이지입니다.\n현재 사내망 서버와 연동되지 않았으므로 네이버 로그인 쿠키가 없어 원문 링크 보기가 작동하지 않거나 다를 수 있습니다.\n실무 연동을 위해선 백엔드 크롤러 구축이 필요합니다.',
        url: 'https://searchad.naver.com/',
        date: '2026.04.15'
    },
    {
        id: 2,
        platform: 'naver',
        category: 'error',
        productType: 'all',
        title: '[데모 샘플] 리포트 전환매출액 지표 일부 누락 안내',
        desc: '4월 3일 ~ 6일간 발생했던 리포트 전환매출액 지표의 일부 누락 건에 대한 복구 안내입니다.',
        content: '안녕하세요. 네이버 검색광고입니다.\n\n해당 글은 디자인 확인을 위한 가상의 데이터입니다. \n실제 데이터를 끌어오기 위해서는 네이버 API/크롤러 연동이 진행되어야 합니다.',
        url: 'https://searchad.naver.com/',
        date: '2026.04.10'
    },
    {
        id: 3,
        platform: 'naver',
        category: 'product',
        productType: 'search',
        title: '[데모 샘플] 플레이스광고 네이버페이 VR 지면 확대',
        desc: '부동산 업종 플레이스광고 노출 시, 네이버페이 VR 단지투어 지면으로의 노출이 확대 적용됩니다.',
        content: '안녕하세요. 플레이스광고 운영자입니다.\n\n디자인 시안 테스트용 글입니다. (실제 데이터 아님)',
        url: 'https://searchad.naver.com/',
        date: '2026.04.09'
    },
    {
        id: 4,
        platform: 'naver',
        category: 'product',
        productType: 'shopping',
        title: '[데모 샘플] 쇼핑검색광고 AI추천더보기 노출 확대',
        desc: '쇼핑검색결과 하단에 위치한 AI추천더보기 영역 내 광고 노출이 새롭게 확대됩니다.',
        content: '디자인 확인용 샘플 데이터입니다.',
        url: 'https://searchad.naver.com/',
        date: '2026.04.08'
    },
    {
        id: 5,
        platform: 'kakao',
        category: 'notice',
        productType: 'all',
        title: '[데모 샘플] 카카오비즈니스 커뮤니티 모집',
        desc: '함께 성장하는 비즈니스 이야기를 나눌 카카오비즈니스 사장님 커뮤니티 모집!',
        content: '안녕하세요. 카카오비즈니스입니다.\n\n해당 글은 디자인 확인을 위해 작성된 임시 샘플입니다. 실제 공지사항과 내용을 다를 수 있습니다.',
        url: 'https://business.kakao.com/',
        date: '2026.04.09'
    },
    {
        id: 6,
        platform: 'kakao',
        category: 'notice',
        productType: 'all',
        title: '[데모 샘플] 카카오비즈니스 무료 세미나',
        desc: '카카오 비즈니스 활용법 세미나 일정이 오픈되었습니다.',
        content: '디자인 확인용 샘플 데이터입니다.',
        url: 'https://business.kakao.com/',
        date: '2026.04.01'
    },
    {
        id: 7,
        platform: 'google',
        category: 'policy',
        productType: 'all',
        title: '[데모 샘플] 금융 서비스 광고 정책 업데이트',
        desc: '구글 애즈 금융 상품 및 서비스 관련 광고 정책이 강화됩니다.',
        content: 'Google Ads 정책이 사전 업데이트됩니다.\n\n(이 데이터는 디자인 렌더링 확인용 샘플입니다)',
        url: 'https://support.google.com/google-ads/announcements/9048695?hl=ko',
        date: '2026.04.13'
    },
    {
        id: 8,
        platform: 'meta',
        category: 'error',
        productType: 'display',
        title: '[데모 샘플] 인스타그램 피드 스폰서드 로그 지연',
        desc: '일부 계정에서 인스타그램 피드 광고 스폰서드 마크가 노출되지 않던 현상 테스트.',
        content: '테스트용 샘플 본문',
        url: 'https://www.facebook.com/business/help/',
        date: '2026.04.12'
    },
    {
        id: 9,
        platform: 'daangn',
        category: 'product',
        productType: 'search',
        title: '[데모 샘플] 당근마켓 지역검색 키워드 추천',
        desc: '당근마켓 지역광고용 시안 데이터입니다.',
        content: '당근 비즈니스 테스트용 콘텐츠입니다.',
        url: 'https://business.daangn.com/',
        date: '2026.04.10'
    },
    {
        id: 10,
        platform: 'others',
        category: 'operation',
        productType: 'display',
        title: '[시스템] 공지사항 연동 시스템 점검 안내 (URL 숨김 테스트)',
        desc: '시스템 점검으로 인해 일부 공지사항의 상세 데이터를 일시적으로 불러올 수 없습니다.',
        content: '',
        url: '',
        date: '2026.04.15'
    }
];

// Configuration for mapping
const platformConfig = {
    naver: { name: '네이버', color: '#03C75A', bg: 'rgba(3, 199, 90, 0.15)' },
    kakao: { name: '카카오', color: '#FEE500', bg: 'rgba(254, 229, 0, 0.15)' },
    google: { name: '구글', color: '#4285F4', bg: 'rgba(66, 133, 244, 0.15)' },
    meta: { name: '메타', color: '#1877F2', bg: 'rgba(24, 119, 242, 0.15)' },
    daangn: { name: '당근마켓', color: '#FF7E36', bg: 'rgba(255, 126, 54, 0.15)' },
    others: { name: '기타', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' }
};

const categoryConfig = {
    notice: { name: '공지/이벤트', color: '#3B82F6' },
    product: { name: '상품/서비스', color: '#10B981' },
    policy: { name: '정책/심사', color: '#F59E0B' },
    error: { name: '오류/장애', color: '#EF4444' },
    operation: { name: '운영', color: '#8B5CF6' }
};

const productConfig = {
    all: { name: '공통/전체' },
    search: { name: '검색광고' },
    display: { name: '디스플레이광고' },
    shopping: { name: '쇼핑광고' },
    video: { name: '동영상광고' }
};

// State
let currentPlatform = 'all';
let currentCategory = 'all';
let currentProduct = 'all';
let searchQuery = '';

// DOM Elements
const noticeGrid = document.getElementById('notice-grid');
const resultsCount = document.querySelector('.results-count span');
const searchInput = document.getElementById('search-input');

const platformTabs = document.querySelectorAll('.platform-tab');
const categoryTabs = document.querySelectorAll('.category-tab');
const productChips = document.querySelectorAll('.product-chip');

// Modal Elements
const modal = document.getElementById('notice-modal');
const modalClose = document.getElementById('modal-close');
const modalPlatform = document.getElementById('modal-platform');
const modalDate = document.getElementById('modal-date');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalProduct = document.getElementById('modal-product');
const modalBody = document.getElementById('modal-body-content');
const modalLink = document.getElementById('modal-link');

// Initialize
function init() {
    setupEventListeners();
    renderNotices();
}

function setupEventListeners() {
    // Platform Click
    platformTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            platformTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentPlatform = e.target.dataset.platform;
            renderNotices();
        });
    });

    // Category Click
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderNotices();
        });
    });

    // Product Click
    productChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            productChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentProduct = e.target.dataset.product;
            renderNotices();
        });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderNotices();
    });

    // Close Modal
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function openModal(noticeId) {
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) return;

    const platConf = platformConfig[notice.platform];
    const catConf = categoryConfig[notice.category];
    const prodConf = productConfig[notice.productType] || { name: notice.productType };

    // Set styling and data
    modalPlatform.textContent = platConf.name;
    modalPlatform.style.color = platConf.color;
    modalPlatform.style.background = platConf.bg;

    modalDate.textContent = notice.date;
    modalTitle.textContent = notice.title;
    
    // Content Handler
    const contentText = notice.content || notice.desc;
    if (contentText && contentText.trim() !== '') {
        modalBody.textContent = contentText;
        modalBody.style.fontStyle = 'normal';
        modalBody.style.opacity = '1';
    } else {
        modalBody.textContent = '등록된 상세 내용이 없습니다.';
        modalBody.style.fontStyle = 'italic';
        modalBody.style.opacity = '0.6';
    }
    
    modalCategory.textContent = catConf.name;
    modalCategory.style.color = catConf.color;
    modalCategory.style.background = `${catConf.color}15`;
    modalCategory.style.borderColor = `${catConf.color}30`;
    
    modalProduct.textContent = prodConf.name;
    
    // Link Handler
    if (notice.url && notice.url.trim() !== '') {
        modalLink.style.display = 'inline-flex';
        modalLink.href = notice.url;
    } else {
        modalLink.style.display = 'none';
        modalLink.href = '#';
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function filterNotices() {
    return notices.filter(notice => {
        const matchPlatform = currentPlatform === 'all' || notice.platform === currentPlatform;
        const matchCategory = currentCategory === 'all' || notice.category === currentCategory;
        const matchProduct = currentProduct === 'all' || notice.productType === currentProduct;
        const matchSearch = notice.title.toLowerCase().includes(searchQuery) || notice.desc.toLowerCase().includes(searchQuery);
        
        return matchPlatform && matchCategory && matchProduct && matchSearch;
    });
}

function renderNotices() {
    const filtered = filterNotices();
    resultsCount.textContent = filtered.length;
    
    noticeGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        noticeGrid.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">search_off</span>
                <h2>검색 결과가 없습니다.</h2>
                <p>필터 조건을 변경하거나 검색어를 다르게 입력해보세요.</p>
            </div>
        `;
        return;
    }

    filtered.forEach((notice, index) => {
        const platConf = platformConfig[notice.platform];
        const catConf = categoryConfig[notice.category];
        const prodConf = productConfig[notice.productType] || { name: notice.productType };

        const card = document.createElement('div');
        card.className = 'notice-card';
        card.style.setProperty('--platform-color', platConf.color);
        card.style.setProperty('--platform-bg', platConf.bg);
        // Staggered animation delay
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="card-header">
                <span class="platform-badge" style="color: ${platConf.color}">${platConf.name}</span>
                <span class="date">${notice.date}</span>
            </div>
            <div class="card-body">
                <h3>${notice.title}</h3>
                <p>${notice.desc}</p>
            </div>
            <div class="card-footer">
                <span class="tag" style="color: ${catConf.color}; background: ${catConf.color}15; border-color: ${catConf.color}30;">
                    ${catConf.name}
                </span>
                <span class="tag tag-product">
                    ${prodConf.name}
                </span>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(notice.id));
        
        noticeGrid.appendChild(card);
    });
}

// Run
document.addEventListener('DOMContentLoaded', init);
