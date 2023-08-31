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

	const $singleOwnership = document.querySelector('input[name="singleOwnership"]')


	const onFiltering = async () => {
		const activeTab = await getActiveTab();

		const checked = $singleOwnership.checked;

		chrome.tabs.sendMessage(activeTab.id, {action: "filter", name: "1인소유", value: checked}, (response) => {
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
			} else {
				console.log(response);
				// console.log(JSON.stringify(response));
			}
		});
	}

	const onChecked = (e) => {
		const {checked: value} = e.target;

		chrome.storage.local.set({'1인소유': value}, (value) => {
		  console.log('Value is set to ' + value);
		});
	}

	document.querySelector('button#submit').addEventListener('click', onFiltering);
	$singleOwnership.addEventListener('click', onChecked);

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

window.addEventListener('load', async () => {
  const activeTab = await getActiveTab();
  const url = activeTab.url;

  if (-1 === url.indexOf('https://m.encar.com/ca/carsearch.do')) {
    document.querySelector('form').style.display = 'none';
    document.querySelector('#warningMessage').style.display = '';
    return;
  }

  const key = `1인소유`;
  // hiddenItemByKeyword(`1인소유`)
  chrome.storage.local.get([key], (result) => {
    const checked = result[key];
    document.querySelector('input[type="checkbox"]').checked = checked;
	});
})

function fitPopupSize() {
	const {scrollWidth: width, scrollHeight: height} = document.documentElement;
	window.resizeTo(width, height);
}

window.addEventListener('load', fitPopupSize);