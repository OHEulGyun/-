import requests
from bs4 import BeautifulSoup
import json
import datetime
import os
import re

# Common Headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_naver():
    notices = []
    # Using the customer center notice list (often more accessible)
    url = "https://searchad.naver.com/customer-center/notice/list"
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Naver Search Ads structure (Table based)
            rows = soup.select('table.notice_list tbody tr') or soup.select('.list_notice li')
            for i, row in enumerate(rows[:8]):
                title_el = row.select_one('td.subject a') or row.select_one('.tit')
                date_el = row.select_one('td.date') or row.select_one('.date')
                
                if title_el:
                    title = title_el.get_text(strip=True)
                    date = date_el.get_text(strip=True).replace('-', '.') if date_el else datetime.datetime.now().strftime("%Y.%m.%d")
                    href = title_el.get('href', '')
                    link = f"https://searchad.naver.com{href}" if href.startswith('/') else href
                    
                    notices.append({
                        "id": f"naver_{datetime.datetime.now().strftime('%m%d')}_{i}",
                        "platform": "naver",
                        "category": "product" if "상품" in title or "출시" in title else "notice",
                        "productType": "search",
                        "title": title,
                        "desc": title,
                        "content": "네이버 검색광고의 최신 공지사항입니다. 상세 내용은 원문 링크를 확인해주세요.",
                        "url": link,
                        "date": date
                    })
    except Exception as e:
        print(f"Naver Error: {e}")
    return notices

def fetch_kakao():
    notices = []
    url = "https://business.kakao.com/info/notice/"
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.select('.list_post li') or soup.select('.list_notice li')
            for i, item in enumerate(items[:8]):
                title_el = item.select_one('.tit_post') or item.select_one('.title')
                date_el = item.select_one('.txt_date') or item.select_one('.date')
                link_el = item.select_one('a')
                
                if title_el:
                    title = title_el.get_text(strip=True)
                    date = date_el.get_text(strip=True).replace('-', '.') if date_el else datetime.datetime.now().strftime("%Y.%m.%d")
                    link = link_el.get('href', '')
                    if link.startswith('/'): link = f"https://business.kakao.com{link}"
                    
                    notices.append({
                        "id": f"kakao_{datetime.datetime.now().strftime('%m%d')}_{i}",
                        "platform": "kakao",
                        "category": "notice",
                        "productType": "all",
                        "title": title,
                        "desc": "카카오 비즈니스 및 광고 시스템 관련 최신 소식입니다.",
                        "content": "",
                        "url": link,
                        "date": date
                    })
    except Exception as e:
        print(f"Kakao Error: {e}")
    return notices

def fetch_google():
    notices = []
    # Google Ads Announcements
    url = "https://support.google.com/google-ads/announcements/9048695?hl=ko"
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Extract list items from the support page
            # Usually inside .article-content or similar
            content = soup.select_one('.article-content') or soup.select_one('.cc')
            if content:
                # Find paragraphs or list items that look like links
                items = content.find_all(['li', 'p'])
                count = 0
                for item in items:
                    link_el = item.find('a')
                    if link_el and count < 5:
                        title = link_el.get_text(strip=True)
                        if len(title) > 10:
                            link = link_el.get('href', '')
                            if link.startswith('/'): link = f"https://support.google.com{link}"
                            notices.append({
                                "id": f"google_{count}",
                                "platform": "google",
                                "category": "policy" if "정책" in title else "notice",
                                "productType": "all",
                                "title": title,
                                "desc": "Google Ads 공식 업데이트 소식입니다.",
                                "url": link,
                                "date": datetime.datetime.now().strftime("%Y.%m.%d")
                            })
                            count += 1
    except Exception as e:
        print(f"Google Error: {e}")
    return notices

def fetch_daangn():
    notices = []
    url = "https://business.daangn.com/notice"
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.select('a[class*="NoticeList_noticeItem"]') or soup.select('.notice-list a')
            for i, item in enumerate(items[:5]):
                title_el = item.select_one('h3') or item.select_one('.title')
                date_el = item.select_one('span[class*="NoticeList_date"]') or item.select_one('.date')
                
                if title_el:
                    title = title_el.get_text(strip=True)
                    date = date_el.get_text(strip=True) if date_el else ""
                    link = "https://business.daangn.com" + item.get('href', '')
                    
                    notices.append({
                        "id": f"daangn_{i}",
                        "platform": "daangn",
                        "category": "notice",
                        "productType": "all",
                        "title": title,
                        "desc": "당근비즈니스 최신 공지사항입니다.",
                        "url": link,
                        "date": date
                    })
    except Exception as e:
        print(f"Daangn Error: {e}")
    return notices

def fetch_meta():
    notices = []
    # Meta for Business news
    url = "https://www.facebook.com/business/news"
    try:
        # Note: Meta often uses complex JS, so this is a best-effort scrape of the static tags
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Look for article titles
            items = soup.find_all('h3') or soup.select('a[href*="/business/news/"]')
            for i, item in enumerate(items[:5]):
                title = item.get_text(strip=True)
                if len(title) > 5:
                    link = item.find_parent('a').get('href', url) if item.name == 'h3' and item.find_parent('a') else (item.get('href', url))
                    if link.startswith('/'): link = "https://www.facebook.com" + link
                    
                    notices.append({
                        "id": f"meta_{i}",
                        "platform": "meta",
                        "category": "product",
                        "productType": "display",
                        "title": title,
                        "desc": "Meta(Facebook/Instagram) 광고 시스템의 새로운 소식입니다.",
                        "url": link,
                        "date": datetime.datetime.now().strftime("%Y.%m.%d")
                    })
    except Exception as e:
        print(f"Meta Error: {e}")
    return notices

def main():
    print("Fetching all notices...")
    all_notices = []
    
    all_notices.extend(fetch_naver())
    all_notices.extend(fetch_kakao())
    all_notices.extend(fetch_google())
    all_notices.extend(fetch_meta())
    all_notices.extend(fetch_daangn())
    
    # Add some 'Others' (Mobon, etc.) as samples or best-effort
    all_notices.append({
        "id": "mobon_1",
        "platform": "others",
        "category": "notice",
        "productType": "display",
        "title": "[모비온] 타겟팅 고도화 및 매체 리포트 기능 개선 안내",
        "desc": "네트워크 광고 서비스 개선 작업에 대한 공지입니다.",
        "url": "https://www.mobon.net/",
        "date": datetime.datetime.now().strftime("%Y.%m.%d")
    })

    # Sort by date (descending) - approximate
    all_notices.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Deduplicate by title
    seen_titles = set()
    unique_notices = []
    for n in all_notices:
        if n['title'] not in seen_titles:
            unique_notices.append(n)
            seen_titles.add(n['title'])
    
    # Save to JSON
    with open('notices.json', 'w', encoding='utf-8') as f:
        json.dump(unique_notices, f, ensure_ascii=False, indent=4)
    
    print(f"Process complete. Total notices saved: {len(unique_notices)}")

if __name__ == "__main__":
    main()
