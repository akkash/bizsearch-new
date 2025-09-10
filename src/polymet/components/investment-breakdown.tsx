import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  DollarSign,
  PieChart,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  TrendingUp,
} from "lucide-react";

interface InvestmentItem {
  id: string;
  category: string;
  name: string;
  amount: number;
  isRequired: boolean;
  description?: string;
  financingAvailable?: boolean;
  paymentTiming?: "upfront" | "monthly" | "quarterly" | "annual";
}

interface FinancingOption {
  id: string;
  name: string;
  provider: string;
  interestRate: number;
  termMonths: number;
  maxAmount: number;
  description: string;
}

interface InvestmentBreakdownProps {
  initialItems?: InvestmentItem[];
  franchiseFee?: number;
  onBreakdownChange?: (breakdown: InvestmentItem[], total: number) => void;
  className?: string;
}

const investmentCategories = [
  "Franchise Fee",
  "Equipment & Fixtures",
  "Leasehold Improvements",
  "Initial Inventory",
  "Working Capital",
  "Marketing & Signage",
  "Training & Travel",
  "Professional Fees",
  "Insurance & Deposits",
  "Technology & Software",
  "Other",
];

const defaultFinancingOptions: FinancingOption[] = [
  {
    id: "sbi-loan",
    name: "SBI Business Loan",
    provider: "State Bank of India",
    interestRate: 11.5,
    termMonths: 84,
    maxAmount: 5000000,
    description: "Collateral-based business loan for franchise setup",
  },
  {
    id: "hdfc-equipment",
    name: "HDFC Equipment Finance",
    provider: "HDFC Bank",
    interestRate: 12.0,
    termMonths: 60,
    maxAmount: 3000000,
    description: "Equipment financing with equipment as collateral",
  },
  {
    id: "icici-working-capital",
    name: "ICICI Working Capital Loan",
    provider: "ICICI Bank",
    interestRate: 13.5,
    termMonths: 36,
    maxAmount: 1500000,
    description: "Unsecured working capital for initial operations",
  },
];

export function InvestmentBreakdown({
  initialItems = [],
  franchiseFee = 800000,
  onBreakdownChange,
  className,
}: InvestmentBreakdownProps) {
  const [items, setItems] = useState<InvestmentItem[]>(
    initialItems.length > 0
      ? initialItems
      : [
          {
            id: "franchise-fee",
            category: "Franchise Fee",
            name: "Initial Franchise Fee",
            amount: franchiseFee,
            isRequired: true,
            paymentTiming: "upfront",
            description: "One-time franchise licensing fee",
          },
        ]
  );

  const [newItem, setNewItem] = useState<Partial<InvestmentItem>>({
    category: "Equipment & Fixtures",
    isRequired: true,
    paymentTiming: "upfront",
  });

  const [showFinancing, setShowFinancing] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<string[]>([]);

  const totalInvestment = items.reduce((sum, item) => sum + item.amount, 0);
  const requiredInvestment = items
    .filter((item) => item.isRequired)
    .reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    onBreakdownChange?.(items, totalInvestment);
  }, [items, totalInvestment, onBreakdownChange]);

  const addInvestmentItem = () => {
    if (newItem.name && newItem.amount && newItem.category) {
      const item: InvestmentItem = {
        id: `item-${Date.now()}`,
        category: newItem.category,
        name: newItem.name,
        amount: newItem.amount,
        isRequired: newItem.isRequired || false,
        description: newItem.description || "",
        financingAvailable: newItem.financingAvailable || false,
        paymentTiming: newItem.paymentTiming || "upfront",
      };

      setItems((prev) => [...prev, item]);
      setNewItem({
        category: "Equipment & Fixtures",
        isRequired: true,
        paymentTiming: "upfront",
      });
    }
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<InvestmentItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const getCategoryTotal = (category: string) => {
    return items
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getCategoryPercentage = (category: string) => {
    const categoryTotal = getCategoryTotal(category);
    return totalInvestment > 0 ? (categoryTotal / totalInvestment) * 100 : 0;
  };

  const getFinancingAmount = () => {
    return selectedFinancing.reduce((total, financingId) => {
      const option = defaultFinancingOptions.find((f) => f.id === financingId);
      return total + (option?.maxAmount || 0);
    }, 0);
  };

  const calculateEMI = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Investment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                ₹{(totalInvestment / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">
                Total Investment
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ₹{(requiredInvestment / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">
                Required Investment
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{((totalInvestment - requiredInvestment) / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground">
                Optional Investment
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold">Investment by Category</h4>
            {investmentCategories.map((category) => {
              const categoryTotal = getCategoryTotal(category);
              const percentage = getCategoryPercentage(category);

              if (categoryTotal === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm">
                      ₹{(categoryTotal / 100000).toFixed(1)}L (
                      {percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Investment Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge
                        variant={item.isRequired ? "default" : "secondary"}
                      >
                        {item.isRequired ? "Required" : "Optional"}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Payment: {item.paymentTiming}</span>
                      {item.financingAvailable && (
                        <span className="text-green-600">
                          Financing Available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={item.id === "franchise-fee"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Inline editing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(item.id, { amount: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Timing</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={item.paymentTiming}
                      onChange={(e) =>
                        updateItem(item.id, {
                          paymentTiming: e.target
                            .value as InvestmentItem["paymentTiming"],
                        })
                      }
                    >
                      <option value="upfront">Upfront</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${item.id}`}
                          checked={item.isRequired}
                          onCheckedChange={(checked) =>
                            updateItem(item.id, { isRequired: !!checked })
                          }
                          disabled={item.id === "franchise-fee"}
                        />

                        <Label
                          htmlFor={`required-${item.id}`}
                          className="text-sm"
                        >
                          Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`financing-${item.id}`}
                          checked={item.financingAvailable}
                          onCheckedChange={(checked) =>
                            updateItem(item.id, {
                              financingAvailable: !!checked,
                            })
                          }
                        />

                        <Label
                          htmlFor={`financing-${item.id}`}
                          className="text-sm"
                        >
                          Financing
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
            <h4 className="font-medium">Add Investment Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  {investmentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Kitchen Equipment"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={newItem.amount || ""}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  placeholder="500000"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Timing</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newItem.paymentTiming}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      paymentTiming: e.target
                        .value as InvestmentItem["paymentTiming"],
                    }))
                  }
                >
                  <option value="upfront">Upfront</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newItem.description || ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this investment item..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-required"
                  checked={newItem.isRequired}
                  onCheckedChange={(checked) =>
                    setNewItem((prev) => ({ ...prev, isRequired: !!checked }))
                  }
                />

                <Label htmlFor="new-required">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-financing"
                  checked={newItem.financingAvailable}
                  onCheckedChange={(checked) =>
                    setNewItem((prev) => ({
                      ...prev,
                      financingAvailable: !!checked,
                    }))
                  }
                />

                <Label htmlFor="new-financing">Financing Available</Label>
              </div>
            </div>

            <Button
              onClick={addInvestmentItem}
              disabled={!newItem.name || !newItem.amount}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investment Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financing Options
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFinancing(!showFinancing)}
            >
              {showFinancing ? "Hide" : "Show"} Financing
            </Button>
          </CardTitle>
        </CardHeader>
        {showFinancing && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {defaultFinancingOptions.map((option) => (
                <div key={option.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedFinancing.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFinancing((prev) => [
                              ...prev,
                              option.id,
                            ]);
                          } else {
                            setSelectedFinancing((prev) =>
                              prev.filter((id) => id !== option.id)
                            );
                          }
                        }}
                      />

                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.provider}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{(option.maxAmount / 100000).toFixed(1)}L max
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.interestRate}% • {option.termMonths} months
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>

                  {selectedFinancing.includes(option.id) && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Monthly EMI: </span>₹
                          {calculateEMI(
                            option.maxAmount,
                            option.interestRate,
                            option.termMonths
                          ).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Total Interest: </span>₹
                          {(
                            calculateEMI(
                              option.maxAmount,
                              option.interestRate,
                              option.termMonths
                            ) *
                              option.termMonths -
                            option.maxAmount
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedFinancing.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />

                  <span className="font-medium text-green-800">
                    Financing Summary
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <p>
                    Total financing available: ₹
                    {(getFinancingAmount() / 100000).toFixed(1)}L
                  </p>
                  <p>
                    Self-funding required: ₹
                    {Math.max(
                      0,
                      (totalInvestment - getFinancingAmount()) / 100000
                    ).toFixed(1)}
                    L
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Investment Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
