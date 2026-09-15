// Import document classes.
import { AVActor } from "./documents/actor.mjs";
import { AVItem } from "./documents/item.mjs";

// Import sheet classes.
import { AVActorSheet } from "./sheets/actor-sheet.mjs";
import { AVItemSheet } from "./sheets/item-sheet.mjs";

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { AV } from "./helpers/config.mjs";

const { SchemaField, StringField, BooleanField, ArrayField, NumberField, ObjectField } = foundry.data.fields;

class BaseActorTemplate extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ initial: "" }),
      notes: new StringField({ initial: "" }),
      tags: new ArrayField(new StringField()),
      lock: new BooleanField({ initial: false })
    };
  }
}

class BaseEntityTemplate extends BaseActorTemplate {
  static defineSchema() {
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      strength: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      dexterity: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      constitution: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      intelligence: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      wisdom: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      charisma: new SchemaField({ base: new NumberField({ initial: 10 }) }),
      
      health: new SchemaField({
        value: new NumberField({ initial: 1, min: 0 }),
        temp: new NumberField({ initial: 0 }),
        min: new NumberField({ initial: 0 }),
        max: new NumberField({ initial: 1 })
      }),
      speed: new SchemaField({
        base: new SchemaField({
          min: new NumberField({ initial: 0 }),
          max: new NumberField({ initial: 40 })
        })
      })
    };
  }
}

// ACTOR SUBTYPES
class CharacterData extends BaseEntityTemplate {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      xp: new NumberField({ initial: 0 })
    };
  }
}

class NpcData extends BaseEntityTemplate {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      level: new NumberField({ initial: 1 })
    };
  }
}

class PartyData extends BaseActorTemplate {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      members: new ArrayField(new StringField()) // Assuming IDs or references
    };
  }
}

class BaseItemTemplate extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      group: new StringField({ initial: "none" }),
      description: new StringField({ initial: "" }),
      tags: new ArrayField(new StringField()),
      container: {
        isContainer: new BooleanField({ initial: false }),
        expanded: new BooleanField({ initial: false })
      },
      lock: new BooleanField({ initial: false })
    };
  }
}

class BaseObjectTemplate extends BaseItemTemplate {
  static defineSchema() {
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      group: new StringField({ initial: "item" }),
      quantity: {
        "value": new SchemaField({ base: new NumberField({ initial: 1 }) }),
        "min": new SchemaField({ base: new NumberField({ initial: 0 }) }),
        "max": new SchemaField({ base: new NumberField({ initial: null }) }),
      },
      unitValue: new SchemaField({ base: new NumberField({ initial: 0 }) }),
      unitWeight: new SchemaField({ base: new NumberField({ initial: 0 }) }),
      location: new StringField({ initial: "None" }),
      isLoot: new BooleanField({ initial: false })
    };
  }
}

// Item SUBTYPES
class ItemData extends BaseObjectTemplate {
  static defineSchema() {
    return {
      ...super.defineSchema(),
    };
  }
}


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async () => {

  console.log(`Initializing System`);

  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.npc = NpcData;
  CONFIG.Actor.dataModels.party = PartyData;

  CONFIG.Item.dataModels.item = ItemData;

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

  await foundry.applications.handlebars.loadTemplates([
    "systems/arden-vul/templates/actor/actor-character-sheet.html",
    "systems/arden-vul/templates/item/item-sheet.html",

    "systems/arden-vul/templates/actor/parts/actor-items.html",
    "systems/arden-vul/templates/item/parts/item-basics-sheet.html",
  ]);

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