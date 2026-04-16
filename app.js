// Data state
let notices = [];

// Fallback data in case notices.json is not yet generated or fails to load
const fallbackNotices = [
    {
        id: 'fallback-1',
        platform: 'naver',
        category: 'notice',
        productType: 'search',
        title: '실시간 데이터를 불러오는 중입니다...',
        desc: 'GitHub Actions가 데이터를 수집할 때까지 잠시만 기다려주세요.',
        content: '프로젝트를 GitHub에 업로드하면 6시간마다 자동으로 공지사항이 업데이트됩니다.',
        url: 'https://searchad.naver.com/',
        date: '2026.04.16'
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
async function init() {
    console.log('Premium Ads Notice Dashboard Initializing...');
    setupEventListeners();
    
    try {
        const response = await fetch('notices.json?v=' + Date.now());
        if (!response.ok) throw new Error('DATA_LOAD_FAIL');
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            notices = data;
            console.log('Real-time data synced successfully.');
        } else {
            console.warn('JSON file is empty. Using embedded core data.');
            notices = fallbackNotices;
        }
    } catch (error) {
        console.warn('Could not fetch notices.json. Displaying pre-loaded real notices.', error);
        notices = fallbackNotices;
    }
    
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
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 100px 0;">
                <span class="material-icons-round" style="font-size: 80px; color: var(--text-dim); opacity: 0.2;">auto_awesome_motion</span>
                <h2 style="margin-top: 20px; color: var(--text-secondary);">현재 조건에 맞는 소식이 없습니다.</h2>
                <p style="color: var(--text-dim);">필터를 변경하거나 검색어를 다르게 입력해 보세요.</p>
            </div>
        `;
        return;
    }

    filtered.forEach((notice, index) => {
        const pConf = platformConfig[notice.platform] || platformConfig['others'];
        const cConf = categoryConfig[notice.category] || { name: '공지', color: '#666' };

        const card = document.createElement('div');
        card.className = 'notice-card';
        card.style.animationDelay = `${index * 0.08}s`;

        card.innerHTML = `
            <div class="card-top">
                <span class="platform-badge" style="background: ${pConf.color}15; color: ${pConf.color}; border: 1px solid ${pConf.color}30;">
                    ${pConf.name}
                </span>
                <span class="card-date">${notice.date}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${notice.title}</h3>
                <p class="card-summary">${notice.desc}</p>
            </div>
            <div class="card-footer">
                <span class="tag" style="background: rgba(255,255,255,0.03); color: var(--text-dim); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">
                    #${cConf.name}
                </span>
                <button class="btn-detail" onclick="event.stopPropagation(); openModal('${notice.id}')">
                    상세보기
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(notice.id));
        noticeGrid.appendChild(card);
    });
}

// Run
document.addEventListener('DOMContentLoaded', init);
