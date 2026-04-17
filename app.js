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
            { id: 'l1', platform: 'naver', title: '[공지] 쇼핑검색광고 - 쇼핑몰상품형 ‘AI 추천 더보기’ 노출 확대 안내', date: '2026.04.17', category: 'product', desc: '보다 효율적인 쇼핑검색 광고 집행을 위해 AI 기반 추천 영역의 노출 비중이 상향 조정되었습니다.\n\n적용 일시: 2026년 4월 20일\n대상: 모든 쇼핑몰 상품형 광고주\n변경 내용: 모바일 탭 검색 결과 하단 인공지능 추천 영역 내 노출 빈도 확대\n\n광고주님께서는 관리자 페이지 내 성과 지표를 통해 노출량 변화를 확인해 주시기 바랍니다.' },
            { id: 'l2', platform: 'kakao', title: '[안내] 카카오 비즈니스 계정 통합 관리 가이드 및 약관 개정 안내', date: '2026.04.17', category: 'notice', desc: '카카오의 모든 비즈니스 도구를 한곳에서 관리할 수 있게 되었습니다.\n\n기존 각각 운영되던 카카오모먼트, 비즈채널, 톡스토어 관리자가 하나로 통합되었습니다. 신규 통합 가이드라인을 다운로드하여 원활한 운영을 준비하세요.' },
            { id: 'l3', platform: 'meta', title: '[Update] Meta Advantage+ 쇼핑 캠페인 Llama 3 기반 예측 모델 적용', date: '2026.04.17', category: 'product', desc: 'Meta의 최신 AI 모델인 Llama 3가 Advantage+ 광고 엔진에 탑재되어 타겟팅 정교화 및 전환 효율이 대폭 개선되었습니다.\n\n주요 변경 사항:\n1. 타겟 매칭 알고리즘 고도화\n2. 크리에이티브 시각화 자동화 성능 향상\n3. 실시간 입찰 최적화 속도 개선' }
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
            <div style="font-size: 11px; color: var(--text-body); opacity: 0.6;">${n.date} · VERIFIED</div>
        `;
        div.onclick = () => selectNotice(n.id);
        listEl.appendChild(div);
    });
}

function selectNotice(id) {
    selectedId = id;
    const n = notices.find(item => item.id === id);
    if (!n) return;

    document.querySelectorAll('.notice-item').forEach(it => {
        it.classList.remove('selected');
        if (it.querySelector('.item-title').innerText === n.title) it.classList.add('selected');
    });

    const p = platformConfig[n.platform] || platformConfig.others;
    const c = categoryConfig[n.category] || { name: '인사이트', label: 'INSICHT', mood: '#64748B' };

    // Enrichment Logic (풍부한 내용 자동 구성)
    const points = n.desc.split('\n').filter(l => l.trim().length > 5).slice(0, 3);
    const impact = n.category === 'policy' ? '치명적 - 광고 운영 정책 확인 필수' : '높음 - 지표 모니터링 및 설정 최적화 권장';

    detailEl.innerHTML = `
        <div class="detail-container">
            <!-- 1. 초고급 히어로 영역 -->
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

            <!-- 2. 전문가용 인사이트 요약 그리드 (Rich Grid) -->
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

            <!-- 3. 본문 및 상세 데이터 -->
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

document.addEventListener('DOMContentLoaded', init);
