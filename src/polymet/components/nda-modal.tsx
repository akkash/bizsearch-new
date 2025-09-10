import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (ndaData: NDAFormData) => void;
  businessName: string;
  sellerName: string;
  documentsCount: number;
  documentTypes?: string[];
  listingType?: "business" | "franchise";
  franchiseSpecificInfo?: {
    territoryInfo?: boolean;
    franchiseePerformance?: boolean;
    royaltyStructure?: boolean;
    trainingMaterials?: boolean;
  };
  className?: string;
}

interface NDAFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  investmentCapacity?: string;
  experienceLevel?: string;
  timeframe?: string;
  agreedToTerms: boolean;
  agreedToConfidentiality: boolean;
  agreedToFranchiseTerms?: boolean;
  signature: string;
}

export function NDAModal({
  isOpen,
  onClose,
  onAccept,
  businessName,
  sellerName,
  documentsCount,
  documentTypes = [],
  listingType = "business",
  franchiseSpecificInfo,
  className,
}: NDAModalProps) {
  const [step, setStep] = useState<
    "overview" | "form" | "terms" | "confirmation"
  >("overview");
  const [formData, setFormData] = useState<NDAFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    investmentCapacity: "",
    experienceLevel: "",
    timeframe: "",
    agreedToTerms: false,
    agreedToConfidentiality: false,
    agreedToFranchiseTerms: false,
    signature: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof NDAFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onAccept(formData);
      setStep("confirmation");
    } catch (error) {
      console.error("NDA submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const baseValid =
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.purpose.trim() !== "" &&
      formData.agreedToTerms &&
      formData.agreedToConfidentiality &&
      formData.signature.trim() !== "";

    if (listingType === "franchise") {
      return baseValid && formData.agreedToFranchiseTerms;
    }

    return baseValid;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />

        <h3 className="text-xl font-semibold mb-2">
          Non-Disclosure Agreement Required
        </h3>
        <p className="text-muted-foreground">
          To access sensitive{" "}
          {listingType === "franchise" ? "franchise" : "financial"} information
          for <strong>{businessName}</strong>, you must sign a Non-Disclosure
          Agreement (NDA).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />

            <h4 className="font-medium">Protected Documents</h4>
            <p className="text-sm text-muted-foreground">
              {documentsCount}{" "}
              {listingType === "franchise" ? "franchise" : "financial"}{" "}
              documents
            </p>
            {documentTypes.length > 0 && (
              <div className="mt-2">
                {documentTypes.slice(0, 2).map((type, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {type}
                  </div>
                ))}
                {documentTypes.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    • +{documentTypes.length - 2} more
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />

            <h4 className="font-medium">Legal Protection</h4>
            <p className="text-sm text-muted-foreground">
              Legally binding agreement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />

            <h4 className="font-medium">Instant Access</h4>
            <p className="text-sm text-muted-foreground">
              Immediate document access
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />

          <div>
            <h4 className="font-medium text-amber-800">Important Notice</h4>
            <p className="text-sm text-amber-700 mt-1">
              By signing this NDA, you agree to keep all{" "}
              {listingType === "franchise"
                ? "franchise and business"
                : "financial and business"}
              information confidential. Violation of this agreement may result
              in legal action.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={() => setStep("form")} className="flex-1">
          Continue to NDA
        </Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Information</h3>
        <p className="text-sm text-muted-foreground">
          Please provide your details to proceed with the NDA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter your full legal name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            placeholder="Your company name (optional)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Information Request *</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => handleInputChange("purpose", e.target.value)}
          placeholder={`Briefly describe why you need access to this ${listingType === "franchise" ? "franchise" : "financial"} information...`}
          rows={3}
          required
        />
      </div>

      {listingType === "franchise" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investmentCapacity">Investment Capacity</Label>
              <select
                id="investmentCapacity"
                value={formData.investmentCapacity}
                onChange={(e) =>
                  handleInputChange("investmentCapacity", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select range</option>
                <option value="under-10L">Under ₹10 Lakhs</option>
                <option value="10L-25L">₹10-25 Lakhs</option>
                <option value="25L-50L">₹25-50 Lakhs</option>
                <option value="50L-1Cr">₹50 Lakhs - 1 Crore</option>
                <option value="1Cr-plus">₹1 Crore+</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Business Experience</Label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) =>
                  handleInputChange("experienceLevel", e.target.value)
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select experience</option>
                <option value="first-time">First-time entrepreneur</option>
                <option value="some-experience">
                  Some business experience
                </option>
                <option value="experienced">Experienced business owner</option>
                <option value="multi-unit">Multi-unit operator</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Investment Timeframe</Label>
            <select
              id="timeframe"
              value={formData.timeframe}
              onChange={(e) => handleInputChange("timeframe", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select timeframe</option>
              <option value="immediate">Ready to invest immediately</option>
              <option value="3-months">Within 3 months</option>
              <option value="6-months">Within 6 months</option>
              <option value="1-year">Within 1 year</option>
              <option value="exploring">Just exploring options</option>
            </select>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("overview")}>
          Back
        </Button>
        <Button
          onClick={() => setStep("terms")}
          disabled={
            !formData.fullName ||
            !formData.email ||
            !formData.phone ||
            !formData.purpose
          }
        >
          Review Terms
        </Button>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">NDA Terms & Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Please review and accept the following terms to proceed.
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-muted/30 text-sm space-y-3">
        <h4 className="font-medium">1. Confidential Information</h4>
        <p>
          All{" "}
          {listingType === "franchise"
            ? "franchise disclosure documents, territory data, financial performance data, training materials, operations manuals,"
            : "financial data,"}{" "}
          business plans, customer lists, and proprietary information related to{" "}
          {businessName} shall be considered confidential.
        </p>

        <h4 className="font-medium">2. Non-Disclosure Obligations</h4>
        <p>
          You agree not to disclose, publish, or communicate any confidential
          information to third parties without written consent from {sellerName}
          .
        </p>

        <h4 className="font-medium">3. Use Restrictions</h4>
        <p>
          Confidential information may only be used for evaluating the potential
          {listingType === "franchise"
            ? "franchise investment in"
            : "acquisition of"}{" "}
          {businessName} and for no other purpose.
        </p>

        {listingType === "franchise" && franchiseSpecificInfo && (
          <>
            <h4 className="font-medium">4. Franchise-Specific Terms</h4>
            <p>
              You acknowledge that franchise information includes sensitive data
              about:
              {franchiseSpecificInfo.territoryInfo && " territory performance,"}
              {franchiseSpecificInfo.franchiseePerformance &&
                " existing franchisee performance,"}
              {franchiseSpecificInfo.royaltyStructure &&
                " proprietary royalty structures,"}
              {franchiseSpecificInfo.trainingMaterials &&
                " training and operational materials,"}
              and other franchise system confidential information.
            </p>
          </>
        )}

        <h4 className="font-medium">4. Return of Information</h4>
        <p>
          Upon request or termination of discussions, you agree to return or
          destroy all confidential materials and documents.
        </p>

        <h4 className="font-medium">5. Legal Remedies</h4>
        <p>
          Breach of this agreement may result in irreparable harm, and the
          disclosing party may seek injunctive relief and monetary damages.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) =>
              handleInputChange("agreedToTerms", !!checked)
            }
          />

          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I have read and agree to the terms and conditions of this
            Non-Disclosure Agreement
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="confidentiality"
            checked={formData.agreedToConfidentiality}
            onCheckedChange={(checked) =>
              handleInputChange("agreedToConfidentiality", !!checked)
            }
          />

          <Label htmlFor="confidentiality" className="text-sm leading-relaxed">
            I understand that I am legally bound to maintain confidentiality of
            all information disclosed to me
          </Label>
        </div>

        {listingType === "franchise" && (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="franchiseTerms"
              checked={formData.agreedToFranchiseTerms}
              onCheckedChange={(checked) =>
                handleInputChange("agreedToFranchiseTerms", !!checked)
              }
            />

            <Label htmlFor="franchiseTerms" className="text-sm leading-relaxed">
              I acknowledge that I am a qualified potential franchisee and will
              use this information solely for franchise evaluation purposes
            </Label>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="signature">Digital Signature *</Label>
          <Input
            id="signature"
            value={formData.signature}
            onChange={(e) => handleInputChange("signature", e.target.value)}
            placeholder="Type your full name as digital signature"
            required
          />

          <p className="text-xs text-muted-foreground">
            By typing your name, you are providing a legally binding digital
            signature
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("form")}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Sign NDA & Access Documents"}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="w-16 h-16 mx-auto text-green-600" />

      <div>
        <h3 className="text-xl font-semibold mb-2">NDA Signed Successfully!</h3>
        <p className="text-muted-foreground">
          You now have access to the{" "}
          {listingType === "franchise" ? "franchise disclosure" : "financial"}{" "}
          documents for {businessName}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Access Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Agreement Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Documents Available:</span>
            <span>{documentsCount} files</span>
          </div>
          <div className="flex justify-between">
            <span>Access Expires:</span>
            <span>
              {new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onClose} className="w-full">
        Continue to Documents
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "overview" && "Non-Disclosure Agreement"}
            {step === "form" && "NDA Information Form"}
            {step === "terms" && "Review & Sign NDA"}
            {step === "confirmation" && "NDA Confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === "overview" &&
              "Secure access to confidential business information"}
            {step === "form" && "Provide your information for the NDA"}
            {step === "terms" && "Review terms and provide digital signature"}
            {step === "confirmation" &&
              "Your NDA has been processed successfully"}
          </DialogDescription>
        </DialogHeader>

        {step === "overview" && renderOverview()}
        {step === "form" && renderForm()}
        {step === "terms" && renderTerms()}
        {step === "confirmation" && renderConfirmation()}
      </DialogContent>
    </Dialog>
  );
}
