export class RankingUpdateDto {
  quizId: string;
  rankings: Array<{
    userId: string;
    username: string;
    score: number;
    position: number;
  }>;
}