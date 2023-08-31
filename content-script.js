console.log(`loaded content-script.js`);

const toggleByKeyword = (list, keyword, applyToEachInList) => {
  const hideList = Array.from(list).filter((product) => {
    return -1 === product.innerText.indexOf(keyword);
  })

  hideList.forEach((product) => {
    applyToEachInList(product);
  })

  const count = {
    total: list.length,
    applyCount: hideList.length,
  }

  window.dispatchEvent(new Event('resize'))

  return {
    count
  }
}

const hideItemByKeyword = (list, keyword) => {
  const {count} = toggleByKeyword(list, keyword, (product) => {
    product.style.display = 'none';
  })

  return {
    count,
  }
}

const showItemByKeyword = (list, keyword) => {
  const {count} = toggleByKeyword(list, keyword, (product) => {
    product.style.display = '';
  })

  return {
    count,
  }
}

const checkUserSalesCount = async () => {
  const list = document.querySelectorAll('#carResultListWrap li');
  const ids = Array.from(list).map((el) => el.getAttribute('id')).filter((id) => isNumeric(id));

  const testIds = ids.slice(0, 4);
  for (const id of testIds) {
    const {currentlyOnSales, recentYearSales} = await getSalesCount(id)

    if (recentYearSales > 200) {
      document.getElementById(id).style.border = '10px solid red';
    }
  }
}

// getSalesCount('35744309');
const getSalesCount = async (vehicleId) => {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://fem.encar.com',
    'Referer': 'https://fem.encar.com/',
  }
  const API_URL = `https://api.encar.com/v1/readside/inspection/vehicle/${vehicleId}`;

  const productData = await fetch(API_URL, {
    method: 'GET',
    headers,
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error, `vehicleId : ${vehicleId}`));

  if (productData === undefined || productData.inspectionSource == null) {
    return {
      currentlyOnSales: null,
      recentYearSales: null,
    }
  }

  const { inspectionSource: {registrantId, updaterId, reservationId} } = productData

  const url = `https://api.encar.com/v1/readside/user/${registrantId}`;

  const userData = await fetch(url, {
    method: 'GET',
    headers,
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));

  const { salesStatus : {currentlyOnSales, recentYearSales}} = userData;

  return {
    currentlyOnSales,
    recentYearSales
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const {action, message, name, value } = request;

  if (action === 'alert') {
    alert(message);
  }

  if (action === "filter") {
    const list = Array.from(document.querySelectorAll('#carResultListWrap li'))
      .filter((el) => isNumeric(el.getAttribute('id')));

    // console.log(value, typeof value);
    const {count} = value === true ? hideItemByKeyword(list, name) : showItemByKeyword(list, name);

    const message = `필터랑 완료: total ${count.total}, apply ${count.applyCount}`;

    // const message = `필터랑 완료: show ${count.show}, hidden ${count.hidden}`;
    // sendResponse(`필터랑 완료: ${message}`)
    alert(message)
  }

  // checkUserSalesCount();
});

function isNumeric (str) {
  return /^\d+(\.\d+)?$/.test(str);
}