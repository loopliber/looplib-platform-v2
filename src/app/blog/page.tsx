'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, User, ArrowRight, TrendingUp, 
  Music, Headphones, Mic, Hash
} from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
  featured?: boolean;
  tags: string[];
}

// This would eventually come from a CMS or database
const blogPosts: BlogPost[] = [
  {
    slug: 'best-free-samples-2025',
    title: 'Best Free Samples for Music Production in 2025',
    excerpt: 'Discover the top sources for high-quality free samples, from trap to soul. Our comprehensive guide covers everything producers need to know.',
    category: 'Guides',
    author: 'LoopLib Team',
    date: 'January 15, 2025',
    readTime: '8 min read',
    featured: true,
    tags: ['free samples', 'music production', 'guide']
  },
  {
    slug: 'how-to-use-free-samples-legally',
    title: 'How to Use Free Samples Legally in Your Music',
    excerpt: 'Understanding sample licensing, royalty-free vs. copyright-free, and how to avoid legal issues when using free samples in commercial releases.',
    category: 'Legal',
    author: 'LoopLib Team',
    date: 'January 12, 2025',
    readTime: '10 min read',
    featured: true,
    tags: ['licensing', 'legal', 'free samples']
  },
  {
    slug: 'free-trap-samples-ultimate-guide',
    title: 'Free Trap Samples: The Ultimate Producer Guide',
    excerpt: 'Everything you need to know about finding, using, and manipulating free trap samples. Includes BPM guides, layering techniques, and mixing tips.',
    category: 'Production',
    author: 'LoopLib Team',
    date: 'January 10, 2025',
    readTime: '12 min read',
    tags: ['trap', 'free samples', 'production tips']
  },
  {
    slug: 'free-soul-samples-where-to-find',
    title: 'Where to Find Free Soul Samples That Actually Sound Good',
    excerpt: 'Stop wasting time on low-quality samples. Here are the best sources for authentic, vintage soul samples that are completely free.',
    category: 'Genres',
    author: 'LoopLib Team',
    date: 'January 8, 2025',
    readTime: '6 min read',
    tags: ['soul', 'vintage', 'free samples']
  },
  {
    slug: 'free-samples-vs-paid-comparison',
    title: 'Free Samples vs Paid Sample Packs: What Producers Need to Know',
    excerpt: 'An honest comparison of free and paid samples. When to use each, quality differences, and how to build a professional sound on any budget.',
    category: 'Guides',
    author: 'LoopLib Team',
    date: 'January 5, 2025',
    readTime: '7 min read',
    tags: ['comparison', 'free samples', 'budget']
  },
  {
    slug: 'organize-free-samples-library',
    title: 'How to Organize Your Free Samples Library Like a Pro',
    excerpt: 'Learn the best methods for organizing thousands of free samples. File naming, folder structures, and tagging systems used by professional producers.',
    category: 'Workflow',
    author: 'LoopLib Team',
    date: 'January 3, 2025',
    readTime: '9 min read',
    tags: ['organization', 'workflow', 'free samples']
  }
];

const categories = [
  { name: 'All Posts', count: blogPosts.length },
  { name: 'Guides', count: blogPosts.filter(p => p.category === 'Guides').length },
  { name: 'Production', count: blogPosts.filter(p => p.category === 'Production').length },
  { name: 'Genres', count: blogPosts.filter(p => p.category === 'Genres').length },
  { name: 'Legal', count: blogPosts.filter(p => p.category === 'Legal').length },
  { name: 'Workflow', count: blogPosts.filter(p => p.category === 'Workflow').length },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All Posts');
  
  const filteredPosts = selectedCategory === 'All Posts' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);
    
  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Free Samples Blog
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400">
              Tips, guides, and insights for music producers using free samples
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Featured Posts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-orange-400" />
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-neutral-500">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-neutral-400 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6">
              <h3 className="font-bold mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.name
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'hover:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm">({category.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tags */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['free samples', 'trap', 'soul', 'rnb', 'production', 'mixing', 'licensing', 'workflow'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.replace(' ', '-')}`}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 mt-6">
              <h3 className="font-bold mb-2">Get Free Samples Weekly</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Join 10,000+ producers getting exclusive free samples and production tips.
              </p>
              <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm font-medium">
                Subscribe
              </button>
            </div>
          </aside>

          {/* Blog Posts Grid */}
          <main className="lg:col-span-3">
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="px-3 py-1 bg-neutral-800 text-xs rounded-full text-neutral-400">
                            {post.category}
                          </span>
                          <span className="text-sm text-neutral-500">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-neutral-400 mb-4">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {post.author}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {post.date}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-neutral-500">
                                #{tag.replace(' ', '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all ml-4 flex-shrink-0" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors">
                2
              </button>
              <button className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors">
                3
              </button>
              <button className="px-4 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors">
                Next
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}