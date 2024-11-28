# Chute
A vanilla JavaScript function to chain functions and methods. ~2KB.

```js
let initial_data = [1, 2, 4]
const result = chute(initial_data,/*any functions…*/push(8))
  //then swap between function and method calls as needed.
  //call any method native to the current data as normal:
  .map(double)
  //`.log` calls a built in method that takes 0+ arguments.
  .log('doubled:')
  //`.log` logs any arguments and the data, then resumes.
  .filter(greater_than(4))
  //`.and` calls a built in method that takes 1+ functions.
  //`.and(f1,f2)` sends data to f1, then f1's return to f2.
  .and(push(32),push(64))
  //nameless calls work the same way as `.and`:
  (push(80,128),push(256))
  //each sub-chain uses a reducer and mimics nested calls.
    //one call `(f1,f2)` == `f2(f1(data))`
    //many calls `(f1)(f2)` == `data=f1(data);data=f2(data)`
  ('reverse')//strings call methods that need no arguments.
  //this allows unbroken sequences: `(f1,'method',f2)`
  //'.tap' calls a built in method that takes a function.
  //'.tap(f1)' sends data to f1 but ignores the result.
  .log('pre-tap')
  .tap(mutate)//.tap functions might mutate data directly.
  .log('post-tap')
  .reduce(add_up)
  //'.if' calls an inbuilt method that takes 2 arguments.
  .if(
    //a boolean
    //or a function that tests data and return a boolean.
    greater_than(64),
    //a function to send data to if the condition === true.
    halve
  )
  .toString()
  (append('.'))
  ()//an empty call returns the final value
  //from this point, method calls directly act on the data.
  .replace('.','!')

log({result})
//Demo Helper Functions
function push (...a){return l => (l.push(...a),l)}
function log (x){console.log('outer_log',x);return x}
function greater_than(n){ return x => x > n}
function double(x){return x * 2}
function halve(x){return x / 2}
function add_up(a, b){return a + b}
function append(x){return d => d+x}
function mutate (data){
  data.length=0
  data.push(1452,1386,1483,1475)
  return 'chucks this returned value'
}
```
