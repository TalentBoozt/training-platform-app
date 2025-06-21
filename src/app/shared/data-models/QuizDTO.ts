import {QuestionDTO} from './QuestionDTO';

export interface QuizDTO {
  id?: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  visibility: string;
  creationDate: string;
  updateDate: string;
  attemptLimit: number;
  questions: QuestionDTO[];
}
