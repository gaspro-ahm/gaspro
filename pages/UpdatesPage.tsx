import React, { useState, useEffect } from 'react';
import { neon } from '@neondatabase/serverless';
import { type Post } from '../types';
import { Loader2, AlertTriangle, UserCircle } from 'lucide-react';

// This connection string is provided by the user.
// In a real-world production app, this should be handled via a secure backend API, not exposed client-side.
const connectionString = 'postgresql://neondb_owner:npg_ZhCoMen1v9Rx@ep-twilight-pond-a1ybu7fd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

const UpdatesPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                // The user provided this exact query example
                const result = await sql<Post>('SELECT id, title, content, author, created_at FROM posts ORDER BY created_at DESC');
                setPosts(result);
            } catch (err) {
                console.error("Database fetch error:", err);
                setError("Gagal memuat update dari database. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const PostCardSkeleton = () => (
         <div className="bg-card p-6 rounded-lg border shadow-sm animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <div className="w-5 h-5 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Company Updates & Announcements</h1>
                <p className="text-muted-foreground mt-1">Informasi terbaru seputar perusahaan dan proyek.</p>
            </div>

            <div className="space-y-6">
                {loading && (
                    <>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                    </>
                )}
                {error && (
                     <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-4">
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                            <h3 className="font-semibold">Terjadi Kesalahan</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                {!loading && !error && posts.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>Belum ada update yang dipublikasikan.</p>
                    </div>
                )}
                {!loading && !error && posts.map(post => (
                    <div key={post.id} className="bg-card p-6 rounded-lg border shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-xl font-bold text-card-foreground mb-2">{post.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-2"><UserCircle size={16} /> {post.author}</span>
                            <span>{new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpdatesPage;
