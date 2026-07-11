export type CaseStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "review_pending"
  | "approved"
  | "rejected";

export interface CaseListItem {
  _id: string;
  status: CaseStatus;
  patientId: string;
  clinicId: string;
  version: number;
  _creationTime: number;
}
