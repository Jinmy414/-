const STORAGE_KEY = 'luoban-static-v1';

const DEFAULT_TYPE_OPTIONS = ['原创', '动画', '轻改', '漫改', '游戏改', '特摄', '机战', '异世界', '热血', '奇幻', '玄幻', '科幻', '校园', '搞笑', '日常', '恋爱', '百合', '运动', '智斗', '偶像', '职场', '悬疑', '治愈', '冒险', '剧情', '动作', '历史', '推理', '后宫', '音乐', '犯罪'];
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '654321';
const ADMIN_REVEAL_PASSWORD = '200304';
const INITIAL_USER_PASSWORD = '000000';
const IMPORTED_USERNAMES = ['罗', '硬', '金', '文', '鹏', '龙', '飞', '鲨', '任', '虎', '马'];
const REMOVED_TYPES = new Set(['游戏', '小说']);
const TEST_USERNAMES = new Set(['demo', 'riko', 'mulberry']);
const TEST_WORK_IDS = new Set(['tide-letter', 'summer-radio', 'zero-garden', 'mountain-shop', 'moon-post', 'mist-island', 'cinema-town', 'daylight-route', 'orange-lab', 'paper-universe', 'echo-far', 'night-orbit']);
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

const RAW_SEED_WORKS = (window.LUOBAN_ANIMATION_WORKS || []).map(work => ({
  ...work,
  userRatings: work.userRatings && typeof work.userRatings === 'object' ? work.userRatings : {},
  rating: Number.isFinite(Number(work.rating)) && work.rating !== null && work.rating !== '' ? Number(work.rating) : null,
  votes: Number(work.votes) || 0,
  ratingSum: Number(work.ratingSum) || 0,
  comments: Array.isArray(work.comments) ? work.comments : []
}));

const SEED_WORKS = [...new Map(RAW_SEED_WORKS.map(work => [work.title.trim().toLowerCase(), work])).values()].filter(work => !TEST_WORK_IDS.has(work.id));

const defaultState = {
  currentUser: null,
  users: [
    { username: ADMIN_USERNAME, password: ADMIN_PASSWORD, role: 'admin', favoriteIds: [], featuredCommentIds: [] },
    ...IMPORTED_USERNAMES.map(username => ({ username, password: INITIAL_USER_PASSWORD, favoriteIds: [], featuredCommentIds: [] }))
  ],
  works: SEED_WORKS,
  types: DEFAULT_TYPE_OPTIONS,
  deletedWorkIds: [],
  query: '',
  filters: { types: [], regions: [], years: [], rank: '', scoreMin: 0, scoreMax: 10 },
  sort: 'hot'
};

let state = loadState();
saveState();
let authMode = 'login';
let selectedRating = null;
let featuredPopularIds = [];
let featuredNicheIds = [];
let toastTimer = null;
let revealUserPasswords = false;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    const deletedWorkIds = new Set(Array.isArray(saved.deletedWorkIds) ? saved.deletedWorkIds : []);
    const seedWorks = structuredClone(SEED_WORKS).filter(work => !deletedWorkIds.has(work.id));
    const savedWorks = Array.isArray(saved.works) ? saved.works.filter(work => !isBgmWork(work) && !isTestWork(work)) : [];
    const savedById = new Map(savedWorks.map(work => [work.id, work]));
    const mergedWorks = [
      ...seedWorks.map(seed => savedById.has(seed.id) ? mergeSeedWork(seed, savedById.get(seed.id)) : seed),
      ...savedWorks.filter(work => !seedWorks.some(seed => seed.id === work.id)).map(normalizeWork)
    ];
    const savedUsers = Array.isArray(saved.users) ? saved.users.filter(user => !TEST_USERNAMES.has(user.username)) : [];
    const users = defaultState.users.map(seedUser => {
      const savedUser = savedUsers.find(user => user.username === seedUser.username);
      return { ...structuredClone(seedUser), ...(savedUser || {}), ...(seedUser.username === ADMIN_USERNAME ? { password: ADMIN_PASSWORD, role: 'admin' } : {}), featuredCommentIds: Array.isArray(savedUser?.featuredCommentIds) ? savedUser.featuredCommentIds : [] };
    });
    savedUsers.filter(user => !defaultState.users.some(seedUser => seedUser.username === user.username)).forEach(user => users.push({ ...user, featuredCommentIds: Array.isArray(user.featuredCommentIds) ? user.featuredCommentIds : [] }));
    return {
      ...structuredClone(defaultState),
      ...saved,
      currentUser: users.some(user => user.username === saved.currentUser) ? saved.currentUser : null,
      types: Array.isArray(saved.types) && saved.types.length ? [...new Set(saved.types.filter(type => type && !REMOVED_TYPES.has(type)))] : [...DEFAULT_TYPE_OPTIONS],
      deletedWorkIds: [...deletedWorkIds],
      filters: { ...defaultState.filters, ...(saved.filters || {}), scoreMin: saved.filters?.scoreMin ?? saved.filters?.score ?? 0, scoreMax: saved.filters?.scoreMax ?? 10 },
      users,
      works: (mergedWorks.length ? mergedWorks : seedWorks).map(work => ({ ...work, types: [...new Set((work.types || []).filter(type => !REMOVED_TYPES.has(type)))] }))
    };
  } catch { return structuredClone(defaultState); }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getWork(id) { return state.works.find(work => work.id === id); }
function getUser(username) { return state.users.find(user => user.username === username); }
function typeOptions() { return state?.types?.length ? state.types : DEFAULT_TYPE_OPTIONS; }
function isBgmWork(work) { return String(work?.createdBy || '').toLowerCase() === 'bgm' || String(work?.createdBy || '').toLowerCase() === 'bangumi' || String(work?.id || '').startsWith('bgm-') || String(work?.sourceUrl || '').includes('bgm.tv'); }
function isTestWork(work) { return TEST_WORK_IDS.has(work?.id); }
function normalizeWork(work) {
  if (!String(work?.sourceLabel || '').includes('动画名称.xlsx')) return work;
  const userRatings = work.userRatings && typeof work.userRatings === 'object' ? work.userRatings : {};
  const ratings = Object.values(userRatings).map(Number).filter(value => Number.isFinite(value));
  const ratingSum = ratings.reduce((sum, value) => sum + value, 0);
  return { ...work, ratingSum, votes: ratings.length, rating: ratings.length ? ratingSum / ratings.length : null, comments: Array.isArray(work.comments) ? work.comments.filter(comment => !String(comment.id).startsWith('sheet-comment-')) : [] };
}
function mergeSeedWork(seed, saved) {
  const userRatings = { ...(seed.userRatings || {}), ...((saved.userRatings && typeof saved.userRatings === 'object') ? saved.userRatings : {}) };
  const seedComments = Array.isArray(seed.comments) ? seed.comments : [];
  const savedComments = Array.isArray(saved.comments) ? saved.comments : [];
  const comments = [...seedComments, ...savedComments.filter(comment => !seedComments.some(item => item.id === comment.id))];
  return normalizeWork({
    ...seed,
    ...saved,
    coverImage: saved.coverImage || seed.coverImage,
    poster: saved.poster || seed.poster,
    userRatings,
    comments
  });
}
function currentRoute() { return location.hash.slice(1) || 'home'; }
function currentUser() { return state.currentUser ? getUser(state.currentUser) : null; }
function isAdmin(user = currentUser()) { return Boolean(user && (user.role === 'admin' || user.username === 'admin' || user.username.toLowerCase() === 'jinmy414')); }
function userInitial(username = '客') { return username.slice(0, 1).toUpperCase(); }
function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function safeImage(value = '') { return /^https?:\/\//i.test(value) || /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(value) ? value : ''; }
function formatRating(value, votes = null) { return votes === 0 || value === null || value === undefined || value === '' ? '—' : Number(value).toFixed(1); }
function displayYear(year) { return year ? String(year) : '年份待补'; }
function displayRating(work) { if (!work.votes) return null; return state.sort === 'score' ? work.rating : Math.min(10, work.rating + (work.votes > 4 ? 1 : 0)); }
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
    <div class="feature-info"><strong>${escapeHTML(work.title)}</strong><div class="feature-meta"><span>${displayYear(work.year)} · ${escapeHTML(work.region)}</span><span class="rating">${formatRating(displayRating(work), work.votes)}</span></div></div>
  </article>`;
  return `<article class="work-card" data-open-work="${work.id}">
    ${coverMarkup(work)}
    <div class="feature-info"><strong>${escapeHTML(work.title)}</strong><div class="feature-meta"><span>${displayYear(work.year)} · ${escapeHTML(work.region)}</span><span class="rating">${formatRating(displayRating(work), work.votes)}</span></div><div class="type-list">${tagHTML}${hotTag}</div></div>
  </article>`;
}

function renderHeader() {
  const route = currentRoute();
  const active = route.startsWith('profile') ? 'profile' : route.startsWith('create') || route.startsWith('edit') ? 'create' : route === 'admin' ? 'admin' : 'home';
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
  const user = currentUser();
  document.getElementById('headerUser').innerHTML = user
    ? `${isAdmin(user) ? '<a class="admin-link" href="#admin" data-nav="admin">管理后台</a>' : ''}<button class="user-button" type="button" data-nav-profile="${escapeHTML(user.username)}"><span class="avatar">${userInitial(user.username)}</span><span>${escapeHTML(user.username)}</span></button><button class="text-link" type="button" data-logout>退出</button>`
    : '<button class="login-link" type="button" data-login>登录 / 注册</button>';
  const search = document.getElementById('globalSearch');
  if (search && search.value !== state.query) search.value = state.query;
}

function renderHome() {
  const filtered = filteredWorks();
  const popular = featuredPopularIds.map(getWork).filter(Boolean);
  const niche = featuredNicheIds.map(getWork).filter(Boolean);
  const quotes = shuffle(window.LUOBAN_QUOTES || []).slice(0, 3);
  const quoteMarkup = quotes.length ? quotes.map(item => `<article class="quote-entry"><blockquote>“${escapeHTML(item.quote)}”</blockquote><cite>——《${escapeHTML(item.work)}》</cite></article>`).join('') : '<p class="quote-empty">台词档案正在整理中。</p>';
  return `<section class="hero">
    <div class="hero-copy"><div class="hero-rail"><span class="hero-seal">罗瓣</span><span>作品档案 · 2026</span></div><h1>把喜欢的作品，<br /><em>安放在潮汐里。</em></h1><p class="hero-intro">一座给动画、电影、书和游戏的安静档案馆。搜索一部作品，也搜索别人记住它的理由。</p><div class="hero-actions"><button class="button button-primary" type="button" data-scroll="discover">开始发现 <span>↘</span></button><button class="button button-ghost" type="button" data-open-create>放进一部作品</button></div><div class="hero-stats"><div class="stat"><strong>${state.works.length}</strong><span>正在被记录的作品</span></div><div class="stat"><strong>${state.works.reduce((sum, work) => sum + work.comments.length, 0)}</strong><span>留下的片段</span></div><div class="stat"><strong>0.5</strong><span>评分最小刻度</span></div></div></div>
    <div class="hero-art quote-board"><span class="art-label">LUOBAN / 台词档案</span><div class="quote-logo"><img src="assets/logo-snail.png" alt="罗瓣 logo" /></div><div class="quote-list">${quoteMarkup}</div><span class="art-note">随机抽取 · ${quotes.length || 0} 条</span></div>
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
  const rankChip = (value, label) => `<button class="filter-chip rank-chip rank-${value} ${f.rank === value ? 'is-selected' : ''}" type="button" data-filter-rank="${value}">${label}</button>`;
  return `<div class="filter-panel">
    <div class="filter-row"><span class="filter-label">类型</span><div class="filter-options">${typeOptions().map(value => chip('type', value, f.types.includes(value))).join('')}${rankChip('hot', '热门')}${rankChip('cold', '冷门')}</div></div>
    <div class="filter-row"><span class="filter-label">地区</span><div class="filter-options">${REGION_OPTIONS.map(value => chip('region', value, f.regions.includes(value))).join('')}</div></div>
    <div class="filter-row"><span class="filter-label">年代</span><div class="filter-options">${YEAR_OPTIONS.map(value => chip('year', value, f.years.includes(value))).join('')}<select class="select-compact" id="exactYear" aria-label="选择具体年份"><option value="">具体年份</option>${exactYears.map(year => `<option value="${year}" ${f.years.includes(String(year)) ? 'selected' : ''}>${year}</option>`).join('')}</select></div></div>
    <div class="filter-row"><span class="filter-label">评分</span><div class="score-filter score-range"><input id="scoreMin" type="range" min="0" max="10" step="0.5" value="${f.scoreMin}" aria-label="最低评分" /><input id="scoreMax" type="range" min="0" max="10" step="0.5" value="${f.scoreMax}" aria-label="最高评分" /><span class="score-value">${f.scoreMin === 0 && f.scoreMax === 10 ? '不限评分' : `${f.scoreMin} – ${f.scoreMax} 分`}</span></div></div>
    <div class="sort-bar"><div class="sort-tabs"><button class="sort-tab ${state.sort === 'hot' ? 'is-selected' : ''}" type="button" data-sort="hot">热门优先</button><button class="sort-tab ${state.sort === 'score' ? 'is-selected' : ''}" type="button" data-sort="score">高分优先</button><button class="sort-tab ${state.sort === 'new' ? 'is-selected' : ''}" type="button" data-sort="new">最新加入</button></div><span class="result-count">${filteredWorks().length} 部作品 · ${state.sort === 'score' ? '按真实评分' : '热门作品展示分 +1'}</span></div>
  </div>`;
}

function filteredWorks() {
  const f = state.filters;
  const query = state.query.trim().toLowerCase();
  const result = state.works.filter(work => {
    const searchable = [work.title, work.region, ...work.types].join(' ').toLowerCase();
    const typeMatch = !f.types.length || f.types.every(type => work.types.includes(type));
    const regionMatch = !f.regions.length || f.regions.every(region => work.region === region);
    const yearMatch = !f.years.length || f.years.every(year => String(work.year) === year || (work.year && yearBucket(work.year) === year));
    const rankMatch = !f.rank || (f.rank === 'hot' ? work.votes > 4 : work.votes <= 4);
    const scoreMatch = work.rating >= Number(f.scoreMin ?? 0) && work.rating <= Number(f.scoreMax ?? 10);
    return (!query || searchable.includes(query)) && typeMatch && regionMatch && yearMatch && rankMatch && scoreMatch;
  });
  return result.sort((a, b) => state.sort === 'score' ? b.rating - a.rating : state.sort === 'new' ? Number(b.year || 0) - Number(a.year || 0) : (b.votes * b.rating) - (a.votes * a.rating));
}

function renderProfile(username = state.currentUser) {
  const user = getUser(username) || { username, favoriteIds: [], featuredCommentIds: [] };
  const own = currentUser()?.username === username;
  const favorites = (user.favoriteIds || []).map(getWork).filter(Boolean).slice(0, 3);
  const allComments = state.works.flatMap(work => work.comments.map(comment => ({ ...comment, work, key: `${work.id}:${comment.id}` }))).filter(item => item.user === username).sort((a, b) => b.date.localeCompare(a.date));
  const selectedCommentIds = user.featuredCommentIds || [];
  const comments = allComments.filter(item => selectedCommentIds.includes(item.key)).slice(0, 3);
  const created = state.works.filter(work => work.createdBy === username);
  return `<section class="page-intro"><div class="eyebrow">Profile / ${escapeHTML(username)}</div><h1>${own ? '我的罗瓣' : `${escapeHTML(username)} 的罗瓣`}</h1><p>${own ? '自己选择三部最爱作品和最多三条展示评论，整理成一张小小的名片。' : '看看这个人最近喜欢什么，也许会发现同一片海。'}</p></section>
    <div class="profile-layout"><aside class="profile-aside"><div class="profile-avatar">${userInitial(username)}</div><h2>${escapeHTML(username)}</h2><div class="profile-handle">@${escapeHTML(username)} · ${own ? '这是你的主页' : '罗瓣用户'}</div><div class="profile-stats"><div class="profile-stat"><strong>${favorites.length}</strong><span>最爱作品</span></div><div class="profile-stat"><strong>${comments.length}</strong><span>展示评论</span></div><div class="profile-stat"><strong>${created.length}</strong><span>创建作品</span></div><div class="profile-stat"><strong>${state.works.reduce((sum, work) => sum + work.comments.filter(comment => comment.user === username).reduce((n, comment) => n + comment.likes, 0), 0)}</strong><span>收到赞</span></div></div>${own ? '<button class="button button-ghost button-wide" type="button" data-toggle-settings style="margin-top:20px">编辑个人信息</button>' : ''}</aside>
      <div class="profile-main"><section class="profile-section"><h3>三部最爱</h3><div class="favorite-grid">${favorites.length ? favorites.map(work => workCard(work, true)).join('') : '<div class="empty-state">还没有选择最爱作品。</div>'}</div></section><section class="profile-section"><h3>展示评论</h3><div class="comment-list">${comments.length ? comments.map(item => `<article class="comment-preview"><div class="comment-preview-top"><span>评论了 <button class="text-link" type="button" data-open-work="${item.work.id}">${escapeHTML(item.work.title)}</button></span><span>${escapeHTML(item.date)} · 赞 ${item.likes}</span></div><p>${escapeHTML(item.text)}</p></article>`).join('') : '<div class="empty-state">还没有选择要展示的评论。</div>'}</div></section><section class="profile-section"><h3>创建的作品</h3><div class="created-work-list">${created.length ? created.map(work => `<button class="created-work-row" type="button" data-open-work="${work.id}"><span>${escapeHTML(work.title)}</span><span>${displayYear(work.year)} · ${escapeHTML(work.region)}</span></button>`).join('') : '<div class="empty-state">还没有创建作品。</div>'}</div></section>${own ? renderProfileSettings(user) : ''}</div></div>`;
}

function renderProfileSettings(user) {
  const favoriteIds = user.favoriteIds || [];
  const commentIds = user.featuredCommentIds || [];
  const favoriteOptions = [...state.works].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN')).map(work => `<option value="${escapeHTML(work.id)}" ${favoriteIds.includes(work.id) ? 'selected' : ''}>${escapeHTML(work.title)}</option>`).join('');
  const commentOptions = state.works.flatMap(work => work.comments.filter(comment => comment.user === user.username).map(comment => ({ work, comment, key: `${work.id}:${comment.id}` }))).map(item => `<option value="${escapeHTML(item.key)}" ${commentIds.includes(item.key) ? 'selected' : ''}>${escapeHTML(item.work.title)}：${escapeHTML(item.comment.text.slice(0, 46))}</option>`).join('');
  return `<section class="profile-section is-hidden" id="profileSettings"><h3>个人信息</h3><form class="editor-card editor-grid" id="profileForm"><label>用户名<input name="username" value="${escapeHTML(user.username)}" autocomplete="username" required /></label><label>新密码<input name="password" type="password" placeholder="留空则不修改" autocomplete="new-password" /></label><label>三部最爱 <small class="form-hint">按住 Ctrl / Command 可多选，最多 3 部</small><select name="favoriteIds" multiple size="7">${favoriteOptions}</select></label><label>展示评论 <small class="form-hint">最多选择 3 条</small><select name="featuredCommentIds" multiple size="7">${commentOptions || '<option disabled>还没有发布过评论</option>'}</select></label><div class="form-actions"><span class="form-error" id="profileError"></span><button class="button button-primary" type="submit">保存修改</button></div></form></section>`;
}

function renderEditor(editId = '') {
  const user = currentUser();
  if (!user) return loginRequired('登录后创建或编辑作品', '拥有账号后，你可以记录自己的作品，也可以继续完善它。');
  const work = editId ? getWork(editId) : null;
  if (work && work.createdBy !== user.username && !isAdmin(user)) return `<div class="login-required"><div class="mini-symbol">↺</div><h2>这部作品属于 ${escapeHTML(work.createdBy)}</h2><p>只能编辑自己创建的作品，管理员可以编辑所有作品。</p><button class="button button-ghost" type="button" data-back-home>回到发现页</button></div>`;
  const selectedTypes = work?.types || ['原创'];
  const posterName = Object.entries(POSTER_OPTIONS).find(([, value]) => value === work?.poster)?.[0] || 'mint';
  return `<section class="page-intro"><div class="eyebrow">Create / Curate</div><h1>${work ? '编辑作品' : '创建一部作品'}</h1><p>${work ? '把信息补充完整，让更多人知道它为什么值得被记住。' : '先留下名字和基本信息，封面和故事都可以以后慢慢补。'}</p></section><div class="editor-shell"><form class="editor-card editor-grid" id="workForm" data-edit-id="${editId}"><label class="full">作品名称<input name="title" value="${escapeHTML(work?.title || '')}" required placeholder="例如：一封寄往未来的信" /></label><label>作品类型<select name="types" multiple size="5" required>${typeOptions().map(type => `<option value="${escapeHTML(type)}" ${selectedTypes.includes(type) ? 'selected' : ''}>${escapeHTML(type)}</option>`).join('')}</select><small class="form-hint">按住 Ctrl / Command 可多选类型</small></label><label>地区<select name="region" required>${REGION_OPTIONS.map(region => `<option value="${region}" ${work?.region === region ? 'selected' : ''}>${region}</option>`).join('')}</select></label><label>年份<input name="year" type="number" min="1900" max="2100" value="${work?.year || new Date().getFullYear()}" required /></label><label>封面风格<select name="poster">${Object.keys(POSTER_OPTIONS).map(key => `<option value="${key}" ${key === posterName ? 'selected' : ''}>${{ mint: '青苔绿', dusk: '晚霞橘', sky: '晴空蓝', lavender: '雾紫色', lemon: '柠檬黄', ink: '墨夜蓝' }[key]}</option>`).join('')}</select></label><label class="full">封面图片地址 <span class="form-hint">可选，使用公开图片 URL</span><input name="coverImage" type="url" value="${escapeHTML(work?.coverImage || '')}" placeholder="https://..." /></label>${isAdmin(user) ? '<label class="full">上传作品图 <span class="form-hint">管理员可从本机选择图片，建议不超过 2MB</span><input name="coverFile" type="file" accept="image/*" /></label>' : ''}<label class="full">一句话介绍<textarea name="summary" placeholder="用一句话说说它是什么。">${escapeHTML(work?.summary || '')}</textarea></label><div class="form-actions">${work && isAdmin(user) ? `<button class="button button-danger" type="button" data-delete-work="${escapeHTML(work.id)}">删除作品</button>` : ''}<button class="button button-ghost" type="button" data-back-home>取消</button><button class="button button-primary" type="submit">${work ? '保存作品' : '发布作品'}</button></div></form></div>`;
}

function loginRequired(title, description) {
  return `<div class="login-required"><div class="mini-symbol">✦</div><h2>${title}</h2><p>${description}</p><button class="button button-primary" type="button" data-login>登录 / 注册</button></div>`;
}

function renderAdmin() {
  const user = currentUser();
  if (!user || !isAdmin(user)) return `<div class="login-required"><div class="mini-symbol">⌘</div><h2>管理员入口</h2><p>这里可以管理所有作品、类型和封面。请输入管理员账号进入。</p><button class="button button-primary" type="button" data-admin-login>管理员登录</button></div>`;
  const works = [...state.works].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  const rows = works.map(work => `<div class="admin-work-row"><div class="admin-work-title"><button class="text-link" type="button" data-open-work="${escapeHTML(work.id)}">${escapeHTML(work.title)}</button><span>${escapeHTML(work.region)} · ${displayYear(work.year)}</span></div><div class="admin-work-types">${work.types.map(type => `<span class="type-tag">${escapeHTML(type)}</span>`).join('') || '<span class="muted">未分类</span>'}</div><div class="admin-work-source">${work.coverImage ? '有封面' : '无封面'} · ${formatRating(work.rating, work.votes)} 分</div><div class="admin-work-actions"><button class="button button-ghost button-small" type="button" data-edit-work="${escapeHTML(work.id)}">编辑</button><button class="button button-danger button-small" type="button" data-delete-work="${escapeHTML(work.id)}">删除</button></div></div>`).join('');
  const typeRows = typeOptions().map(type => `<div class="admin-type-row"><span>${escapeHTML(type)}</span><button class="button button-danger button-small" type="button" data-delete-type="${escapeHTML(type)}">删除</button></div>`).join('');
  const accounts = [...state.users].sort((a, b) => a.username.localeCompare(b.username, 'en'));
  const accountRows = accounts.map(account => `<div class="admin-user-row"><span class="admin-user-name">${escapeHTML(account.username)}${isAdmin(account) ? '<small>管理员</small>' : ''}</span><span>${revealUserPasswords ? escapeHTML(String(account.password || '')) : '••••••'}</span><span>${state.works.filter(work => work.createdBy === account.username).length} 部作品</span></div>`).join('');
  return `<section class="page-intro"><div class="eyebrow">Admin / Archive desk</div><h1>管理员工作台</h1><p>统一整理罗瓣的作品、类型和封面。评分只统计罗瓣用户自己的打分。</p></section><div class="admin-layout"><section class="admin-panel"><div class="admin-panel-heading"><div><h2>作品档案</h2><p>${works.length} 部作品 · 点击编辑可以补封面或重新分配类型</p></div><button class="button button-primary button-small" type="button" data-open-create>新建作品</button></div><div class="admin-work-list">${rows || '<div class="empty-state">还没有作品。</div>'}</div></section><aside class="admin-side"><section class="admin-panel"><h2>类型管理</h2><p class="admin-note">删除类型后，它会从现有作品中移除。</p><form class="type-form" id="typeForm"><input name="typeName" required maxlength="12" placeholder="新增一个类型" /><button class="button button-primary button-small" type="submit">添加</button></form><div class="admin-type-list">${typeRows}</div></section><section class="admin-panel"><h2>账号列表</h2><div class="admin-user-list">${accountRows || '<div class="empty-state">还没有注册账号。</div>'}</div></section><section class="admin-panel admin-safety"><h2>权限说明</h2><p>当前管理员：${escapeHTML(user.username)}</p><p>可编辑所有作品、管理类型、上传封面和删除作品。</p><p class="admin-note">这是静态网站，修改保存在当前浏览器；要让所有访客看到，需要将修改后的数据重新发布。</p></section></aside></div>`;
}

function renderDetail(id) {
  const work = getWork(id);
  if (!work) return `<div class="empty-state"><strong>找不到这部作品</strong><button class="button button-ghost" type="button" data-back-home>回到发现页</button></div>`;
  const user = currentUser();
  const favorite = user?.favoriteIds?.includes(work.id);
  const canEdit = user && (user.username === work.createdBy || isAdmin(user));
  const sortedComments = [...work.comments].sort((a, b) => b.likes - a.likes || b.text.length - a.text.length);
  const ratingButtons = Array.from({ length: 21 }, (_, i) => i / 2).map(score => `<button class="rating-option ${selectedRating === score ? 'is-selected' : ''}" type="button" data-rating="${score}">${score % 1 ? score.toFixed(1) : score}</button>`).join('');
  return `<a class="back-link" href="#home">← 返回发现</a><section class="detail-hero"><div class="detail-cover">${coverMarkup(work)}</div><div class="detail-copy"><div class="eyebrow">Work / ${escapeHTML(work.region)}</div><h1>${escapeHTML(work.title)}</h1><div class="detail-meta"><span>${displayYear(work.year)}</span><span>${escapeHTML(work.region)}</span>${work.types.map(type => `<span>${escapeHTML(type)}</span>`).join('')}</div><p class="detail-summary">${escapeHTML(work.summary || '这部作品还没有一句介绍，等你来补充。')}</p><div class="detail-score"><strong>${formatRating(work.rating, work.votes)}</strong><span>真实评分<br />${work.votes} 人参与</span></div><div class="detail-actions"><button class="button ${favorite ? 'button-coral' : 'button-ghost'} button-small" type="button" data-favorite="${work.id}">${favorite ? '♥ 已收藏' : '♡ 收藏到我的罗瓣'}</button>${canEdit ? `<button class="button button-ghost button-small" type="button" data-edit-work="${work.id}">编辑作品</button>` : ''}${isAdmin(user) ? `<button class="button button-danger button-small" type="button" data-delete-work="${work.id}">删除作品</button>` : ''}</div></div></section><section class="detail-columns"><div><section class="detail-section"><h2>留下你的分数</h2><div class="rating-box"><p>从 0 到 10，每次半分都算数。${user ? '' : '登录后即可评分。'}</p><div class="rating-options">${ratingButtons}</div><div style="margin-top:13px"><button class="button button-primary button-small" type="button" data-submit-rating="${work.id}">提交评分</button></div></div></section><section class="detail-section"><h2>评论 <span class="result-count">${work.comments.length}</span></h2>${user ? `<form class="comment-form" id="commentForm" data-work-id="${work.id}"><textarea name="text" required placeholder="说说你为什么记住它……"></textarea><div style="display:flex;justify-content:flex-end"><button class="button button-primary button-small" type="submit">发布评论</button></div></form>` : loginRequired('想留下一句话吗？', '登录后可以评分、评论，也能给别人的评论点个赞。')}<div class="detail-comment-list">${sortedComments.length ? sortedComments.map(comment => `<article class="detail-comment"><div class="detail-comment-top"><button class="comment-author" type="button" data-open-profile="${escapeHTML(comment.user)}">${userInitial(comment.user)} ${escapeHTML(comment.user)}</button><span class="comment-date">${escapeHTML(comment.date)}</span></div><p>${escapeHTML(comment.text)}</p><button class="like-button ${user && comment.likedBy?.includes(user.username) ? 'is-liked' : ''}" type="button" data-like-comment="${work.id}" data-comment-id="${comment.id}">♥ ${comment.likes}</button>${isAdmin(user) ? `<button class="button button-danger button-small comment-delete" type="button" data-delete-comment="${work.id}" data-comment-id="${comment.id}">删除评论</button>` : ''}</article>`).join('') : '<div class="empty-state">还没有评论，来做第一个说话的人。</div>'}</div></section></div><aside><section class="detail-section"><h2>作品信息</h2><div class="info-list"><div class="info-row"><span>类型</span><span>${work.types.map(escapeHTML).join(' / ')}</span></div><div class="info-row"><span>地区</span><span>${escapeHTML(work.region)}</span></div><div class="info-row"><span>年份</span><span>${displayYear(work.year)}</span></div><div class="info-row"><span>创建者</span><span><button class="text-link" type="button" data-open-profile="${escapeHTML(work.createdBy)}">${escapeHTML(work.createdBy)}</button></span></div>${work.sourceUrl ? `<div class="info-row"><span>资料来源</span><a class="text-link" href="${escapeHTML(work.sourceUrl)}" target="_blank" rel="noopener">Bangumi</a></div>` : ''}${work.sourceLabel ? `<div class="info-row"><span>资料来源</span><span>${escapeHTML(work.sourceLabel)}</span></div>` : ''}<div class="info-row"><span>自动标签</span><span>${autoTags(work).join(' / ')}</span></div></div></section><section class="detail-section"><h2>也许你会喜欢</h2><div class="comment-list">${state.works.filter(item => item.id !== work.id && item.types.some(type => work.types.includes(type))).slice(0, 3).map(item => `<button class="button button-ghost" style="justify-content:space-between" type="button" data-open-work="${item.id}"><span>${escapeHTML(item.title)}</span><span class="rating">${formatRating(item.rating, item.votes)}</span></button>`).join('')}</div></section></aside></section>`;
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
  else if (route === 'admin') app.innerHTML = renderAdmin();
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
  authMode = mode === 'register' ? 'register' : mode === 'admin' ? 'admin' : 'login';
  document.getElementById('modalBackdrop').classList.remove('is-hidden');
  document.getElementById('modalBackdrop').setAttribute('aria-hidden', 'false');
  document.getElementById('authModal').classList.remove('is-hidden');
  document.getElementById('workModal').classList.add('is-hidden');
  document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.classList.toggle('is-active', tab.dataset.authTab === authMode));
  document.getElementById('authTitle').textContent = authMode === 'admin' ? '管理员入口' : authMode === 'login' ? '登录后，开始留下你的分数' : '注册一个罗瓣用户名';
  document.getElementById('authSubmit').textContent = authMode === 'admin' ? '进入管理后台' : authMode === 'login' ? '登录罗瓣' : '创建账号';
  const authHint = document.getElementById('authHint');
  authHint.textContent = authMode === 'admin' ? '' : authMode === 'login' ? '管理员请使用“管理员入口”；普通用户输入自己的账号。' : '用户名需为不重复的英文名称，可含数字、下划线或短横线。';
  authHint.classList.toggle('is-hidden', authMode === 'admin');
  document.getElementById('authError').textContent = '';
  document.getElementById('authForm').reset();
  if (authMode === 'admin') document.getElementById('authUsername').value = ADMIN_USERNAME;
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

function updateRank(value) {
  state.filters.rank = state.filters.rank === value ? '' : value;
  saveState(); renderApp();
}

function deleteWorkById(id) {
  if (!isAdmin()) { openAuth('admin'); return; }
  const work = getWork(id);
  if (!work || !window.confirm(`确定删除《${work.title}》吗？删除后本设备的作品记录将被移除。`)) return;
  state.works = state.works.filter(item => item.id !== id);
  state.deletedWorkIds = [...new Set([...(state.deletedWorkIds || []), id])];
  state.users.forEach(user => {
    user.favoriteIds = (user.favoriteIds || []).filter(workId => workId !== id);
    user.featuredCommentIds = (user.featuredCommentIds || []).filter(key => !key.startsWith(`${id}:`));
  });
  saveState(); refreshFeatured(); navigate('admin'); showToast('作品已删除');
}

function deleteTypeByName(type) {
  if (!isAdmin()) { openAuth('admin'); return; }
  if (typeOptions().length <= 1) { showToast('至少保留一个作品类型'); return; }
  if (!window.confirm(`删除“${type}”类型？它会从现有作品中移除。`)) return;
  state.types = typeOptions().filter(item => item !== type);
  state.filters.types = state.filters.types.filter(item => item !== type);
  state.works.forEach(work => {
    work.types = (work.types || []).filter(item => item !== type);
    if (!work.types.length && state.types.length) work.types = [state.types[0]];
  });
  saveState(); renderApp(); showToast(`类型“${type}”已删除`);
}

function deleteComment(workId, commentId) {
  if (!isAdmin()) { openAuth('admin'); return; }
  const work = getWork(workId);
  if (!work) return;
  const comment = work.comments.find(item => item.id === commentId);
  if (!comment) return;
  if (!window.confirm('删除这条评论？')) return;
  work.comments = work.comments.filter(item => item.id !== commentId);
  saveState(); renderApp(); showToast('评论已删除');
}

document.addEventListener('click', event => {
  const target = event.target;
  const openWork = target.closest('[data-open-work]');
  if (openWork) { navigate(`work-${openWork.dataset.openWork}`); return; }
  const openProfile = target.closest('[data-open-profile], [data-nav-profile]');
  if (openProfile) { navigate(`profile-${encodeURIComponent(openProfile.dataset.openProfile || openProfile.dataset.navProfile)}`); return; }
  if (target.closest('[data-login]')) { openAuth('login'); return; }
  if (target.closest('[data-admin-entry], [data-admin-login]')) { openAuth('admin'); return; }
  if (target.closest('[data-open-create]')) { navigate('create'); return; }
  if (target.closest('[data-back-home]')) { navigate('home'); return; }
  if (target.closest('[data-close-modal]') || target.id === 'modalBackdrop') { closeModal(); return; }
  const deleteWork = target.closest('[data-delete-work]'); if (deleteWork) { deleteWorkById(deleteWork.dataset.deleteWork); return; }
  const deleteType = target.closest('[data-delete-type]'); if (deleteType) { deleteTypeByName(deleteType.dataset.deleteType); return; }
  const deleteCommentButton = target.closest('[data-delete-comment]'); if (deleteCommentButton) { deleteComment(deleteCommentButton.dataset.deleteComment, deleteCommentButton.dataset.commentId); return; }
  const authTab = target.closest('[data-auth-tab]');
  if (authTab) { openAuth(authTab.dataset.authTab); return; }
  const filterType = target.closest('[data-filter-type]'); if (filterType) { updateFilter('type', filterType.dataset.filterType); return; }
  const filterRank = target.closest('[data-filter-rank]'); if (filterRank) { updateRank(filterRank.dataset.filterRank); return; }
  const filterRegion = target.closest('[data-filter-region]'); if (filterRegion) { updateFilter('region', filterRegion.dataset.filterRegion); return; }
  const filterYear = target.closest('[data-filter-year]'); if (filterYear) { updateFilter('year', filterYear.dataset.filterYear); return; }
  const sort = target.closest('[data-sort]'); if (sort) { state.sort = sort.dataset.sort; saveState(); renderApp(); return; }
  if (target.closest('[data-clear-filters]')) { state.query = ''; state.filters = { types: [], regions: [], years: [], rank: '', scoreMin: 0, scoreMax: 10 }; saveState(); renderApp(); return; }
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
  if (target.closest('[data-logout]')) { state.currentUser = null; revealUserPasswords = false; saveState(); navigate('home'); showToast('已安全退出'); return; }
  if (target.closest('[data-toggle-settings]')) { document.getElementById('profileSettings')?.classList.toggle('is-hidden'); return; }
  if (target.closest('[data-scroll]')) { document.getElementById(target.closest('[data-scroll]').dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); return; }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'headerSearch') { event.preventDefault(); state.query = new FormData(event.target).get('q')?.toString() || ''; saveState(); navigate('home'); return; }
  if (event.target.id === 'authForm') {
    event.preventDefault(); const form = new FormData(event.target); const username = form.get('username').toString().trim(); const password = form.get('password').toString(); const error = document.getElementById('authError');
    if (authMode === 'login' || authMode === 'admin') {
      if (authMode === 'admin' && username === ADMIN_USERNAME && password === ADMIN_REVEAL_PASSWORD) {
        state.currentUser = ADMIN_USERNAME; revealUserPasswords = true; saveState(); closeModal(); renderApp(); showToast(`欢迎回来，${ADMIN_USERNAME}`); return;
      }
      const user = getUser(username); if (!user || user.password !== password || (authMode === 'admin' && !isAdmin(user))) { error.textContent = authMode === 'admin' ? '管理员账号或密码不正确。' : '用户名或密码不正确，请检查后重试。'; return; }
      revealUserPasswords = false;
      state.currentUser = username; saveState(); closeModal(); renderApp(); showToast(`欢迎回来，${username}`);
    } else {
      if (!/^\S{1,20}$/.test(username)) { error.textContent = '用户名请使用 1-20 个不含空格的字符。'; return; }
      if (getUser(username)) { error.textContent = '这个用户名已经被使用了。'; return; }
      if (!password) { error.textContent = '请输入密码。'; return; }
      state.users.push({ username, password, favoriteIds: [] }); state.currentUser = username; saveState(); closeModal(); renderApp(); showToast('账号创建成功，欢迎来到罗瓣');
    }
    return;
  }
  if (event.target.id === 'typeForm') {
    event.preventDefault();
    if (!isAdmin()) { openAuth('admin'); return; }
    const name = new FormData(event.target).get('typeName').toString().trim();
    if (!name) return;
    if (typeOptions().includes(name)) { showToast('这个类型已经存在'); return; }
    state.types.push(name); saveState(); renderApp(); showToast(`类型“${name}”已添加`); return;
  }
  if (event.target.id === 'commentForm') {
    event.preventDefault(); if (!currentUser()) { openAuth('login'); return; }
    const form = new FormData(event.target); const work = getWork(event.target.dataset.workId); work.comments.push({ id: `c-${Date.now()}`, user: currentUser().username, text: form.get('text').toString().trim(), likes: 0, date: new Date().toISOString().slice(0, 10) }); const user = currentUser(); user.commentCount = (user.commentCount || 0) + 1; saveState(); renderApp(); showToast('评论已经留下'); return;
  }
  if (event.target.id === 'workForm') {
    event.preventDefault(); const form = new FormData(event.target); const title = form.get('title').toString().trim(); const types = [...event.target.querySelector('[name="types"]').selectedOptions].map(option => option.value); const year = Number(form.get('year')); const region = form.get('region').toString(); const poster = POSTER_OPTIONS[form.get('poster').toString()] || POSTER_OPTIONS.mint; const coverImage = safeImage(form.get('coverImage').toString().trim()); const summary = form.get('summary').toString().trim();
    if (!title || !types.length || !year) { showToast('请填写作品名称、类型和年份'); return; }
    const editId = event.target.dataset.editId;
    const persist = (finalCoverImage) => {
      if (editId) { const work = getWork(editId); Object.assign(work, { title, types, year, region, poster, coverImage: finalCoverImage, summary }); saveState(); navigate(`work-${editId}`); showToast('作品信息已更新'); }
      else { const id = `work-${Date.now()}`; state.works.unshift({ id, title, types, year, region, poster, coverImage: finalCoverImage, summary, rating: null, votes: 0, ratingSum: 0, userRatings: {}, createdBy: currentUser().username, comments: [] }); saveState(); refreshFeatured(); navigate(`work-${id}`); showToast('作品已发布'); }
    };
    const file = event.target.querySelector('[name="coverFile"]')?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); return; }
      if (file.size > 2 * 1024 * 1024) { showToast('图片请控制在 2MB 以内'); return; }
      const reader = new FileReader(); reader.onload = () => persist(safeImage(reader.result.toString())); reader.onerror = () => showToast('图片读取失败，请重试'); reader.readAsDataURL(file);
    } else persist(coverImage);
    return;
  }
  if (event.target.id === 'profileForm') {
    event.preventDefault(); const form = new FormData(event.target); const newUsername = form.get('username').toString().trim(); const password = form.get('password').toString(); const oldUsername = currentUser().username; const error = document.getElementById('profileError');
    if (!/^\S{1,20}$/.test(newUsername)) { error.textContent = '用户名请使用 1-20 个不含空格的字符。'; return; }
    if (newUsername !== oldUsername && getUser(newUsername)) { error.textContent = '这个用户名已经被使用了。'; return; }
    const favoriteIds = [...event.target.querySelector('[name="favoriteIds"]').selectedOptions].map(option => option.value);
    const featuredCommentIds = [...event.target.querySelector('[name="featuredCommentIds"]').selectedOptions].map(option => option.value);
    if (favoriteIds.length > 3 || featuredCommentIds.length > 3) { error.textContent = '最爱作品和展示评论最多各选 3 项。'; return; }
    const user = currentUser(); user.username = newUsername; user.favoriteIds = favoriteIds; user.featuredCommentIds = featuredCommentIds; if (password) user.password = password; state.works.forEach(work => { if (work.createdBy === oldUsername) work.createdBy = newUsername; work.comments.forEach(comment => { if (comment.user === oldUsername) comment.user = newUsername; }); }); state.currentUser = newUsername; saveState(); renderApp(); showToast('个人信息已更新');
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'exactYear') { const value = event.target.value; if (value && !state.filters.years.includes(value)) state.filters.years.push(value); else if (!value) state.filters.years = state.filters.years.filter(year => !/^\d{4}$/.test(year)); saveState(); renderApp(); }
  if (event.target.id === 'scoreMin' || event.target.id === 'scoreMax') {
    const min = event.target.id === 'scoreMin' ? Number(event.target.value) : Number(state.filters.scoreMin ?? 0);
    const max = event.target.id === 'scoreMax' ? Number(event.target.value) : Number(state.filters.scoreMax ?? 10);
    state.filters.scoreMin = Math.min(min, max);
    state.filters.scoreMax = Math.max(min, max);
    saveState(); renderApp();
  }
});

window.addEventListener('hashchange', renderApp);
window.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('globalSearch').focus(); }
  if (event.key === 'Escape') closeModal();
});

refreshFeatured();
renderApp();
