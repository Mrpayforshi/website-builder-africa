import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ArticleBody, Cta } from "@/components/marketing/ResourceBits";
import { POSTS, formatDate, getPost } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — Rivo blog`, description: post.summary };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <MarketingShell>
      <article className={r.article}>
        <p className={r.crumbs}>
          <Link href="/blog">Blog</Link> / {post.category}
        </p>
        <h1 className={r.articleTitle}>{post.title}</h1>
        <p className={r.articleMeta}>
          The Rivo team{post.date ? ` · ${formatDate(post.date)}` : ""} &middot; {post.minutes} min read
        </p>

        <ArticleBody blocks={post.body} />

        <nav className={r.next} aria-label="Back to the blog">
          <Link href="/blog">&larr; All posts</Link>
          <span />
        </nav>
      </article>

      <Cta title="Build the business you have been dreaming about" label="Start building" href="/signup" />
    </MarketingShell>
  );
}
