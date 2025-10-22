"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Zap,
  Globe,
  Upload,
  Database,
  Save,
  TestTube,
  Key,
  Shield,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Mail,
  Cloud,
  Inbox,
  HardDrive
} from "lucide-react";
import { FeedbackStorage } from "@/lib/feedbackStorage";
import IntegrationCard from "@/components/IntegrationCard";

interface SettingsPanelProps {
  mode: string;
  onModeChange: (mode: string) => void;
  onConfigUpdate?: (config: { endpoint: string; apiKey: string }) => void;
}

export default function SettingsPanel({ mode, onModeChange, onConfigUpdate }: SettingsPanelProps) {
  const [endpointUrl, setEndpointUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enableLogging, setEnableLogging] = useState(true);
  const [autoTagging, setAutoTagging] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState("");
  const [integrations, setIntegrations] = useState<Record<string, any>>({
    outlook: { status: 'disconnected' },
    gmail: { status: 'disconnected' },
    s3: { status: 'disconnected' },
    gdrive: { status: 'disconnected' },
    dropbox: { status: 'disconnected' }
  });

  useEffect(() => {
    // Load saved settings
    const savedEndpoint = localStorage.getItem('kb_validator_endpoint');
    const savedApiKey = localStorage.getItem('kb_validator_api_key');
    const savedInstructions = localStorage.getItem('kb_validator_instructions');
    
    if (savedEndpoint) setEndpointUrl(savedEndpoint);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedInstructions) setCustomInstructions(savedInstructions);
  }, []);

  const handleTestConnection = async () => {
    if (!endpointUrl || !apiKey) {
      setTestStatus('error');
      setTestMessage('Please enter both endpoint URL and API key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection...');

    try {
      // Test with a simple ping request
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: 'Test connection',
          test: true
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful!');
      } else {
        setTestStatus('error');
        setTestMessage(`Connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Clear status after 5 seconds
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 5000);
  };

  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('kb_validator_endpoint', endpointUrl);
    localStorage.setItem('kb_validator_api_key', apiKey);
    localStorage.setItem('kb_validator_instructions', customInstructions);
    
    // Notify parent component
    if (onConfigUpdate) {
      onConfigUpdate({ endpoint: endpointUrl, apiKey });
    }

    // Show success message
    setTestStatus('success');
    setTestMessage('Settings saved successfully!');
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  const handleExportData = () => {
    const data = FeedbackStorage.exportFeedback();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kb-validator-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
      FeedbackStorage.clearAllFeedback();
      setTestStatus('success');
      setTestMessage('All feedback data cleared');
      setTimeout(() => {
        setTestStatus('idle');
        setTestMessage('');
      }, 3000);
    }
  };

  const handleIntegrationConnect = async (type: string, config: Record<string, string>) => {
    setTestStatus('testing');
    setTestMessage(`Connecting to ${type}...`);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIntegrations({
        ...integrations,
        [type]: {
          status: 'connected',
          lastSync: new Date().toISOString(),
          config
        }
      });

      localStorage.setItem(`integration_${type}`, JSON.stringify({
        status: 'connected',
        lastSync: new Date().toISOString(),
        config
      }));

      setTestStatus('success');
      setTestMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} connected successfully!`);
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Failed to connect ${type}`);
    }

    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  const handleIntegrationDisconnect = async (type: string) => {
    setIntegrations({
      ...integrations,
      [type]: { status: 'disconnected' }
    });

    localStorage.removeItem(`integration_${type}`);

    setTestStatus('success');
    setTestMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} disconnected`);
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  const handleIntegrationSync = async (type: string) => {
    setTestStatus('testing');
    setTestMessage(`Syncing ${type}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIntegrations({
        ...integrations,
        [type]: {
          ...integrations[type],
          lastSync: new Date().toISOString()
        }
      });

      setTestStatus('success');
      setTestMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} synced successfully!`);
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Failed to sync ${type}`);
    }

    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {testMessage && (
        <div className={`p-4 rounded-lg ${
          testStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          testStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {testStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4" />}
            {testStatus === 'testing' && <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
            <span>{testMessage}</span>
          </div>
        </div>
      )}

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure how the AI agent processes and analyzes content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Operation Mode</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant={mode === "simulated" ? "default" : "outline"}
                onClick={() => onModeChange("simulated")}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    <span className="font-medium">Simulated Mode</span>
                    <Badge variant="secondary">Demo</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use pre-configured responses for testing
                  </p>
                </div>
              </Button>
              
              <Button
                variant={mode === "live" ? "default" : "outline"}
                onClick={() => onModeChange("live")}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Live Mode</span>
                    <Badge variant="secondary">Production</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Connect to your Lyzr agent endpoint
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Live Mode Configuration */}
          {mode === "live" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Lyzr Agent Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.lyzr.ai/v1/agents/your-agent-id"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apikey">API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="Your Lyzr API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleTestConnection} 
                variant="outline" 
                size="sm"
                disabled={testStatus === 'testing'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Analysis Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Add custom instructions for the agent to follow during analysis..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system behavior and data handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Detailed Logging</Label>
              <p className="text-sm text-gray-500">
                Log all agent interactions for debugging and improvement
              </p>
            </div>
            <Switch
              checked={enableLogging}
              onCheckedChange={setEnableLogging}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto-tag Feedback</Label>
              <p className="text-sm text-gray-500">
                Automatically suggest tags based on feedback content
              </p>
            </div>
            <Switch
              checked={autoTagging}
              onCheckedChange={setAutoTagging}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Service Integrations
          </CardTitle>
          <CardDescription>
            Connect your email accounts to analyze archived emails and threads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              icon={<Inbox className="w-5 h-5 text-blue-600" />}
              title="Microsoft Outlook"
              description="Connect Outlook via MCP"
              type="outlook"
              status={integrations.outlook.status}
              lastSync={integrations.outlook.lastSync}
              onConnect={(config) => handleIntegrationConnect('outlook', config)}
              onDisconnect={() => handleIntegrationDisconnect('outlook')}
              onSync={() => handleIntegrationSync('outlook')}
              configFields={[
                {
                  key: 'clientId',
                  label: 'Client ID',
                  type: 'text',
                  placeholder: 'Your Azure App Client ID',
                  helpText: 'Found in Azure Portal under App Registrations'
                },
                {
                  key: 'clientSecret',
                  label: 'Client Secret',
                  type: 'password',
                  placeholder: 'Your Azure App Client Secret'
                },
                {
                  key: 'tenantId',
                  label: 'Tenant ID',
                  type: 'text',
                  placeholder: 'Your Azure Tenant ID'
                }
              ]}
            />

            <IntegrationCard
              icon={<Mail className="w-5 h-5 text-red-600" />}
              title="Gmail"
              description="Connect Gmail via MCP"
              type="gmail"
              status={integrations.gmail.status}
              lastSync={integrations.gmail.lastSync}
              onConnect={(config) => handleIntegrationConnect('gmail', config)}
              onDisconnect={() => handleIntegrationDisconnect('gmail')}
              onSync={() => handleIntegrationSync('gmail')}
              configFields={[
                {
                  key: 'apiKey',
                  label: 'API Key',
                  type: 'password',
                  placeholder: 'Your Gmail API Key',
                  helpText: 'Create in Google Cloud Console'
                },
                {
                  key: 'email',
                  label: 'Email Address',
                  type: 'text',
                  placeholder: 'your-email@gmail.com'
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cloud Storage Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-purple-600" />
            Cloud Storage Integrations
          </CardTitle>
          <CardDescription>
            Connect cloud storage to access archived email exports and documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IntegrationCard
              icon={<HardDrive className="w-5 h-5 text-orange-600" />}
              title="Amazon S3"
              description="Access S3 buckets"
              type="s3"
              status={integrations.s3.status}
              lastSync={integrations.s3.lastSync}
              onConnect={(config) => handleIntegrationConnect('s3', config)}
              onDisconnect={() => handleIntegrationDisconnect('s3')}
              onSync={() => handleIntegrationSync('s3')}
              configFields={[
                {
                  key: 'accessKeyId',
                  label: 'Access Key ID',
                  type: 'text',
                  placeholder: 'Your AWS Access Key'
                },
                {
                  key: 'secretAccessKey',
                  label: 'Secret Access Key',
                  type: 'password',
                  placeholder: 'Your AWS Secret Key'
                },
                {
                  key: 'bucket',
                  label: 'Bucket Name',
                  type: 'text',
                  placeholder: 'my-email-archives'
                },
                {
                  key: 'region',
                  label: 'Region',
                  type: 'text',
                  placeholder: 'us-east-1'
                }
              ]}
            />

            <IntegrationCard
              icon={<Cloud className="w-5 h-5 text-blue-600" />}
              title="Google Drive"
              description="Access Drive files"
              type="gdrive"
              status={integrations.gdrive.status}
              lastSync={integrations.gdrive.lastSync}
              onConnect={(config) => handleIntegrationConnect('gdrive', config)}
              onDisconnect={() => handleIntegrationDisconnect('gdrive')}
              onSync={() => handleIntegrationSync('gdrive')}
              configFields={[
                {
                  key: 'apiKey',
                  label: 'API Key',
                  type: 'password',
                  placeholder: 'Your Google Drive API Key'
                },
                {
                  key: 'folderId',
                  label: 'Folder ID',
                  type: 'text',
                  placeholder: 'Shared folder ID (optional)'
                }
              ]}
            />

            <IntegrationCard
              icon={<Cloud className="w-5 h-5 text-blue-700" />}
              title="Dropbox"
              description="Access Dropbox files"
              type="dropbox"
              status={integrations.dropbox.status}
              lastSync={integrations.dropbox.lastSync}
              onConnect={(config) => handleIntegrationConnect('dropbox', config)}
              onDisconnect={() => handleIntegrationDisconnect('dropbox')}
              onSync={() => handleIntegrationSync('dropbox')}
              configFields={[
                {
                  key: 'accessToken',
                  label: 'Access Token',
                  type: 'password',
                  placeholder: 'Your Dropbox Access Token'
                },
                {
                  key: 'path',
                  label: 'Folder Path',
                  type: 'text',
                  placeholder: '/Email Archives (optional)'
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            Knowledge Base Management
          </CardTitle>
          <CardDescription>
            Upload and manage your knowledge base documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Upload PDF, CSV, or TXT files to enhance the knowledge base
            </p>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Supported formats: PDF, CSV, TXT (max 10MB per file)</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-600" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your feedback data and manage storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Feedback Data
            </Button>
            <Button onClick={handleClearData} variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}