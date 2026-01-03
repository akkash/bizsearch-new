import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Send, CheckCircle, Clock, X, Bot, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QuoteRequestDialogProps {
    selectedListings: Array<{
        id: string;
        name: string;
        type: 'business' | 'franchise';
    }>;
    onClose: () => void;
    isOpen: boolean;
}

export function QuoteRequestDialog({ selectedListings, onClose, isOpen }: QuoteRequestDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [requirements, setRequirements] = useState({
        budget_min: '',
        budget_max: '',
        timeline: '',
        location_preference: '',
        experience_level: '',
        additional_notes: '',
    });

    const handleSubmit = async () => {
        if (!user) {
            toast.error('Please login to request quotes');
            return;
        }

        if (selectedListings.length === 0) {
            toast.error('Please select at least one listing');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('quote-agent', {
                body: {
                    listing_ids: selectedListings.map(l => l.id),
                    listing_type: selectedListings[0].type,
                    requirements: {
                        budget_range: {
                            min: requirements.budget_min ? parseInt(requirements.budget_min) * 100000 : undefined,
                            max: requirements.budget_max ? parseInt(requirements.budget_max) * 100000 : undefined,
                        },
                        timeline: requirements.timeline || undefined,
                        location_preference: requirements.location_preference || undefined,
                        experience_level: requirements.experience_level || undefined,
                        additional_notes: requirements.additional_notes || undefined,
                    },
                },
            });

            if (error) throw error;

            setSuccess(true);
            toast.success(`Quote requests sent to ${selectedListings.length} listings!`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to send quote requests');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Quote Requests Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                            Our AI agent has contacted {selectedListings.length} listings on your behalf.
                            You'll receive responses within 24-48 hours.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                            <Bot className="h-4 w-4" />
                            <span>Powered by BizSearch Quote Agent</span>
                        </div>
                        <Button onClick={onClose}>Done</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Request Quotes from Multiple Listings
                    </DialogTitle>
                    <DialogDescription>
                        Our AI agent will contact each listing with your requirements and collect quotes for comparison.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selected Listings */}
                    <div>
                        <Label className="text-sm font-medium">Selected Listings ({selectedListings.length}/5)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedListings.map((listing) => (
                                <Badge key={listing.id} variant="secondary" className="py-1">
                                    {listing.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Budget Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="budget_min">Min Budget (in Lakhs)</Label>
                            <Input
                                id="budget_min"
                                type="number"
                                placeholder="e.g. 10"
                                value={requirements.budget_min}
                                onChange={(e) => setRequirements({ ...requirements, budget_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="budget_max">Max Budget (in Lakhs)</Label>
                            <Input
                                id="budget_max"
                                type="number"
                                placeholder="e.g. 50"
                                value={requirements.budget_max}
                                onChange={(e) => setRequirements({ ...requirements, budget_max: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <Label htmlFor="timeline">Preferred Timeline</Label>
                        <Select
                            value={requirements.timeline}
                            onValueChange={(value) => setRequirements({ ...requirements, timeline: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="When do you want to start?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="immediately">Immediately (within 1 month)</SelectItem>
                                <SelectItem value="1-3 months">1-3 months</SelectItem>
                                <SelectItem value="3-6 months">3-6 months</SelectItem>
                                <SelectItem value="6+ months">6+ months (exploring)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Experience */}
                    <div>
                        <Label htmlFor="experience">Your Experience Level</Label>
                        <Select
                            value={requirements.experience_level}
                            onValueChange={(value) => setRequirements({ ...requirements, experience_level: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your experience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="first-time">First-time business buyer</SelectItem>
                                <SelectItem value="some-experience">Some business experience</SelectItem>
                                <SelectItem value="experienced">Experienced entrepreneur</SelectItem>
                                <SelectItem value="investor">Investor looking for opportunities</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location">Preferred Location (optional)</Label>
                        <Input
                            id="location"
                            placeholder="e.g. Mumbai, Maharashtra"
                            value={requirements.location_preference}
                            onChange={(e) => setRequirements({ ...requirements, location_preference: e.target.value })}
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <Label htmlFor="notes">Additional Requirements</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any specific questions or requirements..."
                            value={requirements.additional_notes}
                            onChange={(e) => setRequirements({ ...requirements, additional_notes: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || selectedListings.length === 0}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Request Quotes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Component to add listings to quote request
export function AddToQuoteButton({
    listing,
    selectedListings,
    onToggle
}: {
    listing: { id: string; name: string; type: 'business' | 'franchise' };
    selectedListings: string[];
    onToggle: (listing: { id: string; name: string; type: 'business' | 'franchise' }) => void;
}) {
    const isSelected = selectedListings.includes(listing.id);
    const isMaxed = selectedListings.length >= 5 && !isSelected;

    return (
        <Button
            variant={isSelected ? "secondary" : "outline"}
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                onToggle(listing);
            }}
            disabled={isMaxed}
            className={isSelected ? "bg-primary/10 border-primary" : ""}
        >
            {isSelected ? (
                <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Added
                </>
            ) : (
                <>
                    <Zap className="mr-1 h-3 w-3" />
                    Compare
                </>
            )}
        </Button>
    );
}
