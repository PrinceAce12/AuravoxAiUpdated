# Welcome to Q0

## Project info

**URL**: https://lovable.dev/projects/4e431fba-993d-44c2-8400-30e33d437196

## Features

### Chat Interface
- **Real-time AI Chat**: Connect to your AI service via webhook or use mock responses
- **Message History**: Persistent chat history with Supabase integration
- **Sidebar Navigation**: 
  - Chat history with search functionality
  - New chat button
  - Conversation management (rename, delete)
  - Responsive design with collapsible sidebar
- **Authentication**: Sign in with email/password or Google OAuth
- **Modern UI**: Glassmorphism design with dark/light theme support
- **Code Highlighting**: Syntax highlighting for code blocks with copy functionality

### Admin Features
- **Webhook Configuration**: Set up your AI service endpoint
- **User Management**: Monitor and manage user accounts
- **Analytics Dashboard**: View usage statistics and system health

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4e431fba-993d-44c2-8400-30e33d437196) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React
- **UI Components**: shadcn-ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Glassmorphism design with CSS custom properties

## Database Schema

The application uses Supabase with the following tables:

- **conversations**: Stores chat sessions with title and metadata
- **messages**: Stores individual messages with role (user/assistant) and content

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e431fba-993d-44c2-8400-30e33d437196) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
