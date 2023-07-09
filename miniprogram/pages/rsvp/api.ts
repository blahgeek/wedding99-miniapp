import { request } from '../../utils/request';

export interface RsvpResponse {
  // openid is not part of this interface
  name: string,
  participate: boolean,
  plusOne: boolean,
  needHotel: boolean,
  needHotelStartDate: string,
  needHotelEndDate: string,
  notes: string,
}

export async function getRsvp(openid: string): Promise<RsvpResponse | undefined> {
  const { data, statusCode } = await request(`/api/rsvp?openid=${openid}`);
  if (statusCode === 404) {
    return undefined;
  }
  if (statusCode !== 200) {
    throw new Error(`getRsvp failed: ${statusCode}`);
  }
  return data as RsvpResponse;
}

export async function submitRsvp(openid: string, data: RsvpResponse): Promise<void> {
  const { statusCode } = await request(`/api/rsvp?openid=${openid}`, { openid, ...data }, 'POST');
  if (statusCode !== 200) {
    throw new Error(`submitRsvp failed: ${statusCode}`);
  }
}
