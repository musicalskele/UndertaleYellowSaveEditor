export class CommonEditor {
	/**
	 * @param args
	 * @param {string} args.id
	 * @param {string} args.element
	 * @param {string} args.type
	 * @param {string} args.title
	 * @param {string} args.label
	 */
	constructor(args) {
		this.saveID = args.id;

		this.originalValue = "0";

		this.editorLayout = document.createElement("div");
		this.editorLayout.className = "editorLayout";

		this.container = document.createElement("div");
		this.container.className = "editor";
		this.container.onclick = (event) => {
			this.editor.focus();
			event.stopPropagation();
		};
		this.container.appendChild(this.editorLayout);

		this.editor = document.createElement(args.element);
		if (args.type) {
			this.editor.type = args.type;
		}
		this.editor.id = `editor_${this.saveID}`;
		this.editor.name = `editor_${this.saveID}`;
		this.editor.title = args.title ?? args.label ?? "Editor";
		this.editor.value = this.originalValue;
		this.editor.onchange = () => {
			this.validateInput();
			this.callback();
			this.updateSave();
		};
		this.editor.onclick = (event) => {
			event.stopPropagation();
		};

		if (args.label) {
			this.label = document.createElement("label");
			this.label.innerText = args.label;
			this.label.htmlFor = this.editor.id;
			this.label.onclick = (event) => {
				event.stopPropagation();
			};

			this.editorLayout.appendChild(this.label);
		}

		this.editorLayout.appendChild(this.editor);

		setTimeout(() => {
			let parentLabel = args.title ?? this.label?.innerText ?? "Editor";
			let parent = this.container.parentElement;
			while (parent) {
				if (parent.title) {
					parentLabel = `${parent.title} - ${parentLabel}`;
				}

				parent = parent.parentElement;
			}

			this.container.title = parentLabel;
		}, 10);
	}

	retargetContainer() {
		this.container.onclick = (event) => {
			this.editor.click();
			event.stopPropagation();
		};
	}

	/**
	 * @param {string} text
	 */
	addHintText(text) {
		this.hint = document.createElement("div");
		this.hint.className = "hintLabel";
		this.hint.innerHTML = text;

		this.container.appendChild(this.hint);
	}

	validateInput() {
		switch (this.editor.type) {
			case "number": {
				if (!this.editor.value.trim()) {
					this.editor.value = "0";
					console.log(`${this.editor.title} had an empty value`);
				}

				const max = parseInt(this.editor.max);
				const min = parseInt(this.editor.min);
				const value = parseInt(this.editor.value);
				this.editor.value = String(Math.min(max, Math.max(min, value)));

				if (value < min || value > max) {
					updateStatus({message: `Entered value ${value} for ${this.editor.title} was clamped between ${min} and ${max}`, color: "yellow"});
					this.updateSave();
				}
				break;
			}
		}
	}

	/**
	 * @param {string} data
	 */
	updateData(data) {
		switch (this.editor.tagName) {
			case "INPUT": {
				switch (this.editor.type) {
					case "radio": {
						this.editor.checked = parseInt(data) > 0;
						break;
					}
					case "checkbox": {
						this.editor.checked = parseInt(data) >= parseInt(this.editor.max);
						break;
					}
					default: {
						this.editor.value = data;
						break;
					}
				}
				break;
			}
			case "SELECT": {
				this.editor.selectedIndex = data;
				break;
			}
		}

		this.validateInput();
		this.callback();
	}

	callback() {
	}

	// noinspection JSUnusedLocalSymbols
	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		console.log(`Virtual updateSave called in ${this.editor.title}`);
	}

	/**
	 * @param {string} data
	 */
	updateStyle(data) {
		this.container.classList.remove("edited");
		if (data !== this.originalValue) {
			this.container.classList.add("edited");
		}
	}
}

class EditorBase extends CommonEditor {
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

		this.originalValue = SaveData[args.id];
		this.editor.value = this.originalValue;

		if (!Widgets[args.id]) {
			Widgets[args.id] = [];
		}
		Widgets[args.id].push(this);
	}

	/**
	 * @param input
	 * @param {string | string[]} input.expected
	 * @param {number | string} input.value
	 */
	logError(input) {
		const message = corruptedError({
			id: this.saveID,
			title: this.editor.title,
			expected: input.expected,
			data: SaveData[this.saveID],
			value: input.value,
		});
		console.warn(message);
		updateStatus({message: message, color: "yellow"});
	}

	validateSave() {
		const data = parseInt(SaveData[this.saveID]);
		switch (this.editor.type) {
			case "number": {
				const max = parseInt(this.editor.max);
				const min = parseInt(this.editor.min);

				if ((data < min) || (data > max)) {
					const value = String(Math.min(max, Math.max(min, data)));
					this.logError({expected: `between ${min} and ${max}`, value: value});

					SaveData[this.saveID] = value;
					this.editor.value = value;
				}
				break;
			}
			case "checkbox": {
				const max = parseInt(this.editor.max);
				const min = parseInt(this.editor.min);
				if ((data < min) || (data > max)) {
					const value = Math.min(max, Math.max(min, data));
					this.logError({expected: `between ${min} and ${max}`, value: value});

					SaveData[this.saveID] = String(value);
					this.editor.checked = value > 0;
				}
			}
		}

		this.updateStyle();
	}

	updateOriginal() {
		this.originalValue = SaveData[this.saveID];
		this.validateSave();
		this.updateData();
	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = this.editor.value;
		}

		if (data === SaveData[this.saveID]) {
			return;
		}

		console.log(`Value of ${this.editor.title} changed from ${SaveData[this.saveID]} to ${data}`);
		SaveData[this.saveID] = data;
		this.updateStyle(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateData(data) {
		if (!data) {
			data = SaveData[this.saveID];
		}
		super.updateData(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateStyle(data) {
		if (!data) {
			data = SaveData[this.saveID];
		}
		super.updateStyle(data);
	}
}

export class ComboEditor extends EditorBase {
	constructor(args) {
		args.element = "select";
		super({...args});

		this.indexes = {}; // These are manually added for each entry
	}
	addItem(value) {
		const item = document.createElement("option");
		item.value = String(this.editor.options.length);
		item.text = value;

		this.editor.appendChild(item);
	}

	validateInput() {
		let index = this.editor.selectedIndex;
		if ((index === 0) && (this.indexes[SaveData[this.saveID]] === undefined)) {
			const keys = Object.keys(this.indexes);
			index = keys[0];

			const message = corruptedError({
				id: this.saveID,
				title: this.editor.title,
				expected: keys,
				data: SaveData[this.saveID],
				value: index,
			});
			console.warn(message);
			updateStatus({message: message, color: "red"});

			this.editor.selectedIndex = this.indexes[index];
			this.updateSave();
		}
	}

	validateSave() {
		const index = this.indexes[SaveData[this.saveID]];
		if (index === undefined) {
			const value = Object.keys(this.indexes)[0];

			this.logError({expected: Object.keys(this.indexes), value: value});
			SaveData[this.saveID] = value;
			this.editor.selectedIndex = this.indexes[value];
		}
		this.updateStyle();
	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = Object.keys(this.indexes).find(key => this.indexes[key] === this.editor.selectedIndex);
		}
		super.updateSave(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateData(data) {
		if (!data) {
			data = this.indexes[SaveData[this.saveID]];
		}
		super.updateData(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateStyle(data) {
		if (!data) {
			data = SaveData[this.saveID];
		}
		super.updateStyle(data);

		for (const option of this.editor.options) {
			option.style.backgroundColor = null;
		}

		if (data !== this.originalValue) {
			const keys = Object.keys(this.indexes);
			for (const option of this.editor.options) {
				const optionValue = parseInt(option.value);
				const keyValue = keys.find(key => this.indexes[key] === optionValue);
				if (keyValue === this.originalValue) {
					option.style.backgroundColor = "VisitedText";
					break;
				}
			}
		}
	}
}

export class CheckEditor extends EditorBase {
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


	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = this.editor.checked ? this.editor.max : this.editor.min;
		}
		super.updateSave(data);
	}
}

export class YellowCheckEditor extends CheckEditor {
	constructor(args) {
		super({...args});

		switch (args.id) {
			case 67:
			case 112: {
				this.editor.max = "2";
				break;
			}
		}

		// Update the dialog labels, so we don't target the regular editors
		this.editor.id = `yellow_name_editor_${this.saveID}`;
		this.editor.name = `yellow_name_editor_${this.saveID}`;
		if (this.label) {
			this.label.htmlFor = this.editor.id;
			this.label.onclick = (event) => {
				event.stopPropagation();
			};
		}
	}
}

export class LineEditor extends EditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "text";
		super({...args});

		switch (args.id) {
			case 1: {
				const hintText = "Used in dialog and menus";
				this.addHintText(hintText);
				this.callback = () => {
					this.hint.innerHTML = (this.editor.value.length > 6) ? "Easy to change, huh?" : hintText;
				};
				break;
			}
		}
	}
}

export class SpinEditor extends EditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "number";
		super({...args});

		this.editor.min = "0";
		this.editor.max = String(Number.MAX_SAFE_INTEGER);

		switch (args.id) {
			case 2: {
				this.editor.min = "1";
				this.editor.max = "20";
				break;
			}
			case 5: {
				this.addHintText("Base attack power");
				break;
			}
			case 6: {
				this.addHintText("Attack power from your weapon");
				break;
			}
			case 7: {
				this.addHintText("Base defense");
				break;
			}
			case 8: {
				this.addHintText("Defense from your armor");
				break;
			}
			case 10: {
				this.editor.max = "99999";
				break;
			}
			case 12: {
				this.addHintText("Total amount of kills");
				break;
			}
			case 36: {
				this.editor.min = "1";
				this.editor.max = "100";
				const hintTitle = "Used to determine random events.";
				this.addHintText(hintTitle);

				this.callback = () => {
					const value = parseInt(this.editor.value);
					let hintText = "No event";

					if ((value >= 2) && (value <= 39)) {
						hintText = "Wrong Number Song";
					} else if ((value >= 40) && (value <= 45)) {
						// noinspection SpellCheckingInspection
						hintText = "sans's call";
					} else if ((value >= 46) && (value <= 50)) {
						// noinspection SpellCheckingInspection
						hintText = "Alphys's call";
					} else if ((value >= 56) && (value <= 57)) {
						hintText = "Nightmare Mode";
					} else if (value === 61) {
						// noinspection SpellCheckingInspection
						hintText = "Gaster Follower #2";
					} else if (value === 62) {
						// noinspection SpellCheckingInspection
						hintText = "Gaster Follower #1";
					} else if (value === 63) {
						// noinspection SpellCheckingInspection
						hintText = "Gaster Follower #3";
					} else if (value === 65) {
						hintText = "Sound Test Room";
					} else if (value === 66) {
						hintText = "Fake Hallway";
					} else if ((value >= 80) && (value <= 89)) {
						hintText = "Clam Girl";
					} else if ((value >= 91) && (value <= 100)) {
						hintText = "Goner Kid";
					}

					this.hint.innerHTML = `<div>${hintTitle}</div><div>Possible event: <b>${hintText}</b></div>`;
				};
				break;
			}
			case 40: {
				this.addHintText(`Sometimes when backtracking, ${Str_Flowey} will appear briefly and burrow into the ground`);
				break;
			}
			case 56: {
				this.addHintText(`If this is >5, remove a frog from the "four frog" room`);
				break;
			}
			case 57: {
				this.editor.max = "50";
				this.addHintText(`Overrides your "progress" through the genocide route when this is >0`);
				break;
			}
			case 71: {
				this.addHintText(`If this is >3, ${Str_Toriel}'s reaction stays the same`);
				break;
			}
			case 74: {
				this.addHintText("If this is >25, you'll make the switches uncomfortable");
				break;
			}
			case 75: {
				this.addHintText(`If this is >9, ${Str_Toriel}'s reaction stays the same`);
				break;
			}
			case 82: {
				this.addHintText("If this is 2, you'll get a hint about the blue switch in the second room");
				break;
			}
			case 90: {
				this.addHintText(`Checked values during battle: >0, >20, >50<br>Checked values during NPC talk: >0, >12, >24, >39, >69, >99, >8999<br>If this is > 8999, skip ${Str_Muffet}'s battle`);
				break;
			}
			case 94: {
				this.addHintText(`If this is >5, changes ${Str_sans}'s dialog after the puzzle`);
				break;
			}
			case 101: {
				this.addHintText(`0 = ${Str_Snowdrake}<br>1 = ${Str_Ice_Cap}<br>2 (before ${Str_Doggo} = random<br>2 (after ${Str_Doggo}) = ${Str_Lesser_Dog}<br>4 = random`);
				break;
			}
			case 232: {
				this.addHintText("Calculated from regular kills");
				break;
			}
			case 317: {
				this.addHintText(`If this is >16, ${Str_Toriel} has not sent any more messages`);
				break;
			}
			case 318: {
				this.addHintText("Gives you a new message when you move to another room");
				break;
			}
			case 384: {
				// noinspection SpellCheckingInspection
				this.addHintText(`Affects dialog with "Clamguy"<br>If True Pacifist and the puddle is large, a small tree will begin to grow`);
				break;
			}
			case 388: {
				this.addHintText(`0 = ${Str_Aaron}<br>1 = ${Str_Woshua}<br>2 = ${Str_Moldsmal}<br>>2 = random`);
				break;
			}
			case 389: {
				this.addHintText(`0 = ${Str_Temmie}<br>1 = ${Str_Moldsmal} and ${Str_Moldbygg}<br>2 = ${Str_Woshua} and ${Str_Aaron}<br>3 = ${Str_Moldbygg} and ${Str_Woshua}<br>>3 = random`);
				break;
			}
			case 400: {
				this.addHintText("Value 99 skips all messages");
				break;
			}
			case 439: {
				this.addHintText(`0 = ${Str_Vulkin}<br>1 = ${Str_Tsunderplane}<br>2 = ${Str_Pyrope}<br>3 = ${Str_Tsunderplane} and ${Str_Vulkin}<br>4 = ${Str_Pyrope} and ${Str_Pyrope}<br>>4 = random`);
				break;
			}
			case 454: {
				this.addHintText(`0 = ${Str_Whimsalot} and ${Str_Final_Froggit}<br>1 = ${Str_Whimsalot} and ${Str_Astigmatism}<br>2 = ${Str_Knight_Knight} and ${Str_Madjick}<br>>2 = random`);
				break;
			}
			case 457: {
				this.addHintText(`0 = ${Str_Astigmatism}<br>1 = ${Str_Whimsalot} and ${Str_Final_Froggit}<br>2 = ${Str_Whimsalot} and ${Str_Astigmatism}<br>3 = ${Str_Final_Froggit} and ${Str_Astigmatism}<br>4 = ${Str_Knight_Knight} and ${Str_Madjick}<br>>4 = random`);
				break;
			}
			case 493: {
				this.addHintText("Resets after changing rooms<br>Most rooms have more than one conversation");
				break;
			}
			case 517: {
				this.addHintText(`If this is 2, ${Str_Memoryhead} appears<br>If this is 13, you'll get new dialog`);
				break;
			}
			case 526: {
				this.addHintText("If this is 8, the vending machine will be empty");
				break;
			}
			case 535: {
				this.addHintText("Essentially measuring the progress of the fight");
				break;
			}
		}
	}
}

export class RadioEditor extends EditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "radio";
		super({...args});

		this.retargetContainer();

		this.editorLayout.appendChild(this.label);

		this.editor.value = args.id; // Not really used, but will help identify editors
		this.editor.name = args.name; // Needed by the radio buttons

		switch (args.id) {
			case 44: {
				this.addHintText(`Only in ${Str_Ruins}`);
				break;
			}
		}
	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = this.editor.checked ? "1" : "0";
		}
		super.updateSave(data);
	}
}

export class PhoneEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		this.editor.title = `Phone - ${args.title}`;

		// region Values
		this.addItem("None");
		this.addItem("Say Hello");
		this.addItem("Puzzle Help");
		this.addItem("About Yourself");
		this.addItem(`Call Her "Mom"`);
		this.addItem("Flirt");
		// noinspection SpellCheckingInspection
		this.addItem("Toriel's Phone");
		this.addItem("Papyrus's Phone");
		this.addItem("Dimensional Box A");
		this.addItem("Dimensional Box B");
		// endregion

		this.indexes = {0: 0, 201: 1, 202: 2, 203: 3, 204: 4, 205: 5, 206: 6, 210: 7, 220: 8, 221: 9};
	}
}

export class ItemEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		this.editor.title = `Dimensional Box B - ${args.title}`;
		if (args.id <= 340) {
			this.editor.title = `Dimensional Box A - ${args.title}`;
		}
		if (args.id <= 27) {
			this.editor.title = `Inventory - ${args.title}`;
		}

		// region Values
		this.addItem("None");
		this.addItem("Monster Candy");
		this.addItem("Croquet Roll");
		this.addItem("Stick");
		this.addItem("Bandage");
		this.addItem("Rock Candy");
		this.addItem("Pumpkin Rings");
		this.addItem("Spider Donut");
		this.addItem("Stoic Onion");
		this.addItem("Ghost Fruit");
		this.addItem("Spider Cider");
		this.addItem("Butterscotch Pie");
		this.addItem("Faded Ribbon");
		this.addItem("Toy Knife");
		this.addItem("Tough Glove");
		this.addItem("Manly Bandanna");
		this.addItem("Snowman Piece");
		this.addItem("Nice Cream");
		// noinspection SpellCheckingInspection
		this.addItem("Puppydough Ice cream");
		// noinspection SpellCheckingInspection
		this.addItem("Bisicle");
		// noinspection SpellCheckingInspection
		this.addItem("Unisicle");
		this.addItem("Cinnamon Bunny");
		// noinspection SpellCheckingInspection
		this.addItem("Temmie Flakes");
		this.addItem("Abandoned Quiche");
		this.addItem("Old Tutu");
		this.addItem("Ballet Shoes");
		this.addItem("Punch Card");
		this.addItem("Annoying Dog");
		this.addItem("Dog Salad");
		this.addItem("Dog Residue (1)");
		this.addItem("Dog Residue (2)");
		this.addItem("Dog Residue (3)");
		this.addItem("Dog Residue (4)");
		this.addItem("Dog Residue (5)");
		this.addItem("Dog Residue (6)");
		this.addItem("Astronaut Food");
		this.addItem("Instant Noodles");
		this.addItem("Crab Apple");
		this.addItem("Hot Dog...?");
		this.addItem("Hot Cat");
		// noinspection SpellCheckingInspection
		this.addItem("Glamburger");
		this.addItem("Sea Tea");
		// noinspection SpellCheckingInspection
		this.addItem("Starfait");
		this.addItem("Legendary Hero");
		this.addItem("Cloudy Glasses");
		this.addItem("Torn Notebook");
		this.addItem("Stained Apron");
		this.addItem("Burnt Pan");
		this.addItem("Cowboy Hat");
		this.addItem("Empty Gun");
		this.addItem("Heart Locket");
		this.addItem("Worn Dagger");
		this.addItem("Real Knife");
		this.addItem("The Locket");
		this.addItem("Bad Memory");
		this.addItem("Dream");
		this.addItem(`${Str_Undyne_Letter}`);
		this.addItem(`${Str_Undyne_Letter_EX}`);
		// noinspection SpellCheckingInspection
		this.addItem("Potato Chisps");
		this.addItem("Junk Food");
		this.addItem("Mystery Key");
		this.addItem("Face Steak");
		this.addItem("Hush Puppy");
		this.addItem("Snail Pie");
		// noinspection SpellCheckingInspection
		this.addItem("temy armor");
		// endregion
	}

	addItem(value) {
		const index = this.editor.options.length;
		this.indexes[index] = index;

		super.addItem(value);
	}
}

export class WeaponEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		/** @type {SpinEditor} */
		this.buddy = args.buddy;

		// region Values
		this.addItem("Stick");
		this.addItem("Toy Knife");
		this.addItem("Tough Glove");
		this.addItem("Ballet Shoes");
		this.addItem("Torn Notebook");
		this.addItem("Burnt Pan");
		this.addItem("Empty Gun");
		this.addItem("Worn Dagger");
		this.addItem("Real Knife");
		// endregion

		this.atValues = [0, 3, 5, 7, 2, 10, 12, 15, 99];
		this.indexes = {3: 0, 13: 1, 14: 2, 25: 3, 45: 4, 47: 5, 49: 6, 51: 7, 52: 8};

	}

	callback() {
		this.buddy.editor.value = this.atValues[this.editor.selectedIndex];
		this.buddy.updateSave();
	}
}

export class ArmorEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		/** @type {SpinEditor} */
		this.buddy = args.buddy;

		// region Values
		this.addItem("Bandage");
		this.addItem("Faded Ribbon");
		this.addItem("Manly Bandanna");
		this.addItem("Old Tutu");
		this.addItem("Clouded Glasses");
		this.addItem("Stained Apron");
		this.addItem("Cowboy Hat");
		this.addItem("Heart Locket");
		this.addItem("The Locket");
		// noinspection SpellCheckingInspection
		this.addItem("Temmie Armor");
		// endregion

		this.dfValues = [0, 3, 7, 10, 5, 11, 12, 15, 99, 20];
		this.indexes = {4: 0, 12: 1, 15: 2, 24: 3, 44: 4, 46: 5, 48: 6, 50: 7, 53: 8, 64: 9};

	}

	callback() {
		this.buddy.editor.value = this.dfValues[this.editor.selectedIndex];
		this.buddy.updateSave();
	}
}

export class PlotEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		// region Values
		this.addItem(`New Game`);
		this.addItem(`Met ${Str_Flowey}`);
		this.addItem(`${Str_Toriel} escorted you to the next room`);
		this.addItem(`${Str_Toriel} explained puzzles`);
		this.addItem(`Switch puzzle started`);
		this.addItem(`Pulled first switch`);
		this.addItem(`Pulled second switch`);
		this.addItem(`Practice dummy`);
		this.addItem(`Interacted with the dummy`);
		this.addItem(`Dummy encounter done`);
		this.addItem(`Dangerous puzzle started`);
		this.addItem(`Dangerous puzzle ended`);
		this.addItem(`Independence test started`);
		this.addItem(`Independence test ended`);
		this.addItem(`${Str_Toriel} called about leaving the room`);
		this.addItem(`${Str_Toriel} called about pie flavor`);
		this.addItem(`${Str_Toriel} called again`);
		this.addItem(`${Str_Toriel} called about allergies`);
		this.addItem(`Cheered ${Str_Napstablook}`);
		this.addItem(`${Str_Napstablook} encounter done`);
		this.addItem(`Talked with ${Str_Napstablook}`);
		this.addItem(`${Str_Napstablook} disappeared`);
		this.addItem(`${Str_Toriel} called about picking up items`);
		this.addItem(`Hit the switch in a pit`);
		this.addItem(`Pressed a blue switch`);
		this.addItem(`Pressed a red switch`);
		this.addItem(`Pressed a green switch`);
		this.addItem(`Met ${Str_Toriel} again`);
		this.addItem(`${Str_Toriel} told about pie`);
		this.addItem(`${Str_Toriel} showed your room`);
		this.addItem(`Talked with ${Str_Toriel}`);
		this.addItem(`Talked with ${Str_Toriel} more`);
		this.addItem(`Talked with ${Str_Toriel} some more`);
		this.addItem(`Listened about snail facts`);
		this.addItem(`You asked "How to exit the ${Str_Ruins}"`);
		this.addItem(`${Str_Toriel} has to do something`);
		this.addItem(`${Str_Toriel} went to the basement`);
		this.addItem(`${Str_Toriel} is planning to destroy the exit`);
		this.addItem(`${Str_Toriel} warned about ${Str_Asgore}`);
		this.addItem(`${Str_Toriel} warned you for the last time`);
		this.addItem(`${Str_Toriel} encounter done`);
		this.addItem(`Talked with ${Str_Flowey}`);
		this.addItem(`Exited ${Str_Ruins}`);
		this.addItem(`Conveniently-shaped lamp`);
		this.addItem(`${Str_sans} left the area`);
		this.addItem(`${Str_Papyrus} met the human`);
		this.addItem(`${Str_Doggo} encounter done`);
		this.addItem(`${Str_Doggo} went to get dog treats`);
		this.addItem(`Solved the electricity maze`);
		this.addItem(`"Solved" ${Str_sans}'s puzzle`);
		this.addItem(`Found the buried switch`);
		this.addItem(`${Str_Dogamy_and_Dogaressa} encounter done`);
		this.addItem(`${Str_Dogamy_and_Dogaressa} left the area`);
		this.addItem(`Solved the first XO puzzle`);
		this.addItem(`Reached the second XO puzzle`);
		this.addItem(`Solved the second XO puzzle`);
		this.addItem(`Skipped the XO puzzles`);
		this.addItem(`"Solved" the Multicolor Tile Puzzle`);
		this.addItem(`${Str_Greater_Dog} encounter done`);
		this.addItem(`${Str_Greater_Dog} left the area`);
		this.addItem(`Solved the third XO puzzle`);
		this.addItem(`${Str_Greater_Dog} left the area`);
		this.addItem(`"Solved" the final puzzle`);
		this.addItem(`${Str_Papyrus} encounter done`);
		this.addItem(`${Str_Papyrus} left the area`);
		this.addItem(`(unused) ${Str_Monster_Kid} trigger`);
		this.addItem(`${Str_Undyne} spotted you in the sea-grass`);
		this.addItem(`${Str_Papyrus} called about your armor`);
		this.addItem(`Found the hidden door`);
		this.addItem(`(unused) Solved the torch puzzle`);
		this.addItem(`${Str_Undyne} grabbed ${Str_Monster_Kid} in the sea-grass`);
		this.addItem(`Encountered ${Str_Shyren}`);
		this.addItem(`${Str_Monster_Kid} offered to help climb a ledge`);
		this.addItem(`${Str_Monster_Kid} left the area`);
		this.addItem(`Woke up in the Trash Zone`);
		this.addItem(`${Str_Mad_Dummy} encounter done`);
		this.addItem(`${Str_Napstablook} went home`);
		this.addItem(`${Str_Undyne} dragged ${Str_Monster_Kid} away`);
		this.addItem(`Walked to the end of the Echo Flower path`);
		this.addItem(`${Str_Monster_Kid} tripped on a bridge`);
		this.addItem(`${Str_Undyne} confronted you`);
		this.addItem(`${Str_Undyne} encounter done`);
		this.addItem(`${Str_Mettaton}'s game show`);
		this.addItem(`${Str_Alphys} upgraded your phone`);
		this.addItem(`${Str_Alphys} hung up on you`);
		this.addItem(`${Str_Alphys} called about the lasers`);
		this.addItem(`${Str_Alphys} called about the Shooting Puzzles`);
		this.addItem(`Opened the first large door`);
		this.addItem(`${Str_Alphys} called about the puzzles again`);
		this.addItem(`${Str_Alphys} called during ${Str_Mettaton}'s cooking show`);
		this.addItem(`${Str_Mettaton}'s cooking show done`);
		this.addItem(`${Str_Alphys} called about ${Str_Core}`);
		this.addItem(`${Str_Alphys} called about the conveyor puzzle`);
		this.addItem(`${Str_Alphys} tried to help with the timing`);
		this.addItem(`${Str_Alphys} called about going to the bathroom`);
		this.addItem(`${Str_Royal_Guards} encounter done`);
		this.addItem(`Skip ${Str_Hotland} puzzles`);
		this.addItem(`MTT News done`);
		this.addItem(`${Str_Alphys} called about ${Str_Asgore}`);
		this.addItem(`${Str_Alphys} called about the Shooting Puzzles`);
		this.addItem(`Opened the second large door`);
		this.addItem(`${Str_Muffet} encounter done`);
		this.addItem(`${Str_Mettaton} opera`);
		this.addItem(`${Str_Mettaton}'s Multicolor Tile Puzzle done`);
		this.addItem(`Exited ${Str_MTT_Resort}`);
		this.addItem(`${Str_Alphys} called at ${Str_Core} lobby`);
		this.addItem(`Fought the mercenaries`);
		this.addItem(`${Str_Alphys} called about the order of lasers`);
		this.addItem(`${Str_Alphys} called after the lasers`);
		this.addItem(`${Str_Alphys} called at the crossroads`);
		this.addItem(`(unused) Laser event`);
		this.addItem(`${Str_Alphys} called about how everything is under control`);
		this.addItem(`${Str_Alphys} called at the Core Branch`);
		this.addItem(`${Str_Mettaton_EX} encounter done`);
		this.addItem(`${Str_Alphys} told the truth`);
		this.addItem(`${Str_sans} judged you`);
		this.addItem(`Met ${Str_Asgore}`);
		this.addItem(`${Str_Asgore} told how tense this is`);
		this.addItem(`${Str_Asgore} entered the barrier room`);
		this.addItem(`True Pacifist`);
		// endregion

		this.indexes = {
			0: 0,
			1: 1,
			2: 2,
			3: 3,
			4: 4,
			4.5: 5,
			5: 6,
			5.5: 7,
			6: 8,
			7: 9,
			7.5: 10,
			8: 11,
			8.5: 12,
			9: 13,
			9.2: 14,
			9.4: 15,
			9.6: 16,
			9.8: 17,
			10.3: 18,
			10.35: 19,
			10.4: 20,
			11: 21,
			12: 22,
			13: 23,
			14: 24,
			15: 25,
			16: 26,
			17: 27,
			18: 28,
			19: 29,
			19.1: 30,
			19.2: 31,
			19.3: 32,
			19.4: 33,
			19.9: 34,
			20: 35,
			21: 36,
			22: 37,
			23: 38,
			24: 39,
			25: 40,
			28: 41,
			30: 42,
			36: 43,
			37: 44,
			40: 45,
			41: 46,
			42: 47,
			43: 48,
			47: 49,
			49: 50,
			50: 51,
			51: 52,
			53: 53,
			54: 54,
			56: 55,
			57: 56,
			58: 57,
			60: 58,
			61: 59,
			63: 60,
			65: 61,
			67: 62,
			100: 63,
			101: 64,
			104: 65,
			106: 66,
			107: 67,
			108: 68,
			109: 69,
			110: 70,
			111: 71,
			112: 72,
			113: 73,
			115: 74,
			116: 75,
			117: 76,
			118: 77,
			119: 78,
			120: 79,
			121: 80,
			122: 81,
			126: 82,
			127: 83,
			130: 84,
			131: 85,
			132: 86,
			133: 87,
			133.5: 88,
			134: 89,
			135: 90,
			137: 91,
			139: 92,
			140: 93,
			143: 94,
			146: 95,
			160: 96,
			161: 97,
			162: 98,
			163: 99,
			164: 100,
			165: 101,
			167: 102,
			168: 103,
			176: 104,
			177: 105,
			179: 106,
			180: 107,
			181: 108,
			182: 109,
			183: 110,
			184: 111,
			185: 112,
			193: 113,
			199: 114,
			201: 115,
			206: 116,
			207: 117,
			208: 118,
			999: 119
		};
	}
}

export class RoomEditor extends ComboEditor {
	constructor(args) {
		super({...args});

		// region Values
		this.addItem("Ruins - Entrance");
		this.addItem("Ruins - Leaf Pile");
		this.addItem("Ruins - Mouse Hole");
		this.addItem("Ruins - Home");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Box Road");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Spaghetti");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Dog House");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Town");
		this.addItem("Waterfall - Checkpoint");
		this.addItem("Waterfall - Hallway");
		this.addItem("Waterfall - Crystal");
		this.addItem("Waterfall - Bridge");
		this.addItem("Waterfall - Trash Zone");
		this.addItem("Waterfall - Quiet Area");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Temmie Village");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Undyne Arena");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Laboratory Entrance");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Magma Chamber");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Core View");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Bad Opinion Zone");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Spider Entrance");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Hotel Lobby");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Core Branch");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Core End");
		this.addItem("Castle Elevator");
		this.addItem("New Home");
		this.addItem("Last Corridor");
		this.addItem("Throne Entrance");
		this.addItem("Throne Room");
		this.addItem("The End");
		this.addItem("True Laboratory");
		this.addItem("True Lab - Bedroom");
		this.addItem("room_start");
		// noinspection SpellCheckingInspection
		this.addItem("room_introstory");
		// noinspection SpellCheckingInspection
		this.addItem("room_introimage");
		// noinspection SpellCheckingInspection
		this.addItem("room_intromenu");
		this.addItem("room_area1");
		this.addItem("room_area1_2");
		this.addItem("Ruins - 2");
		this.addItem("Ruins - 3");
		this.addItem("Ruins - 4");
		this.addItem("Ruins - 5");
		this.addItem("Ruins - 6");
		this.addItem("Ruins - 7A");
		this.addItem("Ruins - 8");
		this.addItem("Ruins - 9");
		this.addItem("Ruins - 10");
		this.addItem("Ruins - 11");
		this.addItem("Ruins - 12");
		this.addItem("Ruins - 12B");
		this.addItem("Ruins - 13");
		this.addItem("Ruins - 14");
		this.addItem("Ruins - 15A");
		this.addItem("Ruins - 15B");
		this.addItem("Ruins - 15C");
		this.addItem("Ruins - 15D");
		this.addItem("Ruins - 15E");
		this.addItem("Ruins - 16");
		this.addItem("Ruins - 17");
		this.addItem("Ruins - 18OLD");
		this.addItem("Home - Entrance Hall");
		this.addItem("Home - Living Room");
		this.addItem("Home - Hall");
		// noinspection SpellCheckingInspection
		this.addItem("Home - Toriel's Room");
		// noinspection SpellCheckingInspection
		this.addItem("Home - Asriel's Room");
		this.addItem("Home - Kitchen");
		this.addItem("room_basement1");
		this.addItem("room_basement2");
		this.addItem("room_basement3");
		this.addItem("room_basement4");
		this.addItem("room_basement5");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Ruins Exit");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 1");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 2");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 3A");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 4");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 5");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 6");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 6A");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 7");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 8");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 8A");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - 9");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Snow Puzzle");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - XO Puzzle (Small)");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - XO Puzzle (Papyrus)");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Tile Puzzle");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - icehole");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - iceentrance");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - iceexit_new");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - iceexit");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Snow Poff Zone");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Dangerous Bridge Puzzle");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - town2");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Dock");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Snowed Inn");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Snowed Inn (2nd floor)");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Grillby's");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Library");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Garage");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Papyrus's and sans's House");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Papyrus's Room");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - sans's Room");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - sans's Room (Dark)");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - sans's Basement");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - Foggy Hallway");
		this.addItem("Waterfall - 1");
		this.addItem("Waterfall - 3");
		this.addItem("Waterfall - 3A");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - bridgepuzz1");
		this.addItem("Waterfall - 5");
		this.addItem("Waterfall - 5A");
		this.addItem("Waterfall - 6");
		this.addItem("Waterfall - 7");
		this.addItem("Waterfall - 8");
		this.addItem("Waterfall - 9");
		this.addItem("Waterfall - 11");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - nicecream");
		this.addItem("Waterfall - 12");
		this.addItem("Waterfall - shoe");
		this.addItem("Waterfall - bird");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Onionsan");
		this.addItem("Waterfall - 14");
		this.addItem("Waterfall - Piano Puzzle");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - dogroom");
		this.addItem("Waterfall - Music Box Statue");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - prewaterfall");
		this.addItem("Waterfall - waterfall");
		this.addItem("Waterfall - waterfall2");
		this.addItem("Waterfall - waterfall3");
		this.addItem("Waterfall - waterfall4");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - undynebridge");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - undynebridgeend");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - trashzone1");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - trashzone2");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Undyne's Yard");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Undyne's House");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Blooky's Yard");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Blooky's House");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - hapstablook");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Blook Farm");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - prebird");
		this.addItem("Waterfall - Gerson's Shop");
		this.addItem("Waterfall - Dock");
		this.addItem("Waterfall - 15");
		this.addItem("Waterfall - 16");
		this.addItem("Waterfall - 17");
		this.addItem("Waterfall - 18");
		this.addItem("Waterfall - 19");
		this.addItem("Waterfall - 20");
		this.addItem("Waterfall - Puzzle Elder");
		this.addItem("Waterfall - Arena Exit");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - Hotland Entrance");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - sans's Station");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Water Cooler");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Dock");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - lab1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - lab2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 3");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 5");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 6A");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - lasers1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 7");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 8");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - shootguy_2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 9");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - shootguy_1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - turn");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - cookingshow");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_r1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_r2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - hotdog");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - walkandbranch");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - sorry");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - apron");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 10");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - rpuzzle");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - boysnightout");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - newsreport");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - coreview2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_l2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_l3");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - spidershop");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - walkandbranch2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - conveyorlaser");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - shootguy_3");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - preshootguy4");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - shootguy_4");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Spider's Web");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - pacing");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - operatest");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - Tile Puzzle EX");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - hotelfront_1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - hotelfront_2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotel - Restaurant");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - hoteldoors");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - hotelbed");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_r3");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - precore");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core2");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core3");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core4");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core5");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_freebattle");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_laserfun");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_bottomleft");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_left");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_topleft");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_top");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_topright");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_right");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_bottomright");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_center");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - shootguy_5");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_treasureleft");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_treasureright");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_warrior");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_bridge");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_metttest");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - core_final");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - elevator_l1");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - finalelevator");
		// noinspection SpellCheckingInspection
		this.addItem("room_castle_precastle");
		this.addItem("room_castle_hook");
		// noinspection SpellCheckingInspection
		this.addItem("room_asghouse1");
		// noinspection SpellCheckingInspection
		this.addItem("room_asghouse2");
		// noinspection SpellCheckingInspection
		this.addItem("room_asghouse3");
		// noinspection SpellCheckingInspection
		this.addItem("room_asgoreroom");
		// noinspection SpellCheckingInspection
		this.addItem("room_asrielroom_final");
		this.addItem("room_kitchen_final");
		this.addItem("room_basement1_final");
		this.addItem("room_basement2_final");
		this.addItem("room_basement3_final");
		this.addItem("room_basement4_final");
		// noinspection SpellCheckingInspection
		this.addItem("room_lastruins_corridor");
		this.addItem("room_castle_coffins1");
		this.addItem("room_castle_coffins2");
		this.addItem("room_castle_barrier");
		this.addItem("room_castle_exit");
		this.addItem("room_undertale_end");
		// noinspection SpellCheckingInspection
		this.addItem("room_castle_trueexit");
		// noinspection SpellCheckingInspection
		this.addItem("room_outsideworld");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - labelevator");
		// noinspection SpellCheckingInspection
		this.addItem("True Lab - elevatorinside");
		this.addItem("True Lab - elevator");
		this.addItem("True Lab - hall1");
		this.addItem("True Lab - hall2");
		// noinspection SpellCheckingInspection
		this.addItem("True Lab - operatingroom");
		this.addItem("True Lab - Red Lever");
		// noinspection SpellCheckingInspection
		this.addItem("True Lab - prebed");
		this.addItem("True Lab - mirror");
		this.addItem("True Lab - Blue Lever");
		this.addItem("True Lab - hall3");
		this.addItem("True Lab - shower");
		this.addItem("True Lab - determination");
		this.addItem("True Lab - tv");
		this.addItem("True Lab - cooler");
		this.addItem("True Lab - Green Lever");
		this.addItem("True Lab - fan");
		this.addItem("True Lab - castle_elevator");
		// noinspection SpellCheckingInspection
		this.addItem("True Lab - prepower");
		this.addItem("True Lab - power");
		// noinspection SpellCheckingInspection
		this.addItem("room_gaster");
		// noinspection SpellCheckingInspection
		this.addItem("room_icecave1");
		this.addItem("room_ice_dog");
		this.addItem("room2");
		// noinspection SpellCheckingInspection
		this.addItem("Waterfall - fakehallway");
		// noinspection SpellCheckingInspection
		this.addItem("room_mysteryman");
		// noinspection SpellCheckingInspection
		this.addItem("room_soundtest");
		// noinspection SpellCheckingInspection
		this.addItem("TESTROOM");
		this.addItem("Waterfall - redacted");
		this.addItem("Waterfall - 13");
		// noinspection SpellCheckingInspection
		this.addItem("room_overworld");
		// noinspection SpellCheckingInspection
		this.addItem("room_overworld3");
		// noinspection SpellCheckingInspection
		this.addItem("bullettest");
		this.addItem("Waterfall - 16A");
		// noinspection SpellCheckingInspection
		this.addItem("room_end_castroll");
		this.addItem("room_end_highway");
		this.addItem("room_end_beach");
		this.addItem("room_end_metta");
		this.addItem("room_end_school");
		// noinspection SpellCheckingInspection
		this.addItem("room_end_mtebott");
		// noinspection SpellCheckingInspection
		this.addItem("room_creditsdodger");
		// noinspection SpellCheckingInspection
		this.addItem("room_end_myroom");
		// noinspection SpellCheckingInspection
		this.addItem("room_end_theend");
		// noinspection SpellCheckingInspection
		this.addItem("room_spritecheck");
		// noinspection SpellCheckingInspection
		this.addItem("room_joyconfig");
		// noinspection SpellCheckingInspection
		this.addItem("room_controltest");
		this.addItem("room_f_start");
		this.addItem("room_f_intro");
		this.addItem("room_f_menu");
		this.addItem("room_f_room");
		// noinspection SpellCheckingInspection
		this.addItem("room_floweyx");
		this.addItem("room_f_phrase");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 4");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 10_old");
		// noinspection SpellCheckingInspection
		this.addItem("Hotland - 10A_old");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - placeholder");
		this.addItem("Ruins - 12B_old");
		// noinspection SpellCheckingInspection
		this.addItem("Snowdin - rollsnow");
		this.addItem("Waterfall - 7_older");
		// noinspection SpellCheckingInspection
		this.addItem("room_meetundyne_old");
		this.addItem("Waterfall - mushroom");
		// noinspection SpellCheckingInspection
		this.addItem("room_monsteralign_test");
		this.addItem("room_battle");
		// noinspection SpellCheckingInspection
		this.addItem("room_floweybattle");
		// noinspection SpellCheckingInspection
		this.addItem("room_fastbattle");
		// noinspection SpellCheckingInspection
		this.addItem("room_storybattle");
		// noinspection SpellCheckingInspection
		this.addItem("room_gameover");
		this.addItem("room_shop1");
		this.addItem("room_shop2");
		this.addItem("room_shop3");
		this.addItem("room_shop4");
		this.addItem("room_shop5");
		// noinspection SpellCheckingInspection
		this.addItem("room_riverman_transition");
		// noinspection SpellCheckingInspection
		this.addItem("room_papdate");
		// noinspection SpellCheckingInspection
		this.addItem("room_adate");
		// noinspection SpellCheckingInspection
		this.addItem("room_flowey_endchoice");
		// noinspection SpellCheckingInspection
		this.addItem("room_flowey_regret");
		this.addItem("room_empty");
		// noinspection SpellCheckingInspection
		this.addItem("room_emptywhite");
		// noinspection SpellCheckingInspection
		this.addItem("room_emptyblack");
		this.addItem("room_nothingness");
		this.addItem("room_undertale");
		this.addItem("room_of_dog");
		// noinspection SpellCheckingInspection
		this.addItem("room_quizholder");
		// noinspection SpellCheckingInspection
		this.addItem("room_friendtest");
		// noinspection SpellCheckingInspection
		this.addItem("room_bringitinguys");
		// noinspection SpellCheckingInspection
		this.addItem("room_asrielappears");
		// noinspection SpellCheckingInspection
		this.addItem("room_goodbyeasriel");
		// noinspection SpellCheckingInspection
		this.addItem("room_asrielmemory");
		// noinspection SpellCheckingInspection
		this.addItem("room_asrieltest");
		// noinspection SpellCheckingInspection
		this.addItem("room_afinaltest");
		// endregion

		this.indexes = {
			6: 0,
			12: 1,
			18: 2,
			31: 3,
			46: 4,
			56: 5,
			61: 6,
			68: 7,
			83: 8,
			86: 9,
			94: 10,
			110: 11,
			114: 12,
			116: 13,
			128: 14,
			134: 15,
			139: 16,
			145: 17,
			155: 18,
			164: 19,
			176: 20,
			183: 21,
			196: 22,
			210: 23,
			216: 24,
			219: 25,
			231: 26,
			232: 27,
			235: 28,
			236: 29,
			246: 30,
			251: 31,
			0: 32,
			1: 33,
			2: 34,
			3: 35,
			4: 36,
			5: 37,
			7: 38,
			8: 39,
			9: 40,
			10: 41,
			11: 42,
			13: 43,
			14: 44,
			15: 45,
			16: 46,
			17: 47,
			19: 48,
			20: 49,
			21: 50,
			22: 51,
			23: 52,
			24: 53,
			25: 54,
			26: 55,
			27: 56,
			28: 57,
			29: 58,
			30: 59,
			32: 60,
			33: 61,
			34: 62,
			35: 63,
			36: 64,
			37: 65,
			38: 66,
			39: 67,
			40: 68,
			41: 69,
			42: 70,
			43: 71,
			44: 72,
			45: 73,
			47: 74,
			48: 75,
			49: 76,
			50: 77,
			51: 78,
			52: 79,
			53: 80,
			54: 81,
			55: 82,
			57: 83,
			58: 84,
			59: 85,
			60: 86,
			62: 87,
			63: 88,
			64: 89,
			65: 90,
			66: 91,
			67: 92,
			69: 93,
			70: 94,
			71: 95,
			72: 96,
			73: 97,
			74: 98,
			75: 99,
			76: 100,
			77: 101,
			78: 102,
			79: 103,
			80: 104,
			81: 105,
			82: 106,
			84: 107,
			85: 108,
			87: 109,
			88: 110,
			89: 111,
			90: 112,
			91: 113,
			92: 114,
			93: 115,
			95: 116,
			96: 117,
			97: 118,
			98: 119,
			99: 120,
			100: 121,
			101: 122,
			102: 123,
			103: 124,
			104: 125,
			105: 126,
			106: 127,
			107: 128,
			108: 129,
			109: 130,
			111: 131,
			112: 132,
			113: 133,
			115: 134,
			117: 135,
			118: 136,
			119: 137,
			120: 138,
			121: 139,
			122: 140,
			123: 141,
			124: 142,
			125: 143,
			126: 144,
			127: 145,
			129: 146,
			130: 147,
			131: 148,
			132: 149,
			133: 150,
			135: 151,
			136: 152,
			137: 153,
			138: 154,
			140: 155,
			141: 156,
			142: 157,
			143: 158,
			144: 159,
			146: 160,
			147: 161,
			148: 162,
			149: 163,
			150: 164,
			151: 165,
			152: 166,
			153: 167,
			154: 168,
			156: 169,
			157: 170,
			158: 171,
			159: 172,
			160: 173,
			161: 174,
			162: 175,
			163: 176,
			165: 177,
			166: 178,
			167: 179,
			168: 180,
			169: 181,
			170: 182,
			171: 183,
			172: 184,
			173: 185,
			174: 186,
			175: 187,
			177: 188,
			178: 189,
			179: 190,
			180: 191,
			181: 192,
			182: 193,
			184: 194,
			185: 195,
			186: 196,
			187: 197,
			188: 198,
			189: 199,
			190: 200,
			191: 201,
			192: 202,
			193: 203,
			194: 204,
			195: 205,
			197: 206,
			198: 207,
			199: 208,
			200: 209,
			201: 210,
			202: 211,
			203: 212,
			204: 213,
			205: 214,
			206: 215,
			207: 216,
			208: 217,
			209: 218,
			211: 219,
			212: 220,
			213: 221,
			214: 222,
			215: 223,
			217: 224,
			218: 225,
			220: 226,
			221: 227,
			222: 228,
			223: 229,
			224: 230,
			225: 231,
			226: 232,
			227: 233,
			228: 234,
			229: 235,
			230: 236,
			233: 237,
			234: 238,
			237: 239,
			238: 240,
			239: 241,
			240: 242,
			241: 243,
			242: 244,
			243: 245,
			244: 246,
			245: 247,
			247: 248,
			248: 249,
			249: 250,
			250: 251,
			252: 252,
			253: 253,
			254: 254,
			255: 255,
			256: 256,
			257: 257,
			258: 258,
			259: 259,
			260: 260,
			261: 261,
			262: 262,
			263: 263,
			264: 264,
			265: 265,
			266: 266,
			267: 267,
			268: 268,
			269: 269,
			270: 270,
			271: 271,
			272: 272,
			273: 273,
			274: 274,
			275: 275,
			276: 276,
			277: 277,
			278: 278,
			279: 279,
			280: 280,
			281: 281,
			282: 282,
			283: 283,
			284: 284,
			285: 285,
			286: 286,
			287: 287,
			288: 288,
			289: 289,
			290: 290,
			291: 291,
			292: 292,
			293: 293,
			294: 294,
			295: 295,
			296: 296,
			297: 297,
			298: 298,
			299: 299,
			300: 300,
			301: 301,
			302: 302,
			303: 303,
			304: 304,
			305: 305,
			306: 306,
			307: 307,
			308: 308,
			309: 309,
			310: 310,
			311: 311,
			312: 312,
			313: 313,
			314: 314,
			315: 315,
			316: 316,
			317: 317,
			318: 318,
			319: 319,
			320: 320,
			321: 321,
			322: 322,
			323: 323,
			324: 324,
			325: 325,
			326: 326,
			327: 327,
			328: 328,
			329: 329,
			330: 330,
			331: 331,
			332: 332,
			333: 333,
			334: 334
		};
	}
}

export class TimeEditor extends EditorBase {
	constructor(args) {
		args.element = "input";
		args.type = "number";
		super({...args});

		this.editor.min = "0";
		this.editor.max = String(Number.MAX_SAFE_INTEGER);

		this.addHintText("00:00:00");
	}

	callback() {
		const data = this.editor.value;
		// Using precalculated magic numbers for quickly converting the frames into time units
		const h = String(Math.floor(data * 0.000009259)).padStart(2, "0");
		const m = String(Math.floor((data * 0.000555555) % 60)).padStart(2, "0");
		const s = String(Math.floor((data * 0.033333333) % 60)).padStart(2, "0");

		this.hint.innerHTML = `<div>Your estimated play time is <b>${h}:${m}:${s}</b>.</div><div>This is calculated from in-game frames</div>`;
	}

	/**
	 * @param {string} [data]
	 */
	updateSave(data) {
		if (!data) {
			data = String(parseFloat(this.editor.value).toExponential());
		}
		super.updateSave(data);
	}

	/**
	 * @param {string} [data]
	 */
	updateData(data) {
		if (!data) {
			data = parseFloat(SaveData[this.saveID]).toFixed(0);
		}
		super.updateData(data);
	}
}
