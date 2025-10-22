"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Settings, Trash2, RefreshCw } from "lucide-react";

interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: string;
  status?: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  onConnect: (config: Record<string, string>) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync?: () => Promise<void>;
  configFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    helpText?: string;
  }>;
}

export default function IntegrationCard({
  icon,
  title,
  description,
  type,
  status = 'disconnected',
  lastSync,
  onConnect,
  onDisconnect,
  onSync,
  configFields
}: IntegrationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect(config);
      setIsOpen(false);
      setConfig({});
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm(`Are you sure you want to disconnect ${title}?`)) {
      setIsLoading(true);
      try {
        await onDisconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSync = async () => {
    if (onSync) {
      setIsLoading(true);
      try {
        await onSync();
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          {status === 'connected' ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : status === 'error' ? (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          ) : (
            <Badge variant="outline">Disconnected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {status === 'connected' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isLoading || !onSync}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure {title}</DialogTitle>
                    <DialogDescription>Update your integration settings</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {configFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={config[field.key] || ''}
                          onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                        />
                        {field.helpText && (
                          <p className="text-xs text-gray-500">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleConnect} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Connect</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect {title}</DialogTitle>
                  <DialogDescription>
                    Enter your credentials to connect this integration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {configFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      />
                      {field.helpText && (
                        <p className="text-xs text-gray-500">{field.helpText}</p>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConnect} disabled={isLoading}>
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {status === 'connected' && lastSync && (
          <p className="text-xs text-gray-500 mt-3">
            Last synced: {new Date(lastSync).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
