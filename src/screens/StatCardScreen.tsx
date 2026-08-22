import { useEffect, useRef } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useSettings } from '@/stores/settings';
import { allPRs } from '@/services/progression';
import { benchmarkTier, ormForLift } from '@/services/strength';
import { runDiagnostics, effectiveWeight } from '@/services/diagnostics';
import { kgToUnit } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';

const W = 1080;
const H = 1350;
const BG = '#12131A';
const SURFACE = '#1A1B24';
const ACCENT = '#FF5A1F';
const TEXT = '#F2F2F5';
const DIM = '#9A9AA8';

export default function StatCardScreen() {
  const { t } = useTranslation();
  const lifts = useLifts((s) => s.lifts);
  const sparring = useSparring((s) => s.sessions);
  const settings = useSettings((s) => s.settings);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // border
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // header band
    ctx.fillStyle = SURFACE;
    ctx.fillRect(28, 28, W - 56, 170);
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(W / 2, 96, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BG;
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', W / 2, 110);

    const name = settings.displayName?.trim() || 'ArmLog Athlete';
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.fillText(name, W / 2, 172);

    const subParts = [
      settings.weightClass ?? null,
      t('bench.' + benchmarkTier(bestOverallOrm(lifts)).tier),
    ].filter(Boolean);
    ctx.fillStyle = DIM;
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillText(subParts.join(' · '), W / 2, 216);

    // Balance score ring
    const diag = runDiagnostics(sparring, lifts);
    const cy = 430;
    ctx.strokeStyle = '#2A2A36';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(W / 2, cy, 130, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = diag.balanceScore >= 75 ? '#3DDC97' : diag.balanceScore >= 60 ? '#FFD166' : '#EF476F';
    ctx.beginPath();
    ctx.arc(W / 2, cy, 130, -Math.PI / 2, -Math.PI / 2 + (Math.max(diag.balanceScore, 3) / 100) * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText(String(diag.balanceScore), W / 2, cy + 20);
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillStyle = DIM;
    ctx.fillText(t('diag.balance').toUpperCase(), W / 2, cy + 70);

    // Top vectors
    const unit = settings.unit;
    const prs = allPRs(lifts)
      .filter((p) => p.mode === 'dynamic')
      .sort((a, b) => b.valueKg - a.valueKg)
      .slice(0, 3);
    const listTop = 660;
    prs.forEach((p, i) => {
      const y = listTop + i * 150;
      ctx.fillStyle = SURFACE;
      ctx.fillRect(80, y, W - 160, 120);
      ctx.textAlign = 'left';
      ctx.fillStyle = TEXT;
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.fillText(t(`enum.vector.${p.vector}`), 120, y + 76);
      ctx.textAlign = 'right';
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 48px system-ui, sans-serif';
      ctx.fillText(`${kgToUnit(p.valueKg, unit)} ${unit}`, W - 120, y + 76);
    });
    if (prs.length === 0) {
      ctx.textAlign = 'center';
      ctx.fillStyle = DIM;
      ctx.font = '600 32px system-ui, sans-serif';
      ctx.fillText(t('progress.noDataVector'), W / 2, listTop + 60);
    }

    // footer
    ctx.textAlign = 'center';
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('ArmLog', W / 2, H - 90);
    ctx.fillStyle = DIM;
    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillText(t('card.footer'), W / 2, H - 50);
  }, [lifts, sparring, settings, t]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `armlog-card-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'armlog-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'ArmLog' });
      } else {
        download();
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('card.title')} subtitle={t('card.subtitle')} backTo="/progress" />
      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        <div className="overflow-hidden rounded-lg border border-border bg-surface p-2">
          <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-md" />
        </div>
        {!settings.displayName && (
          <p className="text-center text-caption text-text-faint">{t('card.nameHint')}</p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={download} className="btn-ghost flex-1 justify-center">
            <Download size={18} /> {t('card.download')}
          </button>
          <button type="button" onClick={share} className="btn-primary flex-1 justify-center">
            <Share2 size={18} /> {t('card.share')}
          </button>
        </div>
      </div>
    </div>
  );
}

function bestOverallOrm(lifts: ReturnType<typeof useLifts.getState>['lifts']): number {
  return Math.max(
    0,
    ...lifts.filter((l) => l.mode === 'dynamic').map((l) => Math.max(ormForLift(l), effectiveWeight(l))),
  );
}
