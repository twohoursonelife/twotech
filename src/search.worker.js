/**
 * this will run in a background thread as a web worker.
 * it will receive signals from the main thread which will make it do searching tasks.
 * @see @/components/Select.vue
 */
const IS_WEB_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope

if (!IS_WEB_WORKER) {
  throw new Error("Not running in a web worker!");
}
let index = 0
let search_list = []

// called when worker receives a message from main thread via postMessage()
onmessage = function ({data: {signal, data, meta}}) {
  meta = meta || {};
  if (signal === "set_search_list") {
    index = 0;
    search_list = [];
    for (const value of data) {
      // add index to use later when sending result.
      search_list.push({index, value})
      index += 1
    }
    postMessage({meta, signal: 'log', data: (index + 1) + ' is the new search list size'}, {})
  } else if (signal === "search") {
    const query = data;
    const matches = [...search_list].sort((b, a) => similarText(a.value, query) - similarText(b.value, query))
    let result = matches.map(m => m.index);
    if (meta.limit > 0) {
      result = result.slice(0, meta.limit)
    }
    postMessage({meta, signal: 'search_result', data: result}, {})
  } else {
    // send back error
    postMessage({meta, signal: 'log', data: 'unknown signal type received: ' + signal}, {})
  }
}

function similarText(first, second, percent) {
  //  discuss at: https://locutus.io/php/similar_text/
  // original by: Rafał Kukawski (https://blog.kukawski.pl)
  // bugfixed by: Chris McMacken
  // bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (https://stackoverflow.com/questions/14136349/how-does-similar-text-work)
  // improved by: Markus Padourek (taken from https://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
  //   example 1: similar_text('Hello World!', 'Hello locutus!')
  //   returns 1: 8
  //   example 2: similar_text('Hello World!', null)
  //   returns 2: 0
  if (first === null ||
    second === null ||
    typeof first === 'undefined' ||
    typeof second === 'undefined') {
    return 0
  }
  first += ''
  second += ''
  let pos1 = 0
  let pos2 = 0
  let max = 0
  const firstLength = first.length
  const secondLength = second.length
  let p
  let q
  let l
  let sum
  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0; (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++) { // eslint-disable-line max-len
        // @todo: ^-- break up this crazy for loop and put the logic in its body
      }
      if (l > max) {
        max = l
        pos1 = p
        pos2 = q
      }
    }
  }
  sum = max
  if (sum) {
    if (pos1 && pos2) {
      sum += similarText(first.substr(0, pos1), second.substr(0, pos2))
    }
    if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
      sum += similarText(
        first.substr(pos1 + max, firstLength - pos1 - max),
        second.substr(pos2 + max,
          secondLength - pos2 - max))
    }
  }
  if (!percent) {
    return sum
  }
  return (sum * 200) / (firstLength + secondLength)
}
