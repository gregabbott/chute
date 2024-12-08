# Chute
Chute allows method-style chaining and piping for global functions, native methods and more, in JavaScript.

```js
// Functions (Not methods)
function add_one(x){return x+1}
function double(x){return x*2}
function triple(x){return x*3}

let seed = 7 // Seed value with no methods
let result = chute(seed) // Start a chute
// Dot-style call global functions:
.add_one() // 8
.double() // 16
.triple() // 48
() // End a chute

console.log(result) // 48
```

Visit the project [site](https://chute.pages.dev/) or [GitHub Page](https://gregabbott.github.io/chute/).