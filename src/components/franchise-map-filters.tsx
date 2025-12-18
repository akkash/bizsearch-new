import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Building2,
    Filter,
    MapPin,
    IndianRupee,
    ChevronDown,
    ChevronUp,
    X,
    RotateCcw,
} from 'lucide-react';
import type { DiscoveryFilters, AvailableFilters } from '@/lib/franchise-map-discovery-service';

interface FranchiseMapFiltersProps {
    availableFilters: AvailableFilters;
    currentFilters: DiscoveryFilters;
    onFiltersChange: (filters: DiscoveryFilters) => void;
    className?: string;
}

const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(0)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

export function FranchiseMapFilters({
    availableFilters,
    currentFilters,
    onFiltersChange,
    className = '',
}: FranchiseMapFiltersProps) {
    const [franchiseOpen, setFranchiseOpen] = useState(true);
    const [categoryOpen, setCategoryOpen] = useState(true);
    const [feeOpen, setFeeOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);

    const [franchiseFee, setFranchiseFee] = useState<[number, number]>([0, 5000000]);

    // Count active filters
    const activeFilterCount = [
        currentFilters.franchiseIds?.length || 0,
        currentFilters.categories?.length || 0,
        currentFilters.states?.length || 0,
        currentFilters.status && currentFilters.status !== 'all' ? 1 : 0,
        currentFilters.franchiseFeeMin || currentFilters.franchiseFeeMax ? 1 : 0,
        currentFilters.investmentMin || currentFilters.investmentMax ? 1 : 0,
    ].reduce((sum, count) => sum + count, 0);

    const handleFranchiseToggle = (franchiseId: string) => {
        const current = currentFilters.franchiseIds || [];
        const updated = current.includes(franchiseId)
            ? current.filter(id => id !== franchiseId)
            : [...current, franchiseId];
        onFiltersChange({ ...currentFilters, franchiseIds: updated });
    };

    const handleCategoryToggle = (category: string) => {
        const current = currentFilters.categories || [];
        const updated = current.includes(category)
            ? current.filter(c => c !== category)
            : [...current, category];
        onFiltersChange({ ...currentFilters, categories: updated });
    };

    const handleStateChange = (state: string) => {
        if (state === 'all') {
            onFiltersChange({ ...currentFilters, states: undefined });
        } else {
            onFiltersChange({ ...currentFilters, states: [state] });
        }
    };

    const handleStatusChange = (status: 'all' | 'operating' | 'looking_for_franchise') => {
        onFiltersChange({ ...currentFilters, status });
    };

    const handleFranchiseFeeChange = (values: number[]) => {
        setFranchiseFee([values[0], values[1]]);
    };

    const handleFranchiseFeeCommit = () => {
        onFiltersChange({
            ...currentFilters,
            franchiseFeeMin: franchiseFee[0] > 0 ? franchiseFee[0] : undefined,
            franchiseFeeMax: franchiseFee[1] < 5000000 ? franchiseFee[1] : undefined,
        });
    };

    const handleResetFilters = () => {
        setFranchiseFee([0, 5000000]);
        onFiltersChange({});
    };

    return (
        <Card className={`${className}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </CardTitle>
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-8 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Status Toggle */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Location Status</Label>
                    <div className="flex gap-1">
                        <Button
                            variant={!currentFilters.status || currentFilters.status === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange('all')}
                            className="flex-1"
                        >
                            All
                        </Button>
                        <Button
                            variant={currentFilters.status === 'operating' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange('operating')}
                            className="flex-1"
                        >
                            Operating
                        </Button>
                        <Button
                            variant={currentFilters.status === 'looking_for_franchise' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange('looking_for_franchise')}
                            className="flex-1 text-xs"
                        >
                            Available
                        </Button>
                    </div>
                </div>

                {/* Franchisor Selection */}
                <Collapsible open={franchiseOpen} onOpenChange={setFranchiseOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Franchisor
                            {(currentFilters.franchiseIds?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {currentFilters.franchiseIds?.length}
                                </Badge>
                            )}
                        </div>
                        {franchiseOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                        <ScrollArea className="h-40">
                            <div className="space-y-2">
                                {availableFilters.franchises.map(franchise => (
                                    <div
                                        key={franchise.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`franchise-${franchise.id}`}
                                            checked={currentFilters.franchiseIds?.includes(franchise.id) || false}
                                            onCheckedChange={() => handleFranchiseToggle(franchise.id)}
                                        />
                                        <label
                                            htmlFor={`franchise-${franchise.id}`}
                                            className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                                        >
                                            <span className="truncate">{franchise.brand_name}</span>
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {franchise.locationCount}
                                            </Badge>
                                        </label>
                                    </div>
                                ))}
                                {availableFilters.franchises.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No franchises with locations</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CollapsibleContent>
                </Collapsible>

                {/* Category Selection */}
                <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Category
                            {(currentFilters.categories?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {currentFilters.categories?.length}
                                </Badge>
                            )}
                        </div>
                        {categoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                        <div className="flex flex-wrap gap-2">
                            {availableFilters.categories.map(category => (
                                <Badge
                                    key={category}
                                    variant={currentFilters.categories?.includes(category) ? 'default' : 'outline'}
                                    className="cursor-pointer hover:bg-primary/80"
                                    onClick={() => handleCategoryToggle(category)}
                                >
                                    {category}
                                    {currentFilters.categories?.includes(category) && (
                                        <X className="h-3 w-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                            {availableFilters.categories.length === 0 && (
                                <p className="text-sm text-muted-foreground">No categories available</p>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Franchise Fee Range */}
                <Collapsible open={feeOpen} onOpenChange={setFeeOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            Franchise Fee
                        </div>
                        {feeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 px-1">
                        <div className="space-y-4">
                            <Slider
                                min={0}
                                max={5000000}
                                step={100000}
                                value={franchiseFee}
                                onValueChange={handleFranchiseFeeChange}
                                onValueCommit={handleFranchiseFeeCommit}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatCurrency(franchiseFee[0])}</span>
                                <span>{formatCurrency(franchiseFee[1])}</span>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* State Filter */}
                <Collapsible open={stateOpen} onOpenChange={setStateOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            State/Region
                            {(currentFilters.states?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {currentFilters.states?.length}
                                </Badge>
                            )}
                        </div>
                        {stateOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                        <Select
                            value={currentFilters.states?.[0] || 'all'}
                            onValueChange={handleStateChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All States" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                {availableFilters.states.map(state => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CollapsibleContent>
                </Collapsible>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="pt-4 border-t">
                        <Label className="text-xs text-muted-foreground mb-2 block">Active Filters</Label>
                        <div className="flex flex-wrap gap-1">
                            {currentFilters.franchiseIds?.map(id => {
                                const franchise = availableFilters.franchises.find(f => f.id === id);
                                return (
                                    <Badge
                                        key={id}
                                        variant="secondary"
                                        className="text-xs cursor-pointer"
                                        onClick={() => handleFranchiseToggle(id)}
                                    >
                                        {franchise?.brand_name || 'Unknown'}
                                        <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                );
                            })}
                            {currentFilters.categories?.map(cat => (
                                <Badge
                                    key={cat}
                                    variant="secondary"
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleCategoryToggle(cat)}
                                >
                                    {cat}
                                    <X className="h-3 w-3 ml-1" />
                                </Badge>
                            ))}
                            {currentFilters.states?.map(state => (
                                <Badge
                                    key={state}
                                    variant="secondary"
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleStateChange('all')}
                                >
                                    {state}
                                    <X className="h-3 w-3 ml-1" />
                                </Badge>
                            ))}
                            {currentFilters.status && currentFilters.status !== 'all' && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleStatusChange('all')}
                                >
                                    {currentFilters.status === 'operating' ? 'Operating' : 'Available'}
                                    <X className="h-3 w-3 ml-1" />
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
