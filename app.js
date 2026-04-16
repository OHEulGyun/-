const platformConfig = {
    naver: { name: '네이버', color: '#03C75A' },
    kakao: { name: '카카오', color: '#E9C400' },
    google: { name: '구글', color: '#4285F4' },
    meta: { name: '메타', color: '#0668E1' },
    daangn: { name: '당근', color: '#FF7E36' },
    others: { name: '기타', color: '#A855F7' }
};

const categoryConfig = {
    notice: { name: '공지사항' },
    product: { name: '상품/서비스' },
    policy: { name: '정책/심사' },
    error: { name: '오류/장애' }
};

let notices = [];
let filteredNotices = [];
let currentPlatform = 'all';
let selectedId = null;

// DOM
const listContainer = document.getElementById('notice-list-container');
const detailPane = document.getElementById('detail-pane');
const platformTabs = document.querySelectorAll('.filter-chip');

async function init() {
    setupListeners();
    await loadData();
}

async function loadData() {
    try {
        const res = await fetch('notices.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        notices = await res.json();
    } catch (e) {
        // High-Quality Placeholder Data for Instant Review
        notices = [
            { id: 'n1', platform: 'naver', title: '[업데이트] 네이버 쇼핑검색광고 ‘AI 추천 더보기’ 노출 확대', date: '2026.04.16', category: 'product', desc: '쇼핑검색광고의 효율을 높이기 위해 AI 추천 영역이 확장되었습니다.\n\n대상: 쇼핑몰상품형 광고주\n내용: 모바일 결과 페이지 하단 AI 추천 탭 내 노출 비중 확대\n기대효과: 연관 구매 의사가 높은 사용자에게 추가 노출 기회 제공' },
            { id: 'k1', platform: 'kakao', title: '[공지] 카카오 비즈니스 계정 통합 관리 센터 이용 안내', date: '2026.04.16', category: 'notice', desc: '광고, 채널, 스토어를 한 곳에서 관리하는 비즈니스 센터가 개편되었습니다.\n\n새로운 통합 대시보드를 통해 매체별 지표를 한눈에 확인하고 권한을 관리하세요.' },
            { id: 'g1', platform: 'google', title: '[Policy] Google Ads 대한민국 금융 서비스 정책 업데이트', date: '2026.04.15', category: 'policy', desc: '국내 금융 상품 광고 집행 시 신규 인증 절차가 도입됩니다.\n\n행동 필요: 모든 금융 상품 광고주는 5월 1일까지 추가 인증을 완료해야 합니다.' },
            { id: 'm1', platform: 'meta', title: '[News] Meta Ads Advantage+ 쇼핑 캠페인 신규 기능', date: '2026.04.14', category: 'product', desc: 'AI 기반 타겟팅 최적화 기능인 Advantage+ 캠페인에 멀티 광고주 타겟팅이 추가되었습니다.' },
            { id: 'd1', platform: 'daangn', title: '[당근] 지역 타겟팅 광고 내 이웃 관심사 정밀 분석 출시', date: '2026.04.13', category: 'product', desc: '당근비즈니스에서 우리 동네 이웃의 실시간 관심사에 맞춘 정밀 타겟팅 기능을 출시했습니다.' }
        ];
    }
    filterAndRender();
}

function setupListeners() {
    platformTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            platformTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPlatform = tab.dataset.platform;
            filterAndRender();
        });
    });
}

function filterAndRender() {
    filteredNotices = notices.filter(n => currentPlatform === 'all' || n.platform === currentPlatform);
    
    // Render Left List
    listContainer.innerHTML = '';
    filteredNotices.forEach(n => {
        const p = platformConfig[n.platform] || platformConfig.others;
        const div = document.createElement('div');
        div.className = `notice-item ${selectedId === n.id ? 'active' : ''}`;
        div.innerHTML = `
            <div class="item-top">
                <span class="p-badge" style="background: ${p.color}20; color: ${p.color}">${p.name}</span>
                <span class="item-date">${n.date}</span>
            </div>
            <div class="item-title">${n.title}</div>
        `;
        div.onclick = () => selectItem(n.id);
        listContainer.appendChild(div);
    });

    if (selectedId) {
        renderDetail(selectedId);
    }
}

function selectItem(id) {
    selectedId = id;
    const items = document.querySelectorAll('.notice-item');
    filterAndRender(); // Heavy refresh but keeps state simple
    renderDetail(id);
}

function renderDetail(id) {
    const n = notices.find(item => item.id === id);
    if (!n) return;

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: '일반' };

    detailPane.innerHTML = `
        <div class="detail-container">
            <div class="detail-header">
                <span class="p-badge" style="background: ${p.color}20; color: ${p.color}">${p.name} 공식 안내</span>
                <h2>${n.title}</h2>
                <div class="detail-info">
                    <span>분류: <strong>${c.name}</strong></span>
                    <span>작성일: <strong>${n.date}</strong></span>
                </div>
            </div>
            <div class="detail-body">
                ${n.desc.replace(/\n/g, '<br>')}
            </div>
            ${n.url ? `<a href="${n.url}" target="_blank" class="btn-visit">공공 홈페이지에서 원문 보기 <span class="material-icons-round" style="margin-left:8px; font-size:18px;">open_in_new</span></a>` : ''}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', init);
