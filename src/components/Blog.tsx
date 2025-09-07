import React, { useEffect, useState } from "react";
import { loadPosts } from "@/lib/loadPosts";
import type { PostData } from "@/lib/loadPosts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

console.log("🟢 Blog.tsx loaded");

// Calculate read time based on content
function calculateReadTime(text: string, wpm = 200): string {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wpm));
  return `${minutes} min read`;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🟢 Blog.tsx useEffect running");
    // Use static posts directly to avoid API issues
    const staticPosts = [
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
          },
          {
            title: "Data Privacy and Security in Analytics",
            excerpt: "Best practices for protecting sensitive data while maintaining analytical capabilities in modern data environments.",
            date: "2023-12-28",
            readTime: "9 min read",
            category: "Data Security",
            featured: false,
            slug: "data-privacy-security-analytics",
            content: "Content will be loaded from markdown file...",
            author: "DataWeb Team"
          },
          {
            title: "Cloud Data Warehousing Strategies",
            excerpt: "Comprehensive guide to designing and implementing cloud-based data warehousing solutions for modern businesses.",
            date: "2023-12-25",
            readTime: "11 min read",
            category: "Cloud Computing",
            featured: false,
            slug: "cloud-data-warehousing-strategies",
            content: "Content will be loaded from markdown file...",
            author: "DataWeb Team"
          },
          {
            title: "Advanced SQL Techniques for Data Analysis",
            excerpt: "Master advanced SQL techniques including window functions, CTEs, and complex joins for sophisticated data analysis.",
            date: "2023-12-22",
            readTime: "13 min read",
            category: "SQL",
            featured: false,
            slug: "advanced-sql-techniques-data-analysis",
            content: "Content will be loaded from markdown file...",
            author: "DataWeb Team"
          },
          {
            title: "Building Real-time Dashboards",
            excerpt: "Learn how to create dynamic, real-time dashboards that provide instant insights into your business metrics.",
            date: "2023-12-20",
            readTime: "8 min read",
            category: "Dashboard Development",
            featured: false,
            slug: "building-real-time-dashboards",
            content: "Content will be loaded from markdown file...",
            author: "DataWeb Team"
          }
        ];
        setPosts(staticPosts);
        setLoading(false);
      }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends and best practices in data science
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => {
            // Use manual readTime if provided, else calculate automatically
            const readTime = post.readTime?.trim()
              ? post.readTime
              : calculateReadTime(post.content);

            return (
              <Card
                key={index}
                className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
                  post.featured ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl opacity-20">📝</div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.featured && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {readTime}
                    </div>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full group">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
                      })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            View All Posts
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
