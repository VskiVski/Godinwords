import { FormEvent, useState } from 'react';
import { CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const AMOUNTS = [10, 25, 50, 100];

export function DonationsPage() {
  const { user, displayName } = useAuth();
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selectedAmount = custom ? Number(custom) : amount;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAmount || selectedAmount <= 0) return;
    await supabase.from('donations').insert({ amount: selectedAmount, message: message.trim(), donor_name: anonymous ? 'Anônimo' : displayName || 'Anônimo', user_id: user?.id ?? null });
    setSubmitted(true);
  };

  return <main className="min-h-[calc(100vh-64px)] bg-[#fdfaf6]"><div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16"><div className="text-center max-w-2xl mx-auto mb-10"><span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-50 text-primary-700 mb-4"><HeartHandshake size={27} /></span><p className="text-xs uppercase tracking-[0.2em] text-gold-600 font-medium mb-2">Apoie esta missão</p><h1 className="font-serif text-4xl sm:text-5xl text-primary-900">Ajude a Palavra a chegar mais longe</h1><p className="text-secondary-600 mt-4 leading-relaxed">Sua contribuição ajuda a manter o God in Words gratuito e a construir novos espaços para a comunidade católica.</p></div>{submitted ? <div className="max-w-md mx-auto rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-600 mb-3" size={38} /><h2 className="font-serif text-2xl text-emerald-900">Obrigado pela sua generosidade</h2><p className="text-sm text-emerald-800 mt-2">Seu apoio foi registrado. Deus abençoe você e sua família.</p><button onClick={() => setSubmitted(false)} className="text-sm text-emerald-700 underline mt-5">Fazer outra contribuição</button></div> : <form onSubmit={submit} className="max-w-md mx-auto rounded-2xl border border-gold-200/60 bg-white p-6 sm:p-8 shadow-sm"><h2 className="font-serif text-2xl text-primary-900 mb-5">Escolha um valor</h2><div className="grid grid-cols-4 gap-2 mb-4">{AMOUNTS.map((value) => <button type="button" key={value} onClick={() => { setAmount(value); setCustom(''); }} className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${!custom && amount === value ? 'bg-primary-700 border-primary-700 text-white' : 'border-secondary-200 text-secondary-700 hover:border-primary-300'}`}>R$ {value}</button>)}</div><div className="relative mb-5"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-400">R$</span><input type="number" min="1" step="0.01" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Outro valor" className="w-full rounded-lg border border-secondary-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" /></div><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensagem (opcional)" rows={3} className="w-full rounded-lg border border-secondary-200 px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-300" /><label className="flex items-center gap-2 text-sm text-secondary-600 mb-5"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="rounded border-secondary-300 text-primary-700" /> Fazer contribuição anônima</label><button className="w-full rounded-lg bg-primary-700 hover:bg-primary-800 text-white py-3 font-medium transition-colors">Contribuir R$ {selectedAmount.toFixed(2)}</button><div className="flex items-center justify-center gap-2 text-xs text-secondary-400 mt-4"><ShieldCheck size={14} /> Sua contribuição é registrada com segurança</div></form>}</div></main>;
}
