export const AV = {};

AV.STATS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];


AV.HeroicLevelThreshold = 10;

AV.INV_NONE = "None";
AV.INV_READY = "Readied";
AV.INV_WORN = "Worn";
AV.INV_STOWED = "Stowed";
AV.INV_DROPPED = "Dropped";
AV.INV_CAMP = "Camp";
AV.INV_TOWN = "Town";

AV.ItemLocations = [
	AV.INV_NONE,
	AV.INV_READY,
	AV.INV_WORN,
	AV.INV_STOWED,
  AV.INV_DROPPED,
	AV.INV_CAMP,
	AV.INV_TOWN
];

AV.LOAD_LIGHT = "Light";
AV.LOAD_MEDIUM = "Medium";
AV.LOAD_HEAVY = "Heavy";
AV.LOAD_OVERLOADED = "Overloaded";

AV.LoadLevels = [
	AV.LOAD_LIGHT,
	AV.LOAD_MEDIUM,
	AV.LOAD_HEAVY,
	AV.LOAD_OVERLOADED
];

AV.WeaponProficiencyGroups = [
  "Brawling",
  "Exotic",
  "Great",
  "Missile",
  "Pole",
  "Single",
  "Thrown"
];

AV.WeaponAmmunitionType = [
  "Arrow",
  "Bolt",
  "Stone"
];

AV.ArmorProficiencyGroups = [
  "Light",
  "Medium",
  "Heavy",
  "Shield"
];

AV.PanoplyTypes = [
  "Assistance",
  "Familiar",
  "Implement",
  "Order",
  "Patron",
  "PowerFont",
  "Raiment",
  "Ritual",
  "Sacrament",
  "Sanctity",
  "Sanctum",
  "Talisman",
  "Transfiguration"
];

AV.DamageTypes = [
	"Crushing",
	"Piercing",
	"Slashing",
	"Fire",
	"Frost",
	"Acid",
	"Health",
	"Spirit",
	"Healing"
];

AV.SPELL_NONE = "None";
AV.SPELL_PREPARED = "Prepared";
AV.SPELL_INNATE = "Innate";
AV.SPELL_VESSEL = "Vessel";
AV.SPELL_PANOPLY = "Panoply";
AV.SPELL_CAMP = "Camp";
AV.SPELL_TOWN = "Town";

AV.SpellLocations = [
	AV.SPELL_NONE,
	AV.SPELL_PREPARED,
	AV.SPELL_INNATE,
	AV.SPELL_VESSEL,
	AV.SPELL_PANOPLY,
	AV.SPELL_CAMP,
	AV.SPELL_TOWN
];

AV.StatusOrigins = [
  "Condition",
  "Benefit",
  "Wound",
  "Fatigue",
  "Affliction",
  "Other"
];


// Helper Functions

/**
* Return index of element's location in list, or list.length+1 if not found
*/
AV.ordinal = function(listElement, list) {
  let result = list.findIndex(element => element === listElement);
  return (result == -1) ? list.length+1 : result;
}

AV.locationSort = function(locationSet) {
  return (first, second) => {
    let one = AV.ordinal(first.data.location, locationSet);
    let two = AV.ordinal(second.data.location, locationSet);
    return one - two;
  };
}

/**
* Checks if item is of one of the types specified in the list
*/
AV.isType = function(item, list) {

  let result = list.findIndex(element => element === item.type);
  return (result != -1);
}

/**
* Returns a list of all tags on the items in the given list.
*/
AV.getTags = function (items) {
  return items.map(i => i.data.data.tags).flat().filter(t => t !== null).map(t => t.trim().toLowerCase());
}

/**
* Returns a list of all strings (tags) in a given list which match the given function.  If given an item list, they are first converted to lists of their tags.
*/
AV.getTagMatch = function (input, matchFunction) {
  // get the tags from any items or actors in the input list, output a pure list of string tags
  input = input.map(i => (typeof i !== "string") ? i.data.data.tags : i).flat().filter(t => t !== null).map(t => t.trim().toLowerCase());
  return input.filter(matchFunction);
}

/**
* Parses a list of strings (tags) that begin with a specified prefix and have a : in them.  Returns a list of the post : substring from these tags.
*/
AV.getCodeTags = function(input, codePrefix) {
  codePrefix = codePrefix.trim().toLowerCase();
  return AV.getTagMatch(input, (tag) => tag.startsWith(codePrefix) && tag.includes(":"))
    .map(t => {
      const [first, ...rest] = t.split(":");
      return rest.join(":");
    })
    .filter(t => t.trim() !== "")
}

/**
* Parses a list of strings (tags) that begin with a specified prefix and have a : in them.  Returns the sum of the post : values in these tags.
*/
AV.getCodeTagSum = function(input, codePrefix) {
  return AV.getCodeTags(input, codePrefix)
    .map(t => Number(t))
    .reduce((a,b) => a+b, 0);
}

/**
* Composes the d20 roll for stat check / attacks / spell effects, applying conditions that grant +A/D and other modifiers
*/
AV.getD20 = function(actor, adShift, params = { noFatigue: false, noEncumbrance: false }) {
  // handle advantage / disadvantage on roll
  var dice = (Math.abs(adShift)+1) + "d20";
  if (adShift < 0) dice += "kl1"; else if (adShift > 0) dice += "kh1";

  // apply fatigue
  if (!params || !params.noFatigue) {
    if (actor.data.fatigue.exhaustion)
      dice += "-@fatigue.exhaustion";
  }

  if (!params || !params.noEncumbrance) {
    // apply encumbrance level
    // TODO
  }

  return dice;
}

AV.getDialogField = function(form, fieldname, asNumber = false) {
  var _a;
  let val = (_a = form.querySelector('[name="' + fieldname + '"]')) === null || _a === void 0 ? void 0 : _a.value;
  return (asNumber) ? Number(val) : val;
}

AV.d20Roll = async function(formula, numRolls, rollData, specials = { Crit: [20, 1000], Fumble: [-1000, 1] })
{
  let outcomes = [];

  if (Roll.validate(formula) && numRolls >= 1)
  {
    for (let i=0; i < numRolls; i++)
    {
      let notes = [];

      // handle roll
      const roll = new Roll(formula, rollData);
      await roll.evaluate({async: true});
      const d20 = roll.terms[0].total;
      
      // handle special effect rolls (crit, fumble, etc)
      for (const [key, val] of Object.entries(specials)) {
        if ((val.length == 2 && d20 >= val[0] && d20 <= val[1]) || (val.length == 1 && d20 == val))
          notes.push(key);
      }
      
      notes = (notes.length > 0) ? "(" + notes.join(", ") + ")" : "";
      outcomes[i] = { notes: notes, roll: roll, d20: d20, id: (i+1), rollRender: await roll.render(), formula: formula };
    }
  }
  return outcomes;
}

AV.enterText = async function (text) {
  let templateData = { dialogText: text },
    dlg = await renderTemplate("systems/arden-vul/templates/dialogs/text-prompt.html", templateData);

  return new Promise((resolve) => {
    new Dialog({
      title: "",
      content: dlg,
      buttons: {
        ok: {
          label: "Ok",
          icon: '<i class="fas fa-check"></i>',
          callback: (html) => {
            resolve({
              dialogText: html.find('input[name="dialogText"]').val(),
            });
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
        },
      },
      default: "ok",
    }).render(true);
  });
}

AV.pushText = async function (item, table, index = null) {
  const data = item.data.data;
  let update = duplicate(data[table]);
  let initial = update[index];

  AV.enterText(initial).then((dialogInput) => {
    const text = dialogInput.dialogText.trim();
    if (text === null || text === "")
      return;

    if (update && text)
    {
      if (index === null)
        update.push(text);
      else if (index >= 0 && index < update.length)
        update[index] = text;
    }
    else
    {
      update = [text];
    }

    let newData = {};
    newData[table] = update;
    return item.update({ data: newData });
  });
}

AV.popText = async function (item, table, index) {
  const data = item.data.data;
  let update = duplicate(data[table]);
  update.splice(index, 1);
  let newData = {};
  newData[table] = update;
  return item.update({ data: newData });
}

AV.moveText = async function (item, table, index, shift) {
  const data = item.data.data;
  let update = duplicate(data[table]);
  index = Number(index);
  shift = Number(shift);

  if (index+shift < 0 || index+shift >= update.length)
    return;

  let text = update[index];
  update.splice(index, 1);
  update.splice(index+shift, 0, text);

  let newData = {};
  newData[table] = update;
  return item.update({ data: newData });
}

AV.prompt = async function (title, content, callback = () => { ; }) {
  return Dialog.prompt({ title: title, content: content, callback: callback });
}

AV.confirm = async function (title, content) {
  return Dialog.confirm({
    title: title,
    content: content,
    yes: () => { return true; },
    no: () => { return false; },
    defaultYes: true
  });
}

// TODO have this return the input instead of chatting it
AV.textInput = async function (title) {
  new Dialog({
    title: title,
    content:`
      <form>
        <div class="form-group">
          <label>Input text</label>
          <input type='text' name='inputField'></input>
        </div>
      </form>`,
    buttons:{
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: `Apply Changes`
      }},
    default:'yes',
    close: html => {
      let result = html.find('input[name=\'inputField\']');
      if (result.val()!== '') {
          let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: result.val()
        };
        ChatMessage.create(chatData, {});
        }
      }
  }).render(true);
}

AV.tileControl = function(text, title) {
  let pct = canvas.background.tiles.filter(t => t.data.img.includes(text));
  // let pct = canvas.tiles.objects.children.filter(t => t.document.texture.src.includes(text));
  
  new Dialog({
    title: title,
    content:``,
    buttons:{
      show: {
        label: `Show`,
        callback: (html) => 
          pct.forEach(t => {
            t.document.update({hidden: false, alpha: 0.6});
          })
      },
      full: {
        label: `Full`,
        callback: (html) => 
          pct.forEach(t => {
            t.document.update({hidden: false, alpha: 1.0});
          })
      },
      fade: {
        label: `GM Only`,
        callback: (html) => 
          pct.forEach(t => {
            t.document.update({hidden: true, alpha: 1.0});
          })
      },
      conceal: {
        label: `Hide`,
        callback: (html) => 
          pct.forEach(t => {
            t.document.update({hidden: true, alpha: 0.0});
          })
      },
      cancel: {
        label: `Cancel`
      }
    },
    default:'cancel',
  }).render(true);
}
