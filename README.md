# PénzTár - Personal Finance Tracker

A modern personal finance tracking application built with vanilla JavaScript and Supabase.

## Features

- 💰 Track income and expenses
- 📊 Visual charts and analytics
- 🎯 Budget management
- 🔐 Secure authentication with Supabase
- 🌓 Dark mode support
- 🌍 Multi-language support (Hungarian/English)

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Charts**: Chart.js
- **Deployment**: Netlify

## Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   npx -y http-server -p 8080 -c-1
   ```
3. Open `http://localhost:8080/landing.html`

## Deployment

This app is configured for deployment on Netlify.

### Deploy to Netlify

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Netlify
3. Netlify will automatically detect the `netlify.toml` configuration
4. After deployment, update your Supabase project settings:
   - Go to Authentication → URL Configuration
   - Add your Netlify URL to Redirect URLs: `https://your-app.netlify.app/auth.html`

### Environment Configuration

The Supabase credentials are currently hardcoded in `supabase-client.js`. For production, consider:
- Using environment variables
- Rotating the anon key if it's been exposed

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Update `supabase-client.js` with your project URL and anon key
3. Run database migrations from `migrations/` folder in order:
   - `add_type_to_categories.sql` - Adds type field to categories
   - `add_income_categories_for_existing_users.sql` - Creates income categories
4. Configure authentication providers in Supabase dashboard

## Documentation

For detailed project information, see:
- **PROJECT_STATUS.md** - Complete project status, recent changes, and deployment info
- **migrations/README.md** - Database migration instructions
- **docs/** - Feature-specific documentation

## Project Structure

```
├── index.html              # Main app page
├── auth.html               # Authentication page
├── landing.html            # Landing page
├── app.js                  # Main application logic
├── auth.js                 # Authentication logic
├── supabase-client.js      # Supabase client initialization
├── netlify.toml            # Netlify configuration
├── PROJECT_STATUS.md       # Detailed project status and changelog
├── README.md               # This file
├── .claude/
│   ├── commands/           # Claude Code slash commands
│   ├── agents/             # Development agents
│   └── skills/             # Project skills
├── migrations/             # Database migration scripts
└── docs/                   # Feature documentation
```

## License

MIT
