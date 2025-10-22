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

interface AgentClientConfig {
  mode: 'simulated' | 'live';
  endpoint?: string;
  apiKey?: string;
}

export class AgentClient {
  private config: AgentClientConfig;

  constructor(config: AgentClientConfig) {
    this.config = config;
  }

  async analyzeContent(input: string): Promise<AgentResponse> {
    if (this.config.mode === 'simulated') {
      return this.simulateAnalysis(input);
    } else {
      return this.callLiveAgent(input);
    }
  }

  private async simulateAnalysis(input: string): Promise<AgentResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Import simulated data
    const simulatedData = await import('@/data/simulated-responses.json');

    // Enhanced keyword matching to determine which scenario to use
    const inputLower = input.toLowerCase();
    let selectedScenario;

    // Check if this looks like an email format
    const isEmailFormat = this.isEmailInput(input);
    if (isEmailFormat) {
      const emailAnalysis = this.analyzeEmail(input);
      selectedScenario = this.findEmailScenario(simulatedData, inputLower, emailAnalysis);

      if (selectedScenario) {
        return {
          ...selectedScenario.response,
          email_analysis: emailAnalysis
        };
      }
    }

    // Manufacturing - Penn Stainless style (most specific first)
    if (this.containsKeywords(inputLower, ['penn stainless']) || 
        this.containsKeywords(inputLower, ['stainless steel', 'fabrication', 'tanks', 'asme']) ||
        this.containsKeywords(inputLower, ['316l', 'pressure vessel', 'welding'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'manufacturing-custom-fabrication');
    }
    // Construction - Tiny's Construction style  
    else if (this.containsKeywords(inputLower, ["tiny's construction"]) ||
             this.containsKeywords(inputLower, ['construction', 'bidding', 'retail addition']) ||
             this.containsKeywords(inputLower, ['concrete foundation', 'steel frame', 'shopping center'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'construction-project-bid');
    }
    // Energy - Novitium Energy style
    else if (this.containsKeywords(inputLower, ['novitium energy']) ||
             this.containsKeywords(inputLower, ['250 mw', 'solar farm', 'battery energy storage']) ||
             this.containsKeywords(inputLower, ['photovoltaic', 'grid interconnection', '138kv'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'energy-renewable-project');
    }
    // Legal Compliance
    else if (this.containsKeywords(inputLower, ['globaltech']) ||
             this.containsKeywords(inputLower, ['eu ai act', 'compliance', 'chatbot']) ||
             this.containsKeywords(inputLower, ['ce marking', 'dpia', 'conformity assessment'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'legal-compliance-inquiry');
    }
    // Emergency Service
    else if (this.containsKeywords(inputLower, ['metro transit']) ||
             this.containsKeywords(inputLower, ['urgent', 'water main break', 'flooded']) ||
             this.containsKeywords(inputLower, ['union station', 'tunnel', '50,000 gallons'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'emergency-service-request');
    }
    // Billing Support
    else if (this.containsKeywords(inputLower, ['acc-789456']) ||
             this.containsKeywords(inputLower, ['invoice', 'charged $299', 'basic plan']) ||
             this.containsKeywords(inputLower, ['downgraded', 'refund', 'account number'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'support-billing');
    }
    // Technical Support
    else if (this.containsKeywords(inputLower, ['app-2024-x71']) ||
             this.containsKeywords(inputLower, ['api integration', '403 forbidden', '1,200+ users']) ||
             this.containsKeywords(inputLower, ['sync user data', 'stopped working', 'app id'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'technical-support');
    }
    // Enterprise RFP
    else if (this.containsKeywords(inputLower, ['500-employee', 'comprehensive software']) ||
             this.containsKeywords(inputLower, ['project management', 'crm', 'enterprise security']) ||
             this.containsKeywords(inputLower, ['annual licensing', 'api integrations'])) {
      selectedScenario = simulatedData.scenarios.find(s => s.id === 'rfp-enterprise');
    }

    if (!selectedScenario) {
      // Enhanced fallback response that tries to extract some meaningful data
      const extractedItems = this.extractGenericItems(input);
      const detectedIntent = this.detectGenericIntent(input);
      
      return {
        intent: detectedIntent,
        intent_confidence: 0.75,
        routing: "Customer Support > General Team",
        routing_confidence: 0.68,
        confidence: 0.75,
        items: extractedItems,
        kb_matches: [
          {
            title: "General FAQ",
            confidence: 0.65,
            relevance: "Medium",
            section: "Common Questions",
            row_start: 1,
            row_end: 15,
            match_reason: "No specific knowledge base matches found for this input type"
          }
        ],
        knowledge_gaps: [
          {
            description: "Input content requires manual review for proper classification",
            confidence: 0.88,
            gap_reason: "Content doesn't match any known scenario patterns"
          },
          {
            description: "No specific routing rules defined for this type of inquiry",
            confidence: 0.72,
            gap_reason: "Routing logic needs expansion for this content type"
          }
        ],
        extracted_metadata: {
          input_length: input.length,
          detected_type: "general",
          processing_time: new Date().toISOString(),
          word_count: input.split(/\s+/).length
        }
      };
    }

    return selectedScenario.response;
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractGenericItems(input: string): Array<{
    sku: string;
    description: string;
    quantity: number;
    category: string;
    confidence?: number;
    extraction_source?: string;
  }> {
    const items = [];
    
    // Look for email patterns
    const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      items.push({
        sku: "EMAIL-CONTACT",
        description: emailMatch[1],
        quantity: 1,
        category: "Contact Information",
        confidence: 0.95,
        extraction_source: `Email address found: ${emailMatch[1]}`
      });
    }

    // Look for numbers that might be quantities, costs, or IDs
    const numberMatches = input.match(/\$[\d,]+|\d+\s*(units|pieces|items|employees|users)/gi);
    if (numberMatches) {
      numberMatches.slice(0, 3).forEach((match, index) => {
        items.push({
          sku: `ITEM-${index + 1}`,
          description: match,
          quantity: 1,
          category: "Extracted Value",
          confidence: 0.7,
          extraction_source: `Numerical value detected: ${match}`
        });
      });
    }

    return items;
  }

  private detectGenericIntent(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('quote') || inputLower.includes('pricing') || inputLower.includes('cost')) {
      return "Pricing Inquiry";
    } else if (inputLower.includes('support') || inputLower.includes('help') || inputLower.includes('issue')) {
      return "Support Request";
    } else if (inputLower.includes('information') || inputLower.includes('details') || inputLower.includes('specifications')) {
      return "Information Request";
    } else if (inputLower.includes('order') || inputLower.includes('purchase') || inputLower.includes('buy')) {
      return "Purchase Intent";
    } else if (inputLower.includes('meeting') || inputLower.includes('consultation') || inputLower.includes('discuss')) {
      return "Consultation Request";
    }
    
    return "General Inquiry";
  }

  private async callLiveAgent(input: string): Promise<AgentResponse> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('Lyzr endpoint and API key are required for live mode');
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          input: input,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Lyzr API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Lyzr agent:', error);
      throw new Error('Failed to connect to Lyzr agent. Please check your endpoint and API key.');
    }
  }

  updateConfig(newConfig: Partial<AgentClientConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  private isEmailInput(input: string): boolean {
    const hasFromField = /^from:/im.test(input) || /@[\w.-]+\.\w+/i.test(input);
    const hasSubjectField = /^subject:/im.test(input);
    return hasFromField || hasSubjectField || input.includes('@');
  }

  private analyzeEmail(input: string): EmailAnalysis {
    const lines = input.split('\n');
    let sender = '';
    let subject = '';
    let body = '';

    const senderMatch = input.match(/from:\s*(.+?)(?:\n|$)/i);
    if (senderMatch) {
      sender = senderMatch[1].trim();
    } else {
      const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) sender = emailMatch[1];
    }

    const subjectMatch = input.match(/subject:\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }

    const bodyStartIndex = Math.max(
      input.toLowerCase().indexOf('subject:') + (subjectMatch ? subjectMatch[0].length : 0),
      input.toLowerCase().indexOf('from:') + (senderMatch ? senderMatch[0].length : 0)
    );
    body = input.substring(bodyStartIndex).trim();

    const sentiment = this.detectSentiment(input);
    const urgency = this.detectUrgency(input);
    const category = this.detectCategory(input);
    const key_points = this.extractKeyPoints(body);
    const required_actions = this.extractRequiredActions(body);

    return {
      sender,
      subject,
      sentiment,
      urgency,
      category,
      key_points,
      required_actions
    };
  }

  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'urgent' {
    const textLower = text.toLowerCase();
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const negativeWords = ['issue', 'problem', 'complaint', 'disappointed', 'frustrated', 'angry', 'unhappy'];
    const positiveWords = ['thank', 'appreciate', 'great', 'excellent', 'happy', 'satisfied'];

    if (urgentWords.some(word => textLower.includes(word))) return 'urgent';
    if (negativeWords.some(word => textLower.includes(word))) return 'negative';
    if (positiveWords.some(word => textLower.includes(word))) return 'positive';
    return 'neutral';
  }

  private detectUrgency(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const textLower = text.toLowerCase();
    if (textLower.includes('urgent') || textLower.includes('asap') || textLower.includes('emergency')) {
      return 'critical';
    }
    if (textLower.includes('soon') || textLower.includes('quickly') || textLower.includes('important')) {
      return 'high';
    }
    if (textLower.includes('when you can') || textLower.includes('at your convenience')) {
      return 'low';
    }
    return 'medium';
  }

  private detectCategory(text: string): string {
    const textLower = text.toLowerCase();
    if (textLower.includes('billing') || textLower.includes('invoice') || textLower.includes('payment')) {
      return 'Billing';
    }
    if (textLower.includes('technical') || textLower.includes('bug') || textLower.includes('error')) {
      return 'Technical Support';
    }
    if (textLower.includes('feature') || textLower.includes('request') || textLower.includes('suggestion')) {
      return 'Feature Request';
    }
    if (textLower.includes('account') || textLower.includes('password') || textLower.includes('login')) {
      return 'Account Management';
    }
    return 'General Inquiry';
  }

  private extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private extractRequiredActions(text: string): string[] {
    const actions: string[] = [];
    const textLower = text.toLowerCase();

    if (textLower.includes('refund')) actions.push('Process refund request');
    if (textLower.includes('cancel')) actions.push('Handle cancellation');
    if (textLower.includes('change') || textLower.includes('update')) actions.push('Update account details');
    if (textLower.includes('help') || textLower.includes('support')) actions.push('Provide customer support');
    if (textLower.includes('question')) actions.push('Answer customer questions');

    if (actions.length === 0) {
      actions.push('Review customer inquiry', 'Provide appropriate response');
    }

    return actions;
  }

  private findEmailScenario(simulatedData: any, inputLower: string, emailAnalysis: EmailAnalysis): any {
    if (inputLower.includes('billing') || inputLower.includes('invoice') || inputLower.includes('charged')) {
      return simulatedData.scenarios.find((s: any) => s.id === 'support-billing');
    }
    if (inputLower.includes('technical') || inputLower.includes('api') || inputLower.includes('error') || inputLower.includes('403')) {
      return simulatedData.scenarios.find((s: any) => s.id === 'technical-support');
    }
    if (inputLower.includes('feature request') || inputLower.includes('export') || inputLower.includes('functionality')) {
      return simulatedData.scenarios.find((s: any) => s.id === 'feature-request');
    }
    if (inputLower.includes('account') || inputLower.includes('settings') || inputLower.includes('notification')) {
      return simulatedData.scenarios.find((s: any) => s.id === 'account-question');
    }
    return null;
  }
}

// Singleton instance
let agentClient: AgentClient | null = null;

export function getAgentClient(): AgentClient {
  if (!agentClient) {
    agentClient = new AgentClient({ mode: 'simulated' });
  }
  return agentClient;
}

export type { AgentResponse, EmailAnalysis };