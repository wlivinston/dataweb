#!/usr/bin/env python3
"""
Direct DataAfrik.com Deployment Script
Deploys the DataWeb platform directly to www.dataafrik.com on DigitalOcean
without requiring GitHub
"""

import os
import json
import zipfile
import tempfile
from pathlib import Path

class DirectDataAfrikDeployer:
    def __init__(self):
        self.app_name = "dataafrik-platform"
        self.project_dir = Path(".")
        
    def create_app_spec(self):
        """Create the app specification for direct deployment"""
        print("📝 Creating DigitalOcean app specification...")
        
        app_spec = {
            "name": self.app_name,
            "services": [
                {
                    "name": "frontend",
                    "source_dir": "/",
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
        with open("direct_app_spec.json", "w") as f:
            json.dump(app_spec, f, indent=2)
        
        print("✅ Direct app specification created: direct_app_spec.json")
        return app_spec
    
    def create_source_archive(self):
        """Create a source archive for direct deployment"""
        print("📦 Creating source archive...")
        
        # Create a temporary directory for the archive
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Copy all necessary files
            files_to_copy = [
                "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json",
                "tailwind.config.ts", "postcss.config.js", "index.html", "README.md",
                "src/", "public/", "components.json", "eslint.config.js"
            ]
            
            for item in files_to_copy:
                source = self.project_dir / item
                dest = temp_path / item
                
                if source.exists():
                    if source.is_file():
                        dest.parent.mkdir(parents=True, exist_ok=True)
                        dest.write_bytes(source.read_bytes())
                    elif source.is_dir():
                        self._copy_dir(source, dest)
            
            # Create backend directory
            backend_dest = temp_path / "backend"
            backend_dest.mkdir(exist_ok=True)
            self._copy_dir(self.project_dir / "backend", backend_dest)
            
            # Create zip archive
            archive_path = self.project_dir / "dataafrik-source.zip"
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in temp_path.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(temp_path)
                        zipf.write(file_path, arcname)
            
            print(f"✅ Source archive created: {archive_path}")
            return archive_path
    
    def _copy_dir(self, src, dst):
        """Copy directory recursively"""
        dst.mkdir(parents=True, exist_ok=True)
        for item in src.iterdir():
            if item.is_file():
                (dst / item.name).write_bytes(item.read_bytes())
            elif item.is_dir():
                self._copy_dir(item, dst / item.name)
    
    def deploy(self):
        """Main deployment process"""
        print("🚀 Direct DataAfrik.com Deployment Started")
        print("=" * 50)
        
        # Step 1: Create app specification
        self.create_app_spec()
        
        # Step 2: Create source archive
        archive_path = self.create_source_archive()
        
        print("🎉 Preparation completed!")
        print("📁 App specification: direct_app_spec.json")
        print("📦 Source archive: dataafrik-source.zip")
        print("🌐 Ready for DigitalOcean deployment!")
        
        return True

def main():
    """Main function"""
    deployer = DirectDataAfrikDeployer()
    deployer.deploy()

if __name__ == "__main__":
    main()
