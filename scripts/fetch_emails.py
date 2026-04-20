import imaplib
import email
from email.header import decode_header
import json
import os
from datetime import datetime

# --- CONFIGURATION ---
IMAP_SERVER = "imap.gmail.com"
EMAIL_USER = "oilguys@motiv-i.com"
EMAIL_PASS = os.getenv("EMAIL_PASS")  # Password now loaded from environment variable for security
# ---------------------

def get_platform_source(subject, sender):
    subject = subject.lower()
    sender = sender.lower()
    if 'naver' in subject or 'naver' in sender: return 'naver'
    if 'kakao' in subject or 'kakao' in sender: return 'kakao'
    if 'google' in subject or 'google' in sender: return 'google'
    if 'meta' in subject or 'facebook' in sender or 'instagram' in sender: return 'meta'
    if 'daangn' in subject or 'daangn' in sender: return 'daangn'
    return 'others'

def fetch_platform_emails():
    if not EMAIL_PASS:
        print("Error: EMAIL_PASS environment variable is not set.")
        print("Please set it using: $env:EMAIL_PASS='your_password' (PowerShell) or see documentation.")
        return

    try:
        # Connect to server
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("inbox")

        # Search for all emails (you can limit this, e.g., UNSEEN or from specific domains)
        # Search for common platform keywords to filter early if needed
        status, messages = mail.search(None, 'ALL')
        
        email_ids = messages[0].split()
        # Get last 20 emails
        latest_email_ids = email_ids[-20:]

        fetched_emails = []

        for e_id in reversed(latest_email_ids):
            res, msg = mail.fetch(e_id, "(RFC822)")
            for response in msg:
                if isinstance(response, tuple):
                    msg = email.message_from_bytes(response[1])
                    
                    # Store headers
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")
                    
                    from_, encoding = decode_header(msg.get("From"))[0]
                    if isinstance(from_, bytes):
                        from_ = from_.decode(encoding if encoding else "utf-8")
                    
                    date_ = msg.get("Date")
                    
                    # Filter: Only include platform-related emails
                    source = get_platform_source(subject, from_)
                    
                    # Extract body
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))
                            try:
                                payload = part.get_payload(decode=True).decode()
                                if content_type == "text/plain" and "attachment" not in content_disposition:
                                    body += payload
                            except:
                                pass
                    else:
                        body = msg.get_payload(decode=True).decode()

                    fetched_emails.append({
                        "id": f"mail_{e_id.decode()}",
                        "source": source,
                        "from": from_,
                        "title": subject,
                        "date": date_,
                        "body": body[:2000] # Limit size
                    })

        # Save to JSON
        output_path = os.path.join(os.path.dirname(__file__), '..', 'emails.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(fetched_emails, f, ensure_ascii=False, indent=4)
            
        print(f"Successfully fetched {len(fetched_emails)} emails and saved to emails.json")
        mail.close()
        mail.logout()

    except Exception as e:
        print(f"Error fetching emails: {e}")

if __name__ == "__main__":
    fetch_platform_emails()
