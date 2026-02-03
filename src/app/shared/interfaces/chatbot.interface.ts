export interface HelpItem {
    id: string;
    title: string;
    keywords: string[];
    steps: string[];
    route?: string;
    category: string;
    score?: number; // Used for search matching
}

export interface ChatbotMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    helpData?: HelpItem;
    suggestions?: string[];
}
