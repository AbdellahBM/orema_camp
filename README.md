# 🏕️ OREMA Tanger Camping Registration System

A complete event registration and management system built for OREMA Tanger camping events. Features a beautiful Arabic/RTL interface, admin dashboard, and WhatsApp notifications.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-000000?style=flat&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat&logo=vercel)

## 🌟 Features

### 🎯 Public Registration
- **Beautiful Arabic/RTL Interface** - Fully localized for Arabic users
- **Photo Upload** - Participants can upload their photos
- **Form Validation** - Comprehensive client and server-side validation
- **Mobile Responsive** - Works perfectly on all devices
- **Real-time Feedback** - Instant form validation and submission status

### 🔐 Admin Dashboard
- **Secure Authentication** - Email-based admin login system
- **Registration Management** - View, filter, and manage all registrations
- **Status Management** - Approve, decline, or mark registrations as pending
- **Search & Filter** - Find registrations by name, email, phone, or status
- **Pagination** - Handle large numbers of registrations efficiently
- **PDF Export** - Export approved registrations to PDF

### 📱 WhatsApp Notifications
- **Approval Notifications** - Automatically send WhatsApp messages to approved participants
- **UltraMsg Integration** - Professional WhatsApp API integration
- **Error Handling** - Smart handling of invalid numbers and API limits
- **Delivery Tracking** - Track message delivery status
- **Daily Limits** - Respect API usage limits with clear notifications

### 📊 Analytics & Reporting
- **Registration Statistics** - View counts by status (new, approved, declined)
- **Export Functionality** - Generate PDF reports of approved participants
- **Real-time Updates** - Live dashboard updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for photos)
- **Authentication**: Supabase Auth
- **WhatsApp API**: UltraMsg
- **Deployment**: Vercel
- **Fonts**: Cairo (Arabic), Geist (Latin)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase** account (free tier available)
- **UltraMsg** account for WhatsApp notifications (optional)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/AbdellahBM/orema_camp.git
cd orema_camp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WhatsApp API Configuration (Optional)
ULTRAMSG_INSTANCE_ID=your_ultramsg_instance_id
ULTRAMSG_TOKEN=your_ultramsg_token
```

**📝 How to get these values:**

#### Supabase Setup:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

#### UltraMsg Setup (Optional):
1. Create account at [ultramsg.com](https://ultramsg.com)
2. Connect your WhatsApp Business account
3. Get Instance ID and Token from dashboard

### 4. Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  extra_info TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'approved', 'declined')),
  approved_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('registration-photos', 'registration-photos', true);

-- Set up Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view registrations" ON registrations FOR SELECT TO anon USING (true);

-- Allow public insert (for registration form)
CREATE POLICY "Public can insert registrations" ON registrations FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Authenticated users full access" ON registrations FOR ALL TO authenticated USING (true);
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
orema_camp/
├── public/                 # Static assets
│   ├── logo.png           # OREMA logo
│   ├── poster.jpg         # Event poster
│   └── speaker.png        # Speaker photo
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   │   ├── page.js    # Admin login & dashboard
│   │   │   ├── layout.tsx # Admin layout
│   │   │   └── registration/[id]/page.js # Registration details
│   │   ├── api/           # API routes
│   │   │   └── send-approval-whatsapp/route.js # WhatsApp API
│   │   ├── components/    # Reusable components
│   │   │   ├── AdminTable.js      # Registration table
│   │   │   ├── SearchBar.js       # Search functionality
│   │   │   ├── StatusFilter.js    # Status filtering
│   │   │   └── StatusDropdown.js  # Status management
│   │   ├── register/      # Public registration
│   │   │   └── page.js    # Registration form
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   └── lib/
│       └── supabaseClient.js # Supabase configuration
├── SUPABASE_SETUP.md      # Detailed Supabase setup guide
├── WHATSAPP_SETUP.md      # WhatsApp API setup guide
└── README.md              # This file
```

## 🔐 Admin Access

The admin dashboard is protected by email authentication. By default, these emails have admin access:

- `khouloud@orema.com`
- `youssef@orema.com`
- `salman@orema.com`

**To change admin emails:**
1. Edit `src/app/admin/page.js`
2. Update the `ADMIN_EMAILS` array
3. Also update `src/app/api/send-approval-whatsapp/route.js`

**Admin Dashboard URL:** `http://localhost:3000/admin`

## 📱 WhatsApp Notifications

When you approve a registration in the admin dashboard:

1. **Click "Send WhatsApp Approval"** button
2. **System validates** phone number format
3. **Sends message** via UltraMsg API: 
   > 🎉 Congratulations! You have been approved for the event. See you at OREMA Camping Tanger!
4. **Updates database** to prevent duplicate messages
5. **Shows success/error** feedback

**Supported phone formats:**
- `0612345678` (Moroccan)
- `+212612345678` (International)
- `212612345678` (Without +)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Click "Deploy"

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`

**Your app will be live at:** `https://your-project.vercel.app`

### Cost (FREE Tier):
- **Vercel**: Free for personal projects
- **Supabase**: 500MB database, 2GB bandwidth
- **UltraMsg**: 10 messages/day free

## 🔧 Customization

### Change Branding
- Replace logos in `public/` folder
- Update colors in `src/app/globals.css`
- Modify text content in components

### Add Languages
- Add translation files
- Update layouts for RTL/LTR support
- Modify font configurations

### Extend Features
- Add payment integration
- Include email notifications
- Add more admin roles
- Implement advanced analytics

## 🐛 Troubleshooting

### Common Issues:

**"Registration not found" error:**
- Ensure `approved_notified` column exists in database
- Check admin authentication

**WhatsApp not sending:**
- Verify UltraMsg credentials
- Check phone number format
- Ensure daily limits not exceeded

**Photos not uploading:**
- Check Supabase storage bucket permissions
- Verify file size limits (5MB max)

**Build errors:**
- Run `npm run build` to check for issues
- Ensure all environment variables are set

## 📄 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [WhatsApp Setup Guide](./WHATSAPP_SETUP.md)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend & Backend**: Development Team
- **Design**: UI/UX Team  
- **Project Management**: OREMA Team

## 📞 Support

For support, email: [support@orema.com](mailto:support@orema.com)

---

**Made with ❤️ for OREMA Tanger Camping Events**
