#!/usr/bin/env python3
"""
Digital Ocean Deployment Script for DataWeb ML Hub
Deploys Streamlit applications to Digital Ocean App Platform
"""

import os
import json
import requests
import time
from pathlib import Path
import zipfile
import tempfile

class DigitalOceanDeployer:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = "https://api.digitalocean.com/v2"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    def create_app(self, app_name, region="nyc"):
        """Create a new app on Digital Ocean"""
        app_spec = {
            "name": app_name,
            "region": region,
            "services": [
                {
                    "name": "streamlit-app",
                    "source_dir": "/",
                    "github": {
                        "repo": "your-github-repo/dataweb",
                        "branch": "main"
                    },
                    "run_command": "streamlit run streamlit_apps/main.py --server.port $PORT --server.address 0.0.0.0",
                    "environment_slug": "python",
                    "instance_count": 1,
                    "instance_size_slug": "basic-xxs"
                }
            ],
            "databases": [
                {
                    "name": "dataweb-db",
                    "engine": "PG",
                    "version": "14",
                    "production": False
                }
            ]
        }
        
        response = requests.post(
            f"{self.base_url}/apps",
            headers=self.headers,
            json={"spec": app_spec}
        )
        
        if response.status_code == 201:
            app_data = response.json()
            print(f"✅ App created successfully: {app_data['app']['id']}")
            return app_data['app']['id']
        else:
            print(f"❌ Failed to create app: {response.text}")
            return None
    
    def deploy_app(self, app_id):
        """Deploy the app"""
        response = requests.post(
            f"{self.base_url}/apps/{app_id}/deployments",
            headers=self.headers
        )
        
        if response.status_code == 201:
            deployment_data = response.json()
            print(f"✅ Deployment started: {deployment_data['deployment']['id']}")
            return deployment_data['deployment']['id']
        else:
            print(f"❌ Failed to start deployment: {response.text}")
            return None
    
    def get_deployment_status(self, app_id, deployment_id):
        """Check deployment status"""
        response = requests.get(
            f"{self.base_url}/apps/{app_id}/deployments/{deployment_id}",
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json()['deployment']['phase']
        return None
    
    def wait_for_deployment(self, app_id, deployment_id, timeout=300):
        """Wait for deployment to complete"""
        print("⏳ Waiting for deployment to complete...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.get_deployment_status(app_id, deployment_id)
            print(f"📊 Deployment status: {status}")
            
            if status == "SUCCESS":
                print("✅ Deployment completed successfully!")
                return True
            elif status in ["ERROR", "CANCELED"]:
                print(f"❌ Deployment failed with status: {status}")
                return False
            
            time.sleep(10)
        
        print("⏰ Deployment timeout")
        return False
    
    def get_app_url(self, app_id):
        """Get the app URL"""
        response = requests.get(
            f"{self.base_url}/apps/{app_id}",
            headers=self.headers
        )
        
        if response.status_code == 200:
            app_data = response.json()
            return app_data['app']['live_url']
        return None

def create_app_spec():
    """Create the app specification file"""
    app_spec = {
        "name": "dataweb-ml-hub",
        "services": [
            {
                "name": "streamlit-app",
                "source_dir": "/streamlit_apps",
                "run_command": "streamlit run main.py --server.port $PORT --server.address 0.0.0.0",
                "environment_slug": "python",
                "instance_count": 1,
                "instance_size_slug": "basic-xxs",
                "envs": [
                    {
                        "key": "STREAMLIT_SERVER_PORT",
                        "value": "$PORT"
                    },
                    {
                        "key": "STREAMLIT_SERVER_ADDRESS",
                        "value": "0.0.0.0"
                    }
                ]
            }
        ],
        "databases": [
            {
                "name": "dataweb-db",
                "engine": "PG",
                "version": "14",
                "production": False
            }
        ]
    }
    
    with open("app.yaml", "w") as f:
        json.dump(app_spec, f, indent=2)
    
    print("✅ Created app.yaml specification file")

def create_dockerfile():
    """Create a Dockerfile for the Streamlit app"""
    dockerfile_content = """# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY streamlit_apps/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY streamlit_apps/ .

# Expose port
EXPOSE 8501

# Set environment variables
ENV STREAMLIT_SERVER_PORT=8501
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0

# Run the application
CMD ["streamlit", "run", "main.py", "--server.port=8501", "--server.address=0.0.0.0"]
"""
    
    with open("Dockerfile", "w") as f:
        f.write(dockerfile_content)
    
    print("✅ Created Dockerfile")

def create_github_workflow():
    """Create GitHub Actions workflow for automatic deployment"""
    workflow_content = """name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Digital Ocean
      uses: digitalocean/app_action@main
      with:
        app_name: dataweb-ml-hub
        token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
        images: '[{"name":"streamlit-app","registry_type":"DOCKER_HUB","registry":"your-dockerhub-username","repository":"dataweb-ml-hub","tag":"latest"}]'
"""
    
    os.makedirs(".github/workflows", exist_ok=True)
    with open(".github/workflows/deploy.yml", "w") as f:
        f.write(workflow_content)
    
    print("✅ Created GitHub Actions workflow")

def main():
    """Main deployment function"""
    print("🚀 DataWeb ML Hub - Digital Ocean Deployment")
    print("=" * 50)
    
    # Get API token from environment
    api_token = os.getenv("DIGITALOCEAN_API_TOKEN")
    if not api_token:
        print("❌ DIGITALOCEAN_API_TOKEN environment variable not set")
        return
    
    # Create deployment files
    create_app_spec()
    create_dockerfile()
    create_github_workflow()
    
    # Initialize deployer
    deployer = DigitalOceanDeployer(api_token)
    
    # Create app
    app_name = "dataweb-ml-hub"
    print(f"📦 Creating app: {app_name}")
    app_id = deployer.create_app(app_name)
    
    if not app_id:
        print("❌ Failed to create app")
        return
    
    # Deploy app
    print("🚀 Starting deployment...")
    deployment_id = deployer.deploy_app(app_id)
    
    if not deployment_id:
        print("❌ Failed to start deployment")
        return
    
    # Wait for deployment
    success = deployer.wait_for_deployment(app_id, deployment_id)
    
    if success:
        app_url = deployer.get_app_url(app_id)
        if app_url:
            print(f"🎉 App deployed successfully!")
            print(f"🌐 App URL: {app_url}")
            print(f"📊 Streamlit Dashboard: {app_url}")
        else:
            print("✅ Deployment successful but couldn't get app URL")
    else:
        print("❌ Deployment failed")

if __name__ == "__main__":
    main()
