import {ComboEditor, CommonEditor} from "./tools.js";

class IniEditorBase extends CommonEditor {
	/**
	 * @param args
	 * @param {string} args.id
	 * @param {string} args.element
	 * @param {string} args.type
	 * @param {string} args.title
	 * @param {string} args.label
	 */
	constructor(args) {
		super({...args});

		const keys = args.id.split("/");
		this.saveID = keys[0];
		this.saveKey = keys[1];

		this.editor.id = `editor_${this.saveID}_${this.saveKey}`;
		this.editor.name = `editor_${this.saveID}_${this.saveKey}`;

		if (args.label) {
			this.label.htmlFor = this.editor.id;
		}

		if (!IniWidgets[this.saveID]) {
			IniWidgets[this.saveID] = {};
		}
		IniWidgets[this.saveID][this.saveKey] = this;
	}

	/**
	 * @param input
	 * @param {string | string[]} input.data
	 * @param {number | string} input.value
	 */
	logError(input) {
		const message = corruptedError({
			id: `${this.saveID}/${this.saveKey}`,
			title: this.editor.title,
			expected: input.data,
			data: IniData[this.saveID][this.saveKey],
			value: input.value,
		});
		console.warn(message);
		updateStatus({message: message, color: "yellow"});
	}

	addItem(value) {
		const item = document.createElement("option");
		item.text = value;

		this.editor.appendChild(item);
	}

	validateSave() {
		const data = parseFloat(IniData[this.saveID][this.saveKey]);
		switch (this.editor.type) {
			case "number": {
				const max = parseInt(this.editor.max);
				const min = parseInt(this.editor.min);

				if ((data < min) || (data > max)) {
					const value = String(Math.min(max, Math.max(min, data)));
					this.logError({data: `between ${min} and ${max}`, value: value});

					IniData[this.saveID][this.saveKey] = value;
					this.editor.value = value;
				}
				break;
			}
			case "checkbox": {
				const max = parseInt(this.editor.max);
				const min = parseInt(this.editor.min);
				if ((data !== min) && (data !== max)) {
					const value = Math.min(max, Math.max(min, data));
					this.logError({data: `${this.editor.min} or ${this.editor.max}`, value: value});

					IniData[this.saveID][this.saveKey] = String(value);
					this.editor.checked = value > 0;
				}
			}
		}

		this.updateStyle();
	}

	updateOriginal() {
		if (!IniData[this.saveID]) {
			IniData[this.saveID] = {};
		}
		if (!IniData[this.saveID][this.saveKey]) {
			IniData[this.saveID][this.saveKey] = "0.000000"; // The .ini file uses a special notation with its numbers, so we need to add some zeroes
		}

		this.originalValue = IniData[this.saveID][this.saveKey];
		this.validateSave();
		this.updateData();
	}

	/**
	 * @param {string} [data]
	 */
	updateSave() {
		let data;
	
		// Check if the value is a number
		if (!isNaN(this.editor.value)) {
			// If it's a number, add trailing zeroes
			data = `${parseFloat(this.editor.value).toFixed(6)}`;
		} else {
			// If it's not a number, use the value as is
			data = `${this.editor.value}`;
		}
	
		if (!data) {
			data = `${this.editor.value}.000000`; // The .ini file uses a special notation with its numbers, so we need to add some zeroes
		}
	
		if (data === IniData[this.saveID][this.saveKey]) {
			return;
		}
	
		console.log(`Value of ${this.editor.title} changed from ${IniData[this.saveID][this.saveKey]} to ${data}`);
		IniData[this.saveID][this.saveKey] = data;
		this.updateStyle();}

	/**
	 * @param {string} [data]
	 */
	updateData(data) {
		if (!data) {
			data = IniData[this.saveID][this.saveKey];
		}
		super.updateData(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateStyle(data) {
		if (!data) {
			data = IniData[this.saveID][this.saveKey];
		}
		super.updateStyle(data);
	}
}

export class IniLineEditor extends IniEditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "text";
		super({...args});

		switch (args.id) {
			case "General/Name": {
				// noinspection SpellCheckingInspection
				this.addHintText("Your name. Flowey and some menus will reference this");
				break;
			}
		}
	}
}
export class IniCombinedEditor extends IniEditorBase {
	constructor(args) {
	  args.element = "select";
	  super({ ...args });
  
	  this.indexes = {}; // These are manually added for each entry
  
	  switch (args.id) {
		case "Save1/Weapon": {
		  this.addItem("Toy Gun");
		  this.indexes[0] = 0;
		  this.addItem("W. Revoler");
		  this.indexes[1] = 1;
		  break;
		}
		
		case "Save1/Armor": {
			this.addItem("Worn Hat");
			this.indexes[0] = 0;
			this.addItem("Nice Hat");
			this.indexes[1] = 1;
			break;
		}
		case "Save1/Ammo":{
			 /** @type {IniSpinEditor} */
			 this.buddy = args.buddy;
			 this.addItem("Rubber Ammo");
			 this.indexes[0] = 0;
			 this.addItem("Pebbles");
			 this.indexes[1] = 1;
			 this.addItem("Silver Ammo");
			 this.indexes[2] = 2;
			 this.addItem("Coffee Ammo");
			 this.indexes[3] = 3;
			 this.addItem("Glass Ammo");
			 this.indexes[4] = 4;
			 this.addItem("Ice Ammo");
			 this.indexes[5] = 5;
			 this.addItem("Flint Ammo");
			 this.indexes[6] = 6;
			 this.addItem("Nails");
			 this.indexes[7] = 7;
			 this.addItem("F Pellets");
			 this.indexes[8] = 8;
			 this.addItem("Super Ammo");
			 this.indexes[9] = 9;
			 this.buddyValues = [0,3,3,4,5,6,9,10,11,15];
			 break;
			}
		case "Save1/Accessory": {
		  /** @type {IniSpinEditor} */
		  this.buddy = args.buddy;
		  this.addItem("Patch");
		  this.indexes[0] = 0;
		  this.addItem("Feather");
		  this.indexes[1] = 1;
		  this.addItem("Honeydew Pin");
		  this.indexes[2] = 2;
		  this.addItem("Band Merch Pin");
		  this.indexes[3] = 3;
		  this.addItem("Safety Jacket");
		  this.indexes[4] = 4;
		  this.addItem("Silver Scarf");
		  this.indexes[5] = 5;
		  this.addItem("Steel Buckle");
		  this.indexes[6] = 6;
		  this.addItem("Fancy Holster");
		  this.indexes[7] = 7;
		  this.addItem("Safety Goggles");
		  this.indexes[8] = 8;
		  this.addItem("Delta Rune Patch");
		  this.indexes[9] = 9;
		  this.addItem("G. Bandana");
		  this.indexes[10] = 10;
		  
		  this.buddyValues = [0, 2, 4, 0, 5, 6, 7, 8, 9, 10, 12];
		  break;
		}
	  }
	}
  
	callback() {
		// Check if buddy is defined before using it
		if (this.buddy) {
		  this.buddy.editor.value = this.buddyValues[this.editor.selectedIndex];
		  this.buddy.updateSave();
		} else {
		  console.error("No buddy defined for IniCombinedEditor.");
		}
	  }
	}

export class IniArmorEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		// region Values
		this.addItem("Worn Hat");
		this.addItem("Nice Hat");
		// endregion
		this.indexes = {
			"Worn Hat": 0,
			"Nice Hat": 1
		  };

	}
}

export class IniAmmoEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		/** @type {IniSpinEditor} */
		this.buddy = args.buddy;

		// region Values
		this.addItem("Rubber Ammo");
		this.addItem("Pebbles");
		this.addItem("Silver Ammo");
		this.addItem("Coffee Ammo");
		this.addItem("Glass Ammo");
		this.addItem("Ice Ammo");
		this.addItem("Flint Ammo");
		this.addItem("Nails");
		this.addItem("Friendliness Pellets");
		this.addItem("Super Ammo [UNOBTAINABLE]");
		// endregion
		this.atValues = [0,3,3,4,5,6,9,10,11,15];
		this.indexes = {
			"Rubber Ammo": 0,
			"Pebbles": 1,
			"Silver Ammo": 2,
			"Coffee Ammo": 3,
			"Glass Ammo": 4,
			"Ice Ammo": 5,
			"Flint Ammo": 6,
			"Nails": 7,
			"F. Pellets": 8,
			"Super Ammo": 9
		  };

	}

	callback() {
		this.buddy.editor.value = this.atValues[this.editor.selectedIndex];
		this.buddy.updateSave();
	}
}

export class IniSpinEditor extends IniEditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "number";
		super({...args});

		this.editor.min = "0";
		this.editor.max = String(Number.MAX_SAFE_INTEGER);

		// noinspection SpellCheckingInspection
		switch (args.id) {
			case "General/BC": {
				this.addHintText("For those \"Get an item\" trophies on PlayStation");
				break;
			}
			case "General/Gameover": {
				this.addHintText("Keeps track of how many Game Overs you have gotten");
				break;
			}
			case "General/Kills": {
				this.addHintText("Counts how many kills you have made. Used in some menus");
				break;
			}
			case "General/Love": {
				this.addHintText("Your LV. Used in some menus");
				break;
			}
			case "General/Room": {
				this.addHintText("The identifier of the last room you saved in");
				break;
			}
			case "General/Time": {
				this.addHintText("Play time counted using in-game frames");
				break;
			}
			case "General/Won": {
				this.addHintText("Counts how many times you reached an ending");
				break;
			}
			case "General/Fun": {
				this.addHintText("Randomly generated number at the start of the game that determines random events. This value is used in tandem with the \"fun\" in the save file");
				break;
			}
			case "Flowey/CHANGE": {
				this.addHintText("Changes based on if you did or didn't kill on the previous run and did the opposite this run. Can happen twice");
				break;
			}
			case "Flowey/EX": {
				// noinspection SpellCheckingInspection
				this.addHintText("Conversation with Flowey at the end which is unlocked by reaching an ending where you killed at least once, but spared Asgore, didn't complete any dates, and IK or NK is 1");
				break;
			}
			case "Flowey/Met1": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have encountered Flowey for the first time");
				break;
			}
			case "Toriel/Bscotch": {
				// noinspection SpellCheckingInspection
				this.addHintText("Chosen flavor of pie. Toriel will remember this during the phone call. 1 = Butterscotch. 2 = Cinnamon");
				break;
			}
			case "Toriel/TK": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have killed Toriel");
				break;
			}
			case "Toriel/TS": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have spared Toriel");
				break;
			}
			case "Sans/F": {
				this.addHintText("Counts how many times you have fought sans");
				break;
			}
			case "Sans/Intro": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have seen sans's fight intro. It keeps changing based on this number");
				break;
			}
			case "Sans/M1": {
				this.addHintText("Counts how many times you have met sans for the first time");
				break;
			}
			case "Sans/MeetLv": {
				this.addHintText("Counts how many times you have met sans in the judgment hallway while having more than 2 LV");
				break;
			}
			case "Sans/MeetLv1": {
				this.addHintText("Counts how many times you have met sans in the judgment hallway while having 1 LV");
				break;
			}
			case "Sans/MeetLv2": {
				this.addHintText("Counts how many times you have met sans in the judgment hallway while having 2 LV");
				break;
			}
			case "Sans/MP": {
				this.addHintText("(Never used) Counts how many times you have been offered to spare sans");
				break;
			}
			case "Sans/Pass": {
				this.addHintText("Secret codeword counter. You'll hear the first codeword in the judgment hallway, if MeetLv1 is more than 0");
				break;
			}
			case "Sans/SK": {
				this.addHintText("Counts how many times you have killed sans");
				break;
			}
			case "Sans/SS": {
				this.addHintText("Counts how many times you have spared sans");
				break;
			}
			case "Sans/SS2": {
				this.addHintText("Counts how many times you have spared sans again after the first attempt");
				break;
			}
			case "Papyrus/M1": {
				this.addHintText("Counts how many times you have met Papyrus for the first time");
				break;
			}
			case "Papyrus/PD": {
				this.addHintText("Counts how many dates you have completed with Papyrus. Changes title menu");
				break;
			}
			case "Papyrus/PK": {
				this.addHintText("Counts how many times you have killed Papyrus");
				break;
			}
			case "Papyrus/PS": {
				this.addHintText("Counts how many times you have spared Papyrus");
				break;
			}
			case "Undyne/UD": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many dates you have completed with Undyne. Changes title menu");
				break;
			}
			case "Alphys/AD": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many dates you have completed with Alphys. Changes title menu");
				break;
			}
			case "MTT/EssayNo": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many essays you have written about Mettaton");
				break;
			}
			case "Asgore/KillYou": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have died at the Asgore fight. Changes some of the fight dialog");
				break;
			}
			case "FFFFF/D": {
				// noinspection SpellCheckingInspection
				this.addHintText("Counts how many times you have died at the Omega Flowey fight. Changes the dialog when restarting the game");
				break;
			}
			case "FFFFF/E": {
				// noinspection SpellCheckingInspection
				this.addHintText("Sets to 0 after the short credits, 1 after the Omega Flowey fight, and 2 after killing Flowey");
				break;
			}
			case "FFFFF/F": {
				// noinspection SpellCheckingInspection
				this.addHintText("Sets to 0 after the short credits and 1 after the Omega Flowey fight");
				break;
			}
			case "FFFFF/P": {
				// noinspection SpellCheckingInspection
				this.addHintText("Stages of Omega Flowey fight. 1 = start. 2 = knife. 3 = glove. 4 = shoe. 5 = book. 6 = pan. 7 = gun");
				break;
			}
			case "EndF/EndF": {
				// noinspection SpellCheckingInspection
				this.addHintText("Sets to 1 after reaching the True Pacifist ending and 2 after Flowey talks about resetting");
				break;
			}
		}
	}
}

export class IniCheckEditor extends IniEditorBase {
	constructor(args) {
		// noinspection DuplicatedCode
		args.element = "input";
		args.type = "checkbox";
		args.title = args.label;
		super({...args});

		this.retargetContainer();

		this.editorLayout.appendChild(this.label);

		this.editor.min = "0";
		this.editor.max = "1";

		// noinspection SpellCheckingInspection
		switch (args.id) {
			
			case "Save1/FTravel": {
				this.addHintText("Fast Travel enabled (?)");
				break;
			}
			case "Save1/Satchel": {
				this.addHintText("Does it store infinite items?");
				break;
			}
			case "Save1/Follower": {
				this.addHintText("Your follower.");
				break;
			}
			case "Save1/playerCanRun:": {
				this.addHintText("Enables/Disables running (maybe)");
				break;
			}
			
		}
	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = `${this.editor.checked ? this.editor.max : this.editor.min}.000000`;
		}
		super.updateSave(data);
	}
}