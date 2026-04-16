const platformConfig = {
    naver: { name: '네이버', color: '#03C75A' },
    kakao: { name: '카카오', color: '#FFCD00' },
    google: { name: '구글', color: '#4285F4' },
    meta: { name: '메타', color: '#0668E1' },
    daangn: { name: '당근', color: '#FF7E36' },
    others: { name: '기타', color: '#A855F7' }
};

const categoryConfig = {
    notice: { name: '공지사항' },
    product: { name: '업데이트' },
    policy: { name: '정책센터' },
    error: { name: '이슈리포트' }
};

let notices = [];
let currentPlatform = 'all';
let currentCategory = 'all';

// DOM Elements
const noticeGrid = document.getElementById('notice-grid');
const resultsCount = document.querySelector('.results-count span');
const platformTabs = document.querySelectorAll('.platform-tab');
const categoryTabs = document.querySelectorAll('.category-tab');
const modal = document.getElementById('notice-modal');
const modalClose = document.getElementById('modal-close');

async function init() {
    setupEventListeners();
    await loadData();
}

async function loadData() {
    try {
        const response = await fetch('notices.json?t=' + Date.now());
        if (!response.ok) throw new Error();
        notices = await response.json();
    } catch (e) {
        console.error("Using internal data...");
        // This is a safety net
        notices = [
            { id: 'n1', platform: 'naver', title: '[공지] 네이버 검색광고 서버 정기 점검 안내', date: '2026.04.16', category: 'notice', desc: '보다 안정적인 서비스를 위해 서버 점검을 진행합니다.', url: 'https://searchad.naver.com/' },
            { id: 'k1', platform: 'kakao', title: '[소식] 카카오 비즈니스 통합 관리 센터 오픈', date: '2026.04.16', category: 'product', desc: '광고와 채널관리를 한눈에 볼 수 있는 센터가 오픈되었습니다.', url: 'https://business.kakao.com/' },
            { id: 'm1', platform: 'meta', title: '[News] Scaling your business with AI-powered Ads', date: '2026.04.16', category: 'product', desc: 'Learn how to leverage new AI tools in Meta Ads Manager.', url: 'https://www.facebook.com/business' }
        ];
    }
    render();
}

function setupEventListeners() {
    platformTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            platformTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPlatform = tab.dataset.platform;
            render();
        });
    });

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            render();
        });
    });

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

function render() {
    const filtered = notices.filter(n => {
        const pMatch = currentPlatform === 'all' || n.platform === currentPlatform;
        const cMatch = currentCategory === 'all' || n.category === currentCategory;
        return pMatch && cMatch;
    });

    resultsCount.textContent = filtered.length;
    noticeGrid.innerHTML = '';

    filtered.forEach(n => {
        const p = platformConfig[n.platform] || platformConfig.others;
        const c = categoryConfig[n.category] || { name: '공지' };
        
        const card = document.createElement('div');
        card.className = 'notice-card';
        card.innerHTML = `
            <div class="card-top">
                <span class="platform-badge" style="background: ${p.color}20; color: ${p.color}">${p.name}</span>
                <span class="card-date">${n.date}</span>
            </div>
            <h3 class="card-title">${n.title}</h3>
            <p class="card-summary">${n.desc || '상세 내용이 없습니다.'}</p>
            <div class="card-footer">
                <span class="tag">#${c.name}</span>
                <button class="btn-detail">상세보기</button>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(n));
        noticeGrid.appendChild(card);
    });
}

function openModal(n) {
    const p = platformConfig[n.platform] || platformConfig.others;
    document.getElementById('modal-platform').textContent = p.name;
    document.getElementById('modal-platform').style.color = p.color;
    document.getElementById('modal-date').textContent = n.date;
    document.getElementById('modal-title').textContent = n.title;
    document.getElementById('modal-category').textContent = categoryConfig[n.category]?.name || '공지사항';
    document.getElementById('modal-body-content').textContent = n.desc || '상세 내용이 없습니다.';
    document.getElementById('modal-link').href = n.url || '#';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', init);
