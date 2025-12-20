# Chute
Written as a vanilla JavaScript function, Chute works like a pipeline operator to chain and send data through a mix of functions and methods using a dot-notation style.

- [Overview](#overview)
- [Demo](#demo)
- [Links](#links)

# Overview
Without any setup steps,
Chute can alternate between calling any native or custom methods the current data has, 
and sending the current data through any functions: 
whether global-scope or local-scope, 
top level or deeply nested, 
made for chaining or not. 
Chute works with unary (`chute(data).unaryFn1().unaryFn2()…`),
curried (`chute(data).curriedFn1(args).currentF1(args)…`)) 
and non-unary functions. 
Chute can send the current data through non-unary functions
at any specific argument position 
(`chute(data).nonUnaryFn(arg1,chute.x/*current_data*/,arg3)`)
by using its custom-namable placeholder variable 
(`const X = chute.x`). 
Chute also allows sub-chains and one-off inline functions
at any step in a chute
(`chute(data).do(/*subchain*/f1,/*inlineFn*/data=>{…},f3)`).

Chute offers an optional terser writing style, 
where it can
call unary methods without parentheses
(`chute(data).f1.f2.f3.someLib.f4InSomeLib.f5`), 
and call its `.do` sub-chain method when starting a new chute 
`chute(data,f1,f2)`
as well as namelessly later `chute(data).map(mapFn)/*.do*/(f1,f2)`.

Beyond this, Chute has other features
including an optional simple setup step
to simplify using Chute throughout a project.
For example, 
Chute can optionally hoist a library of functions
to make each function callable directly by name,
instead of by path
(e.g. instead of `chute(data).globalLibraryName.pathToFn.fnName`
call `chute(data).fnName()`).

# Links
For more information visit the Chute site:

- https://gregabbott.pages.dev/chute
- https://gregabbott.github.io/chute

# Demo
```js
// .js ~10KB | .min.js ~4KB | MIT License | Vanilla JS 
// =============================================================
// The demo below will call these example dummy functions:
function add_one(x) { return x + 1 }
function add(b) { return a => a + b }
function a_in_b(a, b) { console.log(b.includes(a)); return a }
const put_in_array = x => [x] 
const get_index = n => l => l[n]
// Chute also works with non-unary and non-curried functions.
//   It has an optional placeholder variable for this purpose.
//   You can give the optional placeholder a custom name:
//   Use it to give current data as a specific argument.
const X = chute.x // Here we name the placeholder `X`

// DEMO 1 - Chute (without any setup steps)
let demo_1 = chute(7)// start a new chute with any seed value
.toString// call any method of the current data
// Optional `()` for unary functions and 0-argument methods
.parseInt// send data through any global native functions
.add_one// call any global unary function
.add(8)// call any global curried function
.a_in_b(X,[8,16])// call any global non-unary function
//Setup earlier, the X variable sends the current data as arg 1
.do(put_in_array)// send data through any local-scope functions
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
  const library_of_fns = { two: x => x * 2, three: x => x * 3 }
  const sum = { add : b => a => a + b, minus: b => a => a - b }

  // DEMO 2
  chute// Optional setup lets all chutes access non-globals.
  .feed({// Give all chutes access to functions and libraries:
    append,// This line gives a function 
    times: library_of_fns,// This line gives & renames a library
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
