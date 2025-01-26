document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const newsContainer = document.getElementById('newsContainer');

    const API_KEY = '84582a6ce8c44b4e9c7e2853530341c8';
    const PAGE_SIZE = 12; // 每頁12筆新聞
    let currentTopic = '今日新聞';
    let currentPage = 1;

    async function fetchNews(topic, page = 1) {
        try {
            currentTopic = topic;
            currentPage = page;
            newsContainer.innerHTML = '<p class="loading">載入中...</p>';

            const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&language=zh&sortBy=publishedAt&page=${page}&pageSize=${PAGE_SIZE * 2}&apiKey=${API_KEY}`;
            const response = await fetch(newsApiUrl);
            const data = await response.json();

            if (data.status === 'ok' && data.articles) {
                // 過濾掉沒有圖片的新聞
                const newsItems = data.articles
                    .filter(article => article.urlToImage)
                    .slice(0, PAGE_SIZE)
                    .map(article => ({
                        title: article.title,
                        link: article.url,
                        pubDate: article.publishedAt,
                        image: article.urlToImage,
                        source: article.source.name
                    }));

                displayNews(newsItems, page, data.totalResults);
            } else {
                throw new Error('無法獲取新聞數據');
            }
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
                <img src="${item.image}" alt="${item.title}" class="news-image">
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
            
            // 上一頁按鈕
            if (page > 1) {
                const prevButton = document.createElement('button');
                prevButton.textContent = '上一頁';
                prevButton.onclick = () => fetchNews(currentTopic, page - 1);
                pagination.appendChild(prevButton);
            }

            // 頁碼
            const pageInfo = document.createElement('span');
            pageInfo.className = 'page-info';
            pageInfo.textContent = `${page} / ${totalPages}`;
            pagination.appendChild(pageInfo);

            // 下一頁按鈕
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