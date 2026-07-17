# DocGenius AI - Backend Server Proxy (server.py)
import http.server
import socketserver
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

PORT = 8080

class DocGeniusHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS requests
        self.send_header('Access-Control-Allow-Origin', '*')
        # Disable caching to ensure updates are reflected instantly
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/send-email':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                smtp_config = data.get('smtp', {})
                to_email = data.get('to')
                subject = data.get('subject')
                body = data.get('body')
                
                host = smtp_config.get('host', 'smtp.gmail.com')
                port = int(smtp_config.get('port', 587))
                user = smtp_config.get('user')
                password = smtp_config.get('pass')
                
                if not user or not password or not to_email:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'error', 'message': 'Missing user, password, or recipient email'}).encode('utf-8'))
                    return
                
                # Compose MIME Message
                msg = MIMEMultipart()
                msg['From'] = user
                msg['To'] = to_email
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'html'))
                
                # SMTP Dispatch
                server = smtplib.SMTP(host, port)
                server.starttls()
                server.login(user, password)
                server.sendmail(user, to_email, msg.as_string())
                server.quit()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

# Configure and bind socket connection
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", PORT), DocGeniusHandler) as httpd:
    print(f"DocGenius Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
