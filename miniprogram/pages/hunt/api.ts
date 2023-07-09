import { request } from '../../utils/request';

export async function submitHuntScore(openid: string, name: string, score: number): Promise<void> {
  const { statusCode } = await request(`/api/hunt_score?openid=${openid}`, { name, score }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`postHuntScore failed: ${statusCode}`);
  }
}
