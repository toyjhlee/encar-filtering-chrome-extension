console.log(`loaded content-script.js`);

const toggleByKeyword = (list, keyword, applyToEachInList) => {
  const hideList = Array.from(list).filter(product => {
    return -1 === product.innerText.indexOf(keyword);
  });

  hideList.forEach(applyToEachInList);

  const count = {
    total: list.length,
    applyCount: hideList.length,
  };

  window.dispatchEvent(new Event('resize'));

  return {
    count,
  };
};

const getVehicleId = $img => {
  // https://ci.encar.com/carpicture/carpicture09/pic3549/35493091_001.jpg
  const url =
    $img.getAttribute('src') === '/images/common/trans.gif'
      ? $img.getAttribute('data-src')
      : $img.getAttribute('src');

  if (url === null) {
    return null;
  }

  const match = url.match(/\/([^\/]+\.jpg)/);
  if (!match) return null;

  let value = match[1];

  // 2단계: .jpg나 _001.jpg 제거
  value = value.replace(/(_\d+)?\.jpg$/, '');

  return value;
};

const getRegistrantId = ($img, id) => {
  // https://ci.encar.com/userdata/dealer/photo/myskyl71.jpg?resize=160px:160px
  if ($img === null) return null;
  const url =
    $img.getAttribute('src') === '/images/common/trans.gif'
      ? $img.getAttribute('data-src')
      : $img.getAttribute('src');

  if (url === null) {
    return null;
  }

  const match = url.match(/\/([^\/]+\.jpg)/);
  if (!match) return null;

  let value = match[1];

  // 2단계: .jpg나 _001.jpg 제거
  value = value.replace(/(_\d+)?\.jpg$/, '');

  return value;
};

const checkUserSalesCount = async () => {
  const list = Array.from(
    document.querySelectorAll('#carResultListWrap li'),
  ).filter(el => isNumeric(el.getAttribute('id')));

  const ids = Array.from(list)
    .map(el => {
      const vehicleId = getVehicleId(el.querySelector('img'));
      const registrantId = getRegistrantId(
        el.querySelector('.userMsg img'),
        el.getAttribute('id'),
      );

      return {
        vehicleId,
        registrantId,
      };
    })
    .filter(({ vehicleId, registrantId }) =>
      [vehicleId, registrantId].some(id => id !== null),
    );

  const testIds = ids.slice(0, 10);
  for (const { vehicleId, registrantId } of testIds) {
    const { currentlyOnSales, recentYearSales } = await getSalesCount({
      vehicleId,
      registrantId,
    });

    if (currentlyOnSales === null && recentYearSales === null) {
      // 데이터를 가져 오지 못 했슴.
      continue;
    }

    if (recentYearSales > 200) {
      const span = document.createElement('span');
      span.innerHTML = '↑ 200';
      document
        .getElementById(vehicleId)
        .querySelector('.hotmark')
        .appendChild(span);
    }
  }

  window.dispatchEvent(new Event('resize'));
};

// getSalesCount('35744309');
const getSalesCount = async ({ vehicleId, registrantId }) => {
  const headers = {
    Accept: 'application/json, text/plain, */*',
    Origin: 'https://fem.encar.com',
    Referer: 'https://fem.encar.com/',
  };

  if (registrantId == null) {
    const API_URL = `https://api.encar.com/v1/readside/inspection/vehicle/${vehicleId}`;

    const productData = await fetch(API_URL, {
      method: 'GET',
      headers,
    })
      .then(response => response.json())
      .catch(error =>
        console.error('Error:', error, `vehicleId : ${vehicleId}`),
      );

    if (productData === undefined || productData.inspectionSource == null) {
      return {
        currentlyOnSales: null,
        recentYearSales: null,
      };
    }

    const {
      inspectionSource: {
        registrantId: _registrantId,
        updaterId,
        reservationId,
      },
    } = productData;

    registrantId = _registrantId;
  }

  const url = `https://api.encar.com/v1/readside/user/${registrantId}`;

  const userData = await fetch(url, {
    method: 'GET',
    headers,
  })
    .then(response => response.json())
    .catch(error => console.error('Error:', error));

  const {
    salesStatus: { currentlyOnSales, recentYearSales },
  } = userData;

  return {
    currentlyOnSales,
    recentYearSales,
  };
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { action, message, name, value } = request;

  if (action === 'alert') {
    alert(message);
  }

  if (action === 'filter') {
    const list = Array.from(
      document.querySelectorAll('#carResultListWrap li'),
    ).filter(el => isNumeric(el.getAttribute('id')));

    // toggle visible
    const { count } = toggleByKeyword(list, name, product => {
      if (value === true) {
        product.style.display = 'none';
      } else {
        product.style.display = '';
      }
    });

    const message = `필터랑 완료: total ${count.total}, apply ${count.applyCount}`;

    // const message = `필터랑 완료: show ${count.show}, hidden ${count.hidden}`;
    // sendResponse(`필터랑 완료: ${message}`)
    alert(message);
  }

  // checkUserSalesCount();
});

function isNumeric(str) {
  return /^\d+(\.\d+)?$/.test(str);
}
