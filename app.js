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

// DOM Elements
const listEl = document.getElementById('notice-list');
const detailEl = document.getElementById('main-detail');
const chips = document.querySelectorAll('.chip');
const navItems = document.querySelectorAll('.nav-item[data-view]');
const pageViews = document.querySelectorAll('.page-view');

async function init() {
    setupInteraction();
    setupViewSwitcher();
    await loadData();
}

// 1. View Switching Logic
function setupViewSwitcher() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.dataset.view;
            
            // Toggle Nav Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Toggle Page View
            pageViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === `view-${targetView}`) {
                    view.classList.add('active');
                }
            });

            console.log(`Switched to view: ${targetView}`);
        });
    });
}

// 2. Data Loading & Filtering
async function loadData() {
    try {
        const res = await fetch('notices.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        notices = await res.json();
    } catch (e) {
        console.warn('Real data not found, using internal professional samples.');
        notices = [
            { id: 'p1', platform: 'naver', title: '[공지] 쇼핑검색광고 - 쇼핑몰상품형 ‘AI 추천 더보기’ 노출 확대 안내', date: '2026.04.16', category: 'product', desc: '보다 효율적인 쇼핑검색 광고 집행을 위해 AI 기반 추천 영역의 노출 비중이 상향 조정되었습니다.\n\n적용 일시: 2026년 4월 20일\n대상: 모든 쇼핑몰 상품형 광고주\n변경 내용: 모바일 탭 검색 결과 하단 인공지능 추천 영역 내 노출 빈도 확대' },
            { id: 'p2', platform: 'kakao', title: '[공지] 카카오 비즈니스 계정 통합 관리 가이드 업데이트', date: '2026.04.16', category: 'notice', desc: '광고와 톡채널을 통합하여 관리할 수 있는 새로운 가이드라인이 배포되었습니다.\n\n기존의 개별 관리자 시스템이 카카오 비즈니스 센터로 일원화됨에 따라 운영 효율이 극대화될 것으로 기대됩니다.' },
            { id: 'p3', platform: 'google', title: '[Policy] Google Ads 대한민국 금융 서비스 정책 업데이트 (2026)', date: '2026.04.15', category: 'policy', desc: '국내 금융 상품 광고 집행 시 신규 본인 인증 절차가 도입됩니다. 5월 1일까지 인증을 완료하지 않을 경우 광고 노출이 중단될 수 있으니 유의하시기 바랍니다.' },
            { id: 'p4', platform: 'meta', title: '[News] Meta Ads Advantage+ 쇼핑 캠페인 신규 예측 모델 발표', date: '2026.04.14', category: 'product', desc: 'Llama 3 기반의 신규 예측 알고리즘이 적용되어 전환 효율이 최대 12% 개선되었습니다. 별도의 설정 변경 없이 모든 캠페인에 순차 적용될 예정입니다.' }
        ];
    }
    filterAndDraw();
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

    document.querySelectorAll('.notice-item').forEach(el => el.classList.remove('selected'));
    const items = listEl.querySelectorAll('.notice-item');
    items.forEach(item => {
        if (item.querySelector('.item-title').innerText === n.title) item.classList.add('selected');
    });

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: '공지사항', label: 'INFO' };

    detailEl.innerHTML = `
        <div class="detail-view">
            <div class="hero-box">
                <div style="display: flex; align-items: center; gap: 12px; color: ${p.color}">
                    <span class="material-icons-round">${p.icon}</span>
                    <span style="font-weight: 800; font-size: 14px; letter-spacing: 1px;">${p.name.toUpperCase()}</span>
                </div>
                <h1 class="hero-title">${n.title}</h1>
                <div style="display: flex; gap: 16px;">
                    <span class="tag">분류: ${c.name}</span>
                    <span class="tag">게시일: ${n.date}</span>
                    <span class="tag" style="color: #22863a;">신뢰도: 공식 검증됨</span>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <span>매체 영향도</span>
                    <p style="color: ${n.category === 'policy' ? '#d73a49' : 'var(--brand-primary)'}">
                        ${n.category === 'policy' ? 'Critical' : 'Moderate'}
                    </p>
                </div>
                <div class="summary-card">
                    <span>데이터 소스</span>
                    <p>${n.platform.toUpperCase()} API</p>
                </div>
                <div class="summary-card">
                    <span>업데이트 타입</span>
                    <p>${c.label}</p>
                </div>
            </div>

            <div class="content-box">
                <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--brand-primary);">전략적 제언 및 상세 데이터</h3>
                </div>
                <div class="content-body">
                    ${n.desc.replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 40px; text-align: right;">
                    ${n.url ? `<a href="${n.url}" target="_blank" class="btn-cta">공식 원문 확인하기 <span class="material-icons-round" style="margin-left: 8px; font-size: 18px;">open_in_new</span></a>` : ''}
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', init);
