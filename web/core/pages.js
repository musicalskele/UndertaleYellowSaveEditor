import * as Tools from "./tools.js";
import * as IniTools from "./initools.js";

export const DebugPage = () => {
	"use strict";

	const contents = document.createElement("div");
	contents.className = "filePage pageContent hidden";

	contents.appendChild(new Tools.CheckEditor({id: 35, label: "Bypass kill counters"}).container);
	contents.appendChild(new Tools.SpinEditor({id: 57, label: "Murder level override"}).container);
	contents.appendChild(new Tools.CheckEditor({id: 59, label: "Debug text skip"}).container);

	return contents;
};

export const PlayerPage = () => {
	"use strict";
	/** @type {PageObject[]} */
	const tabPages = [
		{
			target: document.createElement("div"),
			config: {
				image: "images/ico_clover.png",
				text: "Character",
			},
		},
		{
			target: document.createElement("div"),
			config: {
				image: "images/ico_ribbon.png",
				text: "Equipment",
			},
		},
		{
			target: document.createElement("div"),
			config: {
				image: "images/ico_ribbon.png",
				text: "Other/Misc",
			},
		},
		
	];
	let pageIndex = 0;
	let page = tabPages[pageIndex++];
	const stats = new GroupBox("Stats");
	const ammoAT = new IniTools.IniSpinEditor({id: "Save1/AT - Secondary", label: "ATK from Equipped Ammo"});
	
	const armorDFS = new IniTools.IniSpinEditor({id: "Save1/DFS", label: "DF from Equipped Accessory"});
	stats.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/Follower", label: "Your Follower" }).container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/Gold", label: "Your Gold)" }).container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/EXP", label: "Your EXP" }).container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/LV", label: "Your LV" }).container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/DFP", label: "DF from LV" }).container);
	stats.content.appendChild(armorDFS.container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/AT - Primary", label: "ATK from LV" }).container);
	stats.content.appendChild(ammoAT.container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/MAXHP", label: "Your Maximum HP" }).container);
	stats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/HP", label: "Your Current HP" }).container);
	page.target.appendChild(stats.container);
	page = tabPages[pageIndex++];
	const equipment = new GroupBox("Equipment");
	equipment.content.appendChild(new IniTools.IniCombinedEditor({id:"Save1/Ammo", label: "Ammo", buddy: ammoAT}).container);
	equipment.content.appendChild(new IniTools.IniCombinedEditor({id:"Save1/Accessory", label: "Accessory", buddy: armorDFS}).container);
	equipment.content.appendChild(new IniTools.IniCombinedEditor({id:"Save1/Armor", label: "Armor"}).container);
	equipment.content.appendChild(new IniTools.IniCombinedEditor({ id: "Save1/Weapon", label: "Equipped Weapon" }).container);
	equipment.content.appendChild(new IniTools.IniCheckEditor({ id: "Save1/Satchel", label: "Dimensional Satchel" }).container);
	page.target.appendChild(equipment.container);
	const items = new GroupBox("Items");
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/00", label: "Item 0"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/01", label: "Item 1"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/02", label: "Item 2"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/03", label: "Item 3"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/04", label: "Item 4"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/05", label: "Item 5"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/06", label: "Item 6"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/07", label: "Item 7"}).container);
	page.target.appendChild(items.container);
	page = tabPages[pageIndex++];
	const playtime = new GroupBox("Playtime");
	playtime.content.appendChild(new IniTools.IniLineEditor({id: "Playtime/Seconds", label: "Seconds"}).container);
	page.target.appendChild(playtime.container);

	const save1 = new GroupBox("Other");
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/Menu", label: "Menu Sprite" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/FUN", label: "FUN Value" }).container);
	
	save1.content.appendChild(new IniTools.IniCheckEditor({ id: "Save1/playerCanRun:", label: "Enable/Disable Running" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/playerSprite", label: "Sprite Variation" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/rmName", label: "Room Name (Menu)" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/FTravel", label: "Fast Travel Enabled" }).container);
	page.target.appendChild(save1.container);
	const otherstats = new GroupBox("Misc. Stats");
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/MAXRP", label: "Your Maximum RP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/RP", label: "Your Current RP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/MAXSP", label: "Your Maximum SP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/SP", label: "Your Current SP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/MAXPP", label: "Your Maximum PP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/PP", label: "Your Current PP" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/dir", label: "Your Direction" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/pY", label: "Your Y Position" }).container);
	otherstats.content.appendChild(new IniTools.IniSpinEditor({ id: "Save1/pX", label: "Your X Position" }).container);
	otherstats.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/room", label: "Current Room" }).container);
	return buildPages({ tabPages: tabPages, clickTarget: "Player", });
};

	/*

export const IniPage = () => {
	"use strict";
	const items = new GroupBox("Items");
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/00", label: "Item 0"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/01", label: "Item 1"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/02", label: "Item 2"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/03", label: "Item 3"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/04", label: "Item 4"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/05", label: "Item 5"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/06", label: "Item 6"}).container);
	items.content.appendChild(new IniTools.IniLineEditor({id: "Items/07", label: "Item 7"}).container);
	contents.appendChild(items.container);

	const playtime = new GroupBox("Playtime");
	playtime.content.appendChild(new IniTools.IniLineEditor({id: "Playtime/Seconds", label: "Seconds"}).container);
	contents.appendChild(playtime.container);

	const save1 = new GroupBox("Save1");
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/Menu", label: "Menu Sprite" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/FUN", label: "FUN Value" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/FTravel", label: "Fast Travel Enabled" }).container);
	save1.content.appendChild(new IniTools.IniCheckEditor({ id: "Save1/Satchel", label: "Dimensional Satchel" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/Follower", label: "Your Follower" }).container);
	save1.content.appendChild(new IniTools.IniCheckEditor({ id: "Save1/playerCanRun:", label: "Enable/Disable Running" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/playerSprite", label: "Sprite Variation" }).container);
	save1.content.appendChild(new IniTools.IniLineEditor({ id: "Save1/rmName", label: "Room Name (Menu)" }).container);
	save1.content.appendChild(new IniTools.IniCombinedEditor({ id: "Save1/Accessory", label: "Equipped Accessory", buddy:armorDFP }).container);

	contents.appendChild(save1.container);

	

	const general = new GroupBox("General");
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/BH", label: "BH"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/BP", label: "BP"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/BW", label: "BW"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/BC", label: "BC"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/CH", label: "CH"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/CP", label: "CP"}).container);
	// noinspection SpellCheckingInspection
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Gameover", label: "Gameover"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Kills", label: "Kills"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Love", label: "Love"}).container);
	general.content.appendChild(new IniTools.IniLineEditor({id: "General/Name", label: "Name"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Room", label: "Room"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/Tale", label: "Tale"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Time", label: "Time"}).container);
	general.content.appendChild(new IniTools.IniCheckEditor({id: "General/Truth", label: "Truth"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Won", label: "Won"}).container);
	general.content.appendChild(new IniTools.IniSpinEditor({id: "General/Fun", label: "fun"}).container);
	contents.appendChild(general.container);

	// noinspection SpellCheckingInspection
	const flowey = new GroupBox("Flowey");
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/AF", label: "AF"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/AK", label: "AK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/Alter", label: "Alter"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniSpinEditor({id: "Flowey/CHANGE", label: "CHANGE"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/CK", label: "CK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniSpinEditor({id: "Flowey/EX", label: "EX"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/FloweyExplain1", label: "FloweyExplain1"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/IK", label: "IK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/K", label: "K"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniSpinEditor({id: "Flowey/Met1", label: "Met1"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/NK", label: "NK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/SK", label: "SK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/SPECIALK", label: "SPECIALK"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/alter2", label: "alter2"}).container);
	// noinspection SpellCheckingInspection
	flowey.content.appendChild(new IniTools.IniCheckEditor({id: "Flowey/truename", label: "truename"}).container);
	contents.appendChild(flowey.container);

	// noinspection SpellCheckingInspection
	const toriel = new GroupBox("Toriel");
	// noinspection SpellCheckingInspection
	toriel.content.appendChild(new IniTools.IniSpinEditor({id: "Toriel/Bscotch", label: "Bscotch"}).container);
	// noinspection SpellCheckingInspection
	toriel.content.appendChild(new IniTools.IniSpinEditor({id: "Toriel/TK", label: "TK"}).container);
	// noinspection SpellCheckingInspection
	toriel.content.appendChild(new IniTools.IniSpinEditor({id: "Toriel/TS", label: "TS"}).container);
	contents.appendChild(toriel.container);

	const sans = new GroupBox("Sans");
	sans.content.appendChild(new IniTools.IniCheckEditor({id: "Sans/EndMet", label: "EndMet"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/F", label: "F"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/Intro", label: "Intro"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/M1", label: "M1"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/MeetLv", label: "MeetLv"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/MeetLv1", label: "MeetLv1"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/MeetLv2", label: "MeetLv2"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/MP", label: "MP"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/Pass", label: "Pass"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/SK", label: "SK"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/SS", label: "SS"}).container);
	sans.content.appendChild(new IniTools.IniSpinEditor({id: "Sans/SS2", label: "SS2"}).container);
	contents.appendChild(sans.container);

	const papyrus = new GroupBox("Papyrus");
	papyrus.content.appendChild(new IniTools.IniSpinEditor({id: "Papyrus/M1", label: "M1"}).container);
	papyrus.content.appendChild(new IniTools.IniSpinEditor({id: "Papyrus/PD", label: "PD"}).container);
	papyrus.content.appendChild(new IniTools.IniSpinEditor({id: "Papyrus/PK", label: "PK"}).container);
	papyrus.content.appendChild(new IniTools.IniSpinEditor({id: "Papyrus/PS", label: "PS"}).container);
	contents.appendChild(papyrus.container);

	// noinspection SpellCheckingInspection
	const undyne = new GroupBox("Undyne");
	// noinspection SpellCheckingInspection
	undyne.content.appendChild(new IniTools.IniSpinEditor({id: "Undyne/UD", label: "UD"}).container);
	contents.appendChild(undyne.container);

	// noinspection SpellCheckingInspection
	const alphys = new GroupBox("Alphys");
	// noinspection SpellCheckingInspection
	alphys.content.appendChild(new IniTools.IniSpinEditor({id: "Alphys/AD", label: "AD"}).container);
	contents.appendChild(alphys.container);

	const mtt = new GroupBox("MTT");
	mtt.content.appendChild(new IniTools.IniSpinEditor({id: "MTT/EssayNo", label: "EssayNo"}).container);
	contents.appendChild(mtt.container);

	// noinspection SpellCheckingInspection
	const mett = new GroupBox("Mett");
	// noinspection SpellCheckingInspection
	mett.content.appendChild(new IniTools.IniCheckEditor({id: "Mett/O", label: "O"}).container);
	contents.appendChild(mett.container);

	// noinspection SpellCheckingInspection
	const mettaton = new GroupBox("Mettaton");
	// noinspection SpellCheckingInspection
	mettaton.content.appendChild(new IniTools.IniCheckEditor({id: "Mettaton/BossMet", label: "BossMet"}).container);
	contents.appendChild(mettaton.container);

	// noinspection SpellCheckingInspection
	const asgore = new GroupBox("Asgore");
	// noinspection SpellCheckingInspection
	asgore.content.appendChild(new IniTools.IniSpinEditor({id: "Asgore/KillYou", label: "KillYou"}).container);
	contents.appendChild(asgore.container);

	// noinspection SpellCheckingInspection
	const fffff = new GroupBox("FFFFF");
	// noinspection SpellCheckingInspection
	fffff.content.appendChild(new IniTools.IniSpinEditor({id: "FFFFF/D", label: "D"}).container);
	// noinspection SpellCheckingInspection
	fffff.content.appendChild(new IniTools.IniSpinEditor({id: "FFFFF/E", label: "E"}).container);
	// noinspection SpellCheckingInspection
	fffff.content.appendChild(new IniTools.IniSpinEditor({id: "FFFFF/F", label: "F"}).container);
	// noinspection SpellCheckingInspection
	fffff.content.appendChild(new IniTools.IniSpinEditor({id: "FFFFF/P", label: "P"}).container);
	contents.appendChild(fffff.container);

	const endF = new GroupBox("EndF");
	endF.content.appendChild(new IniTools.IniSpinEditor({id: "EndF/EndF", label: "EndF"}).container);
	contents.appendChild(endF.container);

	const f7 = new GroupBox("F7");
	f7.content.appendChild(new IniTools.IniCheckEditor({id: "F7/F7", label: "F7"}).container);
	contents.appendChild(f7.container);

	const reset = new GroupBox("reset");
	reset.content.appendChild(new IniTools.IniCheckEditor({id: "reset/reset", label: "reset"}).container);
	reset.content.appendChild(new IniTools.IniCheckEditor({id: "reset/s_key", label: "s_key"}).container);
	contents.appendChild(reset.container);

};
*/

export const AboutDialog = () => {
	"use strict";

	const closeFunction = () => {
		document.querySelector("#aboutDialog").classList.add("hidden");
	};

	const contents = document.createElement("div");
	contents.id = "aboutDialog";
	contents.className = "dialog hidden";

	const container = document.createElement("div");
	container.className = "dialogContainer";

	const name = document.createElement("div");
	name.id = "aboutName";
	name.innerText = "Undertale Yellow Save Editor";

	const details = document.createElement("p");
	details.id = "aboutDetails";
	details.innerHTML = `This project is a fork of Undertale Save Editor. <br>You can contribute here:<br><a href="${GitHub_Fork_Url}" target="_blank">${GitHub_Fork_Url}</a> <br>The original project can be found here:<br><a href="${GitHub_Url}" target="_blank">${GitHub_Url}</a>`;

	const thanks = document.createElement("div");
	thanks.id = "aboutThanks";
	thanks.innerText = "Special Thanks";

	const credits = document.createElement("div");
	credits.id = "aboutCredits";
	credits.innerHTML = Project_Credits.replaceAll(",", "<br>");

	const footer = document.createElement("div");
	footer.className = "dialogFooter";

	const author = document.createElement("div");
	author.innerHTML = `Maintained by &nbsp; <b>${Project_Author}</b>`;

	const closeButton = document.createElement("button");
	closeButton.className = "dialogButton";
	closeButton.innerText = "Close";
	closeButton.onclick = closeFunction;

	footer.appendChild(author);
	footer.appendChild(closeButton);

	container.appendChild(name);
	container.appendChild(details);
	container.appendChild(thanks);
	container.appendChild(credits);
	container.appendChild(footer);

	contents.appendChild(buildDialogHeader({ title: "About", closeFunction: closeFunction, }));
	contents.appendChild(container);

	return contents;
};
