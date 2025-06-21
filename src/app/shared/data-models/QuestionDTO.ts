export interface QuestionDTO {
  id: string;
  questionText: string;
  questionType: string;
  required: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
}
