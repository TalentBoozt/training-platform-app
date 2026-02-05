import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatbotService } from '../../../services/support/chatbot.service';
import { ChatbotMessage, HelpItem } from '../../../shared/interfaces/chatbot.interface';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  private chatbotService = inject(ChatbotService);
  private router = inject(Router);

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatbotMessage[] = [];
  suggestions: string[] = [];

  ngOnInit() {
    this.suggestions = this.chatbotService.getSuggestedQuestions();
    this.addBotMessage("Hi there! I'm your Talnova assistant. How can I help you today?");
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  async sendMessage(text?: string) {
    const messageText = text || this.userInput;
    if (!messageText.trim() || this.isTyping) return;

    // Add user message
    this.messages.push({
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    });

    if (!text) this.userInput = '';

    // Simulate typing
    this.isTyping = true;
    await new Promise(resolve => setTimeout(resolve, 800)); // Short delay for realism

    // Process with chatbot service
    await this.processUserMessage(messageText);
    this.isTyping = false;
  }

  private async processUserMessage(text: string) {
    const match = await this.chatbotService.findMatchingKnowledge(text);

    if (match) {
      const related = this.chatbotService.getRelatedSuggestions(match.category, match.id);
      this.messages.push({
        id: (Date.now() + 1).toString(),
        text: `I found information on "${match.title}":`,
        sender: 'bot',
        timestamp: new Date(),
        helpData: match,
        suggestions: related.length > 0 ? related : undefined
      });
    } else {
      this.addBotMessage("I couldn't find a specific answer for that. Maybe these common questions can help?", this.suggestions);
    }
  }

  private addBotMessage(text: string, suggestions?: string[]) {
    this.messages.push({
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      suggestions
    });
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.isOpen = false;
  }
}
