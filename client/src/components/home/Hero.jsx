import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero({ hero }) {
  if (!hero) return <div className="skeleton h-[70vh] w-full rounded-none" />;
  return (
    <section className="relative h-[82vh] min-h-[520px] w-full overflow-hidden bg-ink text-white">
      {hero.type === 'video' && hero.video ? (
        <video className="absolute inset-0 h-full w-full object-cover" src={hero.video} poster={hero.poster} autoPlay muted loop playsInline preload="metadata" />
      ) : (
        <img src={hero.poster || hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
      <div className="container-x relative flex h-full flex-col justify-end pb-16 sm:pb-24">
        <p className="eyebrow mb-3 text-brass-200 animate-fadeUp">{hero.eyebrow}</p>
        <h1 className="h-display max-w-4xl text-6xl sm:text-8xl lg:text-[9rem] animate-fadeUp [animation-delay:80ms]">{hero.title}</h1>
        <p className="mt-4 max-w-xl text-base text-ink-200 sm:text-lg animate-fadeUp [animation-delay:160ms]">{hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3 animate-fadeUp [animation-delay:240ms]">
          {hero.primaryCta && <Link to={hero.primaryCta.to} className="btn-light">{hero.primaryCta.label} <ArrowRight size={16} /></Link>}
          {hero.secondaryCta && <Link to={hero.secondaryCta.to} className="btn border border-white text-white hover:bg-white hover:text-ink">{hero.secondaryCta.label}</Link>}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 hidden bg-white/10 backdrop-blur sm:block">
        <div className="container-x flex items-center justify-between gap-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
          <span>Same-day delivery in Kigali</span><span>Fitted in store at Unif House</span><span>MoMo · Airtel · Card · Cash</span><span>7-day exchanges</span>
        </div>
      </div>
    </section>
  );
}
