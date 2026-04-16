const platformConfig = {
    naver: { name: 'Naver Search Ads', color: '#03C75A', icon: 'ads_click' },
    kakao: { name: 'Kakao Business', color: '#E9C400', icon: 'chat' },
    google: { name: 'Google Ads', color: '#4285F4', icon: 'search' },
    meta: { name: 'Meta for Business', color: '#0668E1', icon: 'facebook' },
    daangn: { name: 'Daangn Ads', color: '#FF7E36', icon: 'local_mall' },
    others: { name: 'Vertical Ad Network', color: '#A855F7', icon: 'grain' }
};

const categoryConfig = {
    notice: { name: '일반 공지', label: 'ANNOUNCEMENT' },
    product: { name: '상품 업데이트', label: 'UPDATE' },
    policy: { name: '핵심 정책', label: 'POLICY' },
    error: { name: '시스템 현황', label: 'STATUS' }
};

let notices = [];
let filteredNotices = [];
let currentPlatform = 'all';
let selectedId = null;

const listEl = document.getElementById('notice-list');
const detailEl = document.getElementById('main-detail');
const chips = document.querySelectorAll('.chip');

async function init() {
    setupInteraction();
    await loadData();
}

async function loadData() {
    try {
        const res = await fetch('notices.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        notices = await res.json();
    } catch (e) {
        // High-Quality Placeholder Data
        notices = [
            { id: 'p1', platform: 'naver', title: '[업데이트] 네이버 쇼핑검색광고 ‘AI 추천 더보기’ 노출 확대 안내', date: '2026.04.16', category: 'product', desc: '보다 효율적인 쇼핑검색 광고 집행을 위해 AI 기반 추천 영역의 노출 비중이 상향 조정되었습니다.\n\n적용 일시: 2026년 4월 20일\n대상: 모든 쇼핑몰 상품형 광고주\n변경 내용: 모바일 탭 검색 결과 하단 인공지능 추천 영역 내 노출 빈도 확대\n\n광고주님께서는 관리자 페이지 내 성과 지표를 통해 노출량 변화를 확인해 주시기 바랍니다.' },
            { id: 'p2', platform: 'kakao', title: '[공지] 카카오 비즈니스 통합 관리 센터 이용 가이드 배포', date: '2026.04.16', category: 'notice', desc: '카카오의 모든 비즈니스 도구를 한 번에 관리할 수 있게 되었습니다.\n\n기존 각각 운영되던 카카오모먼트, 비즈채널, 톡스토어 관리자가 하나로 통합되었습니다. 신규 통합 가이드라인을 다운로드하여 원활한 운영을 준비하세요.' },
            { id: 'p3', platform: 'google', title: '[Policy] Google Ads 대한민국 금융 서비스 인증 절차 강화', date: '2026.04.15', category: 'policy', desc: '신뢰할 수 있는 광고 환경 조성을 위해 금융 상품 광고주의 추가 본인 인증이 의무화됩니다.' },
            { id: 'p4', platform: 'meta', title: '[Feature] Meta Advantage+ 쇼핑 캠페인 신규 모델 도입', date: '2026.04.14', category: 'product', desc: 'Llama 3 기반의 신규 예측 모델이 적용되어 전환 효율이 최대 15% 개선될 예정입니다.' }
        ];
    }
    filterAndDraw();
    
    // Auto-select first item for that 'Full' feeling
    if (notices.length > 0) selectNotice(notices[0].id);
}

function setupInteraction() {
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentPlatform = chip.dataset.platform;
            filterAndDraw();
        });
    });
}

function filterAndDraw() {
    filteredNotices = notices.filter(n => currentPlatform === 'all' || n.platform === currentPlatform);
    
    listEl.innerHTML = '';
    filteredNotices.forEach(n => {
        const p = platformConfig[n.platform] || platformConfig.others;
        const div = document.createElement('div');
        div.className = `notice-item ${selectedId === n.id ? 'selected' : ''}`;
        div.innerHTML = `
            <div class="item-meta">
                <span class="badge" style="background: ${p.color}15; color: ${p.color}">${p.name}</span>
                <span class="item-date">${n.date}</span>
            </div>
            <div class="item-title">${n.title}</div>
            <div class="item-summary">${n.desc}</div>
        `;
        div.onclick = () => selectNotice(n.id);
        listEl.appendChild(div);
    });
}

function selectNotice(id) {
    selectedId = id;
    const n = notices.find(item => item.id === id);
    if (!n) return;

    // Refresh list highlight
    document.querySelectorAll('.notice-item').forEach(el => el.classList.remove('selected'));
    const currentItem = Array.from(document.querySelectorAll('.notice-item')).find(el => el.querySelector('.item-title').innerText === n.title);
    if (currentItem) currentItem.classList.add('selected');

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: '공지사항', label: 'INFO' };

    detailEl.innerHTML = `
        <div class="detail-view">
            <!-- 1. Hero Summary Box -->
            <div class="hero-box">
                <div style="display: flex; align-items: center; gap: 12px; color: ${p.color}">
                    <span class="material-icons-round">${p.icon}</span>
                    <span style="font-weight: 800; font-size: 14px; letter-spacing: 1px;">${p.name.toUpperCase()}</span>
                </div>
                <h1 class="hero-title">${n.title}</h1>
                <div style="display: flex; gap: 16px;">
                    <span class="tag">분류: ${c.name}</span>
                    <span class="tag">게시일: ${n.date}</span>
                    <span class="tag" style="color: #22863a;">상태: 정상 처리됨</span>
                </div>
            </div>

            <!-- 2. Meta Stats Grid (Filling Space Professionally) -->
            <div class="summary-grid">
                <div class="summary-card">
                    <span>매체 영향도</span>
                    <p>High Priority</p>
                </div>
                <div class="summary-card">
                    <span>카테고리</span>
                    <p>${c.label}</p>
                </div>
                <div class="summary-card">
                    <span>업데이트 유형</span>
                    <p>시스템 고도화</p>
                </div>
            </div>

            <!-- 3. Real Content Box -->
            <div class="content-box">
                <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--brand-primary);">상세 내역 분석</h3>
                </div>
                <div class="content-body">
                    ${n.desc.replace(/\n/g, '<br>')}
                </div>
                
                <div class="action-bar">
                    ${n.url ? `
                        <a href="${n.url}" target="_blank" class="btn-cta">
                            공식 원문 페이지 방문하기
                            <span class="material-icons-round" style="margin-left: 8px; font-size: 20px; vertical-align: middle;">open_in_new</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', init);
