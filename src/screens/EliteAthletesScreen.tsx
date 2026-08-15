import { useState } from 'react';
import { Trophy, ChevronRight, MapPin, Weight } from 'lucide-react';
import { ATHLETES, type AthleteKey, type AthleteProfile } from '@/data/athletes';
import ScreenHeader from '@/components/ScreenHeader';

export default function EliteAthletesScreen() {
  const [open, setOpen] = useState<AthleteKey | null>(null);
  return (
    <div className="min-h-screen pb-24">
      <ScreenHeader title="Elite Athletes" subtitle="Study the game at the top" backTo="/tools" />
      <div className="mx-auto max-w-md space-y-3 px-4 py-4">
        {ATHLETES.map((a) => (
          <AthleteCard
            key={a.key}
            athlete={a}
            expanded={open === a.key}
            onToggle={() => setOpen(open === a.key ? null : a.key)}
          />
        ))}
      </div>
    </div>
  );
}

function AthleteCard({
  athlete: a,
  expanded,
  onToggle,
}: {
  athlete: AthleteProfile;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="card overflow-hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-lo">
          <Trophy size={22} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-h3">{a.name}</p>
          <p className="text-caption text-text-faint">{a.nickname}</p>
          <div className="mt-1 flex items-center gap-3 text-micro text-text-faint">
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {a.country}
            </span>
            <span className="flex items-center gap-1">
              <Weight size={11} /> {a.weightClass}
            </span>
          </div>
        </div>
        <ChevronRight size={18} className={`text-text-faint transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 animate-slide-up">
          <Section title="Pulling style">
            <p className="text-body text-text-dim">{a.pullingStyle}</p>
          </Section>

          <Section title="Signature lifts">
            <ul className="space-y-1.5">
              {a.signatureLifts.map((l) => (
                <li key={l} className="flex items-start gap-2 text-body text-text-dim">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {l}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Weekly routine">
            <div className="space-y-3">
              {a.weeklySplit.map((d) => (
                <div key={d.day} className="rounded-md border border-border bg-surfaceAlt p-3">
                  <p className="text-body font-semibold">{d.day}</p>
                  <p className="text-caption text-text-faint">{d.focus}</p>
                  <table className="mt-2 w-full text-caption">
                    <tbody>
                      {d.exercises.map((ex, i) => (
                        <tr key={i} className="border-t border-border/50 first:border-t-0">
                          <td className="py-1.5 pr-2 text-text">{ex.name}</td>
                          <td className="py-1.5 pr-2 text-right text-text-dim">
                            {ex.sets}×{ex.reps}
                          </td>
                          <td className="py-1.5 text-right text-text-faint">{ex.load}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Table cues">
            <ul className="space-y-1.5">
              {a.cues.map((c) => (
                <li key={c} className="flex items-start gap-2 text-body text-text-dim">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {c}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-2">{title}</p>
      {children}
    </div>
  );
}
