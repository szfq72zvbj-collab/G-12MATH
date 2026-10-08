import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft, BookOpen, CheckCircle2, ClipboardList, Edit3, GraduationCap,
  Layers3, Loader2, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users
} from 'lucide-react';

const emptyCourse = {
  title: '',
  description: '',
  instructor: '',
  price: '0',
  isPremium: false,
};

const emptyLesson = {
  courseId: '',
  title: '',
  content: '',
  videoUrl: '',
  order: '1',
  materials: '',
};

const AdminPage = () => {
  const { currentUser, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin === true;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRows, userRows, purchaseRows] = await Promise.all([
        pb.collection('courses').getFullList({ sort: 'createdAt', $autoCancel: false }),
        pb.collection('users').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('purchases').getFullList({ sort: '-purchaseDate', expand: 'courseId', $autoCancel: false }),
      ]);
      setCourses(courseRows);
      setUsers(userRows);
      setPurchases(purchaseRows);
      if (!selectedCourseId && courseRows[0]) {
        setSelectedCourseId(courseRows[0].id);
        setLessonForm((v) => ({ ...v, courseId: courseRows[0].id }));
      }
    } catch (err) {
      console.error('Admin load error:', err);
      setError(err?.message || 'Unable to load admin data. Check your PocketBase collection rules.');
      toast.error(err?.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (courseId) => {
    if (!courseId) {
      setLessons([]);
      return;
    }
    try {
      const rows = await pb.collection('lessons').getFullList({
        filter: `courseId = "${courseId}"`,
        sort: 'order',
        $autoCancel: false,
      });
      setLessons(rows);
    } catch (err) {
      console.error('Lesson load error:', err);
      setLessons([]);
      toast.error(err?.message || 'Unable to load lessons');
    }
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && selectedCourseId) loadLessons(selectedCourseId);
  }, [isAdmin, selectedCourseId]);

  const stats = useMemo(() => ({
    courses: courses.length,
    lessons: lessons.length,
    users: users.length,
    purchases: purchases.length,
    completed: purchases.filter((p) => p.status === 'completed' || p.paymentStatus === 'completed').length,
  }), [courses, lessons, users, purchases]);

  if (!currentUser) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-lg w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>Admin access required</CardTitle>
              <CardDescription>
                This account does not have the <code>role = admin</code> permission in PocketBase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard"><Button className="w-full">Back to dashboard</Button></Link>
              <Button variant="outline" className="w-full" onClick={logout}>Sign out</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const startNewCourse = () => {
    setEditingCourseId(null);
    setCourseForm(emptyCourse);
  };

  const editCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      instructor: course.instructor || '',
      price: String(course.price ?? 0),
      isPremium: !!course.isPremium,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return toast.error('Course title is required');
    setSaving(true);
    try {
      const body = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        instructor: courseForm.instructor.trim(),
        price: Number(courseForm.price) || 0,
        isPremium: !!courseForm.isPremium,
      };
      const saved = editingCourseId
        ? await pb.collection('courses').update(editingCourseId, body, { $autoCancel: false })
        : await pb.collection('courses').create(body, { $autoCancel: false });

      setCourses((rows) => editingCourseId
        ? rows.map((row) => row.id === saved.id ? saved : row)
        : [...rows, saved]
      );
      setSelectedCourseId(saved.id);
      setLessonForm((v) => ({ ...v, courseId: saved.id }));
      setEditingCourseId(null);
      setCourseForm(emptyCourse);
      toast.success(editingCourseId ? 'Course updated' : 'Course created');
    } catch (err) {
      toast.error(err?.message || 'Unable to save course');
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? Related data may also be affected by your PocketBase rules.')) return;
    try {
      await pb.collection('courses').delete(courseId, { $autoCancel: false });
      setCourses((rows) => rows.filter((row) => row.id !== courseId));
      if (selectedCourseId === courseId) {
        const next = courses.find((row) => row.id !== courseId);
        setSelectedCourseId(next?.id || '');
      }
      toast.success('Course deleted');
    } catch (err) {
      toast.error(err?.message || 'Unable to delete course');
    }
  };

  const resetLesson = () => {
    setEditingLessonId(null);
    setLessonForm((v) => ({ ...emptyLesson, courseId: selectedCourseId || v.courseId }));
  };

  const editLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      courseId: lesson.courseId || selectedCourseId || '',
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      order: String(lesson.order ?? 1),
      materials: lesson.materials || '',
    });
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.courseId) return toast.error('Choose a course');
    if (!lessonForm.title.trim()) return toast.error('Lesson title is required');
    setSaving(true);
    try {
      const body = {
        courseId: lessonForm.courseId,
        title: lessonForm.title.trim(),
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl.trim(),
        order: Number(lessonForm.order) || 1,
        materials: lessonForm.materials,
      };
      const saved = editingLessonId
        ? await pb.collection('lessons').update(editingLessonId, body, { $autoCancel: false })
        : await pb.collection('lessons').create(body, { $autoCancel: false });

      if (saved.courseId === selectedCourseId) {
        setLessons((rows) => editingLessonId
          ? rows.map((row) => row.id === saved.id ? saved : row)
          : [...rows, saved].sort((a, b) => Number(a.order) - Number(b.order))
        );
      }
      setEditingLessonId(null);
      setLessonForm({ ...emptyLesson, courseId: selectedCourseId });
      toast.success(editingLessonId ? 'Lesson updated' : 'Lesson created');
    } catch (err) {
      toast.error(err?.message || 'Unable to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await pb.collection('lessons').delete(lessonId, { $autoCancel: false });
      setLessons((rows) => rows.filter((row) => row.id !== lessonId));
      toast.success('Lesson deleted');
    } catch (err) {
      toast.error(err?.message || 'Unable to delete lesson');
    }
  };

  const toggleAdmin = async (user) => {
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`${nextRole === 'admin' ? 'Make' : 'Remove'} admin access for ${user.email || user.name || 'this user'}?`)) return;
    try {
      const updated = await pb.collection('users').update(user.id, { role: nextRole }, { $autoCancel: false });
      setUsers((rows) => rows.map((row) => row.id === updated.id ? updated : row));
      toast.success(nextRole === 'admin' ? 'Admin access granted' : 'Admin access removed');
    } catch (err) {
      toast.error(err?.message || 'Unable to update user role');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Grade 12 Math Academy</title>
        <meta name="description" content="Manage Grade 12 mathematics courses, lessons, students, and payments." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage Grade 12 courses, lessons, students, and payments.</p>
              </div>
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ['Courses', stats.courses, BookOpen],
                ['Lessons', stats.lessons, Layers3],
                ['Students', stats.users, Users],
                ['Purchases', stats.purchases, ClipboardList],
                ['Completed', stats.completed, CheckCircle2],
              ].map(([label, value, Icon]) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <Icon className="h-5 w-5 text-primary mb-2" />
                    <div className="text-2xl font-bold">{loading ? '—' : value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-b pb-2">
              {[
                ['overview', 'Overview'],
                ['courses', 'Courses'],
                ['lessons', 'Lessons'],
                ['users', 'Students'],
                ['purchases', 'Payments'],
              ].map(([value, label]) => (
                <Button key={value} variant={tab === value ? 'default' : 'ghost'} onClick={() => setTab(value)}>
                  {label}
                </Button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Quick actions</CardTitle>
                    <CardDescription>Jump directly to common management tasks.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    <Button onClick={() => { setTab('courses'); startNewCourse(); }}><Plus className="h-4 w-4 mr-2" /> New course</Button>
                    <Button variant="outline" onClick={() => setTab('lessons')}><Plus className="h-4 w-4 mr-2" /> New lesson</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin account</CardTitle>
                    <CardDescription>{currentUser.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Role:</strong> {currentUser.role || 'not set'}</p>
                    <p>Admin controls are enforced by PocketBase collection API rules. The frontend only provides the management interface.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'courses' && (
              <div className="grid lg:grid-cols-[360px_1fr] gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div><CardTitle>{editingCourseId ? 'Edit course' : 'New course'}</CardTitle><CardDescription>Create or update course information.</CardDescription></div>
                      {editingCourseId && <Button size="sm" variant="ghost" onClick={startNewCourse}>New</Button>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveCourse} className="space-y-4">
                      <div><Label>Title</Label><Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Complex Numbers" /></div>
                      <div><Label>Description</Label><Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={4} /></div>
                      <div><Label>Instructor</Label><Input value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} /></div>
                      <div><Label>Price (MMK)</Label><Input type="number" min="0" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} /></div>
                      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={courseForm.isPremium} onChange={(e) => setCourseForm({ ...courseForm, isPremium: e.target.checked })} /> Premium course</label>
                      <Button type="submit" className="w-full" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {editingCourseId ? 'Save changes' : 'Create course'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {courses.map((course) => (
                    <Card key={course.id} className={selectedCourseId === course.id ? 'border-primary' : ''}>
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{course.title}</h3>
                            {course.isPremium && <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">Premium</span>}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{Number(course.price || 0).toLocaleString()} MMK · {course.instructor || 'No instructor'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedCourseId(course.id); setLessonForm((v) => ({ ...v, courseId: course.id })); }}><Layers3 className="h-4 w-4 mr-1" /> Lessons</Button>
                          <Button size="sm" variant="outline" onClick={() => editCourse(course)}><Edit3 className="h-4 w-4 mr-1" /> Edit</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCourse(course.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!courses.length && !loading && <Card><CardContent className="p-8 text-center text-muted-foreground">No courses found in PocketBase.</CardContent></Card>}
                </div>
              </div>
            )}

            {tab === 'lessons' && (
              <div className="grid lg:grid-cols-[360px_1fr] gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div><CardTitle>{editingLessonId ? 'Edit lesson' : 'New lesson'}</CardTitle><CardDescription>Lesson notes, video, and ordering.</CardDescription></div>
                      {editingLessonId && <Button size="sm" variant="ghost" onClick={resetLesson}>New</Button>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveLesson} className="space-y-4">
                      <div>
                        <Label>Course</Label>
                        <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={lessonForm.courseId} onChange={(e) => { setSelectedCourseId(e.target.value); setLessonForm({ ...lessonForm, courseId: e.target.value }); }}>
                          <option value="">Select course</option>
                          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                      <div><Label>Title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson 1: Introduction" /></div>
                      <div><Label>Order</Label><Input type="number" min="1" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} /></div>
                      <div><Label>Video URL</Label><Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="https://..." /></div>
                      <div><Label>Notes / content</Label><Textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} rows={8} placeholder="Write the lesson notes here..." /></div>
                      <div><Label>Materials</Label><Textarea value={lessonForm.materials} onChange={(e) => setLessonForm({ ...lessonForm, materials: e.target.value })} rows={3} /></div>
                      <Button type="submit" className="w-full" disabled={saving}><Save className="h-4 w-4 mr-2" />{editingLessonId ? 'Save lesson' : 'Create lesson'}</Button>
                    </form>
                  </CardContent>
                </Card>

                <div>
                  <div className="mb-3">
                    <Label>Showing lessons for</Label>
                    <select className="ml-2 h-9 rounded-md border bg-background px-3 text-sm" value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setLessonForm((v) => ({ ...v, courseId: e.target.value })); }}>
                      <option value="">Select course</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2"><span className="text-xs font-bold text-primary">#{lesson.order}</span><h3 className="font-semibold">{lesson.title}</h3></div>
                              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-4">{lesson.content}</p>
                              {lesson.videoUrl && <p className="text-xs text-primary mt-2 break-all">{lesson.videoUrl}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button size="icon" variant="ghost" onClick={() => editLesson(lesson)}><Edit3 className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteLesson(lesson.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {!lessons.length && <Card><CardContent className="p-8 text-center text-muted-foreground">No lessons for this course yet.</CardContent></Card>}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Student accounts</CardTitle><CardDescription>View accounts and manage admin permissions.</CardDescription></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Role</th><th className="p-3">Action</th></tr></thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="p-3 font-medium">{user.name || '—'}</td>
                            <td className="p-3">{user.email || '—'}</td>
                            <td className="p-3">{user.phone || '—'}</td>
                            <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-muted">{user.role || 'student'}</span></td>
                            <td className="p-3">{user.id !== currentUser.id && <Button size="sm" variant="outline" onClick={() => toggleAdmin(user)}>{user.role === 'admin' ? 'Remove admin' : 'Make admin'}</Button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!users.length && <p className="text-center text-muted-foreground py-6">No users available.</p>}
                </CardContent>
              </Card>
            )}

            {tab === 'purchases' && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Payment history</CardTitle><CardDescription>Review recent course purchase records.</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <div><div className="font-medium">{purchase.expand?.courseId?.title || purchase.courseId || 'Unknown course'}</div><div className="text-sm text-muted-foreground">{purchase.phone || 'No phone'} · {purchase.transactionId || purchase.id}</div></div>
                        <div className="text-right"><div className="font-semibold">{Number(purchase.amount || 0).toLocaleString()} MMK</div><div className="text-xs text-muted-foreground">{purchase.status || purchase.paymentStatus || 'unknown'}</div></div>
                      </div>
                    ))}
                    {!purchases.length && <p className="text-center text-muted-foreground py-6">No purchases yet.</p>}
                  </div>
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
