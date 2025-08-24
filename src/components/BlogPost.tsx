import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Calendar, Clock, User, Share2, MessageCircle, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BlogComments from "./BlogComments";
import { supabase } from "@/lib/supabase";

interface BlogPostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string;
  category: string | null;
  tags: string[] | null;
  featured: boolean;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  read_time: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          return;
        }

        setPost(data);
        setLikes(data.like_count || 0);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = () => {
    setLikes(prev => prev + 1);
    // TODO: Implement like functionality with backend
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="blog-container">
          <div className="blog-header">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="blog-title">{post.title}</h1>
            {post.excerpt && (
              <p className="blog-subtitle">{post.excerpt}</p>
            )}
            
            <div className="blog-meta">
              <div className="blog-author">
                <User className="h-4 w-4 inline mr-1" />
                {post.author}
              </div>
              <div className="blog-date">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </div>
              <div className="blog-read-time">
                <Clock className="h-4 w-4" />
                {post.read_time || '5 min read'}
              </div>
              {post.featured && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="blog-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Article */}
          <article className="blog-main">
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              {/* Engagement Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    {likes} Likes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Comments
                  </Button>
                </div>
                
                <div className="social-share">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="twitter"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Author Bio */}
              <div className="author-bio">
                <h3>About the Author</h3>
                <p>
                  <strong>{post.author}</strong> is a data science professional with expertise in analytics, 
                  machine learning, and business intelligence. With a passion for turning complex data into 
                  actionable insights, they help organizations make data-driven decisions.
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <span>🎓 MS Data Science</span>
                  <span>📊 Power BI Expert</span>
                  <span>🤖 ML Practitioner</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <BlogComments postId={post.id} postSlug={post.slug} />
          </article>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="sticky top-8">
              {/* Table of Contents */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-serif text-lg font-semibold mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  <a href="#introduction" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Introduction
                  </a>
                  <a href="#why-pictures-matter" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Why Pictures Matter
                  </a>
                  <a href="#watch-analytics" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Watch: Analytics in Action
                  </a>
                  <a href="#final-thoughts" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Final Thoughts
                  </a>
                </nav>
              </div>

              {/* Related Articles */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Related Articles</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Building Scalable Data Pipelines
                    </h4>
                    <p className="text-xs text-gray-600">Learn how to build robust data pipelines...</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Real-time Analytics with Kafka
                    </h4>
                    <p className="text-xs text-gray-600">Stream processing for real-time insights...</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      The Future of Machine Learning
                    </h4>
                    <p className="text-xs text-gray-600">Emerging trends in ML and AI...</p>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 mt-8 text-white">
                <h3 className="font-serif text-lg font-semibold mb-2">Stay Updated</h3>
                <p className="text-sm mb-4 opacity-90">
                  Get the latest insights on data science and analytics delivered to your inbox.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Subscribe to Newsletter
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
