function demonstrate_scope(){
// =============================================================
// # CHUTE
const chute_1a_result = chute(// Call Chute to make a new chute.
  [1, 2, 4],// Optionally seed the chute in the initial call.
  global_push(8),//Optionally list first functions to run.
  local_push(16),//f3,f4,f5…
)// Swap between dot-style and parentheses calls as needed.
// =============================================================
// # BASICS - Calls possible without any setup
// The next section covers calls a chute can make without setup.
// (To see what chute can do when setup, see the Feed section).
// =============================================================
// ## CALL METHODS
// (The commands below continue the chute above)
.map(double)// Call any methods native to the current data.
.push(6)// In Chute, ".push" returns the array to the chute.
.forEach(x=>log(`SideFx: ${x}`))// ".forEach" returns its input.
.reverse// Calls needing no arguments need no parentheses.
// ^ See Chute's "path" setting to allow explicit calls only.
.filter(greater_than(4))
// =============================================================
// ## DOT-STYLE CALL GLOBAL FUNCTIONS
// Chute can invoke any global functions using dot-style calls.
// This call style sends the current data through a function,
// and keeps the returned value for any next step in a chute.
// ------------------------------------------------------------
// ### Dot-style Unary
// To call a unary, a function that takes a single argument,
// name the function in the dot-style, and provide no arguments.
// Chute will send the function the current data as argument 1.
.wrap_in_array // Unary calls may omit or include parentheses.
// The above call equates to "data = function_name(data)".
// ------------------------------------------------------------
// ### Dot-style Curried
// For a function that takes arguments and data separately,
// call the function dot-style, and provide the arguments only.
.get_index(0)
// The above call equates to "data = function(arguments)(data)"
// Chute sends the arguments it receives to the function named.
// The named function then returns a second function:
// one prepared for the data based on the arguments provided.
// Chute sends the current data to this second function,
// and uses the value it returns for the next step in the chute.

// For sending the current data at a specific argument position,
// see the "argument placeholder" section.
// ------------------------------------------------------------
// ## CALL ANY FUNCTIONS 
// Chute has a "do" method that takes one or more functions.
// The method sends the current data through a given function,
// and keeps the returned value as the new chute data.
.do(local_push(64))
// ------------------------------------------------------------
// ## Sub-Chains
// When given multiple functions, "do" works like a sub-chain:
// It sends the current data to the first function,
// the result of the first to the second, and so on,
// until the last function in the call returns the final result.
.do(
  global_push(32),
  local_push(64),
  x=>{x.push('Inline');return x}
)
// Because a "do" call receives functions as arguments,
// the method works with global and non-global functions,
// as well as single-use inline functions (as shown above).
// ------------------------------------------------------------
// ## Nameless Calls
// Chutes allow nameless calls to the "do" method.
// Nameless calls take one or more arguments.
(non_global_unary,global_push(128))
// Nameless calls can follow any call that includes parentheses.
// Any dot-style calls may have parentheses when wanted,
// and one nameless call may always follow another.
// =============================================================
// ## Memoise Non-Global Functions
// When a chute receives a named non-global function,
// it makes it available to dot-style call until the chute ends.
.non_global_unary()
// The dot-style call above uses parentheses by choice.
// The parentheses allow a nameless call to follow it, as below.
// ------------------------------------------------------------
// A call inside the call below returns an unnamed function.
(local_push(80))
// Chute sends the data through this function, keeps the return,
// then forgets the function as it lacks a name to call it by.
// =============================================================
// ## INLINE FUNCTIONS 
// Chute supports single-use inline functions where needed.

( x => { log('Inline function received:', x); return x } )

// See the "Sync" section for inline expressions in Chute calls.
// =============================================================
// ## CALL GLOBAL NESTED METHODS
.JSON.stringify// a.b.c.method()
.log(`Stringified!`) // This line calls a built in chute method.
.JSON.parse
.log(`Parsed back`)
.custom.global.method// Nested calls can omit parentheses.
.log
// In the lines above, Chute figures out when to call functions.
// See Chute's "Path" setting to control dot-sequence handling.
// =============================================================
// # ENDING A CHUTE
() // An empty nameless call ends a chute and returns its data.
// Every step above happens in a single chute.
log({chute_1a_result})
// To make a call nameless, a prior item needs end parentheses.
// (Otherwise the call only explicitly calls the prior item.)
    // For example:
    // ".log" omits parentheses.
    // ".log()" explicitly calls log, but gives no arguments.
    // ".log()()" does the same, and then makes a nameless call.
// Method calls after ending a chute act on the data directly.

// A chute can also end with an explicit call:
// "._end()" or "._$()"
let alternate_chute_ending = chute([2,3,4])
.map(double)//native method
.wrap_in_array//global function
._end()//chute command

log({alternate_chute_ending})
// =============================================================
// # ARGUMENT PLACEHOLDER - Give the data at a custom position.
// Chute's property "x" points to a placeholder object.
// The placeholder object represents the current data in a chute
// and can fill argument positions in dot-style function calls.
// When a chute receives the placeholder as a function argument,
// the call handler replaces it with the current data value.

// The following line sets a custom name for the placeholder.
const placeholder = chute.x
// In practice, an underscore may make sense as a placeholder.

// Sometimes a quick-to-type one letter placeholder works well,
// other times something more descriptive may keep things clear.

const chute_1b_result = chute([1,3,5,7,9])
// The second argument in the next call uses the placeholder.
.placeholder_test(`See the data in the console ->`,placeholder)
// The call above equates to: "data = fn(string, current_data)".

// See also the "Sync" setting for Chute's Current Value Token.
// =============================================================
// # TOOLS - BUILT IN METHODS / COMMANDS
// The sections below detail a few of Chute's built in methods. 
// Besides ".do", Chute has "log", "tap", and "pick"
// =============================================================
// ## LOG 
// The built in method ".log()" logs the current data.
.log
// If it receives any arguments, it logs these before the data.
.log(`Log with note`)
// =============================================================
// ## TAP
// Chute's built in ".tap" method sends data to a function,
// ignores anything returned, and keeps the existing data.
// However, a ".tap" function might mutate data directly.
.tap(mutate)
// The tap method allows for any needed side effects mid-chute.
.log(`Post tap:`)
// =============================================================
// ## PICK
// ".pick" calls a built in if-else method.

// ---- (B) if, else if, else (Initial implementation) ---------
// Shape:
// The If Else block needs an object with an "if" property.
// The "if" property must hold a 2 item array (An If, a Then).
// Two other optional properties include "else_if" and "else".
// Any "else_if" property holds an array of 2 element arrays.
// Any "else" property holds a value, or a function.
// The block can have "else" without "else_if" or vice-versa.

// Each pair array holds a condition [0] and returnable [1].
// Chute checks each condition until it finds a truthy one.
// Conditions may reference functions to test the current data.
// Chute sends the current data value through these functions,
// and checks the truthiness of the value returned.

// The If Else block returns a truthy condition's returnable.
// When the "if else" block returns a value, Chute keeps it.
// When the block returns a function, chute uses it.
// Chute sends the current data to any returned function,
// and keeps whatever that function returns as the new data.

// With no match and no "else" given, the data stays the same.
.log('Before pick:')
.pick({
  if: [is_number, local_x10],
  else_if: [
    [is_string, 16],
    [is_array, total],
    [true, `yes`]
  ],
  else: 41
})
.log('After pick:')
// Some ".pick" calls might contain non-global named functions.
// When Chute encounters these functions, it remembers them,
// and makes them dot-style callable until the chute ends.

// As the "pick" block above provided such a function,
// the next dot-style call can make use of it.
.local_x10
.log('Multiplied by 10:')

/* To demonstrate an alternative to the ".pick" call above,
   the code below shows the same idea as an inline function:

  .do(data=>{
    if(is_array(data)){ return 8 }
    else if(is_string(data)){ return 16 }
    else if(is_number(data)){ return local_x10(data) }
    else { return 41 }
  })
*/

// =============================================================
// Misc. examples
.toString
.log('string:')
.replace(/$/,`!`)
.log()
()//This line ends chute 1B.
log({chute_1b_result})

// The above demos make use of these non-global functions:
function local_push(...a){return l=>(l.push(...a),l)}
function non_global_unary(f){log(`Local Unary`);return f}
function local_x10(f){log(`Doing: ${f} * 10`);return f*10}

// =============================================================
// # MAKE - Make Chute with custom settings
// To configure a custom chute call chute.make()
// It takes an object for optional settings detailed below.
// Make returns a configured chute ready for use.
// =============================================================
// ## SYNC - Set up a current value token for inline expressions
// A settings object for a chute can include a "sync" property.
// The "sync" property takes a function that updates a variable.
// As a chute runs, it sends this function the current data.
// Calls within the chute can then use the variable as needed.

let x // A variable to hold the current value can have any name.
//The line below calls "chute.make" for a custom chute.
const current_value_token_chute = chute.make({
  // This settings object gives the chute a "sync" function.
  sync:v=>x=v//This sync function controls the variable x above.
})//This configured chute will work as before but can do more.
({two:2,four:4,eight:8})// It begins with a seed value as usual.
// All of the calls below make use of the current value token.
// The token allows for:
(x.eight) // PROPERTY ACCESS   vs. "(x=>x.eight)"
(x + 10)// ARITHMETIC           vs. "(x=>x+10)"
({data:x})// OBJECT LITERALS    vs. "(x=>{data:x})"
(`Answer is "${x.data}"`)// TEMPLATE LITERALS
(4>2?extract_quoted:x)// TERNARY EXPRESSIONS with function call
([48,64,80,parseInt(x)])// ARRAY LITERALS
()//This empty call ends the chute and returns the final value.

log({current_value_token_chute})
// =============================================================
// ## SKIP - Ignore or keep undefined returned from functions
// Chute has a "skip" setting to handle "undefined".
// When enabled, if a function in a chute returns undefined,
// Chute ignores it, and continues with the data it already had.

// When disabled, the chute makes undefined its new value.
// "skip: true" lets a chute continue in more cases.
// The setting defaults to true if not explicitly set.

// As steps in the following chute return undefined,
// having "skip" set to true helps preserve wanted data.
  let skip_void_chute_result = chute.make({skip:true})
  ({
    tag:`div`,
    parent:`dom_example`
  })
  .make_el()
  .set_props({
    id:`element_for_dom_example`,
    title:`This element alerts a message when clicked.`,
    innerText:`Chute #3 made this element`,
    onclick:()=>alert(`Chute!`),
  })//The next call in this chute returns undefined.
  .classList.add(`round_button`)//Undefined triggers 'skip'.
  .log('Data now:')//'skip' prevents losing the chute item.
  ()// The chute ends and returns the preserved item.
  // (If viewing the Chute site, see the created element below.)
  
  log({skip_void_chute_result})

  // ===========================================================
  // ## PATH - Treat a dot sequence as a path or instruction set
  // Chute has a "path" setting that takes a boolean value.
  // The option controls how Chute handles dot sequences.
    
  // ### ON - Treat a dot sequence as a path
  // With "path" enabled, Chute treats dot sequences as paths.
  // To use the example dot-style sequence ".A.B.C()",
  // Chute seeks an A to contain a B holding a function named C.
  // If all goes well, Chute calls C with any arguments given,
  // and moves on to any next step in the chute.
  // In any other event, Chute produces an error message.

  // In this mode, Chute relies on parentheses to delimit calls,
  // so parentheses appear even for call that take no arguments.

  // ### OFF - Treat a dot sequence as a set of instructions
  // With "path" disabled, Chute examines each dot sequence,
  // and makes function calls at logical points along the way,
  // (instead of expecting a single long path to one function).
  
  // For example, in ".reverse.JSON.stringify.log.JSON.parse()",
  // Chute deduces the paths and call-points in the sequence.
  // It arrives at: reverse > JSON.stringify > log  > JSON.parse
  //                call    > path call      > call > path call

  // HOW:
  // If a key in a sequence holds the next key, Chute moves on.
  // Otherwise, Chute expect the current key to hold a function.
  // If it does, Chute sends the data through this function.
  // If not, Chute throws an error having found a bad path.
  // Chute repeats this process for each key in a dot sequence.
  
  // SUMMARY
  // In dot sequences, parentheses always trigger a call.
  // The "path" setting relates to the sequence before the call,
  // and whether Chute should use it to locate one function,
  // or treat it as a set of instructions to work through.

  // The example below shows how to enable the "path" setting.
  let treat_dots_as_path = chute.make({path:true})
  (["a","b","c"])
  // With this setting on, and no parentheses after LOG,
  // Chute wouldn't call LOG, but would expect LOG to hold MAP.
  .log()
  .map((x,i)=>x+i)
  .log()
  ._end()
  log({treat_dots_as_path})
 
  // The "Path" setting defaults to false when not provided.
  // (All other examples represent the setting disabled.)
  // ===========================================================
  // # ALL - SETTING FOR ALL CHUTES
  // ===========================================================
  // ## FEED - Make functions available to all chutes.

  // The Chute function has a "feed" method to take an object.
  // The object takes non-global functions and libraries,
  // and makes them available for dot-style calls in all chutes.

  // To demonstrate, some pseudo functions and libraries follow:
  const name_of_today=()=>
    ['Sunday','Monday','Tuesday','Wednesday',
     'Thursday','Friday','Saturday']
    [new Date().getDay()]
  const really_long_name_library = {
    add:x=>y=>x+y,
    divide_by:b=>a=>a/b,
    subtract:b=>a=>a-b,
    times_by:b=>a=>a*b,
  }
  // The call below gives the items above to the Chute function.
  chute.feed({
    name_of_today,//Add a function.
    really_long_name_library,//Add a library.
    sum:really_long_name_library,//Optionally rename items.
  })
  // ".feed" returns the Chute function so allows chaining.
  // The line below continues the above call into a new chute.
  // It also uses a function just fed in to the "feed" object.
  (10).sum.subtract(2).log('Chained ".feed"')
  
  // ===========================================================
  // ## LIFT - Make functions in libraries directly callable

  // The Chute function has an optional ".lift" method
  // that takes an object of one or more function libraries.
  // Chute refers to objects that hold functions as libraries.
  
  // ".lift" makes these libraries available across all Chutes,
  // and also makes the functions inside each directly callable.
  // ".lift" allows calling ".function_name()" for brevity,
  // as well as ".library_name.function_name()" for context.

  const example_main_library={
    frequently_used_action:x=>x+' time',
    //f2,f3,f4…
    sentence:x=>{console.log(`Today is ${x}!`);return x},
  }

  chute.lift({
    example_main_library
  })
  //".lift" returns the Chute function to allow chaining.
  // The line below continues the above call into a new chute.
  // It also makes used of a library just given to "lift",
  // and directly calls a function in that library by name.
  ('This saves').frequently_used_action.log('Chained ".lift"')

  // The chutes below belong to different function scopes.
  // Using these Chute features, they call the functions above.
}
//--------------------------------------------------------------
//The following lines set up some examples above.
var custom = {
  global:{
    method: x => {
      log(`Custom.Global.Method`, x)
      return x
    }
  }
}
demonstrate_scope()
//--------------------------------------------------------------

// The chute below calls functions from a non-global library
// which an earlier call to "chute.feed" made possible.
// The object that provided the library gave it a shorter name,
// so the chute below can call these functions more easily.

const use_fed = chute(100)
  .sum.add(64)
  .sum.divide_by(25)
  .sum.times_by(3.14)
  .Math.floor()//This penultimate chute call needs parentheses.
  ()//The chute ends with a single nameless call.
log(
  'Result of chute using functions provided via feed',
  use_fed
)
// An object above named "example_main_library" holds functions.
// Chute received this library through its "lift" method.
// This made the functions inside the library callable by name.
// The chute below makes use of this feature.
// It calls a function named "sentence" by its name, 
// instead of having to call "example_main_library.sentence."

const use_lifted = chute()//Chute allows starting with no seed.
  //In the line below, a dot-style function provides the seed.
  .name_of_today//Chute made this non-global function reachable.
  .sentence()
  ()
log(
  'Result of chute using functions provided via lift',
  use_lifted
)
// =============================================================
// # MORE
// =============================================================
// ## RANK - How chute chooses what to do per dot-style call
// Chute evaluates what to do per dot-style call it receives.
// It either finds an action to take, or returns an error.
// Chute searches for matching actions in the following order:
  // A method built in to Chute. (.do, .pick, .tap, etc.)
  // A method of the current data. (.map, .split, .custom.)
  // A named non-global function (given earlier in the chute).
  // A function given to Chute's .feed or .lift methods.
  // A global function.
// The script logic accounts for nested calls to Chute.
// =============================================================
// ## NAME - Give the chute function a custom name when needed.

const $ = chute // This line lets a dollar sign call Chute.

// The next line calls the custom named chute
let custom_named_chute = $([2,3,4])
.map(double)
.get_index(2)
.double
._end()

log({custom_named_chute})

// # Helper function used for the demo
function placeholder_test(a,x){log(a,x);return x}
function extract_quoted(x){return x.replace(/.*?"(.*?)"/,`$1`)}
function get_index(i){return data => data[i]}
function wrap_in_array(data){return [data]}
function global_push (...a){return l=>{l.push(...a);return l}}
function log (...x){console.log(...x);return x}
function greater_than(n){ return x => x > n}
function double(x){return x * 2}
function total(data){return data.reduce((a,b)=>a+b)}
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