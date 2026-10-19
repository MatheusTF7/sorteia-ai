import wisdom from 'src/assets/potion-explosion/pocao-sabedoria.png';
import blindLove from 'src/assets/potion-explosion/pocao-amor-cego.png';
import magneticAttraction from 'src/assets/potion-explosion/pocao-atracao-magnetica.png';
import prismaticJoy from 'src/assets/potion-explosion/pocao-alegria-prismatica.png';
import abyssalDraft from 'src/assets/potion-explosion/pocao-destilado-abissal.png';
import sandsOfTime from 'src/assets/potion-explosion/pocao-areias-do-tempo.png';
import stickiness from 'src/assets/potion-explosion/pocao-balsamo-da-viscosidade-extrema.png';
import lavamancing from 'src/assets/potion-explosion/pocao-filtro-da-lavamancia.png';
import usa from 'src/assets/heat-pedal-to-the-metal/eua.webp';
import greatBritain from 'src/assets/heat-pedal-to-the-metal/gra-bretanha.png';
import france from 'src/assets/heat-pedal-to-the-metal/franca.webp';
import italy from 'src/assets/heat-pedal-to-the-metal/italia.jpg';
import heat from 'src/assets/heat-pedal-to-the-metal/heat.png';
import stress from 'src/assets/heat-pedal-to-the-metal/stress.png';
import playmat from 'src/assets/heat-pedal-to-the-metal/playmat.jpg';

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
    heat,
    stress,
    playmat,
  },
};
