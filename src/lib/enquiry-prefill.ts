import { getCategory } from "@/lib/events";
import { isPartnerReferralId } from "@/lib/validation";

export function enquiryPrefill(params: URLSearchParams) {
  const candidateCategory = params.get("category") ?? "";
  const candidateReferral = params.get("ref") ?? "";
  return {
    category: getCategory(candidateCategory)?.slug,
    referralId: isPartnerReferralId(candidateReferral) ? candidateReferral.toUpperCase() : undefined,
  };
}
