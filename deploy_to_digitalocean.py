#!/usr/bin/env python3
"""
DataAfrik.com Deployment Script
Deploys the DataWeb platform to www.dataafrik.com on DigitalOcean
"""

import os
import subprocess
import json
import time
import requests
from pathlib import Path

class DataAfrikDeployer:
    def __init__(self):
        self.github_username = "dataafrik"  # You can change this
        self.repo_name = "dataweb"
        self.app_name = "dataafrik-platform"
        
    def setup_git(self):
        """Setup Git repository and push to GitHub"""
        print("🚀 Setting up Git repository...")
        
        # Check if remote already exists
        result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True)
        if "origin" in result.stdout:
            print("✅ Git remote already configured")
            return True
            
        # Add remote origin
        remote_url = f"https://github.com/{self.github_username}/{self.repo_name}.git"
        subprocess.run(["git", "remote", "add", "origin", remote_url])
        print(f"✅ Added remote origin: {remote_url}")
        
        return True
    
    def push_to_github(self):
        """Push code to GitHub"""
        print("📤 Pushing code to GitHub...")
        
        try:
            # Add all changes
            subprocess.run(["git", "add", "."], check=True)
            
            # Commit changes
            subprocess.run(["git", "commit", "-m", "Deploy to DataAfrik.com"], check=True)
            
            # Push to GitHub
            subprocess.run(["git", "push", "-u", "origin", "main"], check=True)
            print("✅ Code pushed to GitHub successfully!")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error pushing to GitHub: {e}")
            return False
    
    def create_app_spec(self):
        """Create the app specification for DigitalOcean"""
        print("📝 Creating DigitalOcean app specification...")
        
        app_spec = {
            "name": self.app_name,
            "services": [
                {
                    "name": "frontend",
                    "source_dir": "/",
                    "github": {
                        "repo": f"{self.github_username}/{self.repo_name}",
                        "branch": "main"
                    },
                    "build_command": "npm install && npm run build",
                    "run_command": "npm run preview",
                    "environment_slug": "node-js",
                    "instance_count": 1,
                    "instance_size_slug": "basic-xxs",
                    "envs": [
                        {
                            "key": "VITE_SUPABASE_URL",
                            "value": "https://wjeqwwilkbpqwuffiuio.supabase.co",
                            "type": "SECRET"
                        },
                        {
                            "key": "VITE_SUPABASE_ANON_KEY",
                            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZXF3d2lsa2JwcXd1ZmZpdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NjkzNDIsImV4cCI6MjA3MDU0NTM0Mn0.b2_QEsEHBGewRGOJHccE9_onobcKgfLU25IoKRdXGGo",
                            "type": "SECRET"
                        },
                        {
                            "key": "NODE_ENV",
                            "value": "production"
                        }
                    ],
                    "routes": [
                        {
                            "path": "/"
                        }
                    ],
                    "health_check": {
                        "http_path": "/",
                        "initial_delay_seconds": 10,
                        "interval_seconds": 10,
                        "timeout_seconds": 5,
                        "success_threshold": 1,
                        "failure_threshold": 3
                    }
                },
                {
                    "name": "backend",
                    "source_dir": "backend",
                    "github": {
                        "repo": f"{self.github_username}/{self.repo_name}",
                        "branch": "main"
                    },
                    "build_command": "npm install",
                    "run_command": "npm start",
                    "environment_slug": "node-js",
                    "instance_count": 1,
                    "instance_size_slug": "basic-xxs",
                    "http_port": 3001,
                    "envs": [
                        {
                            "key": "SUPABASE_URL",
                            "value": "https://wjeqwwilkbpqwuffiuio.supabase.co",
                            "type": "SECRET"
                        },
                        {
                            "key": "SUPABASE_SERVICE_ROLE_KEY",
                            "value": "sbp_ad0bd1a56fcea427de1d5c8c2ab5440741693348",
                            "type": "SECRET"
                        },
                        {
                            "key": "SUPABASE_ANON_KEY",
                            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZXF3d2lsa2JwcXd1ZmZpdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NjkzNDIsImV4cCI6MjA3MDU0NTM0Mn0.b2_QEsEHBGewRGOJHccE9_onobcKgfLU25IoKRdXGGo",
                            "type": "SECRET"
                        },
                        {
                            "key": "NODE_ENV",
                            "value": "production"
                        },
                        {
                            "key": "PORT",
                            "value": "3001"
                        }
                    ],
                    "routes": [
                        {
                            "path": "/api"
                        }
                    ],
                    "health_check": {
                        "http_path": "/api/health",
                        "initial_delay_seconds": 10,
                        "interval_seconds": 10,
                        "timeout_seconds": 5,
                        "success_threshold": 1,
                        "failure_threshold": 3
                    }
                }
            ],
            "domains": [
                {
                    "domain": "dataafrik.com",
                    "type": "PRIMARY"
                },
                {
                    "domain": "www.dataafrik.com",
                    "type": "ALIAS"
                }
            ],
            "envs": [
                {
                    "key": "NODE_ENV",
                    "value": "production",
                    "scope": "RUN_AND_BUILD_TIME"
                }
            ],
            "alerts": [
                {
                    "rule": "DEPLOYMENT_FAILED",
                    "disabled": False
                },
                {
                    "rule": "DOMAIN_FAILED",
                    "disabled": False
                },
                {
                    "rule": "HIGH_CPU",
                    "disabled": False,
                    "operator": "GREATER_THAN",
                    "value": 80,
                    "window": "5m"
                },
                {
                    "rule": "HIGH_MEMORY",
                    "disabled": False,
                    "operator": "GREATER_THAN",
                    "value": 80,
                    "window": "5m"
                }
            ]
        }
        
        # Write app spec to file
        with open("app_spec.json", "w") as f:
            json.dump(app_spec, f, indent=2)
        
        print("✅ App specification created: app_spec.json")
        return app_spec
    
    def deploy_to_digitalocean(self):
        """Deploy to DigitalOcean using doctl"""
        print("🌊 Deploying to DigitalOcean...")
        
        try:
            # Check if doctl is installed
            result = subprocess.run(["doctl", "version"], capture_output=True, text=True)
            if result.returncode != 0:
                print("❌ doctl is not installed. Please install it first:")
                print("   https://docs.digitalocean.com/reference/doctl/how-to/install/")
                return False
            
            # Create app using app spec
            subprocess.run(["doctl", "apps", "create", "--spec", "app_spec.json"], check=True)
            print("✅ App created successfully!")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error deploying to DigitalOcean: {e}")
            return False
    
    def deploy(self):
        """Main deployment process"""
        print("🚀 DataAfrik.com Deployment Started")
        print("=" * 50)
        
        # Step 1: Setup Git
        if not self.setup_git():
            return False
        
        # Step 2: Push to GitHub
        if not self.push_to_github():
            return False
        
        # Step 3: Create app specification
        self.create_app_spec()
        
        # Step 4: Deploy to DigitalOcean
        if not self.deploy_to_digitalocean():
            return False
        
        print("🎉 Deployment completed successfully!")
        print("🌐 Your website will be available at: https://dataafrik.com")
        print("📊 Monitor deployment at: https://cloud.digitalocean.com/apps")
        
        return True

def main():
    """Main function"""
    deployer = DataAfrikDeployer()
    deployer.deploy()

if __name__ == "__main__":
    main()
