# Chute
Chute works like a pipeline operator for sending data through functions & methods in a dot-notation style.
```js
// Chute works like a pipeline operator for functions & methods
// .js ~10KB | .min.js ~4KB | MIT License | Vanilla JS 
// =============================================================
// The demo after this section uses these pseudo functions
function global_add_one(x){ return x + 1 }
const object_of_fns = { two: x => x * 2, three: x => x * 3/*…*/}
const NG_append = b => a => a + b // non-global function
const NG_sum = { add : b => a => a + b, minus: b => a => a - b }
const NG_wrap = x => [x]
const NG_index = n => l => l[n]
// =============================================================
// Chutes access globals and same-scope items without setup.
chute// Optional setup lets all chutes access non-global items.
.feed({// Feed gives all chutes access to functions & libraries:
  append:NG_append,// This line provides a function. [^0]
  times:object_of_fns,// This line gives a library of FNs [^1].
  // The line also sets a custom name to access the library by.
}).lift({// Lift lets all chutes call library functions by name.
  NG_sum// This line gives an object of functions to lift [^2].
})//Any chute anywhere in a project can now access these items.
// ==========================================================
// DEMO (for V 2024_1208)    LEGEND:[FN=Function][NG=Non-global]
const demo = chute(7)//      Start a chute with a seed value
.global_add_one // 8         Call any global functions
.log            // 8         Use any built-in Chute method (few)
.log('Note')    // Note, 8   Log current data with extras
.times.two// unary 16        Call a NG nested FN by path [^1]
.add(64)// curried 80        Call a NG library FN by name [^2]
.toString       // "80"      Use any method the current data has
.parseInt       // 80        Use any global native JS functions
.do(NG_wrap)    // [80]      Call any NG not-setup FNs in scope…
.NG_wrap        // [[80]]    …More calls to it can use dot-style
.do(            //           Pipe data through FN sub-chains
  x=>x[0],      // [80]      Use inline functions if needed
  NG_index(0)   // 80        Each FN's return feeds the next FN
)               //           Hop between sub-chains & dot calls
.append('!')    // "80!"     Use NG FNs from anywhere [^0]
()              // "80!"     End a chute with an empty call
console.log({demo})//"80!"   Use value of methods & FNs sequence
// MORE FEATURES ===============================================
//     Argument placeholder  Call FNs & give data as argument N
//      Current value token  Use data in inline expressions
//                      TAP  Run side effects and ignore returns
//                     PICK  Run if-else FNs on current data
// 0 ARG STYLE OPTIONS =========================================
//  Pipeline (deduce calls)  .reverse.JSON.stringify.log()
//  Dot notation (explicit)  .reverse().JSON.stringify().log()
//               Same steps  .reverse > JSON.stringify > log
// =============================================================
```
- For more information, visit [the Chute site](https://chute.pages.dev/) (also at [GitHub Pages](https://gregabbott.github.io/chute/)).
- Support Chute via:
  - [Buy me a coffee](https://buymeacoffee.com/gregabbott)
  - [Kofi](https://ko-fi.com/gregabbott)
