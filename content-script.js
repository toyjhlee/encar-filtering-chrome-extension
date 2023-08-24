console.log(`loaded content-script.js`);

const hiddenItemByKeyword = (keyword) => {
  const list = document.querySelectorAll('#carResultListWrap li');

  const hiddenList = Array.from(list).filter((product) => {
    return -1 === product.innerText.indexOf(keyword);
  })

  hiddenList.forEach((product) => {
    product.style.display = 'none';
  })

  const count = {
    total: list.length,
    show: list.length - hiddenList.length,
    hidden: hiddenList.length, 
  }

  window.dispatchEvent(new Event('resize')); // show image

  return {
    count,
  }
}

/*
// TODO: storage 에 값을 저장해 load 후에 사용한다. 저장한 값 checked 가 true 인 경우 작동
window.addEventListener('load', () => {
  hiddenItemByKeyword(`1인소유`)
})
*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const {action, message } = request;

  if (action === 'alert') {
    alert(message);
  }

  if (action === "filter") {
    const {count} = hiddenItemByKeyword(`1인소유`)

    const message = `필터랑 완료: show ${count.show}, hidden ${count.hidden}`;
    // sendResponse(`필터랑 완료: ${message}`)
    alert(message)
  }
});