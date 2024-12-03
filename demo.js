function demonstrate_scope(){
// =============================================================
// SETUP CHUTE
const placeholder = chute.x// An optional step for a demo below.
const chute_1 = chute(// Call chute to create a new chute.
  [1, 2, 4],// Optionally seed the chute in the initial call.
  global_push(8)//,f2,f3… <- Optional first functions to run.
)// Swap over to dot-style chaining when it suits:
// =============================================================
// CALL METHODS
.map(double)// Call any methods native to the current data.
.filter(greater_than(4))
.reverse()
.push(6)// ".push" returns the updated data to the chute.
.forEach(x=>log(`SideFx: ${x}`))// .forEach returns its input.
// =============================================================
// CALL GLOBAL FUNCTIONS
// ------------------------------------------------------------
// Call Global Functions Via Dot-Style Calls
// ".f_name()" calls any global function found named "f_name".
// If chute sees no arguments, it sends the data as argument 1.
.wrap_in_array()// ".f_name()" acts like "data = f_name(data)".
// Chute keeps the return value for any next step in the chain.
.get_index(0)// ".f(arguments)" == "data = f(arguments)(data)"
// ------------------------------------------------------------
// Call Any Functions Via ".do" Calls (Sub-chains)
// ".do" sends data through 1+ functions in a single call.
// ".do(f1,f2)" sends data to f1, then f1's return to f2.
.do(global_push(32),local_push(64)/*etc.*/)
// Nameless calls work the same as ".do" calls without the key.
(local_unary,global_push(128,250))
// sub-chains use reduce to mimic nested calls
  // ".do(f1,f2)" works like "f2(f1(data))"
  // Instead of "data=f1(data); data=f2(data)"
// =============================================================
// CALL NON-GLOBAL / SCOPED / LOCAL FUNCTIONS
// A ".do" call above gave Chute a named non-global function.
// Chute remembers named non-global functions it receives,
.local_unary()// and makes them available to dot-style call.
// ------------------------------------------------------------
// The call inside the call below returns an unnamed function.
(local_push(80))// e.g. list=>list.push(80)
// Chute sends the data through the function, keeps the return,
// then forgets the function which lacks a name to call it by.
// =============================================================
// ORDER
// Chute evaluates what to do per dot-style call it receives.
// Chute checks the called name against names of other actions.
// If nothing matches, Chute returns an error.
// Otherwise it calls the first item found with the same name.
// Chute searches for matches in this order:
  // A method built in to Chute. (see more below)
  // A method of the current data. (e.g. .map .split .custom)
  // A global function.
  // A named non-global function (from some previous call).
// =============================================================
// ARGUMENT PLACEHOLDER
// NOTE: This point relates to .some_fn() not .method_of_data().
// Chute's "x" property holds an immutable placeholder object.
// Dot-style function calls can place it in argument positions.
// Chute swaps out placeholders it finds for the current data.

// This script has the set up "const placeholder = chute.x",
// to give an example of custom naming the placeholder to suit.
.placeholder_test(`see data in console ->`,placeholder)
// The above call equates to: "data = fn(string, current_data)".

// When a call of this kind has arguments but no placeholder,
// Chute expects the function call to return another function.
// It sends the data to that returned function.
  // ".fn(a,b)"  ==  "data = fn(arguments no placeholder)(data)"

// SEE ALSO: "Current Value Token" (below)
// =============================================================
// LOG 
// The built in method ".log()" logs the current data.
.log()
// If it receives any arguments, it logs these before the data.
.log(`Log with note`)
// =============================================================
// Call global nested methods a.b.c.method()
.JSON.stringify(placeholder,``,`\t`)//Native global method
.log(`Stringified!`)
.JSON.parse()// Native global
.log(`Parsed back`)
.custom.global.method()//Custom global method
// =============================================================
// TAP
// Chute's built in ".tap" method sends data to a function,
// ignores anything returned, and keeps the existing data.
.tap(mutate)// A ".tap" function might mutate data directly.
.log(`After tap:`)//It also helps when functions return nothing.
// =============================================================
// IF
// ".if" calls a built in method to act on truthy conditions.

// ---- (A) If this, then that ---------------------------------
// An "If this, then that" ".if" call takes 2 arguments.
// Argument 1 can hold a function or value, e.g. "is_monday()".
// Chute sends the current data to any argument 1 function.
// The function returns a truthy or falsey value.

// A truthy condition lets Chute looks at the second argument.
// If argument 2 holds a value, it replaces the chute data.
// If argument 2 holds a function, Chute sends the data to it.
// The chute resumes with whatever data the function returns.

.if(is_array,sum)
.log(`Sum: `)

// ---- (B) if, else if, else (Initial implementation) ---------
// Shape:
// The If Else block needs an object with an "if" property.
// The "if" property must hold a 2 item array (the If the Then).
// Two other optional properties include "else_if" and "else".
// Any "else_if" property holds an array of 2 element arrays.
// Any "else" property holds a value, or a function.
// The block can have "else" without "else_if" or vice-versa.

// Each pair array holds a condition [0] and returnable [1].
// Chute checks each condition until it finds a truthy one.
// Conditions may reference functions to test the current data.
// Chute sends the current data value through these functions,
// and checks the truthiness of the value they return.

// The If Else block returns a truthy condition's returnable.
// When the "if else" block returns a value, Chute keeps it.
// When the block returns a function, chute uses it.
// Chute sends the current data to any returned function,
// and keeps whatever that function returns as the new data.

// With no match and no "else" given, the data stays the same.
.if({
  if: [is_array, true],
  else_if: [
    [is_string, 16],
    [is_number, local_scope_x10],
    [true, `yes`]
  ],
  else: 41
})
/* The above avoids one-use functions filled with repetition.
.do(data=>{
  if(is_array(data)){ return 8 }
  else if(is_string(data)){ return 16 }
  else if(is_number(data)){ return local_scope_x10(data) }
  else { return 41 }
})*/
.local_scope_x10()// Chute remembers non-globals from .if calls.

// =============================================================
// INLINE FUNCTIONS (See also: the Current Value Token section.)
(x=>{log('TRIPLE',x,x*3); return x*3})
// =============================================================
.toString()
[0]// ACCESS BY INDEX via [\d+] to make it the chute data,
.log('Accessed Index Equals: ')
.replace(/$/,`!`)
// =============================================================
()// END THE CHUTE with an empty call to return the current data
// Further method calls would act on data directly.

log(`chute_1 result:`,chute_1)

// =============================================================
// CURRENT VALUE TOKEN
// Chute has a ".with" method that takes a settings object.
// It's "token" property takes a function to access a variable, 
// which Chute updates with the current data as it runs.
// Calls within the chute can reference the variable as needed.
let x // any desired name for the "current value token".
const chute_2 = chute()//Call new chute. Give/omit seed and fns.
.with({token:v=>x=v})//Configure with current value token.
({two:2,four:4,eight:8})// Seed configured chute.
// DO CALLS WITH EXPRESSIONS USING CURRENT VALUE TOKEN
(x.eight) // PROPERTY ACCESSS   Instead of "(x=>x.eight)"
(x + 10)// ARITHMETIC           Instead of "(x=>x+10)"
({data:x})// OBJECT LITERALS    Instead of "(x=>{data:x})"
(`Answer is "${x.data}"`)//TEMPLATE LITERALS
(4>2?extract_quoted:x)// TERNARY (with function call)
([48,64,80,parseInt(x)])// ARRAY LITERAL
()//End the chute

log(`chute_2 result:`,chute_2)
// =============================================================
// THE "skip_void" SETTING
// Chute has a setting called "skip_void" to handle "undefined".
// When enabled, if a function in a chute returns undefined,
// Chute ignores it, and continues with the data it already had.
// I.E. "let x = fn(data); return x === undefined ? data : x"
// When disabled, the chute makes undefined its new value.
// "skip_void:true" lets a chute continue in more cases.

  let chute_3 = chute()//New chute.
  .with({skip_void:true/*default: false*/})//Chute settings.
  ({//The chute call or a later call can contain the seed value.
    tag:`div`,
    parent:`dom_example`
  })
  .make_el()
  .set_props({
    id:`element_for_dom_example`,
    title:`This element alerts a message when clicked.`,
    innerText:`Chute made this element`,
    onclick:()=>alert(`Chute!`),
  })
  .classList.add(`round_button`)//This method returns undefined.
  .log('now')//The chute still has the element.
  ()//End chute. (If at the Chute page, see the element below.)
  
  log(`chute_3 result:`,chute_3)//Chute end value.

  // Demo Helper Functions (Non-Global)
  function local_push(...a){return l=>(l.push(...a),l)}
  function local_unary(f){log(`Local Unary`);return f}
  function local_scope_x10(f){log(`LocalTenfold`);return f*10}
}
// GLOBAL Demo Helper Functions and variables
function return_falsey(){return 0}
function placeholder_test(a,x){log(a,x);return x}
function extract_quoted(x){return x.replace(/.*?"(.*?)"/,`$1`)}
function get_index(i){return data => data[i]}
function wrap_in_array(data){return [data]}
function global_push (...a){return l=>{l.push(...a);return l}}
function log (...x){console.log(...x);return x}
function greater_than(n){ return x => x > n}
function double(x){return x * 2}
function sum(data){return data.reduce((a,b)=>a+b)}
function is_array(data){return Array.isArray(data)}
function is_string(data){return typeof data === `string`}
function is_number(v){return typeof v ===`number`&&!isNaN(v)}
function mutate(d){log(`Mutate`);d.length=2;return `ignored rv`}
function make_el({parent=document.body,tag='div'}){
  let holder = is_string(parent)
    ?document.getElementById(parent)
    :parent
    //log({holder,parent})
  return holder.appendChild(document.createElement(tag))
}
function set_props(props){return el=>{
  Object.entries(props).forEach(([k,v])=>{el[k]=v}); return el
}}
//Items for later examples
var custom={global:{method:x => { log(`NESTED`,x); return x; }}}
//--------------------------------------------------------------
demonstrate_scope()