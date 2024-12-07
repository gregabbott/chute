// Functions (Not methods)
function add_one(x){return x+1}
function double(x){return x*2}
function triple(x){return x*3}

let seed = 7 // Seed value with no methods
let result = chute(seed) // Start a chute
.add_one() // 8
.log
.double() // 16
.log
.triple() // 48
.log()
() // End a chute

console.log(result) // 48