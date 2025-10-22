"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  CheckCircle2,
  Sparkles,
  Target,
  Users
} from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-purple-600" />
            Welcome to Lyzr Copilot
          </DialogTitle>
          <DialogDescription>
            Analyze emails intelligently and generate professional responses with one click
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What it does */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              What does this app do?
            </h3>
            <p className="text-sm text-gray-600">
              This tool helps customer support teams analyze incoming emails and instantly generate appropriate responses.
              The AI extracts sender information, detects sentiment and urgency, and creates tailored replies for customers,
              teams, managers, and CRM systems.
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Key AI Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Email sentiment & urgency detection
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Intelligent category classification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Key points & action extraction
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                One-click response generation
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              How to use the tabs
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Email Analyzer</p>
                  <p className="text-sm text-purple-700">
                    Paste any email to analyze sentiment, urgency, and key points - then generate responses instantly
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">History</p>
                  <p className="text-sm text-green-700">
                    Review past feedback, track satisfaction rates, and identify improvement patterns
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Settings</p>
                  <p className="text-sm text-blue-700">
                    Configure AI endpoints, toggle demo/live mode, and customize response templates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Mode */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                Demo Mode Active
              </Badge>
            </div>
            <p className="text-sm text-amber-700">
              You're currently in demo mode with sample emails. Switch to live mode in Settings
              to connect your AI endpoint for real-time email analysis and response generation.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}