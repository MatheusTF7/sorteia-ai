export type RachaPlayer = {
  id: string;
  name: string;
  goalkeeper: boolean;
  seed: boolean;
  paid: boolean;
};

export type RachaConfig = {
  mode: 'size' | 'seeds';
  teamSize: number;
  defineStarter: boolean;
};

export type RachaState = {
  title: string;
  location: string;
  date: string;
  fee: number;
  players: RachaPlayer[];
  config: RachaConfig;
  teams: string[][];
  starter: string | null;
  drawChanged: boolean;
  ui: {
    newNames: string;
    search: string;
    filter: 'all' | 'goalkeepers' | 'seeds' | 'unpaid';
    detailsOpen: boolean;
    editPlayerId: string;
    editName: string;
    exportOpen: boolean;
    importOpen: boolean;
  };
};
