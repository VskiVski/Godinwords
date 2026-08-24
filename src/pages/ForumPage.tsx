import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, Plus, Send, Loader2, ArrowLeft, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

interface Topic {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  replies_count: number;
  created_at: string;
}

interface Reply {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export function ForumPage() {
  const { user, displayName } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reply, setReply] = useState('');

  const loadTopics = async () => {
    const { data } = await supabase.from('forum_topics').select('*').order('created_at', { ascending: false });
    setTopics(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const openTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setRepliesLoading(true);
    const { data } = await supabase
      .from('forum_replies')
      .select('id, author_name, content, created_at')
      .eq('topic_id', topic.id)
      .order('created_at');
    setReplies(data ?? []);
    setRepliesLoading(false);
  };

  const createTopic = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;
    await supabase.from('forum_topics').insert({
      title: title.trim(),
      content: content.trim(),
      author_name: displayName || 'Peregrino',
    });
    setTitle('');
    setContent('');
    setShowCreate(false);
    await loadTopics();
  };

  const addReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !selectedTopic || !reply.trim()) return;
    const { data } = await supabase
      .from('forum_replies')
      .insert({ topic_id: selectedTopic.id, content: reply.trim(), author_name: displayName || 'Peregrino' })
      .select('id, author_name, content, created_at')
      .maybeSingle();
    if (data) setReplies((current) => [...current, data]);
    setReply('');
    setSelectedTopic((current) => current ? { ...current, replies_count: current.replies_count + 1 } : current);
  };

  if (selectedTopic) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#fdfaf6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-2 text-sm text-secondary-500 hover:text-primary-700 mb-6">
            <ArrowLeft size={16} /> Voltar ao fórum
          </button>
          <article className="rounded-2xl border border-gold-200/60 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-secondary-400 mb-3">
              <UserRound size={14} /> {selectedTopic.author_name} · {formatDate(selectedTopic.created_at)}
            </div>
            <h1 className="font-serif text-3xl text-primary-900 mb-3">{selectedTopic.title}</h1>
            <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">{selectedTopic.content}</p>
          </article>

          <section className="mt-8">
            <h2 className="font-serif text-2xl text-primary-900 mb-4">Respostas ({replies.length})</h2>
            <div className="space-y-3 mb-6">
              {repliesLoading ? (
                <Loader2 className="animate-spin text-secondary-400" size={20} />
              ) : replies.length === 0 ? (
                <p className="text-sm text-secondary-500">Seja o primeiro a responder.</p>
              ) : replies.map((item) => (
                <div key={item.id} className="rounded-xl border border-secondary-100 bg-white p-4">
                  <div className="flex items-center gap-2 text-xs text-secondary-400 mb-2">
                    <UserRound size={13} /> {item.author_name} · {formatDate(item.created_at)}
                  </div>
                  <p className="text-sm text-secondary-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
            {user ? (
              <form onSubmit={addReply} className="flex gap-2">
                <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Escreva uma resposta..." className="flex-1 rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                <button className="rounded-lg bg-primary-700 text-white px-4 hover:bg-primary-800 transition-colors" aria-label="Enviar resposta"><Send size={17} /></button>
              </form>
            ) : (
              <button onClick={() => setShowAuth(true)} className="w-full rounded-lg bg-gold-50 border border-gold-200 py-3 text-sm text-secondary-700 hover:bg-gold-100">Entre para participar da conversa</button>
            )}
          </section>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#fdfaf6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-2">Comunidade</p>
            <h1 className="font-serif text-4xl text-primary-900">Fórum da fé</h1>
            <p className="text-secondary-600 mt-2">Converse, tire dúvidas e compartilhe sua caminhada com outros irmãos.</p>
          </div>
          <button onClick={() => user ? setShowCreate(true) : setShowAuth(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-700 hover:bg-primary-800 text-white px-5 py-2.5 text-sm font-medium"><Plus size={17} /> Novo tópico</button>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-secondary-400" /></div> : topics.length === 0 ? (
          <div className="rounded-2xl border border-gold-200/60 bg-white p-10 text-center"><MessageCircle className="mx-auto text-gold-500 mb-3" size={30} /><p className="text-secondary-600">Ainda não há conversas. Comece a primeira.</p></div>
        ) : (
          <div className="space-y-3">{topics.map((topic) => <button key={topic.id} onClick={() => openTopic(topic)} className="w-full text-left rounded-xl border border-gold-200/60 bg-white p-5 hover:shadow-md transition-all"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-xl text-primary-900">{topic.title}</h2><p className="text-sm text-secondary-600 mt-1 line-clamp-2">{topic.content}</p></div><span className="flex-shrink-0 flex items-center gap-1 text-xs text-secondary-400"><MessageCircle size={14} /> {topic.replies_count}</span></div><p className="text-xs text-secondary-400 mt-3">{topic.author_name} · {formatDate(topic.created_at)}</p></button>)}</div>
        )}
      </div>

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4"><form onSubmit={createTopic} className="w-full max-w-lg rounded-2xl bg-[#fdfaf6] p-7 shadow-2xl"><h2 className="font-serif text-2xl text-primary-900 mb-5">Criar novo tópico</h2><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da conversa" className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-300" /><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Compartilhe sua pergunta ou reflexão..." rows={5} className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-300" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-full px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50">Cancelar</button><button className="rounded-full bg-primary-700 text-white px-5 py-2 text-sm font-medium">Publicar</button></div></form></div>}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(date));
}
