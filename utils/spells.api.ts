// services/spells.api.ts
import { fetchData, postData, putData, deleteData } from "../utils/api";

// Spell Type definition based on your backend schema
export interface SpellType {
  _id: string;
  type: string;
  description: string;
  idealFor: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpellTypeResponse {
  success: boolean;
  count?: number;
  data?: SpellType | SpellType[];
  message?: string;
}

export interface CreateSpellTypeData {
  type: string;
  description: string;
  idealFor: string;
  icon: string;
}

export const spellsAPI = {
  /**
   * Create a new spell type
   * POST /api/spell-types
   */
  createSpellType: (
    spellData: CreateSpellTypeData,
  ): Promise<SpellTypeResponse> => {
    return postData<SpellTypeResponse>("/spell-types", spellData);
  },

  /**
   * Get all spell types
   * GET /api/spell-types
   */
  getAllSpellTypes: (): Promise<SpellTypeResponse> => {
    return fetchData<SpellTypeResponse>("/spell-types");
  },

  /**
   * Get single spell type by ID
   * GET /api/spell-types/:id
   */
  getSpellTypeById: (id: string): Promise<SpellTypeResponse> => {
    return fetchData<SpellTypeResponse>(`/spell-types/${id}`);
  },

  /**
   * Update spell type
   * PUT /api/spell-types/:id
   */
  updateSpellType: (
    id: string,
    spellData: CreateSpellTypeData,
  ): Promise<SpellTypeResponse> => {
    return putData<SpellTypeResponse>(`/spell-types/${id}`, spellData);
  },

  /**
   * Delete spell type
   * DELETE /api/spell-types/:id
   */
  deleteSpellType: (id: string): Promise<SpellTypeResponse> => {
    return deleteData<SpellTypeResponse>(`/spell-types/${id}`);
  },
};
