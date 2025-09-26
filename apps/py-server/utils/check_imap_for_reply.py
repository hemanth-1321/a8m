import imaplib, email

def check_imap_for_reply(imap_host: str, email_user: str, email_pass: str, mailbox: str, reply_token: str) -> bool:
    try:
        mail = imaplib.IMAP4_SSL(imap_host)
        mail.login(email_user, email_pass)
        mail.select(mailbox)

        status, messages = mail.search(None, 'UNSEEN')  
        if status != "OK":
            return False

        for num in messages[0].split():
            typ, msg_data = mail.fetch(num, '(RFC822)')
            if typ != "OK" or not msg_data or not isinstance(msg_data[0], tuple):
                continue

            raw_email = msg_data[0][1]
            if not isinstance(raw_email, (bytes, bytearray)):
                continue

            msg = email.message_from_bytes(raw_email)

            subject = msg.get("subject", "")
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        body += part.get_payload(decode=True).decode(errors="ignore") # type: ignore
            else:
                body = msg.get_payload(decode=True).decode(errors="ignore") # type: ignore

            if reply_token in subject or reply_token in body:
                print(f"Reply token {reply_token} found in message {num}")
                return True

        return False
    except Exception as e:
        print(f"IMAP check failed: {e}")
        return False
