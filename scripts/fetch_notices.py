import os
import json
import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def crawl_platform(p, platform_name, url, category):
    today = datetime.datetime.now().strftime("%Y.%m.%d")
    notice = {
        "id": f"{platform_name[:2]}_{datetime.datetime.now().strftime('%y%m%d')}_1",
        "platform": platform_name,
        "title": f"[{platform_name.capitalize()}] 최신 공지사항 확인",
        "date": today,
        "category": category,
        "desc": "최신 광고 공지사항을 확인해주세요.",
        "url": url
    }
    
    try:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        
        # Add a short delay to allow JS rendering
        page.wait_for_timeout(2000)
        
        title_text = None
        link_url = None
        
        # 1. Platform Specific Precise Selectors
        try:
            if platform_name == "naver":
                elem = page.locator("a[href^='/notice/']").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = "https://ads.naver.com" + elem.get_attribute("href")
            elif platform_name == "kakao":
                elem = page.locator("a[href*='bulletin'] .tit_board, a.link_board").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = url
            elif platform_name == "google":
                elem = page.locator("a.article-link").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = "https://support.google.com" + elem.get_attribute("href")
            elif platform_name == "daangn":
                elem = page.locator("main h1").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = url
            elif platform_name == "mobon":
                elem = page.locator(".list_wrap a, .post a").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = elem.get_attribute("href")
            elif platform_name == "criteo":
                elem = page.locator("h3 a").first
                if elem.count() > 0:
                    title_text = elem.inner_text()
                    link_url = elem.get_attribute("href")
        except Exception as e:
            print(f"Specific selector failed for {platform_name}: {e}")

        # 2. Apply strict extraction if successful
        if title_text and len(title_text.strip()) > 2:
            notice["title"] = title_text.strip()
            if link_url:
                if link_url.startswith('/'):
                    from urllib.parse import urlparse
                    parsed_uri = urlparse(url)
                    link_url = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_uri) + link_url
                notice["url"] = link_url
        else:
            # 3. Fallback to Generic Extraction via BeautifulSoup
            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            links = soup.find_all('a')
            for link in links:
                text = link.get_text(strip=True)
                href = link.get('href')
                if text and len(text) > 12 and href:
                    if 'notice' in href.lower() or 'bulletin' in href.lower() or 'announcement' in href.lower() or 'guide' in href.lower() or 'insight' in href.lower():
                        notice["title"] = text
                        if href.startswith('/'):
                            from urllib.parse import urlparse
                            parsed_uri = urlparse(url)
                            notice["url"] = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_uri) + href
                        elif href.startswith('http'):
                            notice["url"] = href
                        break
                    
        browser.close()
    except Exception as e:
        print(f"Error crawling {platform_name}: {e}")
        
    return notice

def main():
    today = datetime.datetime.now().strftime("%Y.%m.%d")
    print(f"Starting Scraper for {today}")
    
    platforms = [
        {"name": "naver", "url": "https://ads.naver.com/notice", "category": "notice"},
        {"name": "kakao", "url": "https://lounge-board.kakao.com/bulletin/list?serviceType=KAKAOMOMENT", "category": "notice"},
        {"name": "google", "url": "https://support.google.com/google-ads/announcements/9048695?sjid=183181733834323708-NC", "category": "policy"},
        {"name": "daangn", "url": "https://businessdaangn.gitbook.io/business.daangn/guide/account", "category": "notice"},
        {"name": "mobon", "url": "https://www.mobon.net/main/m2/blog/insight.php", "category": "notice"},
        {"name": "criteo", "url": "https://www.criteo.com/", "category": "notice"}
    ]
    
    notices = []
    with sync_playwright() as p:
        for p_info in platforms:
            print(f"Crawling {p_info['name']}...")
            notice = crawl_platform(p, p_info['name'], p_info['url'], p_info['category'])
            notices.append(notice)
            
    # Finalize and Save
    with open('notices.json', 'w', encoding='utf-8') as f:
        json.dump(notices, f, ensure_ascii=False, indent=4)
    print(f"Sync Complete. {len(notices)} insights items pushed.")

if __name__ == "__main__":
    main()
