import { createClerkClient } from '@clerk/express';

let clerk;
export async function getDisplayName(userId) {
  if (!process.env.CLERK_SECRET_KEY) throw new Error('Clerk is not configured');
  clerk ??= createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await clerk.users.getUser(userId);
  return user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'Blog member';
}
