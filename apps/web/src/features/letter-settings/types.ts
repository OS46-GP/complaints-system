export interface LetterSettings {
  id: number;
  organizationNameAr: string | null;
  organizationNameEn: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationFax: string | null;
  organizationEmail: string | null;
  organizationWebsite: string | null;
  managerName: string | null;
  managerTitle: string | null;
  managerSignature: string | null;
  seal: string | null;
  responseDefaultDays: number;
  updatedAt: string;
  managerSignatureUrl: string | null;
  sealUrl: string | null;
}

export type LetterSettingImageField = "managerSignature" | "seal";

export interface UpdateLetterSettingsPayload {
  organizationNameAr?: string;
  organizationNameEn?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationFax?: string;
  organizationEmail?: string;
  organizationWebsite?: string;
  managerName?: string;
  managerTitle?: string;
  responseDefaultDays?: number;
}