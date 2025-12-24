import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Loader2, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface InquiryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listingId: string;
    listingType: 'business' | 'franchise';
    listingName: string;
    ownerId: string;
    askingPrice?: number;
}

export function InquiryDialog({
    open,
    onOpenChange,
    listingId,
    listingType,
    listingName,
    ownerId,
    askingPrice,
}: InquiryDialogProps) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: profile?.display_name || '',
        email: user?.email || profile?.email || '',
        phone: profile?.phone || '',
        budgetRange: '',
        timeline: '',
        message: '',
        acceptNDA: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Create inquiry record
            const { error } = await supabase
                .from('inquiries')
                .insert({
                    sender_id: user?.id || null,
                    recipient_id: ownerId,
                    listing_id: listingId,
                    listing_type: listingType,
                    subject: `Inquiry about ${listingName}`,
                    message: formData.message,
                    contact_email: formData.email,
                    contact_phone: formData.phone,
                    metadata: {
                        sender_name: formData.name,
                        budget_range: formData.budgetRange,
                        timeline: formData.timeline,
                        nda_accepted: formData.acceptNDA,
                    },
                });

            if (error) throw error;

            // Update inquiry count on listing
            if (listingType === 'business') {
                await supabase.rpc('increment_inquiry_count', {
                    p_table: 'businesses',
                    p_id: listingId
                });
            } else {
                await supabase.rpc('increment_inquiry_count', {
                    p_table: 'franchises',
                    p_id: listingId
                });
            }

            setSubmitted(true);
            toast.success('Inquiry sent successfully!');

            // Reset after 2 seconds
            setTimeout(() => {
                setSubmitted(false);
                onOpenChange(false);
                setFormData({
                    name: profile?.display_name || '',
                    email: user?.email || profile?.email || '',
                    phone: profile?.phone || '',
                    budgetRange: '',
                    timeline: '',
                    message: '',
                    acceptNDA: false,
                });
            }, 2000);
        } catch (error: any) {
            console.error('Error sending inquiry:', error);
            toast.error('Failed to send inquiry. Please try again.');
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
                        <h3 className="text-xl font-semibold mb-2">Inquiry Sent!</h3>
                        <p className="text-muted-foreground">
                            The {listingType === 'franchise' ? 'franchisor' : 'seller'} will contact you soon.
                        </p>
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
                        {listingType === 'franchise' ? 'Request Franchise Information' : 'Contact Seller'}
                    </DialogTitle>
                    <DialogDescription>
                        Inquiring about: <strong>{listingName}</strong>
                        {askingPrice && (
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
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Investment Budget</Label>
                            <Select
                                value={formData.budgetRange}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, budgetRange: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="below_10l">Below ₹10 Lakh</SelectItem>
                                    <SelectItem value="10l_25l">₹10-25 Lakh</SelectItem>
                                    <SelectItem value="25l_50l">₹25-50 Lakh</SelectItem>
                                    <SelectItem value="50l_1cr">₹50 Lakh - 1 Crore</SelectItem>
                                    <SelectItem value="above_1cr">Above ₹1 Crore</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeline">Timeline</Label>
                            <Select
                                value={formData.timeline}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, timeline: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="When to start" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediately</SelectItem>
                                    <SelectItem value="1_3_months">1-3 months</SelectItem>
                                    <SelectItem value="3_6_months">3-6 months</SelectItem>
                                    <SelectItem value="6_12_months">6-12 months</SelectItem>
                                    <SelectItem value="exploring">Just exploring</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder={`I'm interested in ${listingType === 'franchise' ? 'this franchise opportunity' : 'buying this business'}. Please share more details about...`}
                            rows={4}
                            required
                        />
                    </div>

                    {listingType === 'business' && (
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="nda"
                                checked={formData.acceptNDA}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, acceptNDA: checked as boolean }))
                                }
                            />
                            <div className="grid gap-1 leading-none">
                                <Label htmlFor="nda" className="text-sm">
                                    I agree to sign an NDA to receive confidential information
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Required for access to financials and sensitive documents
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Inquiry'
                            )}
                        </Button>
                        {!user && (
                            <p className="text-xs text-center text-muted-foreground">
                                <Link to="/login" className="text-primary hover:underline">Login</Link> to track your inquiries and get faster responses
                            </p>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
