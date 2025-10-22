"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Route,
  Package,
  BookOpen,
  AlertTriangle,
  Copy,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Hash,
  Target,
  Quote,
  Mail,
  Users,
  UserCircle,
  Database as DatabaseIcon,
  FileText,
  Check,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface EmailAnalysis {
  sender: string;
  subject: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  key_points: string[];
  required_actions: string[];
}

interface AgentResponse {
  intent: string;
  intent_confidence?: number;
  routing: string;
  routing_confidence?: number;
  confidence: number;
  email_analysis?: EmailAnalysis;
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    category: string;
    confidence?: number;
    extraction_source?: string;
  }>;
  kb_matches: Array<{
    title: string;
    confidence: number;
    relevance: string;
    section: string;
    row_start?: number;
    row_end?: number;
    match_reason?: string;
  }>;
  knowledge_gaps: Array<{
    description: string;
    confidence?: number;
    gap_reason?: string;
  }> | string[];
  extracted_metadata: Record<string, any>;
}

interface AgentOutputPaneProps {
  response: AgentResponse | null;
  isProcessing: boolean;
}

export default function AgentOutputPane({ response, isProcessing }: AgentOutputPaneProps) {
  const [selectedResponseType, setSelectedResponseType] = useState<string | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateResponse = (type: string) => {
    if (!response) return;

    setSelectedResponseType(type);
    let generated = "";
    const emailAnalysis = response.email_analysis;

    switch (type) {
      case "customer":
        generated = generateCustomerReply(emailAnalysis, response);
        break;
      case "manager":
        generated = generateManagerSummary(emailAnalysis, response);
        break;
      case "team":
        generated = generateTeamUpdate(emailAnalysis, response);
        break;
      case "crm":
        generated = generateCRMSummary(emailAnalysis, response);
        break;
    }

    setGeneratedResponse(generated);
  };

  const generateCustomerReply = (analysis: any, resp: AgentResponse) => {
    const urgency = analysis?.urgency || 'medium';
    const urgencyText = urgency === 'critical' || urgency === 'high'
      ? "Thank you for reaching out urgently. "
      : "Thank you for your email. ";

    let reply = `Subject: Re: ${analysis?.subject || resp.intent || "Your Inquiry"}\n\n`;
    reply += `Dear ${extractFirstName(analysis?.sender || 'valued customer')},\n\n`;
    reply += urgencyText;

    if (analysis?.key_points && analysis.key_points.length > 0) {
      reply += `I understand you're writing about:\n`;
      analysis.key_points.forEach((point: string) => {
        reply += `- ${point}\n`;
      });
      reply += `\n`;
    }

    if (resp.kb_matches && resp.kb_matches.length > 0) {
      reply += `Based on our knowledge base, here's what I can share:\n`;
      resp.kb_matches.slice(0, 2).forEach((match: any) => {
        reply += `- ${match.title}: ${match.section}\n`;
      });
      reply += `\n`;
    }

    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      reply += `I'm working on the following for you:\n`;
      analysis.required_actions.forEach((action: string) => {
        reply += `- ${action}\n`;
      });
      reply += `\n`;
    }

    if (urgency === 'critical' || urgency === 'high') {
      reply += `Given the urgency, I'm prioritizing this and will have an update within 24 hours.\n\n`;
    } else {
      reply += `I'll review this carefully and respond within 2-3 business days.\n\n`;
    }

    reply += `Best regards,\n[Your Name]`;
    return reply;
  };

  const generateManagerSummary = (analysis: any, resp: AgentResponse) => {
    let summary = `EXECUTIVE SUMMARY\n${'='.repeat(50)}\n\n`;
    summary += `Customer: ${analysis?.sender || 'Customer Inquiry'}\n`;
    summary += `Priority: ${analysis?.urgency || 'medium'} | Sentiment: ${analysis?.sentiment || 'neutral'}\n`;
    summary += `Category: ${analysis?.category || resp.intent || 'General'}\n\n`;

    summary += `KEY ISSUES:\n`;
    if (analysis?.key_points && analysis.key_points.length > 0) {
      analysis.key_points.forEach((point: string, idx: number) => {
        summary += `${idx + 1}. ${point}\n`;
      });
    }
    summary += `\n`;

    summary += `AI ANALYSIS:\n`;
    summary += `Intent: ${resp.intent} (${Math.round((resp.intent_confidence || resp.confidence) * 100)}% confidence)\n`;
    summary += `Routing: ${resp.routing}\n\n`;

    if (resp.kb_matches && resp.kb_matches.length > 0) {
      summary += `KNOWLEDGE BASE MATCHES:\n`;
      resp.kb_matches.slice(0, 3).forEach((match: any) => {
        summary += `- ${match.title} (${Math.round(match.confidence * 100)}% match)\n`;
      });
      summary += `\n`;
    }

    if (resp.knowledge_gaps && resp.knowledge_gaps.length > 0) {
      summary += `KNOWLEDGE GAPS:\n`;
      const gaps = resp.knowledge_gaps.slice(0, 2);
      gaps.forEach((gap: any) => {
        const gapText = typeof gap === 'string' ? gap : gap.description;
        summary += `- ${gapText}\n`;
      });
      summary += `\n`;
    }

    summary += `RECOMMENDED ACTION: ${analysis?.required_actions?.[0] || 'Review and respond'}\n`;
    return summary;
  };

  const generateTeamUpdate = (analysis: any, resp: AgentResponse) => {
    const urgency = analysis?.urgency || 'medium';
    const category = analysis?.category || resp.intent || 'Customer';
    let update = `[${urgency.toUpperCase()} PRIORITY] New ${category} Email\n\n`;
    update += `FROM: ${analysis?.sender || 'Customer Inquiry'}\n`;
    update += `SUBJECT: ${analysis?.subject || resp.intent || 'No subject'}\n`;
    update += `SENTIMENT: ${analysis?.sentiment || 'neutral'} | URGENCY: ${urgency}\n\n`;

    if (analysis?.key_points && analysis.key_points.length > 0) {
      update += `KEY POINTS:\n`;
      analysis.key_points.forEach((point: string) => {
        update += `• ${point}\n`;
      });
      update += `\n`;
    }

    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      update += `REQUIRED ACTIONS:\n`;
      analysis.required_actions.forEach((action: string) => {
        update += `• ${action}\n`;
      });
      update += `\n`;
    }

    update += `ROUTING: ${resp.routing}\n`;
    update += `CONFIDENCE: ${Math.round(resp.confidence * 100)}%\n\n`;

    if (resp.kb_matches && resp.kb_matches.length > 0) {
      update += `RELEVANT KB ARTICLES:\n`;
      resp.kb_matches.slice(0, 2).forEach((match: any) => {
        update += `- ${match.title}\n`;
      });
    }

    return update;
  };

  const generateCRMSummary = (analysis: any, resp: AgentResponse) => {
    const sentiment = analysis?.sentiment || 'neutral';
    const urgency = analysis?.urgency || 'medium';
    const category = analysis?.category || resp.intent || 'General Inquiry';

    let crm = `CRM ACTIVITY LOG - Email Received\n${'='.repeat(50)}\n\n`;
    crm += `CONTACT: ${analysis?.sender || 'Customer Inquiry'}\n`;
    crm += `DATE: ${new Date().toLocaleString()}\n`;
    crm += `SUBJECT: ${analysis?.subject || resp.intent || 'No subject'}\n\n`;

    crm += `CATEGORY: ${category}\n`;
    crm += `SENTIMENT: ${sentiment}\n`;
    crm += `URGENCY: ${urgency}\n`;
    crm += `ENGAGEMENT SCORE: ${getEngagementScore(sentiment, urgency)}/10\n\n`;

    crm += `SUMMARY:\n`;
    if (analysis?.key_points && analysis.key_points.length > 0) {
      analysis.key_points.forEach((point: string) => {
        crm += `- ${point}\n`;
      });
    }
    crm += `\n`;

    crm += `NEXT ACTIONS:\n`;
    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      analysis.required_actions.forEach((action: string) => {
        crm += `- ${action}\n`;
      });
    }
    crm += `\n`;

    crm += `DEAL IMPACT: ${getDealStageImpact(sentiment, urgency)}\n`;
    crm += `TAGS: #${category.replace(/\s+/g, '')} #${urgency}Priority\n\n`;

    crm += `AI ROUTING: ${resp.routing}\n`;
    crm += `CONFIDENCE: ${Math.round(resp.confidence * 100)}%\n`;

    return crm;
  };

  const extractFirstName = (email: string = "") => {
    const match = email.match(/^([^@\s]+)/);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : "Customer";
  };

  const getDealStageImpact = (sentiment: string, urgency: string) => {
    if (urgency === 'critical' && sentiment === 'negative') return "High Risk - Immediate Attention Required";
    if (urgency === 'high') return "Moderate Risk - Active Engagement Needed";
    if (sentiment === 'positive') return "Positive - Upsell Opportunity";
    return "Neutral - Standard Follow-up";
  };

  const getEngagementScore = (sentiment: string, urgency: string) => {
    let score = 5;
    if (sentiment === 'positive') score += 2;
    if (sentiment === 'negative') score -= 1;
    if (urgency === 'high' || urgency === 'critical') score += 2;
    return Math.max(1, Math.min(10, score));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Agent Analysis
          </CardTitle>
          <CardDescription>Processing your input...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <div className="text-center space-y-2">
              <p className="font-medium">Analyzing content...</p>
              <p className="text-sm text-gray-500">
                Extracting intent, routing, and matching knowledge base
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Agent Analysis
          </CardTitle>
          <CardDescription>Results will appear here after analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-gray-500">
            <Brain className="w-12 h-12 text-gray-300" />
            <div className="text-center">
              <p className="font-medium">Ready to analyze</p>
              <p className="text-sm">Paste content and click analyze to get started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance.toLowerCase()) {
      case "high": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Handle both old format (string array) and new format (object array) for knowledge_gaps
  const normalizedKnowledgeGaps = response.knowledge_gaps.map(gap => 
    typeof gap === 'string' 
      ? { description: gap, confidence: undefined, gap_reason: undefined }
      : gap
  );

  const responseButtons = [
    {
      id: "customer",
      label: "Customer Reply",
      icon: <Mail className="w-4 h-4" />,
      description: "Professional customer response",
      color: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    {
      id: "manager",
      label: "Manager Summary",
      icon: <UserCircle className="w-4 h-4" />,
      description: "Executive briefing",
      color: "bg-purple-500 hover:bg-purple-600 text-white"
    },
    {
      id: "team",
      label: "Team Update",
      icon: <Users className="w-4 h-4" />,
      description: "Internal team notification",
      color: "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      id: "crm",
      label: "CRM Summary",
      icon: <DatabaseIcon className="w-4 h-4" />,
      description: "HubSpot/Salesforce entry",
      color: "bg-orange-500 hover:bg-orange-600 text-white"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Quick Response Generator - Show when we have a response */}
      {response && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              KB-Powered Response Generator
            </CardTitle>
            <CardDescription>
              Generate responses based on knowledge base matches and email analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {responseButtons.map((btn) => (
                <Button
                  key={btn.id}
                  onClick={() => generateResponse(btn.id)}
                  className={`h-auto py-3 px-4 flex flex-col items-center gap-2 ${btn.color} ${
                    selectedResponseType === btn.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  {btn.icon}
                  <span className="text-sm font-medium">{btn.label}</span>
                </Button>
              ))}
            </div>

            {generatedResponse && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="w-3 h-3" />
                    {responseButtons.find(b => b.id === selectedResponseType)?.label}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={generatedResponse}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-white"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Agent Analysis
              </CardTitle>
              <CardDescription>Structured results from AI processing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Analysis Section */}
          {response.email_analysis && (
            <>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  Email Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Sender:</span>
                    <p className="font-medium">{response.email_analysis.sender || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{response.email_analysis.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sentiment:</span>
                    <Badge variant="outline" className={
                      response.email_analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                      response.email_analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                      response.email_analysis.sentiment === 'urgent' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {response.email_analysis.sentiment}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Urgency:</span>
                    <Badge variant="outline" className={
                      response.email_analysis.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                      response.email_analysis.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                      response.email_analysis.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {response.email_analysis.urgency}
                    </Badge>
                  </div>
                </div>
                {response.email_analysis.subject && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Subject:</span>
                    <p className="font-medium text-sm">{response.email_analysis.subject}</p>
                  </div>
                )}
                {response.email_analysis.key_points && response.email_analysis.key_points.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">Key Points:</span>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {response.email_analysis.key_points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}
          {/* Intent & Routing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Intent</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">{response.intent}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn("px-2 py-1 rounded text-xs font-medium", 
                    getConfidenceColor(response.intent_confidence || response.confidence))}>
                    <Target className="w-3 h-3 inline mr-1" />
                    {Math.round((response.intent_confidence || response.confidence) * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Suggested Routing</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">{response.routing}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn("px-2 py-1 rounded text-xs font-medium",
                    getConfidenceColor(response.routing_confidence || response.confidence))}>
                    <Target className="w-3 h-3 inline mr-1" />
                    {Math.round((response.routing_confidence || response.confidence) * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Extracted Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <span className="font-medium">Extracted Items</span>
              <Badge variant="secondary">{response.items.length}</Badge>
            </div>
            <div className="grid gap-2">
              {response.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{item.description}</p>
                    <p className="text-sm text-green-700">SKU: {item.sku}</p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-green-600 mt-1">Qty: {item.quantity}</p>
                    )}
                    {item.extraction_source && (
                      <div className="mt-2 flex items-start gap-1">
                        <Quote className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-green-600 italic">
                          "{item.extraction_source}"
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="outline" className="text-green-700">
                      {item.category}
                    </Badge>
                    {item.confidence && (
                      <div className={cn("px-2 py-1 rounded text-xs font-medium",
                        getConfidenceColor(item.confidence))}>
                        <Target className="w-3 h-3 inline mr-1" />
                        {Math.round(item.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Knowledge Base Matches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Knowledge Base Matches</span>
              <Badge variant="secondary">{response.kb_matches.length}</Badge>
            </div>
            <div className="space-y-2">
              {response.kb_matches.map((match, index) => (
                <div key={index} className="p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-indigo-900">{match.title}</p>
                      <p className="text-sm text-indigo-700 mt-1">{match.section}</p>
                      {match.row_start && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                            <Hash className="w-3 h-3" />
                            Row {match.row_start}
                            {match.row_end && match.row_end !== match.row_start && (
                              <span>-{match.row_end}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {match.match_reason && (
                        <div className="mt-2 flex items-start gap-1">
                          <Quote className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-indigo-600 italic">
                            Match reason: {match.match_reason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getRelevanceColor(match.relevance)} variant="outline">
                        {match.relevance}
                      </Badge>
                      <div className={cn("px-2 py-1 rounded text-xs font-medium",
                        getConfidenceColor(match.confidence))}>
                        <Target className="w-3 h-3 inline mr-1" />
                        {Math.round(match.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Knowledge Gaps */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-medium">Knowledge Gaps</span>
              <Badge variant="secondary">{normalizedKnowledgeGaps.length}</Badge>
            </div>
            <div className="space-y-2">
              {normalizedKnowledgeGaps.map((gap, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-amber-900">{gap.description}</p>
                      {gap.gap_reason && (
                        <div className="mt-2 flex items-start gap-1">
                          <Quote className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-600 italic">
                            Reason: {gap.gap_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {gap.confidence && (
                    <div className={cn("px-2 py-1 rounded text-xs font-medium ml-3",
                      getConfidenceColor(gap.confidence))}>
                      <Target className="w-3 h-3 inline mr-1" />
                      {Math.round(gap.confidence * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}