import imaplib
import email
from email.header import decode_header
import json
import os
import re
from datetime import datetime, timedelta

# --- CONFIGURATION ---
IMAP_SERVER = "imap.gmail.com" 
EMAIL_USER = "oilguys@motiv-i.com"
EMAIL_PASS = os.getenv("EMAIL_PASS")
# ---------------------

# Platform whitelist patterns (Sender or Subject)
PLATFORM_FILTERS = {
    'naver': r'naver|네이버',
    'kakao': r'kakao|카카오',
    'google': r'google|구글|ads-noreply',
    'meta': r'meta|facebook|instagram|비즈니스',
    'daangn': r'daangn|당근',
}

def clean_html(raw_html):
    """Remove HTML tags to get clean text for the dashboard."""
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    cleantext = re.sub(cleanr, '', raw_html)
    return " ".join(cleantext.split())

def get_platform_source(subject, sender):
    combined = f"{subject} {sender}".lower()
    for source, pattern in PLATFORM_FILTERS.items():
        if re.search(pattern, combined):
            return source
    return 'others'

def fetch_platform_emails():
    if not EMAIL_PASS:
        print("Error: EMAIL_PASS environment variable is not set.")
        return

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("inbox")

        # Fetch emails from the last 3 months (90 days)
        date_cutoff = (datetime.now() - timedelta(days=90)).strftime("%d-%b-%Y")
        search_query = f'(SINCE "{date_cutoff}")'
        status, messages = mail.search(None, search_query)
        
        email_ids = messages[0].split()
        fetched_emails = []

        print(f"Searching through {len(email_ids)} recent emails...")

        for e_id in reversed(email_ids):
            res, msg_data = mail.fetch(e_id, "(RFC822)")
            for response in msg_data:
                if isinstance(response, tuple):
                    msg = email.message_from_bytes(response[1])
                    
                    subject = decode_header(msg["Subject"])[0]
                    if isinstance(subject[0], bytes):
                        subject = subject[0].decode(subject[1] if subject[1] else "utf-8")
                    else:
                        subject = subject[0]
                    
                    from_ = msg.get("From", "")
                    
                    source = get_platform_source(subject, from_)
                    if source == 'others': continue # Skip irrelevant personal emails

                    # Robust body extraction (HTML & Plain)
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                body += part.get_payload(decode=True).decode(errors='ignore')
                            elif part.get_content_type() == "text/html":
                                html_content = part.get_payload(decode=True).decode(errors='ignore')
                                body += clean_html(html_content)
                    else:
                        body = msg.get_payload(decode=True).decode(errors='ignore')

                    fetched_emails.append({
                        "id": f"mail_{e_id.decode()}",
                        "source": source,
                        "from": from_,
                        "title": subject,
                        "date": msg.get("Date"),
                        "body": body[:3000].strip() # Dashboard friendly size
                    })

            if len(fetched_emails) >= 30: break # Max view

        output_path = os.path.join(os.path.dirname(__file__), '..', 'emails.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(fetched_emails, f, ensure_ascii=False, indent=4)
            
        print(f"Success: {len(fetched_emails)} platform emails integrated.")
        mail.close()
        mail.logout()

    except imaplib.IMAP4.error as e:
        print(f"Authentication Failed: Check if 'App Password' is required for {EMAIL_USER}")
    except Exception as e:
        print(f"Sync error: {e}")

if __name__ == "__main__":
    fetch_platform_emails()
