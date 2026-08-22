import { useEffect, useRef } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useSettings } from '@/stores/settings';
import { allPRs } from '@/services/progression';
import { benchmarkTier } from '@/services/strength';
import { runDiagnostics } from '@/services/diagnostics';
import { kgToUnit } from '@/types/constants';
import ScreenHeader from '@/components/ScreenHeader';

const W = 1080;
const H = 1350;
const BG = '#12131A';
const PANEL = '#1A1B24';
const TRACK = '#2A2A36';
const ACCENT = '#FF5A1F';
const OK = '#3DDC97';
const WARN = '#FFD166';
const BAD = '#EF476F';
const TEXT = '#F2F2F5';
const DIM = '#9A9AA8';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** Minimal dumbbell glyph used as the logo mark. */
function drawLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.fillStyle = color;
  rr(ctx, cx - s * 0.58, cy - s * 0.36, s * 0.17, s * 0.72, s * 0.06);
  ctx.fill();
  rr(ctx, cx + s * 0.41, cy - s * 0.36, s * 0.17, s * 0.72, s * 0.06);
  ctx.fill();
  rr(ctx, cx - s * 0.37, cy - s * 0.055, s * 0.74, s * 0.11, s * 0.05);
  ctx.fill();
}

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

    // ---------- base ----------
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 6;
    rr(ctx, 28, 28, W - 56, H - 56, 40);
    ctx.stroke();

    const diag = runDiagnostics(sparring, lifts);
    const unit = settings.unit;
    const prs = allPRs(lifts)
      .filter((p) => p.mode === 'dynamic')
      .sort((a, b) => b.valueKg - a.valueKg);
    const top3 = prs.slice(0, 3);
    const bestOrm = Math.max(0, ...prs.map((p) => p.valueKg));
    const tier = benchmarkTier(bestOrm);

    // ---------- header ----------
    drawLogo(ctx, 118, 118, 52, ACCENT);
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('ArmLog', 162, 134);

    const tierLabel = t('bench.' + tier.tier).toUpperCase();
    ctx.font = 'bold 30px system-ui, sans-serif';
    const tw = ctx.measureText(tierLabel).width;
    rr(ctx, W - 110 - tw - 56, 88, tw + 56, 60, 30);
    ctx.fillStyle = tier.color + '26';
    ctx.fill();
    ctx.fillStyle = tier.color;
    ctx.fillText(tierLabel, W - 138 - tw, 128);

    // ---------- identity ----------
    const name = (settings.displayName?.trim() || 'ArmLog Athlete').toUpperCase();
    ctx.fillStyle = TEXT;
    ctx.font = '800 84px system-ui, sans-serif';
    ctx.fillText(name.length > 16 ? name.slice(0, 16) + '…' : name, 92, 300);

    ctx.font = '600 34px system-ui, sans-serif';
    ctx.fillStyle = DIM;
    ctx.fillText(
      [settings.weightClass?.toUpperCase(), t('diag.balance').toUpperCase()].filter(Boolean).join('   ·   '),
      94,
      356,
    );

    ctx.strokeStyle = TRACK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, 408);
    ctx.lineTo(W - 92, 408);
    ctx.stroke();

    // ---------- balance ring ----------
    const cx = W / 2;
    const cy = 640;
    const r = 158;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.strokeStyle = TRACK;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const ringColor = diag.balanceScore >= 75 ? OK : diag.balanceScore >= 60 ? WARN : BAD;
    ctx.strokeStyle = ringColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.max(diag.balanceScore, 2) / 100) * Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = TEXT;
    ctx.font = '800 116px system-ui, sans-serif';
    ctx.fillText(String(diag.balanceScore), cx, cy + 30);
    ctx.fillStyle = DIM;
    ctx.font = '700 30px system-ui, sans-serif';
    ctx.fillText(t('diag.balance').toUpperCase(), cx, cy + 92);

    // ---------- top lifts bars ----------
    ctx.textAlign = 'left';
    ctx.fillStyle = DIM;
    ctx.font = '700 28px system-ui, sans-serif';
    ctx.fillText(t('card.topLifts').toUpperCase(), 96, 906);

    const maxVal = Math.max(1, ...top3.map((p) => p.valueKg));
    let y = 946;
    for (const p of top3) {
      rr(ctx, 80, y, W - 160, 108, 24);
      ctx.fillStyle = PANEL;
      ctx.fill();

      ctx.fillStyle = TEXT;
      ctx.font = 'bold 40px system-ui, sans-serif';
      ctx.fillText(t(`enum.vector.${p.vector}`), 124, y + 66);

      const bx = 520;
      const bw = 340;
      rr(ctx, bx, y + 46, bw, 16, 8);
      ctx.fillStyle = TRACK;
      ctx.fill();
      const fillW = Math.max(14, (p.valueKg / maxVal) * bw);
      rr(ctx, bx, y + 46, fillW, 16, 8);
      ctx.fillStyle = ACCENT;
      ctx.fill();

      ctx.textAlign = 'right';
      ctx.fillStyle = ACCENT;
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.fillText(`${kgToUnit(p.valueKg, unit)} ${unit}`, W - 124, y + 70);
      ctx.textAlign = 'left';

      y += 132;
    }

    if (top3.length === 0) {
      ctx.fillStyle = DIM;
      ctx.font = '600 32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('progress.noDataVector'), W / 2, 1010);
      ctx.textAlign = 'left';
    }

    // ---------- footer ----------
    ctx.strokeStyle = TRACK;
    ctx.beginPath();
    ctx.moveTo(92, H - 168);
    ctx.lineTo(W - 92, H - 168);
    ctx.stroke();

    drawLogo(ctx, W / 2 - 78, H - 106, 40, ACCENT);
    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.fillText('ArmLog', W / 2 - 44, H - 94);
    ctx.fillStyle = DIM;
    ctx.font = '500 26px system-ui, sans-serif';
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    ctx.fillText(date, W / 2 + 96, H - 94);
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
