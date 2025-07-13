# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase project configured
- Domain name (for production deployment)
- SSL certificate (automatically handled by Vercel/Netlify)

## Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_APP_URL`: Your production domain
   - Other optional variables as needed

## Pre-deployment Checklist

### 1. Code Quality
```bash
# Run linting
npm run lint

# Fix any linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### 2. Build Test
```bash
# Clean previous builds
npm run clean

# Build for production
npm run build:prod

# Test the production build locally
npm run preview
```

### 3. Security Review
- [ ] All API keys are in environment variables
- [ ] No hardcoded secrets in code
- [ ] CORS properly configured
- [ ] Authentication flows tested
- [ ] Admin routes properly protected

### 4. Performance Optimization
- [ ] Images optimized
- [ ] Bundle size checked (< 1MB recommended)
- [ ] Lazy loading implemented where needed
- [ ] Console logs removed in production

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all environment variables from `.env.example`

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Set in Netlify dashboard

### Option 3: Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
   ```

2. **Build and run**:
   ```bash
   docker build -t q0-app .
   docker run -p 3000:3000 q0-app
   ```

## Post-deployment Verification

### 1. Functionality Tests
- [ ] User registration/login works
- [ ] Chat functionality works
- [ ] Voice features work (if enabled)
- [ ] Admin panel accessible
- [ ] All routes load correctly

### 2. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### 3. Security Tests
- [ ] HTTPS working
- [ ] Authentication flows secure
- [ ] No sensitive data exposed
- [ ] CORS headers correct

## Monitoring and Maintenance

### 1. Error Tracking
- Set up Sentry for error monitoring
- Monitor console errors
- Track user feedback

### 2. Performance Monitoring
- Use Google Analytics or similar
- Monitor Core Web Vitals
- Track user engagement

### 3. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular backups of Supabase data

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify all imports
   - Check environment variables

2. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Check Supabase configuration

3. **Performance Issues**
   - Analyze bundle size
   - Check for memory leaks
   - Optimize images and assets

### Support Channels
- Check project documentation
- Review GitHub issues
- Contact development team

## Rollback Procedure

If issues occur in production:

1. **Immediate Rollback**
   ```bash
   # For Vercel
   vercel rollback [deployment-url]
   ```

2. **Fix and Redeploy**
   - Identify and fix the issue
   - Test thoroughly
   - Deploy with proper testing

## Scaling Considerations

- **CDN**: Use for static assets
- **Database**: Monitor Supabase usage
- **Caching**: Implement where appropriate
- **Load Balancing**: Consider for high traffic

---

For questions or issues, refer to the development team or create an issue in the project repository.
