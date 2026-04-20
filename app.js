const platformConfig = {
    naver: { name: 'NAVER Ads', color: '#03C75A', icon: 'ads_click', theme: 'rgba(3, 199, 90, 0.05)' },
    kakao: { name: 'KAKAO Biz', color: '#E9C400', icon: 'chat', theme: 'rgba(233, 196, 0, 0.05)' },
    google: { name: 'GOOGLE Ads', color: '#4285F4', icon: 'search', theme: 'rgba(66, 133, 244, 0.05)' },
    meta: { name: 'META Business', color: '#0668E1', icon: 'facebook', theme: 'rgba(6, 104, 225, 0.05)' },
    daangn: { name: 'DAANGN Biz', color: '#FF7E36', icon: 'local_mall', theme: 'rgba(255, 126, 54, 0.05)' },
    others: { name: 'VERTICAL', color: '#A855F7', icon: 'grain', theme: 'rgba(168, 85, 247, 0.05)' }
};

const categoryConfig = {
    notice: { name: '공지사항', label: 'ANNOUNCEMENT', mood: '#6366F1' },
    product: { name: '상품 업데이트', label: 'UPDATE', mood: '#10B981' },
    policy: { name: '정책/심사', label: 'POLICY', mood: '#F59E0B' },
    error: { name: '시스템 현황', label: 'SYSTEM', mood: '#EF4444' }
};

let notices = [];
let filteredNotices = [];
let emails = [];
let filteredEmails = [];
let currentPlatform = 'all';
let currentEmailSource = 'all';
let selectedNoticeId = null;
let selectedEmailId = null;

// DOM 
const listEl = document.getElementById('notice-list');
const detailEl = document.getElementById('main-detail');
const emailListEl = document.getElementById('email-list');
const emailDetailEl = document.getElementById('email-detail');
const chips = document.querySelectorAll('.chip');
const navItems = document.querySelectorAll('.nav-item[data-view]');
const pageViews = document.querySelectorAll('.page-view');

async function init() {
    setupInteraction();
    setupViewSwitcher();
    await loadData();
    await loadEmailData();
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
                    v.style.display = (target === 'dashboard' || target === 'email') ? 'flex' : 'block';
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
            { id: 'l1', platform: 'naver', title: '[공지] 쇼핑검색광고 - 쇼핑몰상품형 ‘AI 추천 더보기’ 노출 확대 안내', date: '2026.04.17', category: 'product', desc: '보다 효율적인 쇼핑검색 광고 집행을 위해 AI 기반 추천 영역의 노출 비중이 상향 조정되었습니다.\n\n적용 일시: 2026년 4월 20일\n대상: 모든 쇼핑몰 상품형 광고주\n변경 내용: 모바일 탭 검색 결과 하단 인공지능 추천 영역 내 노출 빈도 확대\n\n광고주님께서는 관리자 페이지 내 성과 지표를 통해 노출량 변화를 확인해 주시기 바랍니다.' },
            { id: 'l2', platform: 'kakao', title: '[안내] 카카오 비즈니스 계정 통합 관리 가이드 및 약관 개정 안내', date: '2026.04.17', category: 'notice', desc: '카카오의 모든 비즈니스 도구를 한곳에서 관리할 수 있게 되었습니다.\n\n기존 각각 운영되던 카카오모먼트, 비즈채널, 톡스토어 관리자가 하나로 통합되었습니다. 신규 통합 가이드라인을 다운로드하여 원활한 운영을 준비하세요.' },
            { id: 'l3', platform: 'meta', title: '[Update] Meta Advantage+ 쇼핑 캠페인 Llama 3 기반 예측 모델 적용', date: '2026.04.17', category: 'product', desc: 'Meta의 최신 AI 모델인 Llama 3가 Advantage+ 광고 엔진에 탑재되어 타겟팅 정교화 및 전환 효율이 대폭 개선되었습니다.\n\n주요 변경 사항:\n1. 타겟 매칭 알고리즘 고도화\n2. 크리에이티브 시각화 자동화 성능 향상\n3. 실시간 입찰 최적화 속도 개선' }
        ];
    }
    filterAndDraw();
    if (notices.length > 0) selectNotice(notices[0].id);
}

async function loadEmailData() {
    try {
        const res = await fetch('emails.json?t=' + Date.now());
        if (!res.ok) throw new Error();
        emails = await res.json();
    } catch (e) {
        emails = [
            { id: 'e1', source: 'meta', from: 'Meta for Business', title: 'Your account oilguys@motiv-i.com: Meta Ads Policy Update', date: '2026.04.19', body: '안녕하세요, 오을균님.\n\nMeta 광고 정책이 일부 개정되었습니다. 귀하의 계정(oilguys@motiv-i.com)과 관련된 주요 변경 사항을 안내드립니다.\n\n1. 개인정보 처리 방침 고도화\n2. 주류 및 금융 관련 광고 타겟팅 제한 강화\n\n상세 내용은 비즈니스 센터에서 확인해 주십시오.' },
            { id: 'e2', source: 'kakao', from: '카카오 비즈니스', title: '[카카오] oilguys@motiv-i.com 광고 캐시 잔액 부족 안내', date: '2026.04.18', body: '광고주님, 현재 카카오 비즈니스 계정의 잔액이 설정된 하한가 미만으로 소진되었습니다.\n\n계정: oilguys@motiv-i.com\n현재 잔액: 5,420원\n\n광고 중단을 방지하기 위해 충전을 진행해 주시기 바랍니다.' },
            { id: 'e3', source: 'naver', from: '네이버 광고', title: '[네이버광고] 신규 노출 영역 추가 테스트 캠페인 안내', date: '2026.04.18', body: '네이버 성과형 디스플레이 광고의 새로운 지면 테스트가 시작됩니다.\n\n참여 메일: oilguys@motiv-i.com\n내용: 통합 검색 하단 쇼핑 추천 영역 확장 테스트' }
        ];
    }
    filterAndDrawEmails();
    if (emails.length > 0) selectEmail(emails[0].id);
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
        div.className = `notice-item ${selectedNoticeId === n.id ? 'selected' : ''}`;
        div.innerHTML = `
            <span class="item-badge" style="background: ${p.color}20; color: ${p.color}">#${p.name}</span>
            <div class="item-title">${n.title}</div>
            <div style="font-size: 11px; color: var(--text-body); opacity: 0.6;">${n.date} · VERIFIED</div>
        `;
        div.onclick = () => selectNotice(n.id);
        listEl.appendChild(div);
    });
}

function filterAndDrawEmails() {
    filteredEmails = emails; // For now all, can add source filter later
    emailListEl.innerHTML = '';
    filteredEmails.forEach(e => {
        const p = platformConfig[e.source] || platformConfig.others;
        const div = document.createElement('div');
        div.className = `notice-item ${selectedEmailId === e.id ? 'selected' : ''}`;
        div.innerHTML = `
            <span class="item-badge" style="background: ${p.color}20; color: ${p.color}">@${e.from}</span>
            <div class="item-title">${e.title}</div>
            <div style="font-size: 11px; color: var(--text-body); opacity: 0.6;">${e.date} · EMAIL</div>
        `;
        div.onclick = () => selectEmail(e.id);
        emailListEl.appendChild(div);
    });
}

function selectNotice(id) {
    selectedNoticeId = id;
    const n = notices.find(item => item.id === id);
    if (!n) return;

    document.querySelectorAll('#notice-list .notice-item').forEach(it => {
        it.classList.remove('selected');
        if (it.querySelector('.item-title').innerText === n.title) it.classList.add('selected');
    });

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: '인사이트', label: 'INSICHT', mood: '#64748B' };

    // Enrichment Logic
    const points = n.desc.split('\n').filter(l => l.trim().length > 5).slice(0, 3);
    const impact = n.category === 'policy' ? '치명적 - 광고 운영 정책 확인 필수' : '높음 - 지표 모니터링 및 설정 최적화 권장';

    detailEl.innerHTML = `
        <div class="detail-container">
            <div class="luxury-hero" style="border-left: 8px solid ${p.color}; padding-left: 32px; background: ${p.theme}; border-radius: 0 24px 24px 0;">
                <div style="display: flex; align-items: center; gap: 12px; color: ${p.color}; margin-bottom: 24px;">
                    <span class="material-icons-round" style="font-size: 28px;">${p.icon}</span>
                    <span style="font-weight: 800; font-size: 14px; letter-spacing: 3px;">INTELLIGENCE ANALYSIS</span>
                </div>
                <h1 style="font-size: 3.5rem; line-height: 1.2; letter-spacing: -3px; color: white; margin-bottom: 24px;">${n.title}</h1>
                <div class="info-stripe">
                    <span>SOURCE: 공식 ${p.name}</span>
                    <span>TYPE: ${c.name}</span>
                    <span>TIMESTAMP: ${n.date} 09:00 KST</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px;">
                <div style="background: rgba(255,255,255,0.03); padding: 32px; border-radius: 24px; border: 1px solid var(--border-glass);">
                    <div style="color: ${p.color}; font-weight: 800; font-size: 12px; margin-bottom: 12px;">핵심 포인트</div>
                    <div style="font-size: 14px; color: white; line-height: 1.6;">${points[0] || '매체 서비스 최적화 업데이트'}</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 32px; border-radius: 24px; border: 1px solid var(--border-glass);">
                    <div style="color: var(--accent-gold); font-weight: 800; font-size: 12px; margin-bottom: 12px;">예상 영향도</div>
                    <div style="font-size: 14px; color: white; line-height: 1.6;">${impact}</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 32px; border-radius: 24px; border: 1px solid var(--border-glass);">
                    <div style="color: var(--accent-secondary); font-weight: 800; font-size: 12px; margin-bottom: 12px;">운영 권장사항</div>
                    <div style="font-size: 14px; color: white; line-height: 1.6;">집행 중인 캠페인의 전환 데이터 추이 분석</div>
                </div>
            </div>

            <div class="content-box" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-glass);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
                    <h3 style="font-size: 1.5rem; font-weight: 800; color: white; border-bottom: 4px solid ${p.color}; padding-bottom: 8px;">상세 분석 데이터</h3>
                    <div style="font-size: 12px; color: var(--text-body);">수집 엔진: Antigravity-Core v2.5</div>
                </div>
                <div class="content-body" style="font-size: 1.3rem; line-height: 2.2; color: #E2E8F0;">
                    ${n.desc.replace(/\n/g, '<br>')}
                </div>
                
                <div style="text-align: right; margin-top: 80px;">
                    ${n.url ? `
                        <a href="${n.url}" target="_blank" class="btn-premium" style="background: ${p.color}; color: white; padding: 24px 60px;">
                            ${p.name} 원문 확인하기
                            <span class="material-icons-round" style="margin-left: 12px; font-size: 24px;">rocket_launch</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    detailEl.scrollTo(0, 0);
}

function selectEmail(id) {
    selectedEmailId = id;
    const e = emails.find(item => item.id === id);
    if (!e) return;

    document.querySelectorAll('#email-list .notice-item').forEach(it => {
        it.classList.remove('selected');
        if (it.querySelector('.item-title').innerText === e.title) it.classList.add('selected');
    });

    const p = platformConfig[e.source] || platformConfig.others;

    emailDetailEl.innerHTML = `
        <div class="detail-container">
            <div class="luxury-hero" style="border-left: 8px solid ${p.color}; padding-left: 32px; background: rgba(255,255,255,0.02); border-radius: 24px;">
                <div style="display: flex; align-items: center; gap: 12px; color: ${p.color}; margin-bottom: 24px;">
                    <span class="material-icons-round" style="font-size: 28px;">mail</span>
                    <span style="font-weight: 800; font-size: 14px; letter-spacing: 3px;">DIRECT PLATFORM MAIL</span>
                </div>
                <h1 style="font-size: 3rem; line-height: 1.2; color: white; margin-bottom: 24px;">${e.title}</h1>
                <div class="info-stripe">
                    <span>FROM: ${e.from}</span>
                    <span>TO: oilguys@motiv-i.com</span>
                    <span>RECEIVED: ${e.date}</span>
                </div>
            </div>

            <div class="content-box" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-glass); margin-top: 32px;">
                <div class="content-body" style="font-size: 1.2rem; line-height: 2; color: #E2E8F0;">
                    ${e.body.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `;
    emailDetailEl.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', init);
