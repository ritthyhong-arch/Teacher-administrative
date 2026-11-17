"""
Daily Teacher Administration Monitoring System (PSIS)
Local HTTP Server Launcher
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

def run():
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    handler = http.server.SimpleHTTPRequestHandler
    
    # Try preferred port, or fall back to an open port
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), handler) as httpd:
                url = f"http://localhost:{port}/index.html"
                print("=" * 60)
                print("  សាលាបញ្ញាសាស្រ្តអន្តរជាតិ (PSIS)")
                print("  ប្រព័ន្ធត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ")
                print("=" * 60)
                print(f"Server is running at: {url}")
                print("Press Ctrl+C to stop the server.")
                print("=" * 60)
                
                # Open browser automatically
                try:
                    webbrowser.open(url)
                except Exception as e:
                    print(f"Could not open browser automatically: {e}")
                
                httpd.serve_forever()
                break
        except OSError:
            port += 1
            continue

if __name__ == '__main__':
    run()
