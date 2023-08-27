console.log(`loaded content-script.js`);

const hideItemByKeyword = (keyword) => {
  const list = document.querySelectorAll('#carResultListWrap li');

  const hideList = Array.from(list).filter((product) => {
    return -1 === product.innerText.indexOf(keyword);
  })

  hideList.forEach((product) => {
    product.style.display = 'none';
  })

  const count = {
    total: list.length,
    show: list.length - hideList.length,
    hidden: hideList.length,
  }

  window.dispatchEvent(new Event('resize')); // show image

  return {
    count,
  }
}

const showItemByKeyword = (keyword) => {
  const list = document.querySelectorAll('#carResultListWrap li');

  const hideList = Array.from(list).filter((product) => {
    return -1 === product.innerText.indexOf(keyword);
  })

  hideList.forEach((product) => {
    product.style.display = '';
  })

  const count = {
    total: list.length,
    show: list.length,
    hidden: 0,
  }

  window.dispatchEvent(new Event('resize')); // show image

  return {
    count,
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const {action, message, name, value } = request;

  if (action === 'alert') {
    alert(message);
  }

  if (action === "filter") {
    // console.log(value, typeof value);
    const {count} = value === true ? hideItemByKeyword(name) : showItemByKeyword(name);

    const message = `필터랑 완료: show ${count.show}, hidden ${count.hidden}`;
    // sendResponse(`필터랑 완료: ${message}`)
    alert(message)
  }
});