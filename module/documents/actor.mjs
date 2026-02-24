import { AV } from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AVActor extends Actor {

  /** @override */
  static async create(data, options={}) {

    data.prototypeToken = data.prototypeToken || {};

    // For Character and Party set the Token to sync with charsheet.
    switch (data.type) {
      case 'character':
      case 'npc':
      case 'party':
        data.prototypeToken.actorLink = true;
        break;
    }

    return super.create(data, options);
  }
  
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded documents or derived data.
    // const sys = this.system;

    // switch (this.type) {
    //   case 'character':
    //     // stats
    //     AV.STATS.forEach(stat => {
    //       sys[stat].value = modCalc(sys[stat].base);
    //     });

    //     // find and process class
    //     var charClass = this.system.items.filter(item => item.type == "class").at(0);
    //     if (charClass !== undefined) {
    //       // determine level based on xp and class's array of thresholds
    //       let level = 1;
    //       let attack = 0;
    //       sys.class = { level: level, name: charClass.name, type: charClass.sys.group, HD: charClass.sys.HD, heroicHP: charClass.sys.heroicHP, attack: attack };
    //       // determine base attack bonus
    //       // determine base hp
    //       // determine HD
    //       // determine base saves
    //     }
    //     break;
    //   case 'npc':
    //     break;
    //   case 'party':
    //     break;
    // }
  }

  /** @override */
  prepareEmbeddedDocuments() {
    // Data modifications in this step occur before processing derived data.
  }
  
  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const sys = this.system;
    // const flags = actorData.flags.av || {};

    switch (this.type) {
      case 'character':
        this._prepareCharacterData(sys);
        break;
    //   case 'npc':
    //     this._prepareNpcData(sys);
    //     break;
    //   case 'party':
    //     this._preparePartyData(sys);
    //     break;
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData() {
    if (this.type !== 'character') return;

    // Make modifications to data here. For example:
    // const items = this.system.items;
    // const tags = [...AV.getTags(items), ...sys.tags];

    // AV.STATS.forEach(stat => {
    //   sys[stat].bonus = sys[stat].value - 10;
    //   sys[stat].mod = modCalc(sys[stat].value);
    // })




    // data.characterLevel = this._calculateCharacterLevel(data.xp);

    // ish
    // sys.init = sys.dexterity.mod;  //- sys.fatigue.exhaustion - sys.load.modifier;

    // attack bonus
    // data.attackBonus = this._calculateAttackBonus(items);

    // defense

    // hp
    // data.health.max = 10;
    // data.health.max = this._calculateMaxHealth(items, data.vigor.mod, data.characterLevel);
    // data.health.value = Math.max(0, Math.min(data.health.max, data.health.value));
    // data.health.reserve = Math.max(0, Math.min(data.health.max, data.health.reserve));

    // load

    // speed

    // saves




    // level

    // fatigue
    // data.fatigue.value = items.filter((i) => i.type === "status" && i.data.data.origin.toLowerCase() === "fatigue")
    //   .map((f) => f.data.data.progress.value)
    //   .reduce((currentTotal, newValue) => currentTotal + newValue, 0);
    // data.fatigue.exhaustion = Math.floor(data.fatigue.value / 10);

    // base speed
    // let speedTags = AV.getCodeTags(tags, "speed:");
    // let baseSpeedMod = AV.getCodeTagSum(speedTags, "base:");
    // data.speed.base.value = Math.round((data.speed.base.max + baseSpeedMod) * ((6 - data.fatigue.exhaustion) / 6));
    // data.speed.base.color = (data.speed.base.value > data.speed.base.max) ? "green" : ((data.speed.base.value < data.speed.base.max) ? "red" : "");

    // // create other movemnt speeds
    // data.speed.tooltip = [];
    // speedTags.filter(t => !t.startsWith("base")).forEach(tag => {
    //   let pair = tag.split(":");
    //   if (pair.length != 2) return;
    //   let type = pair[0].trim();
    //   let val = new Roll(pair[1].trim(), { speed: data.speed.base.value });
    //   val = val.evaluate({async: false}).total;
    //   data.speed[type] = val;
    //   data.speed.tooltip.push((type.capitalize() + ": " + val));
    // });
    // data.speed.tooltip = data.speed.tooltip.join("\n");

    // tooltip is penalty for this level of exhaustion
    // data.fatigue.tooltip = (data.fatigue.exhaustion <= 0) ? "" : "Exhaustion " + data.fatigue.exhaustion + ":\n -" + data.fatigue.exhaustion + 
    //   " to all stat-based rolls\n -" + data.fatigue.exhaustion + " max load\n Speed reduced by " + (data.speed.base.max - data.speed.base.value);

    // // armor caps dexterity bonus and mod
    // const armorProperties = this._calculateDefenseBonus(items);
    // data.dexterity.bonus = Math.min(armorProperties.maxDexterityBonus, data.dexterity.bonus);
    // data.dexterity.mod = Math.min(armorProperties.maxDexterityMod, data.dexterity.mod);
    // data.dexterity.save = data.dexterity.mod + (data.dexterity.proficientSave ? data.proficiencyBonus : data.halfProficiencyBonus);
    // data.defenseBonus = armorProperties.defense + data.dexterity.mod;


    // inventory
    // data.readied = { value: this._calculateReadiedItems(items) };
    // let bonusReadied = AV.getCodeTagSum(tags, "readied:");
    // data.readied.max = Math.round(Math.max(data.dexterity.value, data.wits.value) / 2.0) + bonusReadied;

    // data.carried = { value: (this._calculateCarriedItems(items) + data.fatigue.exhaustion) };
    // let bonusCarried = AV.getCodeTagSum(tags, "carried:");
    // data.carried.max = data.vigor.value + bonusCarried;

    // if (data.carried.value <= Math.ceil(data.carried.max / 2))
    //   data.carried.loadLevel = "Light";
    // else if (data.carried.value <= data.carried.max)
    //   data.carried.loadLevel = "Medium";
    // else if (data.carried.value <= Math.ceil(1.5 * data.carried.max))
    //   data.carried.loadLevel = "Heavy";
    // else
    //   data.carried.loadLevel = "Overloaded";

    // mana
    // data.mana.max = this._calculateMaxMana(items);
    // data.mana.value = Math.max(0, Math.min(data.mana.max, data.mana.value));
    // data.mana.reserve = Math.max(0, Math.min(data.mana.max, data.mana.reserve));
    // data.mana.cantrip = Math.max(0, data.mana.cantrip);
  }

  // _calculateReadiedItems(items) {
  // 	let readiedItems = 0;

  //   for (let i of items) {
  //     if (AV.isType(i, ['item', 'weapon', 'armor']) && i.data.data.location == AV.INV_READY) {
  //       if (i.data.data.weight < 1.0) {
  //         // multiple light items take up readied slots = total weight (min 1)
  //         readiedItems += Math.max(1, Math.round(i.data.data.weight * i.data.data.quantity.value));
  //       }
  //       else {
  //         // 1+ weight items take up readied slots = total quantity (regardless of weight)
  //         readiedItems += i.data.data.quantity.value;
  //       }
  //     }
  //   }

  //   return Math.round(readiedItems);
  // }

  // _calculateCarriedItems(items) {
  //   let containers = {};
  //   items.contents
  //     .filter(i => i.data.data.tags.includes("container") &&  !AV.ItemLocations.includes(i.name) && i.data.data.group == "item")
  //     .forEach(i => containers[i.id] = i);

  //   return items.contents.filter(i => i.data.data.group == "item")
  //     .filter(i => {
  //       let loc = i.data.data.location;
  //       let weightless = (containers[loc] !== undefined) ? containers[loc].data.data.tags.includes("weightless") : false;
  //       while (!AV.ItemLocations.includes(loc) && loc !== undefined && !weightless) {
  //         loc = containers[loc].data.data.location;
  //         weightless = (containers[loc] !== undefined) ? containers[loc].data.data.tags.includes("weightless") : false;
  //       }
  //       return (loc == AV.INV_READY || loc == AV.INV_WORN || loc == AV.INV_STOWED);
  //     })
  //     .map(i => Math.round(i.data.data.quantity.value * i.data.data.weight))
  //     .reduce((a,b) => a+b, 0);
  // }

  // _calculateCharacterLevel(xpValue) {
  //   if (xpValue >= 130000) return 8 + Math.floor((xpValue - 130000) / 120000);
  //   else if (xpValue >= 65000) return 7;
  //   else if (xpValue >= 32000) return 6;
  //   else if (xpValue >= 16000) return 5;
  //   else if (xpValue >= 8000) return 4;
  //   else if (xpValue >= 4000) return 3;
  //   else if (xpValue >= 2000) return 2;
  //   return 1;
  // }

  // _calculateAttackBonus(items) {
  //   let classes = items.filter((item) => { return AV.isType(item, ["class", "classCaster", "classFighter"]); });
  //   let returnValue = 0;
  //   let totalLevels = 1;
  //   if (classes.length === 0) return 0;
  //   classes.sort((a, b) => { return b.data.data.attackBonusPerLevel - a.data.data.attackBonusPerLevel; });
  //   for (let c = 0; c < classes.length; c++) {
  //     let thisClassLevels = classes[c].data.data.classLevel;
  //     for (let i = 1; i <= thisClassLevels; i++) {        
  //       if (totalLevels > AV.HeroicLevelThreshold) break;
  //       returnValue += classes[c].data.data.attackBonusPerLevel;
  //       totalLevels++;
  //     }
  //   }
  //   return Math.round(returnValue);
  // }

  // _calculateMaxHealth(items, vigorMod, level) {
  //   let classes = items.filter((item) => { return AV.isType(item, ["class", "classCaster", "classFighter"]); });
  //   let returnValue = 0;
  //   let totalLevels = 1;
  //   classes.sort((a, b) => { return b.data.data.startingHealth - a.data.data.startingHealth; });
  //   if (classes.length > 0)
  //   {
	//   returnValue += classes[0].data.data.startingHealth;
  //   }
  //   classes.sort((a, b) => { return b.data.data.maxHealthPerLevel - a.data.data.maxHealthPerLevel; });
  //   for (let c = 0; c < classes.length; c++) {
  //     let thisClassLevels = classes[c].data.data.classLevel;
  //     for (let i = 1; i <= thisClassLevels; i++) {        
  //       if (totalLevels > AV.HeroicLevelThreshold) 
  //         returnValue += classes[c].data.data.maxHealthPerLevelHeroic;
  //       else 
  //         returnValue += classes[c].data.data.maxHealthPerLevel + vigorMod;
  //       totalLevels++;
  //     }
  //   }
  //   return returnValue;
  // }

	// _calculateDefenseBonus(items) {
  //   let armor = items.filter((item) => { return item.type === "armor"; });
  //   let defense = 0;
  //   let maxDexterityBonus = 100;
  //   let maxDexterityMod = 100;

	// 	for (let c = 0; c < armor.length; c++) {
	// 		// worn and readied armor grants protection (half value if non-proficient)
	// 		if (armor[c].data.data.location === AV.INV_WORN || armor[c].data.data.location === AV.INV_READY) {
	// 			let def = Number(armor[c].data.data.defense) + Number(armor[c].data.data.defenseBonus);
	// 			defense += (armor[c].data.data.isProficient) ? def : Math.floor(def / 2);
	// 		}
	// 		// worn armor caps dex bonus and mod (or +1 and +0, if non-proficient)
	// 		if (armor[c].data.data.location === AV.INV_WORN) {
	// 			maxDexterityBonus = (armor[c].data.data.isProficient) ?
	// 				Math.min(maxDexterityBonus, armor[c].data.data.maxDexterityBonus) : 1;
	// 			maxDexterityMod = (armor[c].data.data.isProficient) ?
	// 				Math.min(maxDexterityMod, armor[c].data.data.maxDexterityMod) : 0;
	// 		}
	// 	}
	// 	return { "defense": defense, "maxDexterityBonus": maxDexterityBonus, "maxDexterityMod": maxDexterityMod };
  // }

  // _calculateMaxMana(items) {
  //   let castingClasses = items.filter((item) => { return item.type === "classCaster"; });
  //   let manaLevel = 0;

	// 	for (let c = 0; c < castingClasses.length; c++) {
  //     manaLevel += castingClasses[c].data.data.classLevel * castingClasses[c].data.data.manaLevel;
	// 	}

  //   manaLevel = Math.ceil(manaLevel);
  //   let mana = [0, 4, 6, 9, 12, 17, 22, 28, 37, 44, 56];
  //   return mana[Math.min(10, manaLevel)] + (2 * Math.max(0, manaLevel-10));
  // }


  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData() {
    if (this.type !== 'npc') return;

    // const items = this.items;
    // const tags = [...AV.getTags(items), ...sys.tags];

    // data.xp = (data.cr * data.cr) * 100;
  }


  /**
   * Prepare Party type specific data
   */
  _preparePartyData() {
    if (this.type !== 'party') return;
  
    // const items = this.items;
    // const tags = [...AV.getTags(items), ...sys.tags];

    // clear out any accidental non-item items from the party
    // items.filter((item) => item.data.data.group !== "item").forEach(i => i.delete());
    
    // data.carried.value = this._calculateCarriedItems(items);

    // if (data.carried.value <= data.carried.max)
    //   data.carried.loadLevel = "Standard";
    // else
    //   data.carried.loadLevel = "Heavy";

    // calculate treasure
    // data.treasure = items.filter((item) => item.data.data.group === 'item' && item.data.data.isLoot && item.data.data.location !== AV.INV_TOWN)
    //   .map((item) => item.data.data.quantity.value * item.data.data.value)
    //   .reduce((a,b) => a+b, 0);
    // data.xp.total = data.xp.bonus + (data.xp.riskMultiplier * data.treasure);
    // data.xp.individual = data.xp.total / data.adventurers;
  }


  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const rollData = super.getRollData();

    // switch (this.type) {
    //   case 'character':
    //     this._getCharacterRollData(rollData);
    //     break;
    //   case 'npc':
    //     this._getNpcRollData(rollData);
    //     break;
    //   case 'party':
    //     this._getPartyRollData(rollData);
    //     break;
    // }

    return rollData;
  }
  
  /**
   * Prepare character roll data.
   */
  // _getCharacterRollData(data) {
  //   if (this.data.type !== 'character') return;

  //   data.vigor = foundry.utils.deepClone(data.vigor);
  //   data.dexterity = foundry.utils.deepClone(data.dexterity);
  //   data.wits = foundry.utils.deepClone(data.wits);
  //   data.spirit = foundry.utils.deepClone(data.spirit);

  //   data.features = foundry.utils.deepClone(data.features);
  // }

  /**
   * Prepare NPC roll data.
   */
  // _getNpcRollData(data) {
  //   if (this.data.type !== 'npc') return;

  //   // Process additional NPC data here.
  // }

    /**
   * Prepare NPC roll data.
   */
    // _getPartyRollData(data) {
    //   if (this.data.type !== 'npc') return;
  
    //   // Process additional NPC data here.
    // }  
}

// function modCalc(val) {
//     if (val <= 3) return Math.max(-1 * val, 0);
//     if (val <= 5) return -2;
//     if (val <= 8) return -1;
//     if (val <= 12) return 0;
//     if (val <= 15) return 1;
//     if (val <= 17) return 2;
//     return val-15;
// }
