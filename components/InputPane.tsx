"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Mail, MessageCircle, Sparkles, Factory, HardHat, Zap, Scale, AlertTriangle, Wrench } from "lucide-react";
import simulatedData from "@/data/simulated-responses.json";

interface InputPaneProps {
  input: string;
  setInput: (input: string) => void;
  onAnalyze: (input: string) => void;
  isProcessing: boolean;
}

export default function InputPane({ input, setInput, onAnalyze, isProcessing }: InputPaneProps) {
  const [detectedType, setDetectedType] = useState<string | null>(null);

  const detectInputType = (text: string) => {
    if (text.length < 10) return null;
    
    const textLower = text.toLowerCase();
    
    // Use same logic as agentClient for consistency
    if (textLower.includes("stainless steel") || textLower.includes("fabrication") || textLower.includes("manufacturing") || textLower.includes("penn stainless")) {
      return "Manufacturing RFP";
    } else if (textLower.includes("construction") || textLower.includes("building") || textLower.includes("concrete") || textLower.includes("tiny's construction")) {
      return "Construction Bid";
    } else if (textLower.includes("solar") || textLower.includes("energy") || textLower.includes("renewable") || textLower.includes("novitium energy")) {
      return "Energy Project";
    } else if (textLower.includes("compliance") || textLower.includes("legal") || textLower.includes("ai act") || textLower.includes("globaltech")) {
      return "Legal Compliance";
    } else if (textLower.includes("emergency") || textLower.includes("urgent") || textLower.includes("metro transit") || textLower.includes("flooded")) {
      return "Emergency Service";
    } else if (textLower.includes("rfp") || textLower.includes("proposal") || textLower.includes("enterprise") || textLower.includes("500-employee")) {
      return "Enterprise RFP";
    } else if (textLower.includes("invoice") || textLower.includes("billing") || textLower.includes("charged") || textLower.includes("acc-789456")) {
      return "Support Request";
    } else if (textLower.includes("api") || textLower.includes("integration") || textLower.includes("403 forbidden") || textLower.includes("app-2024-x71")) {
      return "Technical Support";
    }
    return "General Inquiry";
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const type = detectInputType(value);
    setDetectedType(type);
  };

  const loadExample = (scenarioId: string) => {
    const scenario = simulatedData.scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      handleInputChange(scenario.input);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Manufacturing RFP": return <Factory className="w-4 h-4" />;
      case "Construction Bid": return <HardHat className="w-4 h-4" />;
      case "Energy Project": return <Zap className="w-4 h-4" />;
      case "Legal Compliance": return <Scale className="w-4 h-4" />;
      case "Emergency Service": return <AlertTriangle className="w-4 h-4" />;
      case "Enterprise RFP": return <FileText className="w-4 h-4" />;
      case "Support Request": return <Mail className="w-4 h-4" />;
      case "Technical Support": return <Wrench className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Email examples
  const examples = [
    {
      id: "support-billing",
      title: "Billing Issue",
      subtitle: "Customer charged incorrectly",
      icon: <Mail className="w-4 h-4" />,
      extractionPreview: "→ Sentiment: negative | Urgency: high"
    },
    {
      id: "technical-support",
      title: "Technical Problem",
      subtitle: "API integration stopped working",
      icon: <Wrench className="w-4 h-4" />,
      extractionPreview: "→ Sentiment: urgent | Urgency: critical"
    },
    {
      id: "feature-request",
      title: "Feature Request",
      subtitle: "Customer requesting new functionality",
      icon: <MessageCircle className="w-4 h-4" />,
      extractionPreview: "→ Sentiment: positive | Urgency: medium"
    },
    {
      id: "account-question",
      title: "Account Question",
      subtitle: "General account inquiry",
      icon: <Mail className="w-4 h-4" />,
      extractionPreview: "→ Sentiment: neutral | Urgency: low"
    }
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Input
            </CardTitle>
            <CardDescription>
              Paste an email to analyze sender, subject, sentiment, urgency and generate responses
            </CardDescription>
          </div>
          {detectedType && (
            <Badge variant="secondary" className="gap-1">
              {getTypeIcon(detectedType)}
              {detectedType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste the full email here including From, Subject, and body...

Example:
From: customer@company.com
Subject: Urgent: Invoice Issue

Hi, I was charged twice for last month's subscription...."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          className="min-h-[300px] resize-none"
          disabled={isProcessing}
        />

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => onAnalyze(input)}
            disabled={!input.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Sample Emails (click to test):</p>
            <div className="grid grid-cols-1 gap-2">
              {examples.map((example) => (
                <Button 
                  key={example.id}
                  variant="outline" 
                  size="sm"
                  onClick={() => loadExample(example.id)}
                  className="text-left justify-start h-auto p-3"
                  disabled={isProcessing}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2 font-medium">
                      {example.icon}
                      {example.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {example.subtitle}
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-mono">
                      {example.extractionPreview}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}