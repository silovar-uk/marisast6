(() => {
  const year4 = window.MARISA_YEAR4;
  const api = year4?.api;
  if (!year4 || !api || year4.playbookGuardLoaded) return;
  year4.playbookGuardLoaded = true;

  function createGuardedCards(items) {
    const predicate = card => card && !api.containsRetired(card);
    return api.filterPushableArray(
      (Array.isArray(items) ? items : [])
        .filter(predicate)
        .map(card => api.cleanValue(card)),
      predicate
    );
  }

  api.registerGlobalPatch("MARISA_PLAYBOOK", value => {
    if (!value) return value;

    let cards = createGuardedCards(value.cards);
    Object.defineProperty(value, "cards", {
      configurable: true,
      enumerable: true,
      get() { return cards; },
      set(nextCards) { cards = createGuardedCards(nextCards); }
    });

    year4.changeLog.push("Playbook guard: 後続の配列再代入でも退役技カードを除外");
    return value;
  });
})();
