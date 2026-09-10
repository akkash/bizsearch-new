import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/** Franchise ROI preview. Sample figures clearly labeled. */
export function ValuationPreviewSection({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  const [investmentLakh, setInvestmentLakh] = useState(45);

  const model = useMemo(() => {
    const monthlyMin = Math.round(investmentLakh * 0.16);
    const monthlyMax = Math.round(investmentLakh * 0.27);
    const opex = Math.round(investmentLakh * 0.12);
    const paybackMin = Math.max(12, Math.round(16 + (investmentLakh - 45) * 0.08));
    const paybackMax = paybackMin + 6;
    return { monthlyMin, monthlyMax, opex, paybackMin, paybackMax };
  }, [investmentLakh]);

  return (
    <section className={cn(embedded ? "" : "py-16 md:py-24 border-b border-border", className)}>
      <div className={cn(embedded ? "h-full" : "container mx-auto px-4 md:px-6")}>
        {!embedded && (
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-10 md:mb-12 max-w-2xl leading-tight">
            See franchise investment, returns and payback before you commit.
          </h2>
        )}

        <div className="h-full border border-border bg-card shadow-[var(--shadow-sm)] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40">
            <span className="text-sm font-bold uppercase tracking-widest">
              Franchise ROI
            </span>
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-trust-blue text-white">
              Sample
            </span>
          </div>

          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <label className="block mb-8">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Initial investment
                </span>
                <span className="font-mono text-2xl font-bold text-growth-green">
                  ₹{investmentLakh}L
                </span>
              </div>
              <Slider
                min={20}
                max={100}
                step={5}
                value={[investmentLakh]}
                onValueChange={(v) => setInvestmentLakh(v[0] ?? 45)}
                aria-label="Sample initial investment in lakh"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>₹20L</span>
                <span>₹1Cr</span>
              </div>
            </label>

            <div className="border border-border divide-y mb-6">
              {[
                ["Monthly revenue", `₹${model.monthlyMin}L–₹${model.monthlyMax}L`],
                ["Operating costs", `₹${model.opex}L / mo`],
                ["Payback", `${model.paybackMin}–${model.paybackMax} mo`],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>

            <ul className="space-y-2 text-sm mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-growth-green" aria-hidden="true" />
                Investment scales the sample revenue and payback band
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                Rent and labour need local verification
              </li>
            </ul>

            <Button asChild className="h-12 px-6 mt-auto w-fit">
              <Link to="/franchises">
                Explore Franchise ROI
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3">
              Illustrative sample. Assumptions vary by brand and territory. Not a formal appraisal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
