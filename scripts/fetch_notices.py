import requests
from bs4 import BeautifulSoup
import json
import datetime
import os

def fetch_naver():
    notices = []
    # Using the searchad.naver.com notice list
    url = "https://searchad.naver.com/customer-center/notice/list"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        # Note: Naver Search Ads might block simple requests or use JS. 
        # For simplicity in this demo, we'll try to catch common patterns.
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Look for notice items - this selector may need adjustment based on Naver's live HTML
            items = soup.select('.list_notice .item') or soup.select('table tbody tr')
            for i, item in enumerate(items[:10]):
                title_el = item.select_one('.title') or item.select_one('td.subject')
                date_el = item.select_one('.date') or item.select_one('td.date')
                link_el = item.select_one('a')
                
                if title_el and date_el:
                    title = title_el.get_text(strip=True)
                    date = date_el.get_text(strip=True).replace('-', '.')
                    link = "https://searchad.naver.com" + link_el['href'] if link_el and link_el['href'].startswith('/') else (link_el['href'] if link_el else url)
                    
                    notices.append({
                        "id": f"naver_{i}",
                        "platform": "naver",
                        "category": "notice",
                        "productType": "all",
                        "title": title,
                        "desc": title, # Using title as desc if summary not available
                        "content": "상세 내용은 원문을 확인해주세요.",
                        "url": link,
                        "date": date
                    })
    except Exception as e:
        print(f"Naver Error: {e}")
    return notices

def fetch_kakao():
    notices = []
    url = "https://business.kakao.com/info/notice/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Kakao often uses a list structure
            items = soup.select('.list_post li') or soup.select('.notice_list li')
            for i, item in enumerate(items[:10]):
                title_el = item.select_one('.tit_post') or item.select_one('.title')
                date_el = item.select_one('.txt_date') or item.select_one('.date')
                link_el = item.select_one('a')
                
                if title_el:
                    title = title_el.get_text(strip=True)
                    date = date_el.get_text(strip=True) if date_el else datetime.datetime.now().strftime("%Y.%m.%d")
                    link = link_el['href'] if link_el else url
                    if link.startswith('/'): link = "https://business.kakao.com" + link
                    
                    notices.append({
                        "id": f"kakao_{i}",
                        "platform": "kakao",
                        "category": "notice",
                        "productType": "all",
                        "title": title,
                        "desc": title,
                        "content": "카카오비즈니스 최신 공지사항입니다.",
                        "url": link,
                        "date": date
                    })
    except Exception as e:
        print(f"Kakao Error: {e}")
    return notices

def main():
    print("Fetching notices...")
    all_notices = []
    
    # Real fetches
    all_notices.extend(fetch_naver())
    all_notices.extend(fetch_kakao())
    
    # If no real data found (e.g. anti-crawling), keep at least some mock data so the app isn't empty
    if not all_notices:
        print("No real data fetched, adding sample data for fallback.")
        all_notices = [
            {
                "id": "sample_1",
                "platform": "naver",
                "category": "notice",
                "productType": "search",
                "title": "[점검] 광고 시스템 최적화 작업 안내",
                "desc": "서비스 안정화를 위한 일 정 점검 안내입니다.",
                "content": "안정적인 서비스 제공을 위한 서버 점검입니다.",
                "url": "https://searchad.naver.com/",
                "date": datetime.datetime.now().strftime("%Y.%m.%d")
            }
        ]
    
    # Save to JSON
    with open('notices.json', 'w', encoding='utf-8') as f:
        json.dump(all_notices, f, ensure_ascii=False, indent=4)
    
    print(f"Saved {len(all_notices)} notices to notices.json")

if __name__ == "__main__":
    main()
