import { LeaderboardEntry } from '../../../src/types';
import { initialLeaderboard } from '../seedData';
import { db } from '../store';

export class LeaderboardRepository {
  async getByCategory(category?: string): Promise<LeaderboardEntry[]> {
    return db.getLeaderboard(category);
  }

  async save(entry: Partial<LeaderboardEntry> & { name: string; metric: string }): Promise<LeaderboardEntry> {
    return db.saveLeaderboardEntry(entry);
  }

  async delete(id: string): Promise<boolean> {
    return db.deleteLeaderboardEntry(id);
  }
}

export const leaderboardRepository = new LeaderboardRepository();
