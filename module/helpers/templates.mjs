/*
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor sheet partials
//    "systems/arden-vul/templates/actor/parts/actor-features.html",
    "systems/arden-vul/templates/actor/parts/actor-items.html",
//    "systems/arden-vul/templates/actor/parts/actor-spells.html",
//    "systems/arden-vul/templates/actor/parts/actor-effects.html",
//    "systems/arden-vul/templates/actor/parts/actor-statuses.html",

		// Item sheet partials
		"systems/arden-vul/templates/item/parts/item-basics-sheet.html",
		// "systems/arden-vul/templates/item/parts/item-qualities-sheet.html",
		// "systems/arden-vul/templates/item/parts/item-class-core-sheet.html",

  ]);
};
