"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Users,
  UserCircle,
  Database,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import type { AgentResponse } from "@/lib/agentClient";

interface EmailResponseGeneratorProps {
  response: AgentResponse;
  originalEmail: string;
}

export default function EmailResponseGenerator({ response, originalEmail }: EmailResponseGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateResponse = (type: string) => {
    setSelectedType(type);
    let generatedText = "";

    const emailAnalysis = response.email_analysis;

    switch (type) {
      case "customer":
        generatedText = generateCustomerReply(emailAnalysis, response);
        break;
      case "team":
        generatedText = generateTeamUpdate(emailAnalysis, response);
        break;
      case "manager":
        generatedText = generateManagerSummary(emailAnalysis, response);
        break;
      case "hubspot":
        generatedText = generateHubSpotEntry(emailAnalysis, response);
        break;
    }

    setGeneratedResponse(generatedText);
  };

  const generateCustomerReply = (analysis: any, resp: AgentResponse) => {
    const urgencyText = analysis?.urgency === 'critical' || analysis?.urgency === 'high'
      ? "Thank you for reaching out urgently. "
      : "Thank you for your email. ";

    let reply = `Subject: Re: ${analysis?.subject || "Your Inquiry"}\n\n`;
    reply += `Dear ${extractFirstName(analysis?.sender)},\n\n`;
    reply += urgencyText;

    if (analysis?.key_points && analysis.key_points.length > 0) {
      reply += `I understand you're writing about:\n`;
      analysis.key_points.forEach((point: string) => {
        reply += `- ${point}\n`;
      });
      reply += `\n`;
    }

    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      reply += `I'm working on the following items for you:\n`;
      analysis.required_actions.forEach((action: string) => {
        reply += `- ${action}\n`;
      });
      reply += `\n`;
    }

    if (analysis?.urgency === 'critical' || analysis?.urgency === 'high') {
      reply += `Given the urgency of your request, I'm prioritizing this and will have an update for you within 24 hours.\n\n`;
    } else {
      reply += `I'll review this carefully and get back to you with a detailed response within 2-3 business days.\n\n`;
    }

    reply += `Please don't hesitate to reach out if you have any additional questions.\n\n`;
    reply += `Best regards,\n[Your Name]\n[Your Title]`;

    return reply;
  };

  const generateTeamUpdate = (analysis: any, resp: AgentResponse) => {
    let update = `Subject: [${analysis?.urgency?.toUpperCase()}] New ${analysis?.category || 'Customer'} Email\n\n`;
    update += `Team,\n\n`;
    update += `We received a ${analysis?.urgency || 'medium'} priority email that requires attention.\n\n`;

    update += `**Sender:** ${analysis?.sender || 'Unknown'}\n`;
    update += `**Subject:** ${analysis?.subject || 'No subject'}\n`;
    update += `**Sentiment:** ${analysis?.sentiment || 'neutral'}\n`;
    update += `**Category:** ${analysis?.category || 'General inquiry'}\n\n`;

    if (analysis?.key_points && analysis.key_points.length > 0) {
      update += `**Key Points:**\n`;
      analysis.key_points.forEach((point: string) => {
        update += `• ${point}\n`;
      });
      update += `\n`;
    }

    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      update += `**Required Actions:**\n`;
      analysis.required_actions.forEach((action: string) => {
        update += `• ${action}\n`;
      });
      update += `\n`;
    }

    update += `**Routing:** ${resp.routing}\n\n`;
    update += `Please review and assign to the appropriate team member.\n\n`;
    update += `[Automated Team Update]`;

    return update;
  };

  const generateManagerSummary = (analysis: any, resp: AgentResponse) => {
    let summary = `Subject: Customer Communication Summary - ${analysis?.category || 'General'}\n\n`;
    summary += `Executive Summary\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    summary += `**Priority Level:** ${analysis?.urgency || 'medium'} | **Sentiment:** ${analysis?.sentiment || 'neutral'}\n`;
    summary += `**Customer:** ${analysis?.sender || 'Unknown'}\n`;
    summary += `**Subject:** ${analysis?.subject || 'No subject'}\n\n`;

    summary += `**Intent:** ${resp.intent}\n`;
    summary += `**Confidence:** ${Math.round((resp.intent_confidence || resp.confidence) * 100)}%\n\n`;

    if (analysis?.key_points && analysis.key_points.length > 0) {
      summary += `**Key Issues Identified:**\n`;
      analysis.key_points.forEach((point: string, idx: number) => {
        summary += `${idx + 1}. ${point}\n`;
      });
      summary += `\n`;
    }

    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      summary += `**Action Items:**\n`;
      analysis.required_actions.forEach((action: string, idx: number) => {
        summary += `${idx + 1}. ${action}\n`;
      });
      summary += `\n`;
    }

    summary += `**Recommended Routing:** ${resp.routing}\n\n`;

    if (resp.knowledge_gaps && resp.knowledge_gaps.length > 0) {
      summary += `**Knowledge Gaps:**\n`;
      const gaps = resp.knowledge_gaps.slice(0, 2);
      gaps.forEach((gap: any) => {
        const gapText = typeof gap === 'string' ? gap : gap.description;
        summary += `• ${gapText}\n`;
      });
      summary += `\n`;
    }

    summary += `**Status:** Pending Review\n`;
    summary += `**Next Steps:** Team assignment and response within SLA\n\n`;
    summary += `Generated by Email Response AI`;

    return summary;
  };

  const generateHubSpotEntry = (analysis: any, resp: AgentResponse) => {
    let entry = `Contact Activity Log\n`;
    entry += `════════════════════\n\n`;

    entry += `**Activity Type:** Email Received\n`;
    entry += `**Date:** ${new Date().toLocaleDateString()}\n`;
    entry += `**Contact:** ${analysis?.sender || 'Unknown'}\n`;
    entry += `**Subject:** ${analysis?.subject || 'No subject'}\n\n`;

    entry += `**Category:** ${analysis?.category || 'General Inquiry'}\n`;
    entry += `**Sentiment:** ${analysis?.sentiment || 'neutral'}\n`;
    entry += `**Priority:** ${analysis?.urgency || 'medium'}\n\n`;

    entry += `**Summary:**\n`;
    if (analysis?.key_points && analysis.key_points.length > 0) {
      analysis.key_points.forEach((point: string) => {
        entry += `- ${point}\n`;
      });
    } else {
      entry += `Customer inquiry regarding ${analysis?.category || 'services'}.\n`;
    }
    entry += `\n`;

    entry += `**Next Actions:**\n`;
    if (analysis?.required_actions && analysis.required_actions.length > 0) {
      analysis.required_actions.forEach((action: string) => {
        entry += `- ${action}\n`;
      });
    } else {
      entry += `- Follow up with customer\n- Route to appropriate team\n`;
    }
    entry += `\n`;

    entry += `**Deal Stage Impact:** ${getDealStageImpact(analysis?.sentiment, analysis?.urgency)}\n`;
    entry += `**Engagement Score:** ${getEngagementScore(analysis?.sentiment, analysis?.urgency)}/10\n\n`;

    entry += `**Tags:** #${analysis?.category?.replace(/\s+/g, '')} #${analysis?.urgency}Priority #EmailInbound\n\n`;

    entry += `**Internal Notes:**\n`;
    entry += `Confidence: ${Math.round((resp.confidence) * 100)}%\n`;
    entry += `Routing: ${resp.routing}\n`;

    return entry;
  };

  const extractFirstName = (email: string = "") => {
    const match = email.match(/^([^@\s]+)/);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : "Customer";
  };

  const getDealStageImpact = (sentiment: string, urgency: string) => {
    if (urgency === 'critical' && sentiment === 'negative') return "High Risk - Requires Immediate Attention";
    if (urgency === 'high') return "Moderate Risk - Active Engagement Needed";
    if (sentiment === 'positive') return "Positive - Opportunity for Upsell";
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

  const responseTypes = [
    {
      id: "customer",
      label: "Customer Reply",
      icon: <Mail className="w-4 h-4" />,
      description: "Professional response to customer",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
    {
      id: "team",
      label: "Team Update",
      icon: <Users className="w-4 h-4" />,
      description: "Internal team notification",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      id: "manager",
      label: "Manager Summary",
      icon: <UserCircle className="w-4 h-4" />,
      description: "Executive summary for leadership",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      id: "hubspot",
      label: "HubSpot Entry",
      icon: <Database className="w-4 h-4" />,
      description: "CRM activity log entry",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Quick Response Generator
        </CardTitle>
        <CardDescription>
          Generate intelligent responses with one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {responseTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start gap-2 ${type.color} ${selectedType === type.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => generateResponse(type.id)}
            >
              <div className="flex items-center gap-2 font-medium">
                {type.icon}
                {type.label}
              </div>
              <p className="text-xs text-gray-600 text-left">
                {type.description}
              </p>
            </Button>
          ))}
        </div>

        {generatedResponse && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                {responseTypes.find(t => t.id === selectedType)?.icon}
                {responseTypes.find(t => t.id === selectedType)?.label}
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
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={generatedResponse}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
