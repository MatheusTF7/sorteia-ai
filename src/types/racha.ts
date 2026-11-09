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
};
