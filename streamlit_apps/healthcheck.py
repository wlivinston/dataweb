#!/usr/bin/env python3
"""
Health check endpoint for ML Hub service
This file provides a simple HTTP endpoint that DigitalOcean can use for health checks
"""

import http.server
import socketserver
import os
import sys
import subprocess
import threading
import time

class HealthCheckHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_response(404)
            self.end_headers()

def run_health_check_server():
    """Run a simple HTTP server for health checks"""
    PORT = int(os.environ.get('HEALTH_CHECK_PORT', 8081))
    
    try:
        with socketserver.TCPServer(("", PORT), HealthCheckHandler) as httpd:
            print(f"Health check server running on port {PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Health check server error: {e}")

def run_streamlit():
    """Run the main Streamlit application"""
    cmd = [
        sys.executable, "-m", "streamlit", "run", "main.py",
        "--server.port", os.environ.get('PORT', '8080'),
        "--server.address", "0.0.0.0",
        "--server.baseUrlPath", "ml"
    ]
    
    print(f"Starting Streamlit with command: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Streamlit error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Start health check server in a separate thread
    health_thread = threading.Thread(target=run_health_check_server, daemon=True)
    health_thread.start()
    
    # Give health check server time to start
    time.sleep(2)
    
    # Start Streamlit
    run_streamlit()
