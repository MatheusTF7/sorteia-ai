/** Compatible with the existing saved_lists localStorage format. */
export interface SavedParticipantList {
  [key: string]: string | string[] | boolean;
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}
