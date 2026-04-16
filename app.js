const platformConfig = {
    naver: { name: 'NAVER', color: '#03C75A', icon: 'ads_click' },
    kakao: { name: 'KAKAO', color: '#E9C400', icon: 'chat' },
    google: { name: 'GOOGLE', color: '#4285F4', icon: 'search' },
    meta: { name: 'META', color: '#0668E1', icon: 'facebook' },
    daangn: { name: 'DAANGN', color: '#FF7E36', icon: 'local_mall' },
    others: { name: 'VERTICAL', color: '#A855F7', icon: 'grain' }
};

const categoryConfig = {
    notice: { name: 'ANNOUNCEMENT', label: 'ANN' },
    product: { name: 'SYSTEM UPDATE', label: 'UPD' },
    policy: { name: 'POLICY CENTER', label: 'POL' },
    error: { name: 'CRITICAL STATUS', label: 'ERR' }
};

let notices = [];
let filteredNotices = [];
let currentPlatform = 'all';
let selectedId = null;

// DOM 
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

function setupViewSwitcher() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.view;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            pageViews.forEach(v => {
                v.style.display = 'none';
                if (v.id === `view-${target}`) {
                    v.style.display = target === 'dashboard' ? 'flex' : 'block';
                    v.classList.add('active');
                }
            });
        });
    });
}

async function loadData() {
    try {
        const res = await fetch('notices.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        notices = await res.json();
    } catch (e) {
        notices = [
            { id: 'l1', platform: 'naver', title: '[UPGRADE] 네이버 검색광고 전용 AI 추천 엔진 로직 고도화 릴리즈', date: '2026.04.16', category: 'product', desc: '보다 정교한 타겟 분석을 위해 네이버 검색광고의 AI 추천 로직이 2.0 버전으로 업데이트 되었습니다.\n\n이를 통해 연관성 높은 사용자에게의 노출 효율이 평균 15% 이상 개선될 것으로 기대됩니다. 자세한 지표는 리포트 센터에서 확인하십시오.' },
            { id: 'l2', platform: 'kakao', title: '[RELEASE] 카카오 비즈니스 통합 인사이트 대시보드 정식 출시', date: '2026.04.16', category: 'notice', desc: '모든 매체를 한눈에 관리하는 카카오의 새로운 인텔리전스 도구가 오늘 정식 오픈하였습니다.' },
            { id: 'l3', platform: 'meta', title: '[GLOBAL] Meta Advantage+ Shopping Campaigns - New AI Features', date: '2026.04.15', category: 'product', desc: 'Experience the power of Llama 3 integrated advertising tools. Automatic creative generation is now available for all global advertisers.' }
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
            <span class="item-badge" style="background: ${p.color}20; color: ${p.color}">#${p.name}</span>
            <div class="item-title">${n.title}</div>
            <div style="font-size: 11px; color: var(--text-body); opacity: 0.6;">${n.date} · VALIDATED</div>
        `;
        div.onclick = () => selectNotice(n.id);
        listEl.appendChild(div);
    });
}

function selectNotice(id) {
    selectedId = id;
    const n = notices.find(item => item.id === id);
    if (!n) return;

    // Highlight update
    const items = listEl.querySelectorAll('.notice-item');
    items.forEach(it => {
        it.classList.remove('selected');
        if (it.querySelector('.item-title').innerText === n.title) it.classList.add('selected');
    });

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: 'INSIGHT', label: 'INS' };

    detailEl.innerHTML = `
        <div class="detail-container">
            <div class="luxury-hero">
                <div style="display: flex; align-items: center; gap: 12px; color: ${p.color}; margin-bottom: 24px;">
                    <span class="material-icons-round" style="font-size: 20px;">${p.icon}</span>
                    <span style="font-weight: 800; font-size: 12px; letter-spacing: 2px;">PLATFORM INTELLIGENCE</span>
                </div>
                <h1>${n.title}</h1>
                <div class="info-stripe">
                    <span>SOURCE: 공식 ${p.name} 센터</span>
                    <span>TYPE: ${c.name}</span>
                    <span>TIMESTAMP: ${n.date}</span>
                </div>
            </div>

            <div class="content-box">
                <div class="content-body">
                    ${n.desc.replace(/\n/g, '<br>')}
                </div>
                
                <div style="text-align: right; margin-top: 80px;">
                    ${n.url ? `
                        <a href="${n.url}" target="_blank" class="btn-premium">
                            OPEN ORIGINAL SOURCE
                            <span class="material-icons-round" style="margin-left: 12px; font-size: 20px;">arrow_forward</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Smooth scroll to top
    detailEl.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', init);
