import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, firstValueFrom } from 'rxjs';
import { HelpItem } from '../../shared/interfaces/chatbot.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private readonly KNOWLEDGE_BASE_URL = 'assets/chatbot/help-knowledge.json';
  private knowledgeBase: HelpItem[] = [];

  constructor() {
    this.loadKnowledgeBase();
  }

  private async loadKnowledgeBase() {
    try {
      this.knowledgeBase = await firstValueFrom(this.http.get<HelpItem[]>(this.KNOWLEDGE_BASE_URL));
    } catch (error) {
      console.error('Failed to load chatbot knowledge base', error);
    }
  }

  async findMatchingKnowledge(input: string): Promise<HelpItem | null> {
    if (this.knowledgeBase.length === 0) {
      await this.loadKnowledgeBase();
    }

    const query = input.toLowerCase().trim();
    if (query.length < 2) return null;

    const results = this.knowledgeBase.map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();

      // Exact title match (highest priority)
      if (titleLower === query) score += 50;
      else if (titleLower.includes(query)) score += 10;

      // Keyword matching
      item.keywords.forEach(keyword => {
        const kwLower = keyword.toLowerCase();
        if (kwLower === query) score += 30; // Exact keyword match
        else if (query.includes(kwLower)) score += 5; // Long query contains keyword
        else if (kwLower.includes(query)) score += 3; // Keyword contains short query
      });

      return { ...item, score };
    });

    const matches = results.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    return matches.length > 0 ? matches[0] : null;
  }

  getRelatedSuggestions(category: string, currentId: string): string[] {
    return this.knowledgeBase
      .filter(item => item.category === category && item.id !== currentId)
      .map(item => item.title)
      .slice(0, 3); // Return top 3 related questions
  }

  getSuggestedQuestions(): string[] {
    // Return a diverse set of starters
    return [
      "How do I create a course?",
      "How to set pre-recorded course price?",
      "How to add social media links?",
      "Where can I see analytics?",
      "How to add certificates?"
    ];
  }
}
