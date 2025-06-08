'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Clock, User, Calendar, ArrowLeft, Share2, 
  Twitter, Facebook, Hash, ChevronRight,
  Download, Music, Headphones
} from 'lucide-react';

// This is an example blog post template
// In production, you'd fetch this data based on the slug
const blogPost = {
  title: 'Best Free Samples for Music Production in 2025',
  excerpt: 'Discover the top sources for high-quality free samples, from trap to soul. Our comprehensive guide covers everything producers need to know.',
  content: `
    <h2>Why Free Samples Matter for Modern Producers</h2>
    <p>In today's music production landscape, having access to high-quality samples is crucial. Whether you're a bedroom producer just starting out or a seasoned professional, free samples can be the foundation of your next hit.</p>
    
    <p>This comprehensive guide will walk you through everything you need to know about finding, downloading, and using free samples in your productions.</p>

    <h2>Where to Find the Best Free Samples</h2>
    <p>Not all free sample sources are created equal. Here are the top platforms where you can find professional-grade samples without spending a dime:</p>
    
    <h3>1. LoopLib (That's Us!)</h3>
    <p>We offer a curated collection of free samples across multiple genres including trap, soul, R&B, and more. All our samples are:</p>
    <ul>
      <li>Professionally produced</li>
      <li>100% royalty-free for personal use</li>
      <li>Available in high-quality formats</li>
      <li>Tagged and organized for easy browsing</li>
    </ul>

    <h3>2. Other Reputable Sources</h3>
    <p>While we think our samples are the best (we're biased!), there are other good sources to explore:</p>
    <ul>
      <li>Producer forums with sample sharing threads</li>
      <li>YouTube producer channels (check licenses carefully)</li>
      <li>Free sections of major sample pack companies</li>
    </ul>

    <h2>Understanding Sample Licensing</h2>
    <p>This is where many producers get confused. "Free" doesn't always mean "free to use commercially." Here's what you need to know:</p>

    <h3>Royalty-Free vs. Copyright-Free</h3>
    <p><strong>Royalty-Free:</strong> You can use the sample without paying ongoing royalties, but you may need a license for commercial use.</p>
    <p><strong>Copyright-Free:</strong> The sample is in the public domain or the creator has waived all rights (rare for quality samples).</p>

    <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6 my-6">
      <h4 class="text-orange-400 font-bold mb-2">Pro Tip</h4>
      <p>Always check the license before using any free sample in a commercial release. At LoopLib, our free samples are 100% safe for personal use, and we offer affordable licenses when you're ready to release commercially.</p>
    </div>

    <h2>Organizing Your Free Sample Library</h2>
    <p>Once you start downloading free samples, organization becomes crucial. Here's our recommended folder structure:</p>
    
    <pre class="bg-neutral-900 p-4 rounded-lg overflow-x-auto">
    Samples/
    ├── By Genre/
    │   ├── Trap/
    │   ├── Soul/
    │   └── RnB/
    ├── By Type/
    │   ├── Drums/
    │   ├── Melodies/
    │   └── Bass/
    └── By BPM/
        ├── 60-100/
        ├── 100-140/
        └── 140+/
    </pre>

    <h2>Making the Most of Free Samples</h2>
    <p>Getting free samples is just the beginning. Here's how to use them effectively:</p>

    <h3>1. Layer and Combine</h3>
    <p>Don't just drop a loop into your DAW and call it a day. Layer multiple samples, combine different elements, and create something unique.</p>

    <h3>2. Process and Transform</h3>
    <p>Use effects, pitch shifting, time stretching, and other processing to make samples your own. This also helps avoid any potential copyright issues.</p>

    <h3>3. Chop and Rearrange</h3>
    <p>Take melodic loops and chop them into individual hits. Rearrange drum loops to create new patterns. The possibilities are endless.</p>

    <h2>Common Mistakes to Avoid</h2>
    <ul>
      <li><strong>Not reading licenses:</strong> This can lead to legal issues down the line</li>
      <li><strong>Hoarding samples:</strong> Quality over quantity - curate your collection</li>
      <li><strong>Using samples as-is:</strong> Always add your own touch</li>
      <li><strong>Ignoring metadata:</strong> Proper tagging saves time later</li>
    </ul>

    <h2>Conclusion</h2>
    <p>Free samples are an incredible resource for producers at any level. With the right approach to finding, organizing, and using them, you can create professional-sounding tracks without breaking the bank.</p>
    
    <p>Ready to start building your sample library? Check out our collection of free trap, soul, and R&B samples. All professionally produced and ready for your next hit!</p>
  `,
  author: 'LoopLib Team',
  date: 'January 15, 2025',
  readTime: '8 min read',
  category: 'Guides',
  tags: ['free samples', 'music production', 'guide', 'licensing', 'organization'],
  relatedPosts: [
    {
      slug: 'how-to-use-free-samples-legally',
      title: 'How to Use Free Samples Legally in Your Music',
      excerpt: 'Understanding sample licensing and avoiding legal issues.'
    },
    {
      slug: 'organize-free-samples-library',
      title: 'How to Organize Your Free Samples Library Like a Pro',
      excerpt: 'Best methods for organizing thousands of free samples.'
    }
  ]
};

export default function BlogPostPage() {
  return (
    <article className="min-h-screen bg-black text-white">
      {/* Article Header */}
      <header className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
            <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
            <span className="text-white">{blogPost.category}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {blogPost.title}
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-400 mb-6">
            {blogPost.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {blogPost.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {blogPost.date}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {blogPost.readTime}
            </span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-orange-400 prose-a:no-underline hover:prose-a:text-orange-300
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-neutral-300 prose-ul:my-4 prose-ul:space-y-2
                prose-li:pl-2
                prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-neutral-800">
              <h3 className="font-bold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.replace(' ', '-')}`}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center space-x-4">
              <span className="text-neutral-400">Share:</span>
              <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Table of Contents */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-6 sticky top-24">
              <h3 className="font-bold mb-4">Table of Contents</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-neutral-400 hover:text-orange-400 transition-colors">
                    Why Free Samples Matter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-orange-400 transition-colors">
                    Where to Find the Best Samples
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-orange-400 transition-colors">
                    Understanding Licensing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-orange-400 transition-colors">
                    Organizing Your Library
                  </a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-orange-400 transition-colors">
                    Making the Most of Samples
                  </a>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
              <Music className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="font-bold mb-2">Get Free Samples</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Download professional samples for your next track.
              </p>
              <Link 
                href="/samples"
                className="block w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-center text-sm font-medium"
              >
                Browse Samples
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        <section className="mt-16 pt-12 border-t border-neutral-800">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPost.relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-900/70 hover:border-neutral-700 transition-all">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {post.excerpt}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 text-center">
          <Headphones className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Want More Free Samples & Tips?</h2>
          <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
            Join our newsletter and get exclusive free samples, production tips, and early access to new releases.
          </p>
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-medium">
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </article>
  );
}