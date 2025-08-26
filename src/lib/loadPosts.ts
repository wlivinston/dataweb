// src/lib/loadPosts.ts

export interface PostData {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  featured?: boolean;
  slug: string;
  content: string;
  author?: string;
  qualification?: string;
}

export async function loadPosts(): Promise<PostData[]> {
  console.log("LOADING POSTS FROM BACKEND...");
  const response = await fetch('http://localhost:3001/api/blog/posts');
  if (!response.ok) throw new Error('Failed to fetch posts from backend');
  const data = await response.json();
  console.log("✅ Posts loaded:", data);
  return data.posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}