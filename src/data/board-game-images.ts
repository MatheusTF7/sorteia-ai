import wisdom from 'src/assets/pocao-sabedoria.png';
import blindLove from 'src/assets/pocao-amor-cego.png';
import magneticAttraction from 'src/assets/pocao-atracao-magnetica.png';
import prismaticJoy from 'src/assets/pocao-alegria-prismatica.png';
import abyssalDraft from 'src/assets/pocao-destilado-abissal.png';
import sandsOfTime from 'src/assets/pocao-areias-do-tempo.png';
import stickiness from 'src/assets/pocao-balsamo-da-viscosidade-extrema.png';
import lavamancing from 'src/assets/pocao-filtro-da-lavamancia.png';
import usa from 'src/assets/eua.webp';
import greatBritain from 'src/assets/gra-bretanha.png';
import france from 'src/assets/franca.webp';
import italy from 'src/assets/italia.jpg';

// Keep artwork separate from the rule dataset. Webpack resolves these imports
// against the configured publicPath and includes the files in the PWA precache.
export const boardGameImages: Record<string, Record<string, string>> = {
  'potion-explosion': {
    wisdom,
    'blind-love': blindLove,
    'magnetic-attraction': magneticAttraction,
    'prismatic-joy': prismaticJoy,
    'abyssal-draft': abyssalDraft,
    'sands-of-time': sandsOfTime,
    stickiness,
    lavamancing,
  },
  'heat-pedal-to-the-metal': {
    usa,
    'great-britain': greatBritain,
    france,
    italy,
  },
};
