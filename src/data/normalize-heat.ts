import type { BoardGame, BoardGameRule } from '../types/board-games';
import type { HeatDataset } from '../types/heat';

/** Adapt content once at the boundary, keeping the shared UI dataset-agnostic. */
export function normalizeHeatDataset(data: HeatDataset): BoardGame {
  const steps = new Map(data.playerAid.turnSteps.map((step) => [step.ruleId, step]));
  const modules = new Map(data.modules.map((module) => [module.id, module]));
  const rules = data.playerAid.rules.map((rule): BoardGameRule => {
    const step = steps.get(rule.id);
    return {
      id: rule.id,
      title: rule.title,
      summary: rule.summary,
      details: rule.details ?? [],
      tags: [rule.tags],
      category: rule.id === 'setup' ? 'preparacao' : step ? 'turno' : 'regras',
      module: rule.module,
      moduleName: modules.get(rule.module)?.name ?? rule.module,
      ...(step ? { step: step.step, mandatory: step.mandatory } : {}),
    };
  });

  return {
    schemaVersion: data.schemaVersion,
    id: data.id,
    title: data.name,
    edition: data.edition,
    language: data.locale,
    players: data.players,
    durationMinutes: { min: data.durationMinutes, max: data.durationMinutes },
    disclaimer: data.contentDisclaimer,
    sources: data.sources.map((source, index) => ({ ...source, id: `source-${index}` })),
    ingredients: [],
    setup: rules.filter((rule) => rule.category === 'preparacao'),
    rules: rules
      .filter((rule) => rule.category !== 'preparacao')
      .sort((left, right) => (left.step ?? Infinity) - (right.step ?? Infinity)),
    searchSynonyms: {},
    // implementationNotes also contains development instructions; keep those
    // out of the player-facing content limitations.
    sourceNotes: { weather: data.weatherReference.notes },
    modules: data.modules,
    racingReference: { module: 'base', gears: data.quickReference, circuits: data.circuits },
  };
}
