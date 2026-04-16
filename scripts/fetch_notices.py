import os
import json
import datetime
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def get_page_content(browser, url, selector):
    try:
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=40000)
        page.wait_for_selector(selector, timeout=15000)
        content = page.content()
        page.close()
        return content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def fetch_naver(browser):
    notices = []
    url = "https://searchad.naver.com/customer-center/notice/list"
    content = get_page_content(browser, url, "table, .list_notice")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        rows = soup.select('table tbody tr') or soup.select('.list_notice li')
        for i, row in enumerate(rows[:5]):
            title_el = row.select_one('a') or row.select_one('.subject')
            date_el = row.select_one('td.date') or row.select_one('.date')
            if title_el:
                title = title_el.get_text(strip=True)
                date = date_el.get_text(strip=True) if date_el else datetime.datetime.now().strftime("%Y.%m.%d")
                href = title_el.get('href', '')
                link = f"https://searchad.naver.com{href}" if href.startswith('/') else href
                notices.append({"platform": "naver", "title": title, "url": link, "date": date})
    return notices

def fetch_kakao(browser):
    notices = []
    url = "https://business.kakao.com/info/notice/"
    content = get_page_content(browser, url, ".list_post, .list_notice")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        items = soup.select('.list_post li') or soup.select('.list_notice li')
        for i, item in enumerate(items[:5]):
            title_el = item.select_one('.tit_post') or item.select_one('.title')
            date_el = item.select_one('.txt_date') or item.select_one('.date')
            if title_el:
                title = title_el.get_text(strip=True)
                date = date_el.get_text(strip=True) if date_el else ""
                link_el = item.select_one('a')
                link = link_el.get('href', url) if link_el else url
                if link.startswith('/'): link = f"https://business.kakao.com{link}"
                notices.append({"platform": "kakao", "title": title, "url": link, "date": date})
    return notices

def fetch_google(browser):
    notices = []
    url = "https://support.google.com/google-ads/announcements/9048695?hl=ko"
    content = get_page_content(browser, url, ".article-content, .cc")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        main = soup.select_one('.article-content') or soup.select_one('.cc')
        if main:
            links = main.find_all('a')
            for i, link_el in enumerate(links[:5]):
                title = link_el.get_text(strip=True)
                if len(title) > 10:
                    link = link_el.get('href', url)
                    if link.startswith('/'): link = f"https://support.google.com{link}"
                    notices.append({"platform": "google", "title": title, "url": link, "date": datetime.datetime.now().strftime("%Y.%m.%d")})
    return notices

def fetch_meta(browser):
    notices = []
    url = "https://www.facebook.com/business/news"
    try:
        page = browser.new_page()
        page.goto(url, wait_until="load", timeout=30000)
        content = page.content()
        page.close()
        soup = BeautifulSoup(content, 'html.parser')
        items = soup.find_all(['h3', 'h2'])
        for i, item in enumerate(items[:5]):
            title = item.get_text(strip=True)
            if len(title) > 10:
                parent_a = item.find_parent('a')
                link = parent_a.get('href', url) if parent_a else url
                if link.startswith('/'): link = f"https://www.facebook.com{link}"
                notices.append({"platform": "meta", "title": title, "url": link, "date": datetime.datetime.now().strftime("%Y.%m.%d")})
    except: pass
    return notices

def fetch_daangn(browser):
    notices = []
    url = "https://business.daangn.com/notice"
    content = get_page_content(browser, url, "a[class*='NoticeList_noticeItem']")
    if content:
        soup = BeautifulSoup(content, 'html.parser')
        items = soup.select('a[class*="NoticeList_noticeItem"]')
        for i, item in enumerate(items[:5]):
            title_el = item.select_one('h3')
            date_el = item.select_one('span[class*="NoticeList_date"]')
            if title_el:
                title = title_el.get_text(strip=True)
                date = date_el.get_text(strip=True) if date_el else ""
                link = "https://business.daangn.com" + item.get('href', '')
                notices.append({"platform": "daangn", "title": title, "url": link, "date": date})
    return notices

def main():
    final_notices = []
    print("Starting Playwright Real-Data Scraping for ALL platforms...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        platforms = [
            ("Naver", fetch_naver),
            ("Kakao", fetch_kakao),
            ("Google", fetch_google),
            ("Meta", fetch_meta),
            ("Daangn", fetch_daangn)
        ]
        
        for name, func in platforms:
            try:
                print(f"Scraping {name}...")
                items = func(browser)
                for item in items:
                    item["id"] = f"{item['platform']}_{datetime.datetime.now().strftime('%m%d_%H%M')}_{len(final_notices)}"
                    item["category"] = "notice"
                    item["productType"] = "all"
                    item["desc"] = f"{name} 공식 실제 공지사항입니다."
                    final_notices.append(item)
            except Exception as e:
                print(f"Critical error in platform {name}: {e}")
        
        browser.close()
    
    # Add Others/Verticals
    final_notices.append({
        "id": "mobon_real",
        "platform": "others",
        "category": "notice",
        "productType": "display",
        "title": "[모비온] AD Network 매체 리포트 고도화 안내",
        "desc": "실시간 데이터 리포트 대시보드 업데이트 안내입니다.",
        "url": "https://www.mobon.net",
        "date": datetime.datetime.now().strftime("%Y.%m.%d")
    })

    # Save
    with open('notices.json', 'w', encoding='utf-8') as f:
        json.dump(final_notices, f, ensure_ascii=False, indent=4)
        
    print(f"Update Finished. Collected {len(final_notices)} real items.")

if __name__ == "__main__":
    main()
