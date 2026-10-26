import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Scale, Share2, X } from "lucide-react";
import type { Franchise } from "@/types/listings";
import {
  buildCompareRows,
  MAX_COMPARE,
  type CompareSeeker,
  type CompareSlot,
  type CompareTone,
} from "@/lib/franchise-compare";
import { cn } from "@/lib/utils";

interface ComparisonFeatureProps {
  slots: CompareSlot[];
  seeker: CompareSeeker;
  onRemoveItem: (id: string) => void;
  onAddMore: () => void;
  onEnquire: (franchise: Franchise) => void;
  onKeepFit: (franchise: Franchise) => void;
  onShare: () => void;
  enquiringId?: string | null;
  signedIn?: boolean;
  className?: string;
}

function toneClass(tone: CompareTone): string {
  if (tone === "best") return "text-growth-green";
  if (tone === "mismatch") return "text-amber-700 dark:text-amber-400";
  if (tone === "unpublished") return "text-muted-foreground";
  return "";
}

export function ComparisonFeature({
  slots,
  seeker,
  onRemoveItem,
  onAddMore,
  onEnquire,
  onKeepFit,
  onShare,
  enquiringId,
  signedIn,
  className,
}: ComparisonFeatureProps) {
  const filled = slots.filter((slot) => slot.franchise);
  const rows = buildCompareRows(slots, seeker);
  const empty = filled.length === 0 && !slots.some((slot) => slot.missing);

  return (
    <Card className={className}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Compare franchises
            <span className="text-sm font-normal text-muted-foreground">
              ({filled.length}/{MAX_COMPARE})
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onShare} disabled={!filled.length}>
              <Share2 className="h-4 w-4 mr-2" />
              Share link
            </Button>
            <Button variant="outline" size="sm" onClick={onAddMore} disabled={filled.length >= MAX_COMPARE}>
              <Plus className="h-4 w-4 mr-2" />
              Add from list
            </Button>
          </div>
        </div>
        {empty ? (
          <p className="text-sm text-muted-foreground">
            Pick 2–3 brands from this list. Compare investment, territory, and requirements before you enquire.
          </p>
        ) : filled.length === 1 ? (
          <p className="text-sm text-muted-foreground">
            One brand selected. Add 1–2 more from the list below to compare side by side.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Yes / No / unpublished only from listing fields. Nothing is invented.
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full min-w-[640px] text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 text-xs uppercase tracking-widest text-muted-foreground sticky left-0 bg-secondary border-b border-r border-border min-w-[9rem]">
                  Metric
                </th>
                {slots.map((slot, index) => (
                  <th
                    key={slot.id || `empty-${index}`}
                    className="text-left p-3 border-b border-r last:border-r-0 border-border align-top min-w-[12rem]"
                  >
                    {slot.franchise ? (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/franchise/${slot.franchise.slug || slot.franchise.id}`}
                            className="font-display font-bold uppercase hover:text-growth-green line-clamp-2"
                          >
                            {slot.franchise.brandName || slot.franchise.brand_name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => onRemoveItem(slot.franchise!.id)}
                            aria-label={`Remove ${slot.franchise.brandName || slot.franchise.brand_name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          {slot.franchise.industry || "Franchise"}
                        </p>
                        <div className="flex flex-col gap-2 pt-1">
                          <Button
                            size="sm"
                            disabled={enquiringId === slot.franchise.id}
                            onClick={() => onEnquire(slot.franchise!)}
                          >
                            {enquiringId === slot.franchise.id
                              ? "Opening enquiry…"
                              : signedIn
                                ? "Enquire"
                                : "Enquire with your profile"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onKeepFit(slot.franchise!)}>
                            Keep this fit
                          </Button>
                        </div>
                      </div>
                    ) : slot.missing ? (
                      <p className="text-sm text-muted-foreground">No details found in the table.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={onAddMore}
                        className="w-full min-h-[7rem] rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-growth-green hover:text-foreground"
                      >
                        Empty slot — add a brand
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="p-3 text-muted-foreground font-medium sticky left-0 bg-card border-b border-r border-border">
                    {row.label}
                  </td>
                  {row.cells.map((cell, index) => (
                    <td
                      key={`${row.key}-${slots[index]?.id || index}`}
                      className={cn(
                        "p-3 border-b border-r last:border-r-0 border-border font-semibold",
                        toneClass(cell.tone)
                      )}
                    >
                      <span className="font-mono">{cell.text}</span>
                      {cell.tone === "best" && (
                        <Badge variant="outline" className="ml-2 text-[10px] border-growth-green text-growth-green">
                          Best
                        </Badge>
                      )}
                      {cell.tone === "mismatch" && (
                        <Badge variant="outline" className="ml-2 text-[10px] border-amber-600 text-amber-700 dark:text-amber-400">
                          Mismatch
                        </Badge>
                      )}
                      {cell.tone === "unpublished" && cell.text !== "Add a brand from the list below" && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Not published
                        </Badge>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-3 text-muted-foreground font-medium sticky left-0 bg-card">Next step</td>
                {slots.map((slot, index) => (
                  <td key={`cta-${slot.id || index}`} className="p-3">
                    {slot.franchise ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          disabled={enquiringId === slot.franchise.id}
                          onClick={() => onEnquire(slot.franchise!)}
                        >
                          {enquiringId === slot.franchise.id
                            ? "Opening enquiry…"
                            : signedIn
                              ? "Enquire"
                              : "Enquire with your profile"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onKeepFit(slot.franchise!)}>
                          Keep this fit
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
