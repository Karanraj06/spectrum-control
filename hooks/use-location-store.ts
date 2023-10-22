import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  setLatitude: (latitude: number) => void;
  setLongitude: (longitude: number) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  latitude: null,
  longitude: null,
  setLatitude: (latitude: number) => set({ latitude }),
  setLongitude: (longitude: number) => set({ longitude }),
}));
