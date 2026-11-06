import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function PromoBar() {
  const { content } = useStore();
  const messages = content?.promoBar?.length ? content.promoBar : ['Free delivery in Kigali on orders over 80,000 RWF'];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (messages.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, [messages.length]);
  return (
    <div className="bg-ink text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
      <div className="container-x flex h-9 items-center justify-center">
        <p key={i} className="animate-fadeUp">{messages[i]}</p>
      </div>
    </div>
  );
}
