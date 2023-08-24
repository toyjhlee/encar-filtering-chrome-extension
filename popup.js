console.log('loaded popup.js');

async function getActiveTab() {
	const queryOptions = { active: true, currentWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

document.addEventListener("DOMContentLoaded", async () => {
	/*
	// TODO: README.md 로 이동
	[chrome.tabs.query](https://developer.chrome.com/docs/extensions/reference/tabs/#method-query)
	[chrome.tabs.sendMessage](https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage)
	*/
	const onFiltering = async () => {
		const activeTab = await getActiveTab();

		chrome.tabs.sendMessage(activeTab.id, {action: "filter"}, (response) => {
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
			} else {
				console.log(response);
				// console.log(JSON.stringify(response));
			}
		});
	}

	document.querySelector('button#ownedOne').addEventListener('click', onFiltering);

	/*
	chrome.tabs.sendMessage(activeTab.id, {action: "alert", message: 'bbb'}, (response) => {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} else {
			console.log(response);
		}
	});
	*/
})

function fitPopupSize() {
	const {scrollWidth: width, scrollHeight: height} = document.documentElement;
	window.resizeTo(width, height);
}

window.addEventListener('load', fitPopupSize);