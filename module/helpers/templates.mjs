/*
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor sheet partials
//    "systems/redage/templates/actor/parts/actor-features.html",
    "systems/redage/templates/actor/parts/actor-items.html",
//    "systems/redage/templates/actor/parts/actor-spells.html",
//    "systems/redage/templates/actor/parts/actor-effects.html",
//    "systems/redage/templates/actor/parts/actor-statuses.html",

		// Item sheet partials
		"systems/redage/templates/item/parts/item-basics-sheet.html",
		// "systems/redage/templates/item/parts/item-qualities-sheet.html",
		// "systems/redage/templates/item/parts/item-class-core-sheet.html",

  ]);
};
