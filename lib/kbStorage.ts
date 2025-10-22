export interface KBEntry {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'url';
  content: string; // File content or URL
  file_size?: number;
  file_type?: string;
  tags: string[];
  category: string;
  status: 'ready' | 'processing' | 'error';
  confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface KBCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export class KBStorage {
  private static readonly ENTRIES_KEY = 'kb_validator_entries';
  private static readonly CATEGORIES_KEY = 'kb_validator_categories';

  static getAllEntries(): KBEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.ENTRIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading KB entries from localStorage:', error);
    }
    
    return this.getDefaultEntries();
  }

  static getAllCategories(): KBCategory[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.CATEGORIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading KB categories from localStorage:', error);
    }
    
    return this.getDefaultCategories();
  }

  static saveEntry(entry: Omit<KBEntry, 'id' | 'created_at' | 'updated_at'>): KBEntry {
    const newEntry: KBEntry = {
      ...entry,
      id: `kb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getAllEntries();
        const updated = [newEntry, ...existing];
        localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving KB entry to localStorage:', error);
      }
    }

    return newEntry;
  }

  static updateEntry(id: string, updates: Partial<KBEntry>): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = this.getAllEntries();
      const updated = existing.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updated_at: new Date().toISOString() }
          : entry
      );
      localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating KB entry:', error);
    }
  }

  static deleteEntry(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = this.getAllEntries();
      const updated = existing.filter(entry => entry.id !== id);
      localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting KB entry:', error);
    }
  }

  static saveCategory(category: Omit<KBCategory, 'id' | 'created_at'>): KBCategory {
    const newCategory: KBCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getAllCategories();
        const updated = [newCategory, ...existing];
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving KB category to localStorage:', error);
      }
    }

    return newCategory;
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ENTRIES_KEY);
    localStorage.removeItem(this.CATEGORIES_KEY);
  }

  private static getDefaultEntries(): KBEntry[] {
    return [
      {
        id: "kb-001",
        title: "Enterprise_Security_Guidelines_2024.pdf",
        description: "Comprehensive security guidelines including authentication protocols, data protection standards, and compliance requirements for enterprise deployments",
        type: "document",
        content: "",
        file_size: 2340000,
        file_type: "application/pdf",
        tags: ["security", "enterprise", "guidelines", "compliance"],
        category: "technical-docs",
        status: "ready",
        confidence: 0.95,
        created_at: "2024-12-15T10:30:00Z",
        updated_at: "2024-12-15T10:30:00Z"
      },
      {
        id: "kb-002", 
        title: "API Integration Reference",
        description: "Complete API documentation with authentication methods, endpoints, rate limits, and integration examples for third-party systems",
        type: "url",
        content: "https://docs.example.com/api-integration",
        tags: ["api", "integration", "reference", "technical"],
        category: "technical-docs",
        status: "ready",
        confidence: 0.92,
        created_at: "2024-12-14T15:22:00Z",
        updated_at: "2024-12-14T15:22:00Z"
      },
      {
        id: "kb-003",
        title: "Customer_Onboarding_Checklist.docx",
        description: "Step-by-step checklist for onboarding new enterprise customers, including account setup, training schedules, and success metrics",
        type: "document",
        content: "",
        file_size: 856000,
        file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        tags: ["onboarding", "customers", "checklist", "process"],
        category: "support",
        status: "ready",
        confidence: 0.88,
        created_at: "2024-12-13T09:15:00Z",
        updated_at: "2024-12-13T09:15:00Z"
      },
      {
        id: "kb-004",
        title: "Troubleshooting Database Connections",
        description: "Common database connection issues, error codes, diagnostic steps, and resolution procedures for MySQL, PostgreSQL, and MongoDB",
        type: "url", 
        content: "https://support.example.com/database-troubleshooting",
        tags: ["troubleshooting", "database", "mysql", "postgresql", "support"],
        category: "support",
        status: "ready",
        confidence: 0.91,
        created_at: "2024-12-12T14:45:00Z",
        updated_at: "2024-12-12T14:45:00Z"
      },
      {
        id: "kb-005",
        title: "Data_Privacy_Policy_GDPR.pdf",
        description: "GDPR compliance documentation covering data processing, user rights, consent management, and breach notification procedures",
        type: "document",
        content: "",
        file_size: 1890000,
        file_type: "application/pdf", 
        tags: ["privacy", "gdpr", "compliance", "legal", "data-protection"],
        category: "policies",
        status: "ready",
        confidence: 0.94,
        created_at: "2024-12-11T11:20:00Z",
        updated_at: "2024-12-11T11:20:00Z"
      }
    ];
  }

  private static getDefaultCategories(): KBCategory[] {
    return [
      {
        id: "technical-docs",
        name: "Technical Documentation",
        description: "API guides, system architecture, and technical specifications",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "guidelines", 
        name: "Guidelines",
        description: "Best practices, standards, and procedural guidelines",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "support",
        name: "Support Materials", 
        description: "Troubleshooting guides, FAQs, and customer support resources",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "training",
        name: "Training Resources",
        description: "Training materials, tutorials, and educational content", 
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "policies",
        name: "Policies",
        description: "Company policies, legal documents, and compliance materials",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "web-resources",
        name: "Web Resources", 
        description: "External links, online documentation, and web-based resources",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "external-docs",
        name: "External Documentation",
        description: "Third-party documentation and external reference materials",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "reference", 
        name: "Reference Materials",
        description: "Reference guides, specifications, and lookup resources",
        created_at: "2024-12-01T00:00:00Z"
      },
      {
        id: "uncategorized",
        name: "Uncategorized",
        description: "Items that haven't been assigned to a specific category",
        created_at: "2024-12-01T00:00:00Z"
      }
    ];
  }
}