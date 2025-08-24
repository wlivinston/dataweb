#!/usr/bin/env python3
"""
Digital Ocean Backend Deployment Script for DataWeb
Deploys the Node.js backend API to Digital Ocean App Platform
"""

import os
import json
import requests
import time
from pathlib import Path
import zipfile
import tempfile

class DigitalOceanBackendDeployer:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = "https://api.digitalocean.com/v2"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }

    def create_backend_app(self, app_name="dataweb-backend"):
        """Create the backend app on Digital Ocean"""
        try:
            # Create app spec for backend
            app_spec = {
                "name": app_name,
                "services": [
                    {
                        "name": "api",
                        "source_dir": "/backend",
                        "github": {
                            "repo": "your-username/dataweb",
                            "branch": "main"
                        },
                        "run_command": "npm start",
                        "environment_slug": "node-js",
                        "instance_count": 1,
                        "instance_size_slug": "basic-xxs",
                        "http_port": 3001,
                        "envs": [
                            {"key": "NODE_ENV", "value": "production"},
                            {"key": "PORT", "value": "3001"},
                            {"key": "DATABASE_URL", "value": "${DATABASE_URL}", "type": "SECRET"},
                            {"key": "JWT_SECRET", "value": "${JWT_SECRET}", "type": "SECRET"},
                            {"key": "SMTP_HOST", "value": "${SMTP_HOST}"},
                            {"key": "SMTP_PORT", "value": "${SMTP_PORT}"},
                            {"key": "SMTP_USER", "value": "${SMTP_USER}", "type": "SECRET"},
                            {"key": "SMTP_PASS", "value": "${SMTP_PASS}", "type": "SECRET"},
                            {"key": "FRONTEND_URL", "value": "${FRONTEND_URL}"},
                            {"key": "ADMIN_EMAIL", "value": "${ADMIN_EMAIL}"}
                        ],
                        "health_check": {
                            "http_path": "/health",
                            "initial_delay_seconds": 10,
                            "period_seconds": 10,
                            "timeout_seconds": 5,
                            "success_threshold": 1,
                            "failure_threshold": 3
                        }
                    }
                ],
                "databases": [
                    {
                        "name": "dataweb-db",
                        "engine": "PG",
                        "version": "15",
                        "production": False
                    }
                ],
                "envs": [
                    {"key": "DATABASE_URL", "value": "${DATABASE_URL}", "type": "SECRET"},
                    {"key": "JWT_SECRET", "value": "${JWT_SECRET}", "type": "SECRET"},
                    {"key": "SMTP_USER", "value": "${SMTP_USER}", "type": "SECRET"},
                    {"key": "SMTP_PASS", "value": "${SMTP_PASS}", "type": "SECRET"}
                ],
                "region": "nyc"
            }

            print(f"🚀 Creating backend app: {app_name}")
            response = requests.post(
                f"{self.base_url}/apps",
                headers=self.headers,
                json={"spec": app_spec}
            )

            if response.status_code == 201:
                app_data = response.json()
                app_id = app_data["app"]["id"]
                print(f"✅ Backend app created successfully with ID: {app_id}")
                return app_id
            else:
                print(f"❌ Failed to create backend app: {response.status_code}")
                print(f"Response: {response.text}")
                return None

        except Exception as e:
            print(f"❌ Error creating backend app: {str(e)}")
            return None

    def deploy_backend_app(self, app_id):
        """Deploy the backend app"""
        try:
            print(f"🚀 Starting backend deployment for app ID: {app_id}")
            response = requests.post(
                f"{self.base_url}/apps/{app_id}/deployments",
                headers=self.headers,
                json={"force_build": True}
            )

            if response.status_code == 201:
                deployment_data = response.json()
                deployment_id = deployment_data["deployment"]["id"]
                print(f"✅ Backend deployment started with ID: {deployment_id}")
                return deployment_id
            else:
                print(f"❌ Failed to start backend deployment: {response.status_code}")
                print(f"Response: {response.text}")
                return None

        except Exception as e:
            print(f"❌ Error starting backend deployment: {str(e)}")
            return None

    def get_deployment_status(self, app_id, deployment_id):
        """Get deployment status"""
        try:
            response = requests.get(
                f"{self.base_url}/apps/{app_id}/deployments/{deployment_id}",
                headers=self.headers
            )

            if response.status_code == 200:
                deployment_data = response.json()
                return deployment_data["deployment"]["phase"]
            else:
                print(f"❌ Failed to get deployment status: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Error getting deployment status: {str(e)}")
            return None

    def wait_for_deployment(self, app_id, deployment_id, timeout=600):
        """Wait for deployment to complete"""
        print("⏳ Waiting for backend deployment to complete...")
        start_time = time.time()

        while time.time() - start_time < timeout:
            status = self.get_deployment_status(app_id, deployment_id)
            
            if status == "SUPERSEDED":
                print("⚠️  Deployment was superseded by a newer deployment")
                return False
            elif status == "ERROR":
                print("❌ Deployment failed")
                return False
            elif status == "ACTIVE":
                print("✅ Backend deployment completed successfully!")
                return True
            elif status == "PENDING":
                print("⏳ Deployment is pending...")
            elif status == "BUILDING":
                print("🔨 Building backend application...")
            elif status == "DEPLOYING":
                print("🚀 Deploying backend application...")

            time.sleep(10)

        print("⏰ Deployment timeout reached")
        return False

    def get_app_url(self, app_id):
        """Get the app URL"""
        try:
            response = requests.get(
                f"{self.base_url}/apps/{app_id}",
                headers=self.headers
            )

            if response.status_code == 200:
                app_data = response.json()
                return app_data["app"]["live_url"]
            else:
                print(f"❌ Failed to get app URL: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Error getting app URL: {str(e)}")
            return None

    def setup_database(self, app_id):
        """Setup database and get connection string"""
        try:
            print("🗄️  Setting up database...")
            response = requests.get(
                f"{self.base_url}/apps/{app_id}",
                headers=self.headers
            )

            if response.status_code == 200:
                app_data = response.json()
                databases = app_data["app"].get("databases", [])
                
                if databases:
                    db_id = databases[0]["id"]
                    print(f"✅ Database found with ID: {db_id}")
                    
                    # Get database connection info
                    db_response = requests.get(
                        f"{self.base_url}/databases/{db_id}",
                        headers=self.headers
                    )
                    
                    if db_response.status_code == 200:
                        db_data = db_response.json()
                        connection_info = db_data["database"]["connection"]
                        
                        # Construct DATABASE_URL
                        database_url = f"postgresql://{connection_info['user']}:{connection_info['password']}@{connection_info['host']}:{connection_info['port']}/{connection_info['database']}?sslmode=require"
                        
                        print("✅ Database connection string generated")
                        return database_url
                
                print("⚠️  No database found in app")
                return None
            else:
                print(f"❌ Failed to get app info: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Error setting up database: {str(e)}")
            return None

def create_backend_files():
    """Create backend files for deployment"""
    print("📁 Creating backend files for deployment...")
    
    # Create backend directory structure
    backend_dir = Path("backend")
    backend_dir.mkdir(exist_ok=True)
    
    # Create necessary files
    files_to_create = [
        ("package.json", """{
  "name": "dataweb-backend",
  "version": "1.0.0",
  "description": "DataWeb Backend API for comments, subscriptions, and authentication",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.7",
    "pg": "^8.11.3",
    "joi": "^17.11.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "crypto": "^1.0.1",
    "gray-matter": "^4.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}"""),
        ("Dockerfile", """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]"""),
        ("healthcheck.js", """const http = require('http');
const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3001,
  path: '/health',
  method: 'GET',
  timeout: 2000
};
const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});
req.on('error', () => process.exit(1));
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.end();""")
    ]
    
    for filename, content in files_to_create:
        file_path = backend_dir / filename
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ Created {filename}")

def main():
    print("🚀 DataWeb Backend - Digital Ocean Deployment")
    print("=" * 50)

    # Get API token from environment
    api_token = os.getenv("DIGITALOCEAN_API_TOKEN")
    if not api_token:
        print("❌ DIGITALOCEAN_API_TOKEN environment variable not set")
        return

    # Create backend files
    create_backend_files()

    # Initialize deployer
    deployer = DigitalOceanBackendDeployer(api_token)

    # Create backend app
    app_name = "dataweb-backend"
    print(f"📦 Creating backend app: {app_name}")
    app_id = deployer.create_backend_app(app_name)

    if not app_id:
        print("❌ Failed to create backend app")
        return

    # Setup database
    database_url = deployer.setup_database(app_id)
    if database_url:
        print(f"🗄️  Database URL: {database_url}")
        print("💡 You'll need to set this as an environment variable in your app")

    # Deploy backend
    print("🚀 Starting backend deployment...")
    deployment_id = deployer.deploy_backend_app(app_id)

    if not deployment_id:
        print("❌ Failed to start backend deployment")
        return

    # Wait for deployment
    success = deployer.wait_for_deployment(app_id, deployment_id)

    if success:
        app_url = deployer.get_app_url(app_id)
        if app_url:
            print(f"🎉 Backend deployed successfully!")
            print(f"🌐 Backend URL: {app_url}")
            print(f"📊 Health Check: {app_url}/health")
            print(f"🔗 API Base URL: {app_url}/api")
            print("\n📋 Next Steps:")
            print("1. Set up your environment variables in the Digital Ocean dashboard")
            print("2. Configure your database connection")
            print("3. Set up email service (SMTP)")
            print("4. Update your frontend to use the new backend URL")
        else:
            print("✅ Deployment successful but couldn't get app URL")
    else:
        print("❌ Backend deployment failed")

if __name__ == "__main__":
    main()
