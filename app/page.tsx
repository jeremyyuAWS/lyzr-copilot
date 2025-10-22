"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CircleHelp as HelpCircle, Zap, MessageSquare, Settings, ChartBar as BarChart3, TestTube, Globe, BookOpen } from "lucide-react";
import Image from "next/image";
import InputPane from "@/components/InputPane";
import AgentOutputPane from "@/components/AgentOutputPane";
import FeedbackPanel from "@/components/FeedbackPanel";
import HistoryReview from "@/components/HistoryReview";
import KnowledgeBase from "@/components/KnowledgeBase";
import SettingsPanel from "@/components/SettingsPanel";
import WelcomeModal from "@/components/WelcomeModal";
import { getAgentClient, type AgentResponse } from "@/lib/agentClient";
import { FeedbackStorage } from "@/lib/feedbackStorage";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [currentResponse, setCurrentResponse] = useState<AgentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState("simulated"); // Default to simulated/demo mode
  const [error, setError] = useState<string | null>(null);
  const [agentConfig, setAgentConfig] = useState({
    endpoint: "",
    apiKey: ""
  });

  // Set client-side flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize welcome modal and config after client-side hydration
  useEffect(() => {
    if (!isClient) return;

    const hasSeenWelcome = localStorage.getItem('kb_validator_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('kb_validator_welcome_seen', 'true');
    }

    // Load saved config but NOT mode - always start in demo mode
    const savedEndpoint = localStorage.getItem('kb_validator_endpoint');
    const savedApiKey = localStorage.getItem('kb_validator_api_key');
    if (savedEndpoint && savedApiKey) {
      setAgentConfig({ endpoint: savedEndpoint, apiKey: savedApiKey });
    }
  }, [isClient]);

  const handleAnalyze = async (input: string) => {
    if (!input.trim()) return;

    setCurrentInput(input);
    setCurrentResponse(null);
    setIsProcessing(true);
    setError(null);

    try {
      const agentClient = getAgentClient();
      
      // Update agent config based on current mode
      agentClient.updateConfig({
        mode: mode as 'simulated' | 'live',
        endpoint: agentConfig.endpoint,
        apiKey: agentConfig.apiKey
      });

      const response = await agentClient.analyzeContent(input);
      setCurrentResponse(response);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedbackSubmit = (feedback: any) => {
    if (!isClient) return;
    
    try {
      const savedFeedback = FeedbackStorage.saveFeedback({
        input_preview: currentInput.substring(0, 100) + (currentInput.length > 100 ? '...' : ''),
        rating: feedback.rating,
        comment: feedback.comment || '',
        tags: feedback.tags || [],
        user: 'demo.user@company.com', // In real app, get from auth
        response_data: currentResponse
      });
      
      console.log("Feedback saved:", savedFeedback);
    } catch (err) {
      console.error('Error saving feedback:', err);
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    // Save mode preference only on client side
    if (isClient) {
      localStorage.setItem('kb_validator_mode', newMode);
    }
    // Clear current response when switching modes
    setCurrentResponse(null);
    setError(null);
  };

  const handleModeToggle = (checked: boolean) => {
    const newMode = checked ? 'live' : 'simulated';
    handleModeChange(newMode);
  };

  const handleConfigUpdate = (config: { endpoint: string; apiKey: string }) => {
    setAgentConfig(config);
  };

  const isLiveConfigured = agentConfig.endpoint && agentConfig.apiKey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/images/lyzr-logo-cut.png"
                alt="Lyzr Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lyzr Copilot</h1>
              <p className="text-gray-600">Intelligent email analysis and response generation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-purple-600" />
                <Label htmlFor="mode-toggle" className="text-sm font-medium cursor-pointer">
                  Demo
                </Label>
              </div>

              <Switch
                id="mode-toggle"
                checked={mode === 'live'}
                onCheckedChange={handleModeToggle}
                disabled={mode === 'live' && !isLiveConfigured}
              />

              <div className="flex items-center gap-2">
                <Label htmlFor="mode-toggle" className="text-sm font-medium cursor-pointer">
                  Live
                </Label>
                <Globe className="w-4 h-4 text-green-600" />
              </div>
            </div>

            {/* Mode Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              mode === "simulated"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}>
              <Zap className="w-4 h-4" />
              {mode === "simulated" ? "Demo Mode" : "Live Mode"}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWelcome(true)}
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
          </div>
        </div>

        {/* Live Mode Warning */}
        {mode === 'live' && !isLiveConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              <strong>Live mode requires configuration.</strong> Please go to Settings to add your Lyzr endpoint and API key, or switch back to Demo mode.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="validate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="validate" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Email Analyzer
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-6">
                <InputPane 
                  input={currentInput}
                  setInput={setCurrentInput}
                  onAnalyze={handleAnalyze}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                <AgentOutputPane
                  response={currentResponse}
                  isProcessing={isProcessing}
                />

                {currentResponse && (
                  <FeedbackPanel
                    response={currentResponse}
                    onFeedbackSubmit={handleFeedbackSubmit}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="knowledge-base">
            <KnowledgeBase />
          </TabsContent>

          <TabsContent value="history">
            <HistoryReview />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel 
              mode={mode}
              onModeChange={handleModeChange}
              onConfigUpdate={handleConfigUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>

      <WelcomeModal 
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}