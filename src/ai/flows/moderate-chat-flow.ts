
'use server';
/**
 * @fileOverview A content moderation AI flow for chat messages.
 *
 * - moderateChat - A function that handles the chat message moderation.
 * - ModerateChatInput - The input type for the moderateChat function.
 * - ModerateChatOutput - The return type for the moderateChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatInputSchema = z.object({
  text: z.string().describe('The user message to analyze.'),
});
export type ModerateChatInput = z.infer<typeof ModerateChatInputSchema>;

const ModerateChatOutputSchema = z.object({
  isAppropriate: z.boolean().describe('True if the message is appropriate, false otherwise.'),
  moderatedText: z.string().describe('The original message if appropriate, or the censored version if not.'),
});
export type ModerateChatOutput = z.infer<typeof ModerateChatOutputSchema>;

export async function moderateChat(input: ModerateChatInput): Promise<ModerateChatOutput> {
  return moderateChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateChatPrompt',
  input: {schema: ModerateChatInputSchema},
  output: {schema: ModerateChatOutputSchema},
  prompt: `You are a content moderator for a professional chat application. Analyze the following user message. Determine if it contains any profanity, hate speech, or otherwise inappropriate content for a professional setting.
If the message is inappropriate, replace the offensive words with '****'.

Respond with a JSON object. The object must have two fields:
1.  "isAppropriate": A boolean. Set to 'true' if the message is clean and professional, 'false' otherwise.
2.  "moderatedText": A string. This should contain the original message if it is appropriate, or the censored version if it is not.

Message to analyze:
"{{{text}}}"
`,
});

const moderateChatFlow = ai.defineFlow(
  {
    name: 'moderateChatFlow',
    inputSchema: ModerateChatInputSchema,
    outputSchema: ModerateChatOutputSchema,
  },
  async input => {
    // Return early if the input is empty to save an API call
    if (!input.text.trim()) {
      return { isAppropriate: true, moderatedText: '' };
    }
      
    const {output} = await prompt(input);
    return output!;
  }
);
