// Import document classes.
import { AVActor } from "./documents/actor.mjs";
import { AVItem } from "./documents/item.mjs";

// Import sheet classes.
import { AVActorSheet } from "./sheets/actor-sheet.mjs";
import { AVItemSheet } from "./sheets/item-sheet.mjs";

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { AV } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  console.log(`Initializing System`);

  // Add utility classes to the global game object so that they're more easily accessible in global contexts.
  game.av = {
    AVActor,
    AVItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.AV = AV;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d8 + @dexterity.mod",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = AVActor;
  CONFIG.Item.documentClass = AVItem;
  // CONFIG.ActiveEffect.documentClass = AVEffect;

  // Register sheet & item application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("arden-vul", AVActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("arden-vul", AVItemSheet, { makeDefault: true });

  await preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:

// String concatenation handlebar
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

// NotEquals handlebar
Handlebars.registerHelper('noteq', (a, b, options) => {
  return (a !== b) ? options.fn(this) : '';
});

// toLowerCase handlebar
Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});


/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  let args = ['"' + item.name + '"'];
  
  // attach the character name if the speaker is bound to an actor, or has a token selected
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (actor && await AV.confirm("Macro Actor", "Connect macro to '" + actor.name + "'?"))
    args.push('"' + actor.name + '"');

  // Create the macro command
  args = args.join(", ");
  const command = `game.av.rollItemMacro(${args});`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "av.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName, actor = null) {
  const speaker = ChatMessage.getSpeaker();

  // if no actor name is given, use the selected token actor, or the speaker's bound actor
  if (!actor) {
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
  }
  // if an actor name is given, use that actor
  else {
    actor = Array.from(game.actors.values()).find(a => a.name === actor);
  }

  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}