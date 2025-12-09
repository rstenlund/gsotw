# Supabase Setup Guide for GSOTW

## 📋 Complete Setup Checklist

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: GSOTW (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get Your API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Update your `.env.local` file (or `.env`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Make sure to use `NEXT_PUBLIC_SUPABASE_ANON_KEY`, not `PUBLISHABLE_KEY`

### 4. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create songs table
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  spotify_url TEXT,
  spotify_id TEXT,
  album_cover_url TEXT,
  added_by UUID REFERENCES auth.users(id),
  votes INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  week_number INTEGER
);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)

-- Allow anyone to read songs
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT
  USING (true);

-- Allow authenticated users to insert songs
CREATE POLICY "Authenticated users can insert songs"
  ON songs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own songs
CREATE POLICY "Users can update their own songs"
  ON songs FOR UPDATE
  USING (auth.uid() = added_by);

-- Allow users to delete their own songs
CREATE POLICY "Users can delete their own songs"
  ON songs FOR DELETE
  USING (auth.uid() = added_by);

-- Create indexes for better performance
CREATE INDEX idx_songs_week ON songs(week_number);
CREATE INDEX idx_songs_votes ON songs(votes DESC);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
```

### 5. Set Up Storage (Optional - for album covers)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `album-covers`
3. Set it to **Public** if you want direct image access
4. Configure policies:

```sql
-- Allow anyone to read album covers
CREATE POLICY "Album covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album-covers');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload album covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'album-covers' AND
    auth.role() = 'authenticated'
  );
```

### 6. Test Your Setup

Create a test file to verify everything works:

```typescript
// app/test-supabase/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function TestSupabase() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function test() {
      const { data, error } = await supabase.from("songs").select("*");

      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Success! Data:", data);
        setData(data || []);
      }
      setLoading(false);
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Supabase Connection Test</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p className="text-green-600">✅ Connected to Supabase!</p>
          <p>Found {data.length} songs</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
```

Visit `http://localhost:3000/test-supabase` to test!

## 🛠️ Files Created

Your Supabase setup includes:

- ✅ `/src/lib/supabase/client.ts` - Client-side Supabase client
- ✅ `/src/lib/supabase/server.ts` - Server-side Supabase client
- ✅ `/src/lib/supabase/middleware.ts` - Session refresh middleware
- ✅ `/src/lib/supabase/types.ts` - TypeScript types for your database
- ✅ `/src/lib/supabase/examples.ts` - Usage examples and patterns
- ✅ `/middleware.ts` - Next.js middleware (combines Clerk + Supabase)

## 📚 Usage Examples

### Client Component (with useState)

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

function MyComponent() {
  const supabase = createClient();

  async function addSong() {
    const { data, error } = await supabase
      .from("songs")
      .insert([{ title: "Ghost Town", artist: "As It Is" }]);
  }
}
```

### Server Component

```typescript
import { createClient } from "@/lib/supabase/server";

async function MyServerComponent() {
  const supabase = await createClient();

  const { data: songs } = await supabase.from("songs").select("*");

  return <div>{/* render songs */}</div>;
}
```

### API Route

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("songs").select("*");
  return NextResponse.json({ data });
}
```

## 🔒 Security Best Practices

1. **Never expose your service_role key** - Only use the anon key in frontend
2. **Use Row Level Security (RLS)** - Always enable RLS on tables
3. **Validate data** - Validate user input before inserting into database
4. **Use prepared statements** - Supabase does this automatically
5. **Limit query results** - Use `.limit()` to prevent large data transfers

## 🚀 Next Steps

1. ✅ Environment variables configured
2. ✅ Database tables created
3. ✅ RLS policies set up
4. ⬜ Test the connection
5. ⬜ Integrate into your components
6. ⬜ Set up real-time subscriptions (optional)

## 📖 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## ❓ Troubleshooting

### "Invalid API key" error

- Double-check your `.env.local` file has correct values
- Restart your dev server after changing env variables

### "relation does not exist" error

- Make sure you created the table in SQL Editor
- Check table name matches exactly (case-sensitive)

### "permission denied" error

- Check your RLS policies
- Make sure policies allow the operation you're trying to do

### Authentication not working

- Verify middleware is set up correctly
- Check that Supabase URL and anon key are correct
