// ==UserScript==
// @name         ChatGPT Remote Prompt Loader
// @namespace    http://tampermonkey.net/
// @version      2024-12-27
// @description  automates the process of loading external text content into a webpage’s prompt interface
// @author       You
// @match        https://chatgpt.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

function putTextToInputElement(input, text) {
  const paragraphs = text.split('\n');
  input.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}

function getUrlFromHash(hash) {
  if (hash.startsWith('#url=http')) {
    return hash.replace('#url=', '');
  }

  return null;
}

function fetchTextFromUrl(url) {
  return new Promise((resolve, reject) => {
    const req = GM.xmlHttpRequest({
      method: 'GET',
      url,
      onload: function (response) {
        resolve(response.responseText);
      },
      onerror: function (response) {
        reject(response);
      },
    });
  });
}

(function () {
  'use strict';

  const url = getUrlFromHash(window.location.hash);
  if (!url) {
    console.log('ignore this launch...', window.location.hash, url);
    return;
  }
  console.log('url', url);

  const fetchPromise = fetchTextFromUrl(url);

  const interval = setInterval(() => {
    const input = document.querySelector('#prompt-textarea');
    if (!input) {
      // protect from infinite run
      return;
    }

    clearInterval(interval);
    console.log('found the root element', interval);

    fetchPromise
      .then((text) => {
        putTextToInputElement(input, text);
      })
      .catch((error) => {
        console.error('fetch error', error);
      });
  }, 333);
})();
