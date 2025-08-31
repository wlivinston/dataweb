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
  
  try {
    // Use the deployed backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://clownfish-app-3hmi3.ondigitalocean.app';
    const response = await fetch(`${backendUrl}/api/blog/posts`);
    
    if (!response.ok) {
      console.error('Failed to fetch posts from backend:', response.status, response.statusText);
      // Fallback to static posts if backend fails
      return getStaticPosts();
    }
    
    const data = await response.json();
    console.log("✅ Posts loaded:", data);
    
    // Check if we have posts from backend
    if (data.posts && data.posts.length > 0) {
      return data.posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else {
      console.log("No posts from backend, using static posts");
      return getStaticPosts();
    }
  } catch (error) {
    console.error('Error loading posts from backend:', error);
    // Fallback to static posts if backend fails
    return getStaticPosts();
  }
}

// Fallback static posts
function getStaticPosts(): PostData[] {
  return [
    {
      title: "Building Scalable Data Pipelines",
      excerpt: "Learn how to design and implement robust data pipelines that can handle large-scale data processing with Apache Airflow and modern cloud technologies.",
      date: "2024-01-15",
      readTime: "8 min read",
      category: "Data Engineering",
      featured: true,
      slug: "building-scalable-data-pipelines",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    },
    {
      title: "Data Analytics and Visual Storytelling",
      excerpt: "Transform raw data into compelling visual narratives that drive business decisions using advanced visualization techniques.",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Data Visualization",
      featured: true,
      slug: "data-analytics-visual-storytelling",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    },
    {
      title: "Machine Learning in Production",
      excerpt: "Best practices for deploying and maintaining machine learning models in production environments.",
      date: "2024-01-08",
      readTime: "10 min read",
      category: "Machine Learning",
      featured: false,
      slug: "machine-learning-in-production",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    },
    {
      title: "Real-time Analytics with Apache Kafka",
      excerpt: "Build real-time data processing systems using Apache Kafka and stream processing technologies.",
      date: "2024-01-05",
      readTime: "12 min read",
      category: "Real-time Analytics",
      featured: false,
      slug: "real-time-analytics-with-kafka",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    },
    {
      title: "Statistical Analysis for Beginners",
      excerpt: "A comprehensive guide to statistical analysis techniques for data science beginners.",
      date: "2024-01-03",
      readTime: "15 min read",
      category: "Statistics",
      featured: false,
      slug: "statistical-analysis-for-beginners",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    },
    {
      title: "The Future of Machine Learning",
      excerpt: "Exploring emerging trends and technologies that will shape the future of machine learning.",
      date: "2024-01-01",
      readTime: "7 min read",
      category: "Machine Learning",
      featured: false,
      slug: "the-future-of-machine-learning",
      content: "Content will be loaded from markdown file...",
      author: "DataWeb Team"
    }
  ];
}