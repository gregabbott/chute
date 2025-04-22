# Chute
Chute works like a pipeline operator for sending data through functions and methods in a dot-notation style.
```js
// .js ~10KB | .min.js ~4KB | MIT License | Vanilla JS 
// =============================================================
// The demo below uses these example functions
function add_one(x) { return x + 1 }
function add(b) { return a => a + b }
function a_in_b(a, b) { console.log(b.includes(a)); return a }
const put_in_array = x => [x] 
const get_index = n => l => l[n]
const X = chute.x // Chute has a placeholder feature, used below
// DEMO 1
let demo_1 = chute(7)// start a new chute with any seed value
.toString// call methods of the current data. (parens optional)
.parseInt// send data through global native functions
.add_one// global unary
.add(8)// global curried
.a_in_b(X,[8,16])// global other (X sends data as argument 1)
.do(put_in_array)// send data through local non-global functions
.put_in_array// dot-call non-globals called earlier in a chute
.JSON.stringify// call global nested functions: native or custom
.log// call any of Chute's built in methods
.JSON.parse
.do(// optionally give '.do' a chain of one or more functions
  get_index(0),
  list=>list[0]// write one-off inline functions
)
()//a blank call ends a chute and returns the current data
console.log(demo_1)// 16
// =============================================================
{
  // The demo below uses these non-global functions & libraries
  const append = b => a => a + b
  const badly_named_ob = { two: x => x * 2, three: x => x * 3 }
  const sum = { add : b => a => a + b, minus: b => a => a - b }

  // DEMO 2
  chute// Optional setup lets all chutes access non-globals.
  .feed({// Give all chutes access to functions and libraries:
    append,// This line gives a function 
    times: badly_named_ob,// This line gives & renames a library
  })
  .lift({// Give all chutes access to library functions by name:
    sum
  })// Any chute anywhere in a project can now access the above.
}
const demo_2 = 
chute(8)
.times.three// <| Given to Chute via 'feed'
.minus(8)// <| Given to Chute via 'lift' (vs. '.sum.minus')
.append('!')
()
console.log(demo_2)// "16!"
/* =============================================================
MORE FEATURES
     Current value token  Use data in inline expressions
                     TAP  Run side effects and ignore returns
                    PICK  Run if-else FNs on current data
0 ARG STYLE OPTIONS =========================================
 Pipeline (deduce calls)  .reverse.JSON.stringify.log()
 Dot notation (explicit)  .reverse().JSON.stringify().log()
          Both equate to  .reverse > JSON.stringify > log
============================================================= */
```
- For more information, visit:
  - https://gregabbott.pages.dev/chute
  - https://gregabbott.github.io/chute
- Support Chute via:
  - [Buy me a coffee](https://buymeacoffee.com/gregabbott)
  - [Kofi](https://ko-fi.com/gregabbott)
