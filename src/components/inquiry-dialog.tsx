import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  MessageSquare,
  CheckCircle,
  LogIn,
  UserPlus,
  Shield,
  Bell,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { InquiryService } from '@/lib/inquiry-service';
import {
  EXPERIENCE_OPTIONS,
  FUNDS_AVAILABLE_OPTIONS,
  INVESTMENT_CAPACITY_OPTIONS,
  OPENING_TIMELINE_OPTIONS,
} from '@/types/franchise-domain';
import { StoreFormatPicker } from '@/components/store-format-picker';
import {
  findStoreFormat,
  type StoreFormat,
} from '@/lib/store-formats';
import { toast } from 'sonner';

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingType: 'business' | 'franchise';
  listingName: string;
  ownerId: string;
  askingPrice?: number;
  storeFormats?: StoreFormat[];
  initialFormatId?: string | null;
}

export function InquiryDialog({
  open,
  onOpenChange,
  listingId,
  listingType,
  listingName,
  ownerId,
  askingPrice,
  storeFormats = [],
  initialFormatId = null,
}: InquiryDialogProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentCapacity: '',
    preferredLocation: '',
    openingTimeline: '',
    fundsAvailable: '',
    relevantExperience: '',
    message: '',
    acceptNDA: false,
  });

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        name: profile?.display_name || prev.name,
        email: user?.email || profile?.email || prev.email,
        phone: profile?.phone || prev.phone,
      }));
      setSelectedFormatId(
        initialFormatId || storeFormats[0]?.id || null
      );
    }
  }, [open, user, profile, initialFormatId, storeFormats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!user) {
      toast.error('Please sign in to send an enquiry');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (listingType === 'franchise') {
      if (
        !formData.investmentCapacity ||
        !formData.preferredLocation.trim() ||
        !formData.openingTimeline ||
        !formData.fundsAvailable ||
        !formData.relevantExperience
      ) {
        toast.error('Please complete all qualification questions');
        return;
      }
      if (storeFormats.length > 1 && !selectedFormatId) {
        toast.error('Please select an outlet format');
        return;
      }
    }

    setLoading(true);
    try {
      const format = findStoreFormat(storeFormats, selectedFormatId);
      await InquiryService.createInquiry({
        senderId: user.id,
        listingId,
        listingType,
        subject: format
          ? `Inquiry about ${listingName} (${format.name})`
          : `Inquiry about ${listingName}`,
        message: formData.message,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        qualification:
          listingType === 'franchise'
            ? {
                investmentCapacity: formData.investmentCapacity,
                preferredLocation: formData.preferredLocation.trim(),
                openingTimeline: formData.openingTimeline,
                fundsAvailable: formData.fundsAvailable,
                relevantExperience: formData.relevantExperience,
              }
            : {
                investmentCapacity: formData.investmentCapacity || undefined,
                openingTimeline: formData.openingTimeline || undefined,
              },
        selectedStoreFormat: format
          ? {
              id: format.id,
              name: format.name,
              snapshot: { ...format },
            }
          : undefined,
        metadata: {
          sender_name: formData.name,
          nda_accepted: formData.acceptNDA,
          budget_range: formData.investmentCapacity,
          timeline: formData.openingTimeline,
        },
      });

      try {
        await supabase.rpc('increment_inquiry_count', {
          p_table: listingType === 'business' ? 'businesses' : 'franchises',
          p_id: listingId,
        });
      } catch (rpcErr) {
        console.warn('Inquiry count increment skipped:', rpcErr);
      }

      setSubmitted(true);
      toast.success(
        listingType === 'franchise'
          ? 'Qualified enquiry sent to the brand'
          : 'Inquiry sent successfully'
      );

      setTimeout(() => {
        setSubmitted(false);
        onOpenChange(false);
        setFormData({
          name: profile?.display_name || '',
          email: user?.email || profile?.email || '',
          phone: profile?.phone || '',
          investmentCapacity: '',
          preferredLocation: '',
          openingTimeline: '',
          fundsAvailable: '',
          relevantExperience: '',
          message: '',
          acceptNDA: false,
        });
      }, 2000);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      const message =
        error instanceof Error && error.message.includes('open enquiry')
          ? error.message
          : 'Failed to send inquiry. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enquiry Sent</h3>
            <p className="text-muted-foreground">
              {listingType === 'franchise'
                ? 'The franchisor will review your qualification and respond.'
                : 'The seller will contact you soon.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const location = useLocation();

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {listingType === 'franchise' ? 'Enquire about this franchise' : 'Contact Seller'}
            </DialogTitle>
            <DialogDescription>
              Sign in to continue: <strong>{listingName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Create a free account to unlock these benefits:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Track enquiries</div>
                  <div className="text-xs text-muted-foreground">
                    Status and responses in one place
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Get notifications</div>
                  <div className="text-xs text-muted-foreground">When the brand responds</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Secure messaging</div>
                  <div className="text-xs text-muted-foreground">Direct platform communication</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="w-full">
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname + '?contact=true')}`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link
                  to={`/signup?redirect=${encodeURIComponent(location.pathname + '?contact=true')}`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Free Account
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {listingType === 'franchise' ? 'Qualified franchise enquiry' : 'Contact Seller'}
          </DialogTitle>
          <DialogDescription>
            {listingType === 'franchise'
              ? 'Answer a few questions so the brand can assess fit.'
              : 'Inquiring about:'}{' '}
            <strong>{listingName}</strong>
            {askingPrice != null && listingType === 'business' && (
              <span className="ml-2 text-primary font-medium">
                ₹{(askingPrice / 100000).toFixed(1)}L
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>

          {listingType === 'franchise' && storeFormats.length > 0 && (
            <StoreFormatPicker
              formats={storeFormats}
              value={selectedFormatId}
              onChange={setSelectedFormatId}
              label="Which outlet format are you interested in?"
              required={storeFormats.length > 1}
            />
          )}

          {listingType === 'franchise' && (
            <div className="space-y-3 rounded-md border border-border p-3 bg-secondary/20">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Qualification
              </p>

              <div className="space-y-2">
                <Label>How much are you prepared to invest? *</Label>
                <Select
                  value={formData.investmentCapacity}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, investmentCapacity: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_CAPACITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocation">Where do you want to operate? *</Label>
                <Input
                  id="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preferredLocation: e.target.value }))
                  }
                  placeholder="City, State (e.g. Chennai, Tamil Nadu)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>When can you start? *</Label>
                <Select
                  value={formData.openingTimeline}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, openingTimeline: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENING_TIMELINE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Are funds available? *</Label>
                <Select
                  value={formData.fundsAvailable}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, fundsAvailable: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Funding status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNDS_AVAILABLE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relevant operating experience? *</Label>
                <Select
                  value={formData.relevantExperience}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, relevantExperience: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {listingType === 'business' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select
                  value={formData.investmentCapacity}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, investmentCapacity: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_CAPACITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select
                  value={formData.openingTimeline}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, openingTimeline: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When to start" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENING_TIMELINE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder={
                listingType === 'franchise'
                  ? "I'm interested in this franchise. Please share next steps..."
                  : "I'm interested in buying this business..."
              }
              rows={3}
              required
            />
          </div>

          {listingType === 'business' && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="nda"
                checked={formData.acceptNDA}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, acceptNDA: checked as boolean }))
                }
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="nda" className="text-sm">
                  I agree to sign an NDA to receive confidential information
                </Label>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : listingType === 'franchise' ? (
              'Submit qualified enquiry'
            ) : (
              'Send Inquiry'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
