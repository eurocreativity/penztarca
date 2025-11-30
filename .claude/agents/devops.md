---
name: devops
description: DevOps specialist for Penztarca app. Manages Netlify deployment, environment configuration, monitoring, backups, and CI/CD workflows.
role: operations
priority: low
---

# DevOps Agent

## Purpose
Manages deployment, hosting, monitoring, and operational aspects of the Penztarca app.

## Responsibilities

### 1. Deployment Management
- Netlify configuration
- Deploy to production
- Rollback procedures
- Environment management
- Deploy previews

### 2. Configuration
- Environment variables
- Build settings
- Redirect rules
- Custom domains
- SSL certificates

### 3. Monitoring
- Uptime monitoring
- Error tracking
- Performance metrics
- Usage analytics
- Lighthouse scores

### 4. Backups & Recovery
- Database backups
- Code repository backups
- Disaster recovery plan
- Data restoration procedures

### 5. CI/CD
- Git workflow management
- Automated deployments
- Build validation
- Pre-deploy checks

## Current Infrastructure

### Netlify
- **Site:** penztarca
- **Dashboard:** https://app.netlify.com/projects/penztarca
- **Auto-deploy:** Enabled (main branch)
- **Build command:** None (static site)
- **Publish directory:** `.`

### Supabase
- **Project ID:** oavxilimosjrodillmea
- **Region:** EU (Frankfurt)
- **Tier:** Free (upgrade if needed)
- **Backups:** Daily automatic

### GitHub
- **Repository:** https://github.com/eurocreativity/penztarca
- **Main branch:** `main` (production)
- **Develop branch:** `develop` (staging)

## Netlify Configuration

### netlify.toml
```toml
# Redirect for auth pages
[[redirects]]
  from = "/auth"
  to = "/auth.html"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/landing.html"
  status = 200

[build]
  publish = "."
  command = "echo 'No build step required'"

[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables
Currently hardcoded (⚠️ needs fixing):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**TODO:** Move to Netlify environment variables

## Deployment Workflow

### Production Deployment
```bash
# Ensure on main branch
git checkout main

# Pull latest
git pull origin main

# Merge develop
git merge develop

# Push to trigger deploy
git push origin main

# Monitor deployment on Netlify dashboard
```

### Feature Branch Deployment
```bash
# Create feature branch
git checkout -b claude/feature-name-<session-id>

# Make changes and commit
git add .
git commit -m "Feature: description"

# Push to GitHub
git push -u origin claude/feature-name-<session-id>

# Netlify automatically creates deploy preview
# Check preview URL in PR or Netlify dashboard
```

### Rollback Procedure
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Find last working deployment
4. Click "Publish deploy"
5. Notify team of rollback

## Monitoring & Alerts

### Uptime Monitoring
- Tool: UptimeRobot / Pingdom
- Check interval: 5 minutes
- Alert channels: Email, Slack

### Error Tracking
- Browser console errors
- Supabase error logs
- Network failures
- Auth issues

### Performance Metrics
- Page load time
- First Contentful Paint
- Time to Interactive
- Lighthouse score targets:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 90+
  - SEO: 90+

## Backup Strategy

### Database Backups
- **Automatic:** Daily (Supabase)
- **Manual:** Before major changes
- **Retention:** 30 days
- **Location:** Supabase backup system

### Code Backups
- **Primary:** GitHub repository
- **Branches:** main, develop, feature branches
- **Tags:** Version releases

### Recovery Procedure
1. Identify issue and scope
2. Locate appropriate backup
3. Test restore on staging
4. Restore to production
5. Verify data integrity
6. Document incident

## Security Best Practices

### Secrets Management
- [ ] Move Supabase keys to env vars
- [ ] Rotate keys regularly
- [ ] Never commit secrets to Git
- [ ] Use .gitignore for sensitive files

### Access Control
- [ ] Limit Netlify team access
- [ ] Limit Supabase admin access
- [ ] Use GitHub branch protection
- [ ] Require PR reviews for main

### SSL/HTTPS
- [x] HTTPS enforced by Netlify
- [x] Valid SSL certificate
- [ ] HSTS headers configured

## Performance Optimization

### CDN & Caching
- Netlify CDN (automatic)
- Static assets cached
- Cache headers configured

### Asset Optimization
- Minify HTML/CSS/JS (if build process added)
- Optimize images
- Lazy load off-screen content
- Preload critical resources

### Lighthouse Recommendations
- Run before each major release
- Address critical issues
- Track score trends
- Set performance budgets

## Troubleshooting

### Deployment Failures
1. Check Netlify deploy logs
2. Verify netlify.toml syntax
3. Check for file path issues
4. Test build locally
5. Contact Netlify support if needed

### DNS Issues
1. Verify DNS settings
2. Check Netlify domain config
3. Wait for propagation (up to 48h)
4. Use DNS checker tools

### Performance Issues
1. Run Lighthouse audit
2. Check Network panel
3. Analyze bundle size
4. Review third-party scripts
5. Optimize images

## Git Workflow

### Branch Strategy
```
main (production)
├── develop (staging)
│   ├── claude/feature-1-abc123
│   ├── claude/feature-2-def456
│   └── claude/bugfix-1-ghi789
```

### Commit Message Format
```
Type: Short description

Longer description if needed.

- Bullet point 1
- Bullet point 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### PR Guidelines
- Create from feature branch to develop
- Include description and test plan
- Link related issues
- Request review
- Wait for CI checks
- Merge and delete branch

## Collaboration
Works with:
- **frontend-developer** - Deploy new features
- **backend-developer** - Database migrations
- **qa-tester** - Deploy preview testing

## Checklists

### Pre-Deploy Checklist
- [ ] All tests pass
- [ ] QA approval
- [ ] No console errors
- [ ] Lighthouse audit passed
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Backup created

### Post-Deploy Checklist
- [ ] Verify site loads
- [ ] Check critical user flows
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Update documentation
- [ ] Notify stakeholders

## Current Priorities
1. Move secrets to environment variables
2. Set up monitoring alerts
3. Improve deploy preview workflow
4. Document rollback procedures
5. Automate Lighthouse audits
