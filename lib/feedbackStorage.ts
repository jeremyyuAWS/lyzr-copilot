export interface FeedbackEntry {
  id: string;
  timestamp: string;
  input_preview: string;
  scenario_id?: string;
  rating: 'positive' | 'negative';
  comment: string;
  tags: string[];
  user: string;
  response_data?: any;
}

export class FeedbackStorage {
  private static readonly STORAGE_KEY = 'kb_validator_feedback';

  static getAllFeedback(): FeedbackEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading feedback from localStorage:', error);
    }
    
    // Return demo data if no stored feedback
    return this.getDefaultFeedback();
  }

  static saveFeedback(feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>): FeedbackEntry {
    const newFeedback: FeedbackEntry = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getAllFeedback();
        const updated = [newFeedback, ...existing];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving feedback to localStorage:', error);
      }
    }

    return newFeedback;
  }

  static deleteFeedback(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = this.getAllFeedback();
      const updated = existing.filter(f => f.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  }

  static exportFeedback(): string {
    const feedback = this.getAllFeedback();
    return JSON.stringify(feedback, null, 2);
  }

  static clearAllFeedback(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private static getDefaultFeedback(): FeedbackEntry[] {
    return [
      {
        id: "fb-001",
        timestamp: "2024-12-19T10:30:00Z",
        input_preview: "We are looking for a comprehensive software solution...",
        scenario_id: "rfp-enterprise",
        rating: "positive",
        comment: "Great job identifying the enterprise intent and routing to sales. The extracted items were spot on.",
        tags: ["Intent Correct", "Routing Accurate", "Items Missing"],
        user: "sarah.johnson@company.com"
      },
      {
        id: "fb-002", 
        timestamp: "2024-12-19T09:15:00Z",
        input_preview: "Hi, I'm having trouble with my invoice...",
        scenario_id: "support-billing",
        rating: "negative",
        comment: "The routing should go to billing specialists, not general support. Also missed the urgency of the refund request.",
        tags: ["Routing Needs Update", "Response Too Generic"],
        user: "mike.chen@company.com"
      },
      {
        id: "fb-003",
        timestamp: "2024-12-19T08:45:00Z", 
        input_preview: "Our API integration stopped working yesterday...",
        scenario_id: "technical-support",
        rating: "positive",
        comment: "Perfect technical classification and good identification of critical priority. KB matches were very relevant.",
        tags: ["Intent Correct", "KB Match Helpful", "Gaps Well Identified"],
        user: "alex.rivera@company.com"
      }
    ];
  }
}