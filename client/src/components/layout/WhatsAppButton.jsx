import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function WhatsAppButton() {
  const { waLink } = useStore();
  return (
    <a
      href={waLink('Hello Briva Store! I would like to order.')}
      target="_blank"
      rel="noreferrer"
      className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lift transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} className="fill-white/20" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
