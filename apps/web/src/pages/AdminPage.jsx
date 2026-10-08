import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient.js';
import MathText from '@/components/MathText.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Edit3, Loader2, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users } from 'lucide-react';

const blank = {
  id: null,
  chapter_id: '',
  prompt: '',
  a: '',
  b: '',
  c: '',
  d: '',
  correct_index: '0',
  explanation: '',
  difficulty: 'medium',
  published: true,
};

const AdminPage = () => {
  const { currentUser, profile, logout } = useAuth();
  const signedInEmail = (profile?.email || currentUser?.email || '').trim().toLowerCase();
  const authorizedAdmin =
    profile?.role === 'admin' ||
    signedInEmail === 'aungnaingmin200537@gmail.com';
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('questions');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [c, q, p, a] = await Promise.all([
      supabase.from('grade12_chapters').select('*').order('sort_order'),
      supabase.from('grade12_questions').select('*').order('chapter_id').order('id'),
      supabase.from('profiles').select('id,full_name,email,phone,role,created_at,last_seen').order('created_at', { ascending: false }),
      supabase.from('grade12_attempts').select('id,user_id,chapter_id,score,total,percentage,created_at').order('created_at', { ascending: false }),
    ]);
    const errors = [c, q, p, a].filter((r) => r.error).map((r) => r.error.message);
    if (errors.length) setError(errors.join(' | '));
    if (!c.error) {
      setChapters(c.data || []);
      if (activeChapter == null && c.data?.[0]) setActiveChapter(c.data[0].id);
    }
    if (!q.error) setQuestions(q.data || []);
    if (!p.error) setProfiles(p.data || []);
    if (!a.error) setAttempts(a.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authorizedAdmin) void load();
  }, [authorizedAdmin]);

  const chapterQuestions = useMemo(
    () => questions.filter((q) => q.chapter_id === activeChapter),
    [questions, activeChapter]
  );

  const studentProfiles = profiles.filter((p) => p.role !== 'admin');
  const now = Date.now();
  const active7d = studentProfiles.filter((p) => p.last_seen && now - new Date(p.last_seen).getTime() <= 7 * 86400000).length;
  const active30d = studentProfiles.filter((p) => p.last_seen && now - new Date(p.last_seen).getTime() <= 30 * 86400000).length;

  const stats = {
    questions: questions.length,
    published: questions.filter((q) => q.published).length,
    students: studentProfiles.length,
    active7d,
    active30d,
    attempts: attempts.length,
  };

  if (!currentUser) return <Navigate to="/login" replace />;

  if (!authorizedAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <div className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Administrator access required</CardTitle>
              <CardDescription>
                Your current account is <code>{signedInEmail || 'unknown'}</code>.
                Administrator access is enabled only for the configured admin account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard"><Button className="w-full">Back to dashboard</Button></Link>
              <Button variant="outline" className="w-full" onClick={logout}>Sign out and switch account</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const startNew = () => setForm({ ...blank, chapter_id: String(activeChapter || '') });

  const edit = (q) => {
    setForm({
      id: q.id,
      chapter_id: String(q.chapter_id),
      prompt: q.prompt || '',
      a: q.options?.[0] || '',
      b: q.options?.[1] || '',
      c: q.options?.[2] || '',
      d: q.options?.[3] || '',
      correct_index: String(q.correct_index ?? 0),
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      published: !!q.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.chapter_id || !form.prompt.trim()) return toast.error('Choose a chapter and enter a question.');
    const options = [form.a, form.b, form.c, form.d].map((x) => x.trim());
    if (options.some((x) => !x)) return toast.error('All four options are required.');

    setSaving(true);
    const payload = {
      chapter_id: Number(form.chapter_id),
      prompt: form.prompt.trim(),
      options,
      correct_index: Number(form.correct_index),
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
      published: form.published,
      created_by: currentUser.id,
    };

    const result = form.id
      ? await supabase.from('grade12_questions').update(payload).eq('id', form.id).select().single()
      : await supabase.from('grade12_questions').insert(payload).select().single();

    setSaving(false);
    if (result.error) return toast.error(result.error.message);

    toast.success(form.id ? 'Question updated' : 'Question added');
    const saved = result.data;
    setQuestions((rows) => form.id ? rows.map((q) => q.id === saved.id ? saved : q) : [...rows, saved].sort((x, y) => Number(x.id) - Number(y.id)));
    setActiveChapter(saved.chapter_id);
    setForm({ ...blank, chapter_id: String(saved.chapter_id) });
  };

  const remove = async () => {
    if (!form.id || !window.confirm('Delete this question?')) return;
    const result = await supabase.from('grade12_questions').delete().eq('id', form.id);
    if (result.error) return toast.error(result.error.message);
    toast.success('Question deleted');
    setQuestions((rows) => rows.filter((q) => q.id !== form.id));
    setForm({ ...blank, chapter_id: String(activeChapter || '') });
  };

  const toggleAdmin = async (person) => {
    const role = person.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`${role === 'admin' ? 'Grant' : 'Remove'} admin access for ${person.email || person.full_name}?`)) return;
    const result = await supabase.from('profiles').update({ role }).eq('id', person.id);
    if (result.error) return toast.error(result.error.message);
    toast.success(role === 'admin' ? 'Admin access granted' : 'Admin access removed');
    setProfiles((rows) => rows.map((p) => p.id === person.id ? { ...p, role } : p));
  };

  return (
    <>
      <Helmet>
        <title>G12 Math Admin</title>
        <meta name="description" content="Grade 12 Mathematics question and student administration." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <h1 className="text-3xl sm:text-4xl font-black">Grade 12 Admin</h1>
                <p className="text-muted-foreground mt-1">Create and manage your own Grade 12 mathematics questions.</p>
              </div>
              <Button variant="outline" onClick={load} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>

            {error && <Card className="border-destructive/40 bg-destructive/5"><CardContent className="pt-6 text-sm text-destructive">{error}</CardContent></Card>}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                ['Questions', stats.questions, BookOpen],
                ['Published', stats.published, CheckCircle2],
                ['Students', stats.students, Users],
                ['Active 7d', stats.active7d, Users],
                ['Active 30d', stats.active30d, Users],
                ['Attempts', stats.attempts, BarChart3],
              ].map(([label, value, Icon]) => (
                <Card key={label}><CardContent className="p-4"><Icon className="h-5 w-5 text-primary mb-2" /><div className="text-2xl font-black">{loading ? '—' : value}</div><div className="text-xs text-muted-foreground">{label}</div></CardContent></Card>
              ))}
            </div>

            <div className="flex gap-2 border-b overflow-x-auto">
              <Button variant={tab === 'questions' ? 'default' : 'ghost'} onClick={() => setTab('questions')}>Question Editor</Button>
              <Button variant={tab === 'students' ? 'default' : 'ghost'} onClick={() => setTab('students')}>Students</Button>
              <Button variant={tab === 'attempts' ? 'default' : 'ghost'} onClick={() => setTab('attempts')}>Quiz Attempts</Button>
            </div>

            {tab === 'questions' && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <Card className="h-fit">
                  <CardHeader><CardTitle>Chapters</CardTitle><CardDescription>Choose where to add questions.</CardDescription></CardHeader>
                  <CardContent className="space-y-2">
                    {chapters.map((chapter) => {
                      const count = questions.filter((q) => q.chapter_id === chapter.id).length;
                      return (
                        <button key={chapter.id} onClick={() => { setActiveChapter(chapter.id); setForm({ ...blank, chapter_id: String(chapter.id) }); }}
                          className={`w-full text-left rounded-xl border p-3 transition ${activeChapter === chapter.id ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}>
                          <div className="font-bold">Chapter {chapter.id}</div>
                          <div className="text-sm text-muted-foreground truncate">{chapter.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{count} question{count === 1 ? '' : 's'}</div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div><CardTitle>{form.id ? 'Edit question' : 'Add question'}</CardTitle><CardDescription>Use LaTeX such as <code>$x^2$</code>, <code>$\\sqrt{x}$</code>, or <code>\\(x^2+1\\)</code>.</CardDescription></div>
                        <Button variant="outline" onClick={startNew}><Plus className="h-4 w-4 mr-1" /> New</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={save} className="space-y-4">
                        <div>
                          <Label>Chapter</Label>
                          <select className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.chapter_id} onChange={(e) => { setActiveChapter(Number(e.target.value)); setForm({ ...form, chapter_id: e.target.value }); }}>
                            <option value="">Select chapter</option>
                            {chapters.map((c) => <option key={c.id} value={c.id}>Chapter {c.id} · {c.title}</option>)}
                          </select>
                        </div>
                        <div><Label>Question</Label><Textarea className="mt-1 min-h-28" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="If z = 3 + 4i, what is |z|?" /></div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {['a','b','c','d'].map((key, index) => <div key={key}><Label>Option {String.fromCharCode(65 + index)}</Label><Input className="mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div><Label>Correct answer</Label><select className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.correct_index} onChange={(e) => setForm({ ...form, correct_index: e.target.value })}>{['A','B','C','D'].map((x, i) => <option key={x} value={i}>Option {x}</option>)}</select></div>
                          <div><Label>Difficulty</Label><select className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                          <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
                        </div>
                        <div><Label>Explanation</Label><Textarea className="mt-1 min-h-24" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explain the solution step by step." /></div>

                        <div className="rounded-2xl border bg-muted/20 p-5">
                          <div className="text-sm font-bold mb-3">Preview</div>
                          <div className="text-lg font-semibold"><MathText>{form.prompt || 'Your question will appear here.'}</MathText></div>
                          <div className="grid sm:grid-cols-2 gap-2 mt-4">
                            {[form.a,form.b,form.c,form.d].map((value, i) => <div key={i} className="rounded-lg border bg-background p-3"><span className="font-bold mr-2">{String.fromCharCode(65+i)}.</span><MathText>{value || 'Option'}</MathText></div>)}
                          </div>
                          {form.explanation && <div className="mt-4 pt-4 border-t text-sm text-muted-foreground"><MathText>{form.explanation}</MathText></div>}
                        </div>

                        <div className="flex gap-3">
                          <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}{form.id ? 'Save changes' : 'Save question'}</Button>
                          {form.id && <Button type="button" variant="destructive" onClick={remove}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Questions in Chapter {activeChapter}</CardTitle><CardDescription>{chapters.find((c) => c.id === activeChapter)?.title || ''}</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                      {chapterQuestions.map((q) => (
                        <button key={q.id} onClick={() => edit(q)} className="w-full text-left rounded-xl border p-4 hover:border-primary/50">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-bold">Question {q.id}</div>
                            <span className="text-xs text-muted-foreground">{q.difficulty} · {q.published ? 'Published' : 'Draft'}</span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground line-clamp-2"><MathText>{q.prompt}</MathText></div>
                        </button>
                      ))}
                      {!chapterQuestions.length && <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No questions in this chapter yet. Create the first one above.</div>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {tab === 'students' && (
              <Card>
                <CardHeader><CardTitle>Student accounts</CardTitle><CardDescription>Manage profiles and administrator permissions.</CardDescription></CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Role</th><th className="p-3">Action</th></tr></thead>
                    <tbody>
                      {profiles.map((person) => (
                        <tr key={person.id} className="border-b">
                          <td className="p-3 font-medium">{person.full_name || '—'}</td>
                          <td className="p-3">{person.email || '—'}</td>
                          <td className="p-3">{person.phone || '—'}</td>
                          <td className="p-3"><span className="rounded-full bg-muted px-2 py-1 text-xs">{person.role}</span></td>
                          <td className="p-3">{person.id !== currentUser.id && <Button size="sm" variant="outline" onClick={() => toggleAdmin(person)}>{person.role === 'admin' ? 'Remove admin' : 'Make admin'}</Button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {tab === 'attempts' && (
              <Card>
                <CardHeader><CardTitle>Quiz attempts</CardTitle><CardDescription>Review student results.</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {attempts.map((a) => {
                    const person = profiles.find((p) => p.id === a.user_id);
                    const chapter = chapters.find((c) => c.id === a.chapter_id);
                    return <div key={a.id} className="rounded-xl border p-4 flex flex-col sm:flex-row sm:justify-between gap-2"><div><div className="font-medium">{person?.full_name || person?.email || 'Student'}</div><div className="text-sm text-muted-foreground">Chapter {a.chapter_id} · {chapter?.title || 'Unknown'}</div></div><div className="text-right font-bold">{a.score}/{a.total} · {Number(a.percentage).toFixed(1)}%</div></div>;
                  })}
                  {!attempts.length && <div className="text-center text-muted-foreground py-8">No quiz attempts yet.</div>}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AdminPage;
