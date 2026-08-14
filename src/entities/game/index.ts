/**
 * The game entity: static card data from `docs/rules.md` plus the anemic match
 * model the Effect Matrix operates on.
 *
 * Public surface of the entity — import from here, not from `./data/*` or
 * `./model/*` internals.
 */
export * from './data';
export * from './effects';
export * from './model';
