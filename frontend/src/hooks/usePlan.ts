import { PLAN_HEIGHT, PLAN_URL, PLAN_WIDTH } from "../constants/plan";
import { mediaUrl } from "../utils/mediaUrl";
import { useApi } from "./useApi";

interface SettingsResponse {
  plan?: { url?: string; width?: number; height?: number } | null;
}

export interface PlanInfo {
  url: string;
  width: number;
  height: number;
  provisional: boolean; // vrai tant que l'équipe n'a pas téléversé le vrai plan
  loaded: boolean;
}

// Plan du fort choisi par l'équipe dans l'administration, sinon le plan provisoire
export const usePlan = (): PlanInfo => {
  const { data, loading } = useApi<SettingsResponse>("/settings");
  const plan = data?.plan;

  if (plan?.url && plan.width && plan.height) {
    return { url: mediaUrl(plan.url) ?? plan.url, width: plan.width, height: plan.height, provisional: false, loaded: true };
  }
  return { url: PLAN_URL, width: PLAN_WIDTH, height: PLAN_HEIGHT, provisional: true, loaded: !loading };
};
