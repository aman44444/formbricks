"use server";

import { generateSurveySingleUseId } from "@/app/lib/singleUseSurveys";
import { authOptions } from "@formbricks/lib/authOptions";
import { sendEmbedSurveyPreviewEmail } from "@formbricks/lib/emails/emails";
import { canUserAccessSurvey } from "@formbricks/lib/survey/auth";
import { AuthenticationError, AuthorizationError } from "@formbricks/types/v1/errors";
import { getServerSession } from "next-auth";

type TSendEmailActionArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function generateSingleUseIdAction(surveyId: string, isEncrypted: boolean): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const hasUserSurveyAccess = await canUserAccessSurvey(session.user.id, surveyId);

  if (!hasUserSurveyAccess) throw new AuthorizationError("Not authorized");

  return generateSurveySingleUseId(isEncrypted);
}

export const sendEmailAction = async ({ html, subject, to }: TSendEmailActionArgs) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new AuthenticationError("Not authenticated");
  }
  return await sendEmbedSurveyPreviewEmail(to, subject, html);
};
