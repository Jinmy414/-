const STORAGE_KEY = 'luoban-static-v1';

const TYPE_OPTIONS = ['原创', '轻改', '漫改', '游戏改', '游戏', '小说', '特摄', '机战', '异世界', '热血', '奇幻', '玄幻', '科幻', '校园', '搞笑', '日常', '恋爱', '百合', '运动', '智斗', '偶像', '职场', '悬疑', '治愈', '冒险', '剧情', '动作', '历史', '推理', '后宫', '音乐', '犯罪'];
const REGION_OPTIONS = ['中国', '日本', '欧美', '其他'];
const YEAR_OPTIONS = ['80年代及以前', '90年代', '00年代', '10年代', '20年代'];
const POSTER_OPTIONS = {
  mint: 'linear-gradient(145deg, #b8d7cc 0%, #4d8d7b 48%, #0f4f47 100%)',
  dusk: 'linear-gradient(145deg, #f2b28f 0%, #bd6d5d 46%, #5d373a 100%)',
  sky: 'linear-gradient(145deg, #b7d8df 0%, #6099a4 48%, #28556a 100%)',
  lavender: 'linear-gradient(145deg, #d8c9dc 0%, #9b789c 50%, #4d405d 100%)',
  lemon: 'linear-gradient(145deg, #f2e4a9 0%, #b5aa55 48%, #566331 100%)',
  ink: 'linear-gradient(145deg, #9ab1b2 0%, #4f6869 46%, #1e3036 100%)'
};

const SEED_WORKS = [...(window.LUOBAN_BANGUMI_WORKS || []),
  { id: 'tide-letter', title: '潮汐信使', year: 2024, region: '中国', types: ['原创', '奇幻', '恋爱'], rating: 9.1, votes: 28, ratingSum: 254.8, poster: POSTER_OPTIONS.mint, coverImage: '', summary: '一封寄往未来的信，让两个隔着潮汐的人在一座海边小城里相遇。', createdBy: 'demo', comments: [
    { id: 'c1', user: 'riko', text: '海风、留白和配乐都刚刚好，最后一集看完很久没有说话。', likes: 32, date: '2026-08-21' },
    { id: 'c2', user: 'demo', text: '喜欢它把奇幻写得很轻，像生活里突然亮了一盏灯。', likes: 18, date: '2026-08-23' }
  ] },
  { id: 'summer-radio', title: '夏日留声机', year: 2023, region: '日本', types: ['原创', '校园', '日常'], rating: 8.8, votes: 17, ratingSum: 149.6, poster: POSTER_OPTIONS.sky, coverImage: '', summary: '旧唱片店里播放的每一首歌，都对应着一段没有说完的青春。', createdBy: 'riko', comments: [
    { id: 'c3', user: 'mulberry', text: '很适合夏天看的作品，细节多到想二刷。', likes: 21, date: '2026-07-15' }
  ] },
  { id: 'zero-garden', title: '零号花园', year: 2025, region: '欧美', types: ['科幻', '智斗', '原创'], rating: 9.3, votes: 36, ratingSum: 334.8, poster: POSTER_OPTIONS.ink, coverImage: '', summary: '城市的每个角落都长出了会记录记忆的植物，只有一座花园没有编号。', createdBy: 'demo', comments: [
    { id: 'c4', user: 'riko', text: '概念很漂亮，而且没有为了反转牺牲人物。', likes: 27, date: '2026-08-30' }
  ] },
  { id: 'mountain-shop', title: '山海便利店', year: 2022, region: '中国', types: ['原创', '奇幻', '搞笑'], rating: 8.6, votes: 9, ratingSum: 77.4, poster: POSTER_OPTIONS.lemon, coverImage: '', summary: '凌晨两点以后，只有迷路的人和山里的精怪能找到这家店。', createdBy: 'mulberry', comments: [
    { id: 'c5', user: 'demo', text: '每集都像一碗热汤，轻松但不空。', likes: 15, date: '2026-06-02' }
  ] },
  { id: 'moon-post', title: '月面邮局', year: 2021, region: '欧美', types: ['轻改', '科幻', '日常'], rating: 9.0, votes: 3, ratingSum: 27, poster: POSTER_OPTIONS.lavender, coverImage: '', summary: '月球背面有一家邮局，替人们投递那些来不及说出口的话。', createdBy: 'riko', comments: [
    { id: 'c6', user: 'sora', text: '很温柔的一部，像在黑夜里收到一张明信片。', likes: 24, date: '2026-08-04' }
  ] },
  { id: 'mist-island', title: '雾岛来信', year: 2020, region: '日本', types: ['漫改', '恋爱', '悬疑'], rating: 8.7, votes: 2, ratingSum: 17.4, poster: POSTER_OPTIONS.dusk, coverImage: '', summary: '每年雾起时，岛上都会收到一封来自十年前的信。', createdBy: 'mulberry', comments: [
    { id: 'c7', user: 'demo', text: '前半段像散文，后半段的情绪收得很漂亮。', likes: 13, date: '2026-05-12' }
  ] },
  { id: 'cinema-town', title: '小镇放映室', year: 2019, region: '中国', types: ['原创', '日常', '职场'], rating: 8.4, votes: 6, ratingSum: 50.4, poster: POSTER_OPTIONS.sky, coverImage: '', summary: '一家快要关门的电影院，和一群舍不得离开的观众。', createdBy: 'demo', comments: [] },
  { id: 'daylight-route', title: '白昼航线', year: 2024, region: '欧美', types: ['原创', '热血', '运动'], rating: 8.9, votes: 12, ratingSum: 106.8, poster: POSTER_OPTIONS.mint, coverImage: '', summary: '一支临时组成的帆船队，决定穿过一片没有航线的海。', createdBy: 'riko', comments: [] },
  { id: 'orange-lab', title: '橘子汽水研究所', year: 2018, region: '日本', types: ['游戏改', '校园', '搞笑'], rating: 8.1, votes: 3, ratingSum: 24.3, poster: POSTER_OPTIONS.lemon, coverImage: '', summary: '校园里最不靠谱的社团，认真研究着汽水、友情和夏天。', createdBy: 'mulberry', comments: [] },
  { id: 'paper-universe', title: '纸上宇宙', year: 2016, region: '中国', types: ['原创', '玄幻', '智斗'], rating: 7.9, votes: 5, ratingSum: 39.5, poster: POSTER_OPTIONS.lavender, coverImage: '', summary: '画在纸上的星球开始运行，而画它的人被请去担任观测员。', createdBy: 'demo', comments: [] },
  { id: 'echo-far', title: '远方的回声', year: 2014, region: '其他', types: ['特摄', '科幻', '热血'], rating: 7.6, votes: 4, ratingSum: 30.4, poster: POSTER_OPTIONS.ink, coverImage: '', summary: '一台只能接收未来信号的旧收音机，改变了四个人的选择。', createdBy: 'sora', comments: [] },
  { id: 'night-orbit', title: '夜航轨道', year: 2011, region: '欧美', types: ['机战', '原创', '热血'], rating: 8.2, votes: 7, ratingSum: 57.4, poster: POSTER_OPTIONS.dusk, coverImage: '', summary: '在城市熄灯之后，夜航员们守护着一条看不见的轨道。', createdBy: 'riko', comments: [] }
];

const defaultState = {
  currentUser: null,
  users: [
    { username: 'demo', password: 'luoban', favoriteIds: ['tide-letter', 'zero-garden', 'mountain-shop'] },
    { username: 'riko', password: 'riko', favoriteIds: ['summer-radio', 'moon-post'] },
    { username: 'mulberry', password: 'mulberry', favoriteIds: ['mist-island', 'orange-lab'] }
  ],
  works: SEED_WORKS,
  query: '',
  filters: { types: [], regions: [], years: [], score: 0 },
  sort: 'hot'
};

let state = loadState();
let authMode = 'login';
let selectedRating = null;
let featuredPopularIds = [];
let featuredNicheIds = [];
let toastTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    const seedWorks = structuredClone(SEED_WORKS);
    const savedWorks = Array.isArray(saved.works) ? saved.works : [];
    const savedById = new Map(savedWorks.map(work => [work.id, work]));
    const mergedWorks = [
      ...seedWorks.map(seed => savedById.has(seed.id) ? { ...seed, ...savedById.get(seed.id), comments: Array.isArray(savedById.get(seed.id).comments) ? savedById.get(seed.id).comments : seed.comments } : seed),
      ...savedWorks.filter(work => !seedWorks.some(seed => seed.id === work.id))
    ];
    return {
      ...structuredClone(defaultState),
      ...saved,
      filters: { ...defaultState.filters, ...(saved.filters || {}) },
      users: Array.isArray(saved.users) ? saved.users : defaultState.users,
      works: mergedWorks.length ? mergedWorks : seedWorks
    };
  } catch { return structuredClone(defaultState); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getWork(id) { return state.works.find(work => work.id === id); }
function getUser(username) { return state.users.find(user => user.username === username); }
function currentRoute() { return location.hash.slice(1) || 'home'; }
function currentUser() { return state.currentUser ? getUser(state.currentUser) : null; }
function userInitial(username = '客') { return username.slice(0, 1).toUpperCase(); }
function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function safeImage(value = '') { return /^https?:\/\//i.test(value) ? value : ''; }
function formatRating(value) { return Number(value || 0).toFixed(1); }
function displayRating(work) { return state.sort === 'score' ? work.rating : Math.min(10, work.rating + (work.votes > 4 ? 1 : 0)); }
function yearBucket(year) {
  if (year <= 1989) return '80年代及以前';
  if (year <= 1999) return '90年代';
  if (year <= 2009) return '00年代';
  if (year <= 2019) return '10年代';
  return '20年代';
}
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
function refreshFeatured() {
  const popular = state.works.filter(work => work.votes > 4 && work.rating > 8);
  const niche = state.works.filter(work => work.votes <= 4 && work.rating > 8);
  featuredPopularIds = shuffle(popular).slice(0, 3).map(work => work.id);
  featuredNicheIds = shuffle(niche).slice(0, 3).map(work => work.id);
}

function coverMarkup(work, extraClass = '') {
  const image = safeImage(work.coverImage);
  const style = image ? `style="background-image:url('${escapeHTML(image)}')"` : `style="--cover:${work.poster || POSTER_OPTIONS.mint}"`;
  return `<div class="work-cover ${extraClass} ${image ? 'has-image' : ''}" ${style}>
    <span class="cover-symbol">${escapeHTML(work.title.slice(0, 1))}</span>
    <span class="cover-title">${escapeHTML(work.title)}</span>
  </div>`;
}

function workCard(work, feature = false) {
  const tagHTML = work.types.slice(0, 3).map(type => `<span class="type-tag">${escapeHTML(type)}</span>`).join('');
  const hotTag = work.votes >= 4 ? '<span class="type-tag hot">热门</span>' : '<span class="type-tag">冷门</span>';
  if (feature) return `<article class="feature-card" data-open-work="${work.id}">
    ${coverMarkup(work)}
    <div class="feature-info"><strong>${escapeHTML(work.title)}</strong><div class="feature-meta"><span>${work.year} · ${escapeHTML(work.region)}</span><span class="rating">${formatRating(displayRating(work))}</span></div></div>
  </article>`;
  return `<article class="work-card" data-open-work="${work.id}">
    ${coverMarkup(work)}
    <div class="feature-info"><strong>${escapeHTML(work.title)}</strong><div class="feature-meta"><span>${work.year} · ${escapeHTML(work.region)}</span><span class="rating">${formatRating(displayRating(work))}</span></div><div class="type-list">${tagHTML}${hotTag}</div></div>
  </article>`;
}

function renderHeader() {
  const route = currentRoute();
  const active = route.startsWith('profile') ? 'profile' : route.startsWith('create') || route.startsWith('edit') ? 'create' : 'home';
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
  const user = currentUser();
  document.getElementById('headerUser').innerHTML = user
    ? `<button class="user-button" type="button" data-nav-profile="${escapeHTML(user.username)}"><span class="avatar">${userInitial(user.username)}</span><span>${escapeHTML(user.username)}</span></button><button class="text-link" type="button" data-logout>退出</button>`
    : '<button class="login-link" type="button" data-login>登录 / 注册</button>';
  const search = document.getElementById('globalSearch');
  if (search && search.value !== state.query) search.value = state.query;
}

function renderHome() {
  const filtered = filteredWorks();
  const popular = featuredPopularIds.map(getWork).filter(Boolean);
  const niche = featuredNicheIds.map(getWork).filter(Boolean);
  return `<section class="hero">
    <div class="hero-copy"><div class="hero-rail"><span class="hero-seal">罗瓣</span><span>作品档案 · 2026</span></div><h1>把喜欢的作品，<br /><em>安放在潮汐里。</em></h1><p class="hero-intro">一座给动画、电影、书和游戏的安静档案馆。搜索一部作品，也搜索别人记住它的理由。</p><div class="hero-actions"><button class="button button-primary" type="button" data-scroll="discover">开始发现 <span>↘</span></button><button class="button button-ghost" type="button" data-open-create>放进一部作品</button></div><div class="hero-stats"><div class="stat"><strong>${state.works.length}</strong><span>正在被记录的作品</span></div><div class="stat"><strong>${state.works.reduce((sum, work) => sum + work.comments.length, 0)}</strong><span>留下的片段</span></div><div class="stat"><strong>0.5</strong><span>评分最小刻度</span></div></div></div>
    <div class="hero-art"><span class="art-label">LUOBAN / ARCHIVE 01</span><div class="art-orbit art-orbit-one"></div><div class="art-orbit art-orbit-two"></div><div class="art-logo-frame"><img src="assets/logo-snail.png" alt="罗瓣 logo" /></div><span class="art-caption">见喜欢，见自己</span><span class="art-note">a quiet archive<br />for loud feelings</span></div>
  </section>
  <section id="discover" class="discover-section"><div class="section-heading"><div><span class="section-index">01 / 今日记录</span><h2>先从一部作品开始</h2><p>每次打开，遇见 3 部热门高分和 3 部冷门高分作品。</p></div><span class="text-link section-date">随机漫游中 · ${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span></div>
    <div class="split-heading"><h2>热门高分</h2><span class="tag">评分人数 &gt; 4</span><span class="line"></span></div><div class="feature-grid">${popular.length ? popular.map(work => workCard(work, true)).join('') : '<div class="empty-state">还没有足够的热门高分作品。</div>'}</div>
    <div class="split-heading"><h2>冷门高分</h2><span class="tag">评分人数 ≤ 4</span><span class="line"></span></div><div class="feature-grid">${niche.length ? niche.map(work => workCard(work, true)).join('') : '<div class="empty-state">再留下几份评分，这里会长出新的推荐。</div>'}</div>
  </section>
  <section class="works-section"><div class="section-heading"><div><span class="section-index">02 / 全部记录</span><h2>按你的方式找作品</h2><p>搜索标题、类型或地区，用标签收拢兴趣。</p></div></div>${renderFilters()}<div class="works-grid">${filtered.length ? filtered.map(work => workCard(work)).join('') : '<div class="empty-state"><strong>没有找到匹配的作品</strong>换个关键词或放宽筛选条件试试。<br /><button class="button button-ghost button-small" type="button" data-clear-filters>清除筛选</button></div>'}</div></section>`;
}

function renderFilters() {
  const f = state.filters;
  const chip = (kind, value, selected) => `<button class="filter-chip ${selected ? 'is-selected' : ''}" type="button" data-filter-${kind}="${escapeHTML(value)}">${escapeHTML(value)}</button>`;
  const exactYears = Array.from({ length: 16 }, (_, i) => 2010 + i).filter(year => year <= new Date().getFullYear());
  return `<div class="filter-panel">
    <div class="filter-row"><span class="filter-label">类型</span><div class="filter-options">${TYPE_OPTIONS.map(value => chip('type', value, f.types.includes(value))).join('')}</div></div>
    <div class="filter-row"><span class="filter-label">地区</span><div class="filter-options">${REGION_OPTIONS.map(value => chip('region', value, f.regions.includes(value))).join('')}</div></div>
    <div class="filter-row"><span class="filter-label">年代</span><div class="filter-options">${YEAR_OPTIONS.map(value => chip('year', value, f.years.includes(value))).join('')}<select class="select-compact" id="exactYear" aria-label="选择具体年份"><option value="">具体年份</option>${exactYears.map(year => `<option value="${year}" ${f.years.includes(String(year)) ? 'selected' : ''}>${year}</option>`).join('')}</select></div></div>
    <div class="filter-row"><span class="filter-label">评分</span><div class="score-filter"><input id="scoreRange" type="range" min="0" max="10" step="0.5" value="${f.score}" aria-label="最低评分" /><span class="score-value">${f.score ? `${f.score} 分以上` : '不限评分'}</span></div></div>
    <div class="sort-bar"><div class="sort-tabs"><button class="sort-tab ${state.sort === 'hot' ? 'is-selected' : ''}" type="button" data-sort="hot">热门优先</button><button class="sort-tab ${state.sort === 'score' ? 'is-selected' : ''}" type="button" data-sort="score">高分优先</button><button class="sort-tab ${state.sort === 'new' ? 'is-selected' : ''}" type="button" data-sort="new">最新加入</button></div><span class="result-count">${filteredWorks().length} 部作品 · ${state.sort === 'score' ? '按真实评分' : '热门作品展示分 +1'}</span></div>
  </div>`;
}

function filteredWorks() {
  const f = state.filters;
  const query = state.query.trim().toLowerCase();
  const result = state.works.filter(work => {
    const searchable = [work.title, work.region, ...work.types].join(' ').toLowerCase();
    const typeMatch = !f.types.length || f.types.some(type => work.types.includes(type));
    const regionMatch = !f.regions.length || f.regions.includes(work.region);
    const yearMatch = !f.years.length || f.years.some(year => String(work.year) === year || yearBucket(work.year) === year);
    const scoreMatch = !f.score || work.rating >= Number(f.score);
    return (!query || searchable.includes(query)) && typeMatch && regionMatch && yearMatch && scoreMatch;
  });
  return result.sort((a, b) => state.sort === 'score' ? b.rating - a.rating : state.sort === 'new' ? b.year - a.year : (b.votes * b.rating) - (a.votes * a.rating));
}

function renderProfile(username = state.currentUser) {
  const user = getUser(username) || { username, favoriteIds: [] };
  const own = currentUser()?.username === username;
  const favorites = (user.favoriteIds || []).map(getWork).filter(Boolean).slice(0, 3);
  const comments = state.works.flatMap(work => work.comments.map(comment => ({ ...comment, work }))).filter(item => item.user === username).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const created = state.works.filter(work => work.createdBy === username);
  return `<section class="page-intro"><div class="eyebrow">Profile / ${escapeHTML(username)}</div><h1>${own ? '我的罗瓣' : `${escapeHTML(username)} 的罗瓣`}</h1><p>${own ? '把最喜欢的三部作品和最近留下的话，整理成一张小小的名片。' : '看看这个人最近喜欢什么，也许会发现同一片海。'}</p></section>
    <div class="profile-layout"><aside class="profile-aside"><div class="profile-avatar">${userInitial(username)}</div><h2>${escapeHTML(username)}</h2><div class="profile-handle">@${escapeHTML(username)} · ${own ? '这是你的主页' : '罗瓣用户'}</div><div class="profile-stats"><div class="profile-stat"><strong>${favorites.length}</strong><span>最爱作品</span></div><div class="profile-stat"><strong>${comments.length}</strong><span>展示评论</span></div><div class="profile-stat"><strong>${created.length}</strong><span>创建作品</span></div><div class="profile-stat"><strong>${state.works.reduce((sum, work) => sum + work.comments.filter(comment => comment.user === username).reduce((n, comment) => n + comment.likes, 0), 0)}</strong><span>收到赞</span></div></div>${own ? '<button class="button button-ghost button-wide" type="button" data-toggle-settings style="margin-top:20px">编辑个人信息</button>' : ''}</aside>
      <div class="profile-main"><section class="profile-section"><h3>三部最爱</h3><div class="favorite-grid">${favorites.length ? favorites.map(work => workCard(work, true)).join('') : '<div class="empty-state">还没有收藏作品。</div>'}</div></section><section class="profile-section"><h3>最近留下的三句话</h3><div class="comment-list">${comments.length ? comments.map(item => `<article class="comment-preview"><div class="comment-preview-top"><span>评论了 <button class="text-link" type="button" data-open-work="${item.work.id}">${escapeHTML(item.work.title)}</button></span><span>${escapeHTML(item.date)} · 赞 ${item.likes}</span></div><p>${escapeHTML(item.text)}</p></article>`).join('') : '<div class="empty-state">还没有公开评论。</div>'}</div></section>${own ? renderProfileSettings(user) : ''}</div></div>`;
}

function renderProfileSettings(user) {
  return `<section class="profile-section is-hidden" id="profileSettings"><h3>个人信息</h3><form class="editor-card editor-grid" id="profileForm"><label>用户名<input name="username" value="${escapeHTML(user.username)}" autocomplete="username" required /></label><label>新密码<input name="password" type="password" placeholder="留空则不修改" autocomplete="new-password" /></label><div class="form-actions"><span class="form-error" id="profileError"></span><button class="button button-primary" type="submit">保存修改</button></div></form></section>`;
}

function renderEditor(editId = '') {
  const user = currentUser();
  if (!user) return loginRequired('登录后创建或编辑作品', '拥有账号后，你可以记录自己的作品，也可以继续完善它。');
  const work = editId ? getWork(editId) : null;
  if (work && work.createdBy !== user.username && user.username !== 'admin') return `<div class="login-required"><div class="mini-symbol">↺</div><h2>这部作品属于 ${escapeHTML(work.createdBy)}</h2><p>只能编辑自己创建的作品，管理员可以编辑所有作品。</p><button class="button button-ghost" type="button" data-back-home>回到发现页</button></div>`;
  const selectedTypes = work?.types || ['原创'];
  const posterName = Object.entries(POSTER_OPTIONS).find(([, value]) => value === work?.poster)?.[0] || 'mint';
  return `<section class="page-intro"><div class="eyebrow">Create / Curate</div><h1>${work ? '编辑作品' : '创建一部作品'}</h1><p>${work ? '把信息补充完整，让更多人知道它为什么值得被记住。' : '先留下名字和基本信息，封面和故事都可以以后慢慢补。'}</p></section><div class="editor-shell"><form class="editor-card editor-grid" id="workForm" data-edit-id="${editId}"><label class="full">作品名称<input name="title" value="${escapeHTML(work?.title || '')}" required placeholder="例如：一封寄往未来的信" /></label><label>作品类型<select name="types" multiple size="5" required>${TYPE_OPTIONS.map(type => `<option value="${escapeHTML(type)}" ${selectedTypes.includes(type) ? 'selected' : ''}>${escapeHTML(type)}</option>`).join('')}</select><small class="form-hint">按住 Ctrl / Command 可多选类型</small></label><label>地区<select name="region" required>${REGION_OPTIONS.map(region => `<option value="${region}" ${work?.region === region ? 'selected' : ''}>${region}</option>`).join('')}</select></label><label>年份<input name="year" type="number" min="1900" max="2100" value="${work?.year || new Date().getFullYear()}" required /></label><label>封面风格<select name="poster">${Object.keys(POSTER_OPTIONS).map(key => `<option value="${key}" ${key === posterName ? 'selected' : ''}>${{ mint: '青苔绿', dusk: '晚霞橘', sky: '晴空蓝', lavender: '雾紫色', lemon: '柠檬黄', ink: '墨夜蓝' }[key]}</option>`).join('')}</select></label><label class="full">封面图片地址 <span class="form-hint">可选，使用公开图片 URL</span><input name="coverImage" type="url" value="${escapeHTML(work?.coverImage || '')}" placeholder="https://..." /></label><label class="full">一句话介绍<textarea name="summary" placeholder="用一句话说说它是什么。">${escapeHTML(work?.summary || '')}</textarea></label><div class="form-actions"><button class="button button-ghost" type="button" data-back-home>取消</button><button class="button button-primary" type="submit">${work ? '保存作品' : '发布作品'}</button></div></form></div>`;
}

function loginRequired(title, description) {
  return `<div class="login-required"><div class="mini-symbol">✦</div><h2>${title}</h2><p>${description}</p><button class="button button-primary" type="button" data-login>登录 / 注册</button></div>`;
}

function renderDetail(id) {
  const work = getWork(id);
  if (!work) return `<div class="empty-state"><strong>找不到这部作品</strong><button class="button button-ghost" type="button" data-back-home>回到发现页</button></div>`;
  const user = currentUser();
  const favorite = user?.favoriteIds?.includes(work.id);
  const canEdit = user && (user.username === work.createdBy || user.username === 'admin');
  const sortedComments = [...work.comments].sort((a, b) => b.likes - a.likes || b.text.length - a.text.length);
  const ratingButtons = Array.from({ length: 21 }, (_, i) => i / 2).map(score => `<button class="rating-option ${selectedRating === score ? 'is-selected' : ''}" type="button" data-rating="${score}">${score % 1 ? score.toFixed(1) : score}</button>`).join('');
  return `<a class="back-link" href="#home">← 返回发现</a><section class="detail-hero"><div class="detail-cover">${coverMarkup(work)}</div><div class="detail-copy"><div class="eyebrow">Work / ${escapeHTML(work.region)}</div><h1>${escapeHTML(work.title)}</h1><div class="detail-meta"><span>${work.year}</span><span>${escapeHTML(work.region)}</span>${work.types.map(type => `<span>${escapeHTML(type)}</span>`).join('')}</div><p class="detail-summary">${escapeHTML(work.summary || '这部作品还没有一句介绍，等你来补充。')}</p><div class="detail-score"><strong>${formatRating(work.rating)}</strong><span>真实评分<br />${work.votes} 人参与</span></div><div class="detail-actions"><button class="button ${favorite ? 'button-coral' : 'button-ghost'} button-small" type="button" data-favorite="${work.id}">${favorite ? '♥ 已收藏' : '♡ 收藏到我的罗瓣'}</button>${canEdit ? `<button class="button button-ghost button-small" type="button" data-edit-work="${work.id}">编辑作品</button>` : ''}</div></div></section><section class="detail-columns"><div><section class="detail-section"><h2>留下你的分数</h2><div class="rating-box"><p>从 0 到 10，每次半分都算数。${user ? '' : '登录后即可评分。'}</p><div class="rating-options">${ratingButtons}</div><div style="margin-top:13px"><button class="button button-primary button-small" type="button" data-submit-rating="${work.id}">提交评分</button></div></div></section><section class="detail-section"><h2>评论 <span class="result-count">${work.comments.length}</span></h2>${user ? `<form class="comment-form" id="commentForm" data-work-id="${work.id}"><textarea name="text" required placeholder="说说你为什么记住它……"></textarea><div style="display:flex;justify-content:flex-end"><button class="button button-primary button-small" type="submit">发布评论</button></div></form>` : loginRequired('想留下一句话吗？', '登录后可以评分、评论，也能给别人的评论点个赞。')}<div class="detail-comment-list">${sortedComments.length ? sortedComments.map(comment => `<article class="detail-comment"><div class="detail-comment-top"><button class="comment-author" type="button" data-open-profile="${escapeHTML(comment.user)}">${userInitial(comment.user)} ${escapeHTML(comment.user)}</button><span class="comment-date">${escapeHTML(comment.date)}</span></div><p>${escapeHTML(comment.text)}</p><button class="like-button ${user && comment.likedBy?.includes(user.username) ? 'is-liked' : ''}" type="button" data-like-comment="${work.id}" data-comment-id="${comment.id}">♥ ${comment.likes}</button></article>`).join('') : '<div class="empty-state">还没有评论，来做第一个说话的人。</div>'}</div></section></div><aside><section class="detail-section"><h2>作品信息</h2><div class="info-list"><div class="info-row"><span>类型</span><span>${work.types.map(escapeHTML).join(' / ')}</span></div><div class="info-row"><span>地区</span><span>${escapeHTML(work.region)}</span></div><div class="info-row"><span>年份</span><span>${work.year}</span></div><div class="info-row"><span>创建者</span><span><button class="text-link" type="button" data-open-profile="${escapeHTML(work.createdBy)}">${escapeHTML(work.createdBy)}</button></span></div>${work.sourceUrl ? `<div class="info-row"><span>资料来源</span><a class="text-link" href="${escapeHTML(work.sourceUrl)}" target="_blank" rel="noopener">Bangumi</a></div>` : ''}<div class="info-row"><span>自动标签</span><span>${autoTags(work).join(' / ')}</span></div></div></section><section class="detail-section"><h2>也许你会喜欢</h2><div class="comment-list">${state.works.filter(item => item.id !== work.id && item.types.some(type => work.types.includes(type))).slice(0, 3).map(item => `<button class="button button-ghost" style="justify-content:space-between" type="button" data-open-work="${item.id}"><span>${escapeHTML(item.title)}</span><span class="rating">${formatRating(item.rating)}</span></button>`).join('')}</div></section></aside></section>`;
}

function autoTags(work) {
  const tags = [work.votes >= 4 ? '热门' : '冷门', work.rating > 8 ? '高分' : '', work.rating < 4 ? '赤石' : ''].filter(Boolean);
  return tags.length ? tags : ['待观察'];
}

function renderApp() {
  renderHeader();
  const route = currentRoute();
  const app = document.getElementById('app');
  selectedRating = null;
  if (route === 'home') app.innerHTML = renderHome();
  else if (route === 'profile') app.innerHTML = currentUser() ? renderProfile() : loginRequired('登录后查看你的罗瓣', '收藏三部最爱作品，再留下三条最想被看见的评论。');
  else if (route.startsWith('profile-')) app.innerHTML = renderProfile(decodeURIComponent(route.slice(8)));
  else if (route === 'create') app.innerHTML = renderEditor();
  else if (route.startsWith('edit-')) app.innerHTML = renderEditor(route.slice(5));
  else if (route.startsWith('work-')) app.innerHTML = renderDetail(route.slice(5));
  else { location.hash = '#home'; return; }
  if (route !== 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigate(route) {
  if (location.hash === `#${route}`) renderApp();
  else location.hash = `#${route}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message; toast.classList.add('is-visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function openAuth(mode = 'login') {
  authMode = mode;
  document.getElementById('modalBackdrop').classList.remove('is-hidden');
  document.getElementById('modalBackdrop').setAttribute('aria-hidden', 'false');
  document.getElementById('authModal').classList.remove('is-hidden');
  document.getElementById('workModal').classList.add('is-hidden');
  document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.classList.toggle('is-active', tab.dataset.authTab === mode));
  document.getElementById('authTitle').textContent = mode === 'login' ? '登录后，开始留下你的分数' : '注册一个罗瓣用户名';
  document.getElementById('authSubmit').textContent = mode === 'login' ? '登录罗瓣' : '创建账号';
  document.getElementById('authHint').textContent = mode === 'login' ? '演示账号：demo / luoban' : '用户名需为不重复的英文名称，可含数字、下划线或短横线。';
  document.getElementById('authError').textContent = '';
  document.getElementById('authForm').reset();
  setTimeout(() => document.getElementById('authUsername').focus(), 0);
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.add('is-hidden');
  document.getElementById('modalBackdrop').setAttribute('aria-hidden', 'true');
}

function updateFilter(kind, value) {
  const list = state.filters[`${kind}s`];
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1); else list.push(value);
  saveState(); renderApp();
}

document.addEventListener('click', event => {
  const target = event.target;
  const openWork = target.closest('[data-open-work]');
  if (openWork) { navigate(`work-${openWork.dataset.openWork}`); return; }
  const openProfile = target.closest('[data-open-profile], [data-nav-profile]');
  if (openProfile) { navigate(`profile-${encodeURIComponent(openProfile.dataset.openProfile || openProfile.dataset.navProfile)}`); return; }
  if (target.closest('[data-login]')) { openAuth('login'); return; }
  if (target.closest('[data-open-create]')) { navigate('create'); return; }
  if (target.closest('[data-back-home]')) { navigate('home'); return; }
  if (target.closest('[data-close-modal]') || target.id === 'modalBackdrop') { closeModal(); return; }
  const authTab = target.closest('[data-auth-tab]');
  if (authTab) { openAuth(authTab.dataset.authTab); return; }
  const filterType = target.closest('[data-filter-type]'); if (filterType) { updateFilter('type', filterType.dataset.filterType); return; }
  const filterRegion = target.closest('[data-filter-region]'); if (filterRegion) { updateFilter('region', filterRegion.dataset.filterRegion); return; }
  const filterYear = target.closest('[data-filter-year]'); if (filterYear) { updateFilter('year', filterYear.dataset.filterYear); return; }
  const sort = target.closest('[data-sort]'); if (sort) { state.sort = sort.dataset.sort; saveState(); renderApp(); return; }
  if (target.closest('[data-clear-filters]')) { state.query = ''; state.filters = { types: [], regions: [], years: [], score: 0 }; saveState(); renderApp(); return; }
  const rate = target.closest('[data-rating]'); if (rate) { selectedRating = Number(rate.dataset.rating); document.querySelectorAll('[data-rating]').forEach(button => button.classList.toggle('is-selected', Number(button.dataset.rating) === selectedRating)); return; }
  const submitRating = target.closest('[data-submit-rating]');
  if (submitRating) {
    if (!currentUser()) { openAuth('login'); return; }
    if (selectedRating === null) { showToast('先选择一个分数吧'); return; }
    const work = getWork(submitRating.dataset.submitRating); const user = currentUser();
    work.userRatings = work.userRatings || {};
    const old = work.userRatings[user.username];
    if (old === undefined) { work.ratingSum += selectedRating; work.votes += 1; } else { work.ratingSum += selectedRating - old; }
    work.userRatings[user.username] = selectedRating; work.rating = work.votes ? work.ratingSum / work.votes : 0;
    saveState(); renderApp(); showToast(old === undefined ? '评分已记录，谢谢你的半分' : '评分已更新'); return;
  }
  const favorite = target.closest('[data-favorite]');
  if (favorite) {
    if (!currentUser()) { openAuth('login'); return; }
    const user = currentUser(); user.favoriteIds = user.favoriteIds || [];
    const index = user.favoriteIds.indexOf(favorite.dataset.favorite);
    if (index >= 0) { user.favoriteIds.splice(index, 1); showToast('已从最爱作品移除'); } else { if (user.favoriteIds.length >= 3) user.favoriteIds.shift(); user.favoriteIds.push(favorite.dataset.favorite); showToast('已放进你的三部最爱'); }
    saveState(); renderApp(); return;
  }
  const like = target.closest('[data-like-comment]');
  if (like) {
    if (!currentUser()) { openAuth('login'); return; }
    const work = getWork(like.dataset.likeComment); const comment = work.comments.find(item => item.id === like.dataset.commentId); const user = currentUser();
    comment.likedBy = comment.likedBy || [];
    const index = comment.likedBy.indexOf(user.username);
    if (index >= 0) { comment.likedBy.splice(index, 1); comment.likes = Math.max(0, comment.likes - 1); } else { comment.likedBy.push(user.username); comment.likes += 1; }
    saveState(); renderApp(); return;
  }
  const edit = target.closest('[data-edit-work]'); if (edit) { navigate(`edit-${edit.dataset.editWork}`); return; }
  if (target.closest('[data-logout]')) { state.currentUser = null; saveState(); navigate('home'); showToast('已安全退出'); return; }
  if (target.closest('[data-toggle-settings]')) { document.getElementById('profileSettings')?.classList.toggle('is-hidden'); return; }
  if (target.closest('[data-scroll]')) { document.getElementById(target.closest('[data-scroll]').dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); return; }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'headerSearch') { event.preventDefault(); state.query = new FormData(event.target).get('q')?.toString() || ''; saveState(); navigate('home'); return; }
  if (event.target.id === 'authForm') {
    event.preventDefault(); const form = new FormData(event.target); const username = form.get('username').toString().trim(); const password = form.get('password').toString(); const error = document.getElementById('authError');
    if (authMode === 'login') {
      const user = getUser(username); if (!user || user.password !== password) { error.textContent = '用户名或密码不正确，试试 demo / luoban。'; return; }
      state.currentUser = username; saveState(); closeModal(); renderApp(); showToast(`欢迎回来，${username}`);
    } else {
      if (!/^[A-Za-z][A-Za-z0-9_-]{1,19}$/.test(username)) { error.textContent = '用户名请使用 2-20 位英文、数字、下划线或短横线。'; return; }
      if (getUser(username)) { error.textContent = '这个用户名已经被使用了。'; return; }
      if (!password) { error.textContent = '请输入密码。'; return; }
      state.users.push({ username, password, favoriteIds: [] }); state.currentUser = username; saveState(); closeModal(); renderApp(); showToast('账号创建成功，欢迎来到罗瓣');
    }
    return;
  }
  if (event.target.id === 'commentForm') {
    event.preventDefault(); if (!currentUser()) { openAuth('login'); return; }
    const form = new FormData(event.target); const work = getWork(event.target.dataset.workId); work.comments.push({ id: `c-${Date.now()}`, user: currentUser().username, text: form.get('text').toString().trim(), likes: 0, date: new Date().toISOString().slice(0, 10) }); const user = currentUser(); user.commentCount = (user.commentCount || 0) + 1; saveState(); renderApp(); showToast('评论已经留下'); return;
  }
  if (event.target.id === 'workForm') {
    event.preventDefault(); const form = new FormData(event.target); const title = form.get('title').toString().trim(); const types = [...event.target.querySelector('[name="types"]').selectedOptions].map(option => option.value); const year = Number(form.get('year')); const region = form.get('region').toString(); const poster = POSTER_OPTIONS[form.get('poster').toString()] || POSTER_OPTIONS.mint; const coverImage = safeImage(form.get('coverImage').toString().trim()); const summary = form.get('summary').toString().trim();
    if (!title || !types.length || !year) { showToast('请填写作品名称、类型和年份'); return; }
    const editId = event.target.dataset.editId;
    if (editId) { const work = getWork(editId); Object.assign(work, { title, types, year, region, poster, coverImage, summary }); saveState(); navigate(`work-${editId}`); showToast('作品信息已更新'); }
    else { const id = `work-${Date.now()}`; state.works.unshift({ id, title, types, year, region, poster, coverImage, summary, rating: 0, votes: 0, ratingSum: 0, createdBy: currentUser().username, comments: [] }); saveState(); refreshFeatured(); navigate(`work-${id}`); showToast('作品已发布'); }
    return;
  }
  if (event.target.id === 'profileForm') {
    event.preventDefault(); const form = new FormData(event.target); const newUsername = form.get('username').toString().trim(); const password = form.get('password').toString(); const oldUsername = currentUser().username; const error = document.getElementById('profileError');
    if (!/^[A-Za-z][A-Za-z0-9_-]{1,19}$/.test(newUsername)) { error.textContent = '用户名请使用 2-20 位英文、数字、下划线或短横线。'; return; }
    if (newUsername !== oldUsername && getUser(newUsername)) { error.textContent = '这个用户名已经被使用了。'; return; }
    const user = currentUser(); user.username = newUsername; if (password) user.password = password; state.works.forEach(work => { if (work.createdBy === oldUsername) work.createdBy = newUsername; work.comments.forEach(comment => { if (comment.user === oldUsername) comment.user = newUsername; }); }); state.currentUser = newUsername; saveState(); renderApp(); showToast('个人信息已更新');
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'exactYear') { const value = event.target.value; if (value && !state.filters.years.includes(value)) state.filters.years.push(value); else if (!value) state.filters.years = state.filters.years.filter(year => !/^\d{4}$/.test(year)); saveState(); renderApp(); }
  if (event.target.id === 'scoreRange') { state.filters.score = Number(event.target.value); saveState(); renderApp(); }
});

window.addEventListener('hashchange', renderApp);
window.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('globalSearch').focus(); }
  if (event.key === 'Escape') closeModal();
});

refreshFeatured();
renderApp();
