demonstrate_scope()
function demonstrate_scope(){
//==============================================================
//SETUP CHUTE
const placeholder = chute.x//An optional step for a demo below.
const example_1 = chute(//Call chute.
  [1, 2, 4],//Give a seed value to send through functions.
  global_push(8)//f2, f3… Optionally list first functions here.
)//Swap over to dot-style chaining when it suits:
//==============================================================
//CALL METHODS
.map(double)//Call any methods native to the current data.
.filter(greater_than(4))
.reverse()
.push(6)//`.push` returns the updated data to the chute.
.forEach(x=>log(`SideFx: ${x}`))//chutes resumes after .forEach.
//==============================================================
//CALL GLOBAL FUNCTIONS
//------------------------------------------------------------
//Call Global Functions Via Dot-Style Calls
//".f_name()" calls any global function found named "f_name".
//If chute sees no arguments, it sends the data as argument 1.
//".f_name()" acts like "data = f_name(data)"
.wrap_in_array()
//Chute keeps the return value for any next step in the chain.
.get_index(0)//".f(arguments)" == "data = f(arguments)(data)"
//------------------------------------------------------------
//Call Any Functions Via ".do" Calls (Sub-chains)
//".do" sends data through 1+ functions in a single call.
//".do(f1,f2)" sends data to f1, then f1's return to f2.
.do(global_push(32),local_push(64)/*etc*/)
//Nameless calls work as ".do" calls without the key.
(local_push(80),global_push(128,250))
//sub-chains use reduce to mimic nested calls
  //".do(f1,f2)" works like "f2(f1(data))"
  //Instead of `data=f1(data); data=f2(data)`
//==============================================================
//CALL NON-GLOBAL / SCOPED / LOCAL FUNCTIONS
//All of Chute's built in methods can receive any functions.
//This allows passing in non-global functions, as above.
(local_unary)//Chute looks out for named non-global functions.
//It makes each available to call dot-style after that point:
.local_unary()
//------------------------------------------------------------
//The call inside the call below returns an unnamed function.
(local_push(80))//e.g. list=>list.push(80)
//Chute sends the data through the function, keeps the return,
//then forgets the function which lacks a name to call it by.
//==============================================================
//ORDER
//Chute evaluates what to do per dot-style call it receives.
//Chute checks the called name against names of other actions.
//If nothing matches, Chute returns an error.
//Otherwise it calls the first item found with the same name.
//Chute searches for matches in this order:
  //A method built in to Chute. (see more below)
  //A native method of the current data. (e.g. .map .split)
  //A global function.
  //A named non-global function (from some previous call).
//==============================================================
//ARGUMENT PLACEHOLDER
//Chute's 'x' property holds a placeholder to give dot-style
//function calls the current data, at a set argument position.
//To give an example of custom naming the placeholder to suit,
//this script set it up as `const placeholder = chute.x`.
.placeholder_test("see data in console ->",placeholder)
//The above call equates to: "data = fn(string, current_data)".

//Per dot-style function call, Chute look at each argument,
//and swaps any placeholder it finds for the current data.

//When a .function call has arguments but no data placeholder,
//Chute expects the function call to return another function.
//It then sends the data to that function, keeping the result.
//e.g. ".fn(a,b)" == "data = fn(user provided arguments)(data)"
//==============================================================
//LOG 
//The built in method ".log()" logs the current data.
.log()
//If it receives any arguments, it logs these before the data.
.log('Log with note')
//==============================================================
//NESTED CALLS (path dot-style calls) **NEW** 2024_1202.2
//Call native functions in namespace e.g. Math / JSON
.JSON.stringify(placeholder,null,'\t')
.log('Stringified!')
.JSON.parse()
.log('Parsed back')
//Call custom methods and functions in Global namespaces
//==============================================================
//TAP
//".tap" calls a built in method that takes one function.
//Chute sends the data to function, ignoring any return value.
.tap(mutate)//A ".tap" function might mutate data directly.
.log('Post-tap data')
//==============================================================
//IF
//`.if` calls a built in method to act on truthy conditions.

//---- (A) If this, then that ----------------------------------
//An "If this, then that" ".if" call takes 2 arguments.
//Argument 1 can hold a function or value, e.g. "is_monday()".
//Chute sends the current data to any argument 1 function.
//The function returns a truthy or falsey value.

//A truthy condition lets Chute looks at the second argument.
//If argument 2 holds a value, it replaces the chute data.
//If argument 2 holds a function, Chute sends the data to it.
//The chute resumes with whatever data the function returns.

.if(is_array,sum)
.log('Sum: ')

//---- (B) if, else if, else -----------------------------------
//Shape:
//The If Else block needs an object with an "if" property.
//The "if" property must hold a 2 item array.
//Two other optional properties include "else_if" and "else".
//Any "else_if" property holds an array of 2 element arrays.
//Any "else" property holds a value, or a function.
//The block can have "else" without "else_if" or vice-versa.

//Each 2 element array holds a condition [0] and returnable [1].
//Chute checks each condition until it finds a truthy one.
//Conditions may reference functions to test the current data,
//Chute sends the current data value through these functions
//and checks the truthiness of the value they return.

//The If Else block returns a truthy condition's returnable.
//When the "if else" block returns a value, Chute keeps it.
//When the block returns a function, chute uses it.
//Chute sends the current data to any returned function,
//and keeps whatever that function returns as the new data.

//With no 'else' property and no match, the data stays the same.
.if({
  if: [is_array, true],
  /*optional parts:*/
  else_if: [
    [is_string, 16             ],
    [is_number, local_scope_x10],
    [     true, 'yes'          ]
  ],
  else: 41
})//(^ This initial implementation will likely change.)
/* Equivalent:
.do(the_current_data=>{
  if(is_array(the_current_data)){
    return 8
  }
  else if(is_string(the_current_data)){
    return 16
  }
  else if(Number(the_current_data)){
    return local_scope_x10(the_current_data)
  }
  else {
    return 41
  }
})*/
.local_scope_x10()//Chute remembers non-globals from .if calls.
//==============================================================
//Inline functions
//One alternative to the current value token (detailed below).
(x=>x*3)//Anything at all
.log("Tripled")
//==============================================================
.toString()
//Index number access. 
[0]//The value of this item becomes the chute data.
//==============================================================
//ENDING THE CHUTE
.log()//This dot style call needs parentheses '()',
()//so that a final empty call can returns the data value.
.toString()//Regular method calls can act on the returned data.
.replace(/$/,'!')

log(`Chute Result:`,example_1)

//==============================================================
//CURRENT VALUE TOKEN
//Chute has a built in '.with' method that takes a function.
//It lets Chute update a non-global variable as it runs.
//Calls in the chute can then reference the variable as needed.

let x //any desired name for the "current value token"
const chute_2_result = chute().with(v=>x=v)//.with after call to chute
({two:2,four:4,eight:8})//initial chute value
//The token can now be used in calls
//Access current data property
(x.eight) //Instead of single use function "(x=>x.eight)"
//Arithmetic
(x + 10)//Instead of "(x=>x+10)"
//Object literals
({data:x})//Instead of "(x=>{data:x})"
//Template literals
(`Answer is "${x.data}"`)
(4>2?extract_quoted:x)//Ternary (with function call)
([48,64,80,parseInt(x)])//Array literal
//`.do` may call any of the above calls for the same result.
()
log('chute_2 result',chute_2_result)
//Demo Helper Functions (Non-Global)
function local_push(...a){return l=>(l.push(...a),l)}
function local_unary(f){log('Local Unary');return f}
function local_scope_x10(f){log(`LocalTenfold`);return f*10}
}
//Demo Helper Functions (Global)
function return_falsey(){return 0}
function placeholder_test(a,x){log(a,x);return x}
function extract_quoted(x){return x.replace(/.*?"(.*?)"/,'$1')}
function get_index(i){return data => data[i]}
function wrap_in_array(data){return [data]}
function global_push (...a){return l=>{l.push(...a);return l}}
function log (...x){console.log(...x);return x}
function greater_than(n){ return x => x > n}
function double(x){return x * 2}
function sum(data){return data.reduce((a,b)=>a+b)}
function is_array(data){return Array.isArray(data)}
function is_string(data){return typeof data === 'string'}
function is_number(v){return typeof v ==='number'&&!isNaN(v)}
function mutate (d){log('Mutate');d.length=2;return 'chuck'}