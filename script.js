document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const newsContainer = document.getElementById('newsContainer');

    const PAGE_SIZE = 12; // 每頁12筆新聞
    let currentTopic = '今日新聞';
    let currentPage = 1;

    async function fetchNews(topic, page = 1) {
        try {
            currentTopic = topic;
            currentPage = page;
            newsContainer.innerHTML = '<p class="loading">載入中...</p>';

            // 使用 Google News RSS feed
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=zh-TW&gl=TW&ceid=TW:zh-TW`;
            const response = await fetch(rssUrl);
            const text = await response.text();
            
            // 解析 RSS XML
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const items = Array.from(xml.querySelectorAll("item"));
            
            const newsItems = items.map(item => ({
                title: item.querySelector("title").textContent,
                link: item.querySelector("link").textContent,
                pubDate: new Date(item.querySelector("pubDate").textContent),
                source: item.querySelector("source").textContent
            }));

            displayNews(newsItems.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), page, newsItems.length);
        } catch (error) {
            console.error('獲取新聞時發生錯誤：', error);
            newsContainer.innerHTML = `<p class="no-news">${error.message || '獲取新聞時發生錯誤，請稍後再試。'}</p>`;
        }
    }

    function displayNews(newsItems, page, totalResults) {
        newsContainer.innerHTML = '';
        
        if (newsItems.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">沒有找到相關新聞</p>';
            return;
        }

        // 顯示新聞
        newsItems.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            const publishDate = new Date(item.pubDate).toLocaleDateString('zh-TW');
            
            newsCard.innerHTML = `
                <h2>${item.title}</h2>
                <div class="news-meta">
                    <span class="news-source">${item.source}</span>
                    <span class="news-date">${publishDate}</span>
                </div>
                <a href="${item.link}" target="_blank">閱讀更多</a>
            `;
            newsContainer.appendChild(newsCard);
        });

        // 添加分頁控制
        const totalPages = Math.ceil(totalResults / PAGE_SIZE);
        if (totalPages > 1) {
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            
            if (page > 1) {
                const prevButton = document.createElement('button');
                prevButton.textContent = '上一頁';
                prevButton.onclick = () => fetchNews(currentTopic, page - 1);
                pagination.appendChild(prevButton);
            }

            const pageInfo = document.createElement('span');
            pageInfo.className = 'page-info';
            pageInfo.textContent = `${page} / ${totalPages}`;
            pagination.appendChild(pageInfo);

            if (page < totalPages) {
                const nextButton = document.createElement('button');
                nextButton.textContent = '下一頁';
                nextButton.onclick = () => fetchNews(currentTopic, page + 1);
                pagination.appendChild(nextButton);
            }

            newsContainer.appendChild(pagination);
        }
    }

    // 分類按鈕事件處理
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            fetchNews(category, 1);
        });
    });

    // 搜尋功能
    let searchTimeout;
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                fetchNews(searchTerm, 1);
            }, 300);
        }
    });

    // Enter 鍵搜尋
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                fetchNews(searchTerm, 1);
            }
        }
    });

    // 載入預設新聞
    fetchNews('今日新聞', 1);
}); 