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
    const results = this.knowledgeBase.map(item => {
      let score = 0;

      // Match title
      if (item.title.toLowerCase().includes(query)) score += 10;

      // Match keywords
      item.keywords.forEach(keyword => {
        if (query.includes(keyword.toLowerCase())) score += 5;
        if (keyword.toLowerCase().includes(query)) score += 3;
      });

      return { ...item, score };
    });

    const bestMatch = results.filter(r => r.score > 0).sort((a, b) => b.score - a.score)[0];
    return bestMatch || null;
  }

  getSuggestedQuestions(): string[] {
    return [
      "How do I create a course?",
      "How do I add lectures?",
      "How do payments work?",
      "Where can I see analytics?",
      "How to edit my profile?"
    ];
  }
}
