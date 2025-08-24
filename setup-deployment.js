#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 DataWeb Platform Deployment Setup\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupDeployment() {
  try {
    console.log('📋 Please provide the following information for deployment:\n');

    // Get GitHub repository details
    const githubUsername = await askQuestion('GitHub Username: ');
    const githubRepoName = await askQuestion('GitHub Repository Name: ');
    
    // Get domain details
    const domain = await askQuestion('Your Domain (e.g., dataweb.yourdomain.com): ');
    const wwwDomain = `www.${domain}`;
    
    // Get Supabase service role key
    console.log('\n🔑 Supabase Service Role Key:');
    console.log('1. Go to: https://supabase.com/dashboard/project/wjeqwwilkbpqwuffiuio');
    console.log('2. Navigate to Settings → API');
    console.log('3. Copy the "service_role" key (not the anon key)');
    const serviceRoleKey = await askQuestion('Enter your Supabase service role key: ');

    // Read the app.yaml file
    const appYamlPath = path.join(__dirname, 'app.yaml');
    let appYamlContent = fs.readFileSync(appYamlPath, 'utf8');

    // Replace placeholders
    appYamlContent = appYamlContent.replace(/your-github-username\/your-repo-name/g, `${githubUsername}/${githubRepoName}`);
    appYamlContent = appYamlContent.replace(/your_supabase_service_role_key_here/g, serviceRoleKey);
    appYamlContent = appYamlContent.replace(/dataweb\.yourdomain\.com/g, domain);
    appYamlContent = appYamlContent.replace(/www\.dataweb\.yourdomain\.com/g, wwwDomain);

    // Write updated app.yaml
    fs.writeFileSync(appYamlPath, appYamlContent);

    console.log('\n✅ Configuration updated successfully!');
    console.log('\n📁 Files updated:');
    console.log('  - app.yaml (deployment configuration)');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Push your code to GitHub:');
    console.log(`   git remote add origin https://github.com/${githubUsername}/${githubRepoName}.git`);
    console.log('   git push -u origin main');
    console.log('\n2. Deploy to Digital Ocean using the app.yaml file');
    console.log('\n3. Configure your DNS to point to the Digital Ocean app');
    console.log('\n4. Update Supabase authentication settings with your production domain');

    // Create a summary file
    const summary = {
      github: {
        username: githubUsername,
        repository: githubRepoName,
        url: `https://github.com/${githubUsername}/${githubRepoName}`
      },
      domain: {
        primary: domain,
        www: wwwDomain
      },
      supabase: {
        projectUrl: 'https://wjeqwwilkbpqwuffiuio.supabase.co',
        serviceRoleKey: serviceRoleKey.substring(0, 20) + '...' // Only show first 20 chars for security
      },
      deployment: {
        status: 'ready',
        nextSteps: [
          'Push code to GitHub',
          'Deploy to Digital Ocean',
          'Configure DNS',
          'Update Supabase settings'
        ]
      }
    };

    fs.writeFileSync('deployment-summary.json', JSON.stringify(summary, null, 2));
    console.log('\n📄 Deployment summary saved to: deployment-summary.json');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

// Check if app.yaml exists
if (!fs.existsSync('app.yaml')) {
  console.error('❌ app.yaml file not found. Please ensure you have the deployment configuration file.');
  process.exit(1);
}

setupDeployment();
