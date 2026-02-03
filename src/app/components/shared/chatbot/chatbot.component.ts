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

  sendMessage(text?: string) {
    const messageText = text || this.userInput;
    if (!messageText.trim()) return;

    // Add user message
    this.messages.push({
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    });

    if (!text) this.userInput = '';

    // Process with chatbot service
    this.processUserMessage(messageText);
  }

  private async processUserMessage(text: string) {
    // Show typing indicator if needed, but for simplicity we'll respond fast
    const match = await this.chatbotService.findMatchingKnowledge(text);

    if (match) {
      this.messages.push({
        id: (Date.now() + 1).toString(),
        text: `I can help with "${match.title}":`,
        sender: 'bot',
        timestamp: new Date(),
        helpData: match
      });
    } else {
      this.addBotMessage("I couldn't find a direct answer for that. Would you like to try one of these common questions?", this.suggestions);
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
