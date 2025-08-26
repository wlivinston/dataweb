import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { PostData } from "@/lib/loadPosts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // Needed for HTML (like <iframe> or <img>) in Markdown

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/blog/posts/${slug}`)
      .then(res => res.json())
      .then((data: { post: PostData }) => {
        setPost(data.post || null);
      })
      .catch(error => {
        console.error('Error fetching post:', error);
        setPost(null);
      });
  }, [slug]);

  if (!post) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <article className="max-w-3xl mx-auto p-10 bg-white rounded-xl shadow">
      {/* Back to Blogs Button */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-block text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
        >
          ← Back to Blogs
        </Link>
      </div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="mb-6 text-gray-600">
        {post.date} &middot; {post.readTime}
      </div>
      {/* Markdown Render with custom styling */}
      <div className="markdown-preview">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPost;
