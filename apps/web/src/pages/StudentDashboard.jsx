import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ChevronRight, LogOut, ShieldCheck, Trophy } from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser, profile, isAdmin, logout } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [c, a] = await Promise.all([
        supabase.from('grade12_chapters').select('*').order('sort_order'),
        supabase.from('grade12_attempts').select('id,chapter_id,score,total,percentage,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(10),
      ]);
      if (!c.error) setChapters(c.data || []);
      if (!a.error) setAttempts(a.data || []);
      setLoading(false);
    };
    if (currentUser) load();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-primary font-bold">GRADE 12 MATHEMATICS</div>
              <h1 className="text-3xl sm:text-4xl font-black mt-1">Welcome, {profile?.full_name || currentUser.email}</h1>
              <p className="text-muted-foreground mt-1">Choose a chapter and start practicing.</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && <Button asChild variant="outline"><Link to="/admin"><ShieldCheck className="h-4 w-4 mr-2" /> Admin</Link></Button>}
              <Button variant="ghost" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Card><CardContent className="p-4"><BookOpen className="h-5 w-5 text-primary mb-2" /><div className="text-2xl font-black">{chapters.length}</div><div className="text-xs text-muted-foreground">Chapters</div></CardContent></Card>
            <Card><CardContent className="p-4"><Trophy className="h-5 w-5 text-primary mb-2" /><div className="text-2xl font-black">{attempts.length}</div><div className="text-xs text-muted-foreground">Recent attempts</div></CardContent></Card>
            <Card><CardContent className="p-4"><Trophy className="h-5 w-5 text-primary mb-2" /><div className="text-2xl font-black">{attempts.length ? Math.max(...attempts.map((a) => Number(a.percentage))).toFixed(0) + '%' : '—'}</div><div className="text-xs text-muted-foreground">Best recent score</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chapter practice</CardTitle>
              <CardDescription>Every chapter is connected to the same question bank your admin can edit.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {chapters.map((chapter) => (
                  <Link key={chapter.id} to={`/quiz/${chapter.id}`} className="rounded-xl border p-4 flex items-center gap-4 hover:border-primary/60 hover:bg-primary/5 transition">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center font-black">{chapter.id}</div>
                    <div className="flex-1"><div className="font-bold">Chapter {chapter.id}: {chapter.title}</div><div className="text-sm text-muted-foreground line-clamp-1">{chapter.description}</div></div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
              {loading && <div className="text-center py-8 text-muted-foreground">Loading chapters…</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent results</CardTitle><CardDescription>Your latest saved chapter attempts.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {attempts.map((a) => {
                const chapter = chapters.find((c) => c.id === a.chapter_id);
                return <div key={a.id} className="rounded-xl border p-4 flex justify-between gap-3"><div><div className="font-medium">Chapter {a.chapter_id}: {chapter?.title || 'Unknown'}</div><div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div></div><div className="font-black">{a.score}/{a.total} · {Number(a.percentage).toFixed(0)}%</div></div>;
              })}
              {!attempts.length && !loading && <div className="text-center py-6 text-muted-foreground">No attempts yet. Start your first chapter quiz.</div>}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
