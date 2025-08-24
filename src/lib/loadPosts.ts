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
  const response = await fetch('http://localhost:5000/api/posts');
  if (!response.ok) throw new Error('Failed to fetch posts from backend');
  const posts = await response.json();
  console.log("✅ Posts loaded:", posts);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}