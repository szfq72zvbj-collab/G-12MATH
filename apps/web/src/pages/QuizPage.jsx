import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient.js';
import MathText from '@/components/MathText.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';

const QuizPage = () => {
  const { chapterId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, q] = await Promise.all([
        supabase.from('grade12_chapters').select('*').eq('id', Number(chapterId)).single(),
        supabase.from('grade12_questions').select('id,prompt,options,correct_index,explanation,difficulty').eq('chapter_id', Number(chapterId)).eq('published', true).order('id'),
      ]);
      if (!c.error) setChapter(c.data);
      if (!q.error) setQuestions(q.data || []);
      setLoading(false);
    };
    load();
  }, [chapterId]);

  const score = useMemo(
    () => questions.reduce((total, q) => total + (answers[q.id] === q.correct_index ? 1 : 0), 0),
    [questions, answers]
  );

  const submit = async () => {
    if (!questions.length) return;
    setSubmitted(true);
    setSaving(true);
    await supabase.from('grade12_attempts').insert({
      user_id: currentUser.id,
      chapter_id: Number(chapterId),
      score,
      total: questions.length,
    });
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading quiz…</div>;
  }

  if (!chapter) {
    return <div className="min-h-screen flex items-center justify-center"><Link to="/dashboard"><Button>Back to dashboard</Button></Link></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Link>
          <div>
            <div className="text-sm font-bold text-primary">CHAPTER {chapter.id}</div>
            <h1 className="text-3xl sm:text-4xl font-black mt-1">{chapter.title}</h1>
            <p className="text-muted-foreground mt-2">{chapter.description}</p>
          </div>

          {submitted ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-3xl">{score}/{questions.length}</CardTitle>
                <CardDescription>Your score is {questions.length ? ((score / questions.length) * 100).toFixed(0) : 0}%.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => { setAnswers({}); setSubmitted(false); }}><RotateCcw className="h-4 w-4 mr-2" /> Try again</Button>
                <Button variant="outline" asChild><Link to="/dashboard">Back to dashboard</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {!questions.length && <Card><CardContent className="py-10 text-center text-muted-foreground">No published questions are available for this chapter yet.</CardContent></Card>}
              {questions.map((q, index) => (
                <Card key={q.id}>
                  <CardHeader>
                    <div className="text-xs font-bold text-primary mb-2">QUESTION {index + 1}</div>
                    <CardTitle className="text-lg leading-relaxed"><MathText>{q.prompt}</MathText></CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {(q.options || []).map((option, optionIndex) => {
                      const selected = answers[q.id] === optionIndex;
                      return (
                        <button key={optionIndex} type="button" onClick={() => setAnswers((v) => ({ ...v, [q.id]: optionIndex }))}
                          className={`w-full text-left rounded-xl border p-4 transition ${selected ? 'border-primary bg-primary/10' : 'hover:border-primary/40'}`}>
                          <span className="font-bold mr-3">{String.fromCharCode(65 + optionIndex)}.</span>
                          <MathText>{option}</MathText>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
              {questions.length > 0 && (
                <Button className="w-full sm:w-auto" size="lg" onClick={submit} disabled={Object.keys(answers).length !== questions.length || saving}>
                  <CheckCircle2 className="h-5 w-5 mr-2" /> {saving ? 'Saving…' : 'Submit quiz'}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizPage;
