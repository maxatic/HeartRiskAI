# CardioGuard Assistant - Frontend

A Next.js 14 frontend for the CardioGuard heart attack risk prediction application.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Django backend running (see parent directory)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update the API URL in .env.local if needed
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file with:

```env
# Django API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# InstantDB App ID (optional)
NEXT_PUBLIC_INSTANTDB_APP_ID=your-instantdb-app-id
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set the root directory to `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Django API URL (e.g., `https://your-django-app.railway.app/api`)

### Environment Variables on Vercel

In your Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your deployed Django API URL |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── auth/page.tsx   # Login/Signup
│   │   ├── predict/page.tsx # Health form
│   │   └── result/page.tsx  # Results dashboard
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── RiskCharts.tsx
│   └── lib/
│       ├── api.ts          # API client
│       └── auth-context.tsx # Auth state management
├── package.json
├── tailwind.config.ts
└── next.config.js
```

## API Endpoints Used

The frontend communicates with the Django backend:

- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User authentication
- `GET /api/auth/me/` - Get current user
- `POST /api/predict/` - Heart risk prediction

## Backend Deployment

Don't forget to deploy your Django backend! Recommended platforms:

- **Railway** (recommended): Easy Python deployment
- **Render**: Free tier available
- **Fly.io**: Good for containerized apps

Make sure to:
1. Update `CORS_ALLOWED_ORIGINS` in Django settings with your Vercel domain
2. Set proper environment variables for production
