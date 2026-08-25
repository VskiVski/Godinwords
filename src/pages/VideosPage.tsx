import { FormEvent, useEffect, useState } from 'react';
import { Clapperboard, Heart, Loader2, Plus, Play, X, Star, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

interface Video {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  video_type: string;
  video_url: string;
  likes_count: number;
}

export function VideosPage() {
  const { user, displayName } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [type, setType] = useState<'all' | 'short' | 'long'>('all');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [videoType, setVideoType] = useState<'short' | 'long'>('short');

  const loadVideos = async () => {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    setVideos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from('video_likes').select('video_id').then(({ data }) => setLiked(new Set((data ?? []).map((row) => row.video_id))));
  }, [user]);

  const toggleLike = async (video: Video) => {
    if (!user) { setShowAuth(true); return; }
    const isLiked = liked.has(video.id);
    if (isLiked) await supabase.from('video_likes').delete().eq('video_id', video.id);
    else await supabase.from('video_likes').insert({ video_id: video.id });
    setLiked((current) => { const next = new Set(current); isLiked ? next.delete(video.id) : next.add(video.id); return next; });
    setVideos((current) => current.map((item) => item.id === video.id ? { ...item, likes_count: Math.max(0, item.likes_count + (isLiked ? -1 : 1)) } : item));
  };

  const createVideo = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    await supabase.from('videos').insert({ title: title.trim(), description: description.trim(), video_url: url.trim(), video_type: videoType, author_name: displayName || 'Peregrino' });
    setTitle(''); setDescription(''); setUrl(''); setShowCreate(false); await loadVideos();
  };

  const visibleVideos = type === 'all' ? videos : videos.filter((video) => video.video_type === type);

  const RECOMMENDED_CHANNELS = [
    {
      name: 'Frei Gilson',
      description: 'Pregações e homilias do Frei Gilson, conhecido por suas pregações apaixonadas e profundas sobre a Palavra de Deus.',
      url: 'https://www.youtube.com/@FreiGilsonOFM',
      tag: 'Pregações',
    },
    {
      name: 'Canção Nova',
      description: 'Comunidade católica com pregações, lives e conteúdo de evangelização 24 horas por dia.',
      url: 'https://www.youtube.com/@CancaoNova',
      tag: 'Evangelização',
    },
    {
      name: 'Padre Paulo Ricardo',
      description: 'Catequese, estudos bíblicos e formação católica aprofundada.',
      url: 'https://www.youtube.com/@padrepauloricardo',
      tag: 'Catequese',
    },
  ];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-secondary-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8"><div><p className="text-xs uppercase tracking-[0.2em] text-gold-400 font-medium mb-2">Evangelização</p><h1 className="font-serif text-4xl text-white">Vídeos da comunidade</h1><p className="text-secondary-300 mt-2">Pregações, testemunhos e reflexões para alimentar sua fé.</p></div><button onClick={() => user ? setShowCreate(true) : setShowAuth(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 text-primary-950 px-5 py-2.5 text-sm font-semibold"><Plus size={17} /> Publicar vídeo</button></div>
        <div className="flex gap-2 mb-8">{[['all', 'Todos'], ['short', 'Curtos'], ['long', 'Pregações longas']].map(([value, label]) => <button key={value} onClick={() => setType(value as typeof type)} className={`rounded-full px-4 py-2 text-sm transition-colors ${type === value ? 'bg-white text-secondary-950' : 'bg-white/10 text-secondary-200 hover:bg-white/20'}`}>{label}</button>)}</div>
        <div className="rounded-2xl border border-gold-400/30 bg-gold-400/10 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4"><Star size={18} className="text-gold-400" /><h2 className="font-serif text-xl text-white">Canais recomendados</h2></div>
          <div className="grid gap-4 sm:grid-cols-3">{RECOMMENDED_CHANNELS.map((channel) => <a key={channel.name} href={channel.url} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors block"><div className="flex items-center justify-between mb-2"><span className="text-xs uppercase tracking-wider text-gold-300 font-medium">{channel.tag}</span><ExternalLink size={14} className="text-secondary-400" /></div><h3 className="font-serif text-lg text-white mb-1">{channel.name}</h3><p className="text-xs text-secondary-300 leading-relaxed line-clamp-3">{channel.description}</p></a>)}</div>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-secondary-300" /></div> : visibleVideos.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"><Clapperboard className="mx-auto text-gold-400 mb-3" size={32} /><p className="text-secondary-300">Ainda não há vídeos publicados pela comunidade. Seja o primeiro a compartilhar uma pregação.</p></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleVideos.map((video) => <article key={video.id} className="rounded-2xl overflow-hidden bg-white/10 border border-white/10"><div className="aspect-video bg-black flex items-center justify-center"><a href={video.video_url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-gold-500 text-primary-950 flex items-center justify-center hover:scale-105 transition-transform" aria-label={`Assistir ${video.title}`}><Play size={20} fill="currentColor" /></a></div><div className="p-5"><div className="flex items-center gap-2 text-xs text-gold-300 uppercase tracking-wider mb-2">{video.video_type === 'short' ? 'Vídeo curto' : 'Pregação'} · {video.author_name}</div><h2 className="font-serif text-xl text-white">{video.title}</h2>{video.description && <p className="text-sm text-secondary-300 mt-2 line-clamp-2">{video.description}</p>}<button onClick={() => toggleLike(video)} className={`mt-4 inline-flex items-center gap-2 text-sm ${liked.has(video.id) ? 'text-rose-300' : 'text-secondary-300 hover:text-white'}`}><Heart size={17} fill={liked.has(video.id) ? 'currentColor' : 'none'} /> {video.likes_count}</button></div></article>)}</div>}
      </div>
      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={createVideo} className="w-full max-w-lg rounded-2xl bg-[#fdfaf6] text-secondary-900 p-7 shadow-2xl"><div className="flex justify-between items-center mb-5"><h2 className="font-serif text-2xl text-primary-900">Publicar vídeo</h2><button type="button" onClick={() => setShowCreate(false)}><X size={20} /></button></div><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título do vídeo" className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-3" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição (opcional)" rows={3} className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-3" /><input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Link do vídeo (YouTube, Vimeo...)" className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-3" /><select value={videoType} onChange={(event) => setVideoType(event.target.value as typeof videoType)} className="w-full rounded-lg border border-secondary-200 px-4 py-3 text-sm mb-4"><option value="short">Vídeo curto</option><option value="long">Pregação longa</option></select><button className="w-full rounded-lg bg-primary-700 text-white py-3 font-medium">Publicar</button></form></div>}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}
