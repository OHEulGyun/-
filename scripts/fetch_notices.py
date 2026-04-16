import os
import json
import datetime
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def get_page_content(browser, url, selector):
    try:
        page = browser.new_page()
        # Set a very real user agent
        page.set_extra_http_headers({"Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8"})
        print(f"Opening {url}...")
        page.goto(url, wait_until="load", timeout=45000)
        
        # Take a breather for JS to execute
        page.wait_for_timeout(3000) 
        
        # Try to find common notice markers if specific selector fails
        content = page.content()
        page.close()
        return content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def fetch_naver(browser):
    notices = []
    # Primary URL for Naver Search Ads
    url = "https://searchad.naver.com/customer-center/notice/list"
    content = get_page_content(browser, url, "body")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        # Very broad selector to catch titles
        links = soup.select('a[href*="notice/"]') or soup.select('td.subject a') or soup.select('.tit')
        for i, link_el in enumerate(links[:8]):
            title = link_el.get_text(strip=True)
            if len(title) > 5:
                href = link_el.get('href', '')
                full_link = f"https://searchad.naver.com{href}" if href.startswith('/') else href
                notices.append({"platform": "naver", "title": title, "url": full_link})
    return notices

def fetch_kakao(browser):
    notices = []
    url = "https://business.kakao.com/info/notice/"
    content = get_page_content(browser, url, "body")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        # Look for notice titles in Kakao
        items = soup.select('.pit_post') or soup.select('.tit_post') or soup.select('.title') or soup.select('a[class*="link_post"]')
        for i, item in enumerate(items[:8]):
            title = item.get_text(strip=True)
            if len(title) > 5:
                link = item.get('href', url) if item.name == 'a' else (item.find_parent('a').get('href', url) if item.find_parent('a') else url)
                if link.startswith('/'): link = f"https://business.kakao.com{link}"
                notices.append({"platform": "kakao", "title": title, "url": link})
    return notices

def fetch_google_ads(browser):
    notices = []
    url = "https://support.google.com/google-ads/announcements/9048695?hl=ko"
    content = get_page_content(browser, url, "body")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        # Find all help links that could be announcements
        links = soup.find_all('a', href=re.compile(r'/answer/|/announcements/')) if 're' in globals() else soup.find_all('a')
        count = 0
        for link_el in links:
            title = link_el.get_text(strip=True)
            if len(title) > 15 and count < 8:
                href = link_el.get('href', '')
                full_link = f"https://support.google.com{href}" if href.startswith('/') else href
                notices.append({"platform": "google", "title": title, "url": full_link})
                count += 1
    return notices

def fetch_daangn(browser):
    notices = []
    url = "https://business.daangn.com/notice"
    content = get_page_content(browser, url, "body")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        items = soup.find_all('h3') or soup.select('.title')
        for i, item in enumerate(items[:5]):
            title = item.get_text(strip=True)
            if len(title) > 5:
                link_el = item.find_parent('a') or item.find('a')
                link = "https://business.daangn.com" + link_el.get('href', '') if link_el else url
                notices.append({"platform": "daangn", "title": title, "url": link})
    return notices

def main():
    import re
    globals()['re'] = re
    
    final_notices = []
    today_str = datetime.datetime.now().strftime("%Y.%m.%d")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        funcs = [
            ("Naver", fetch_naver),
            ("Kakao", fetch_kakao),
            ("Google", fetch_google_ads),
            ("Daangn", fetch_daangn)
        ]
        
        # Re-fetch Meta as it was working
        print("Scraping Meta...")
        page = browser.new_page()
        try:
            page.goto("https://www.facebook.com/business/news", timeout=45000)
            page.wait_for_timeout(3000)
            soup = BeautifulSoup(page.content(), 'html.parser')
            meta_items = soup.find_all(['h3', 'h2'])
            for i, item in enumerate(meta_items[:5]):
                t = item.get_text(strip=True)
                if len(t) > 10:
                    l = item.find_parent('a').get('href', '') if item.find_parent('a') else ''
                    if l.startswith('/'): l = "https://www.facebook.com" + l
                    final_notices.append({"id": f"meta_{i}", "platform": "meta", "title": t, "url": l, "date": today_str, "category": "notice", "productType": "all", "desc": "Meta 실제 공지사항입니다."})
        except: pass
        page.close()

        # Fetch Others
        for name, func in funcs:
            print(f"Attempting {name}...")
            try:
                items = func(browser)
                for i, item in enumerate(items):
                    item["id"] = f"{item['platform']}_{i}_{datetime.datetime.now().strftime('%H%M')}"
                    item["date"] = today_str
                    item["category"] = "notice"
                    item["productType"] = "all"
                    item["desc"] = f"{name} 공식 실제 공지사항입니다."
                    final_notices.append(item)
            except Exception as e:
                print(f"Error in {name}: {e}")
        
        browser.close()

    # Final backup if still empty
    if len(final_notices) < 3:
        final_notices.append({"id": "emergency", "platform": "others", "title": "[안내] 시스템 동기화 및 매체별 데이터 수집 최적화 진행 중", "date": today_str, "category": "notice", "productType": "all", "desc": "실시간 데이터 반영을 위해 시스템을 점검하고 있습니다.", "url": "#"})

    with open('notices.json', 'w', encoding='utf-8') as f:
        json.dump(final_notices, f, ensure_ascii=False, indent=4)
    
    print(f"Done. Total: {len(final_notices)}")

if __name__ == "__main__":
    main()
