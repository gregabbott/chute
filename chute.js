const chute = (()=>{
/* https://gregabbott.github.io/chute By + Copyright Greg Abbott
[V1=2024-11-27][V=2024-12-03.1]*/
const keys=[],
stringy=x=>JSON.stringify(x),
error=(...x)=>{throw new Error(x)},
is_fn=x=>x instanceof Function,
is_number=v=>typeof v ==='number'&&!isNaN(v),
is_array=x=>Array.isArray(x),
is_object=v=>v&& typeof v=='object'&&!Array.isArray(v),
is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k]),
is_global_fn=name=>is_fn(globalThis[name]),
non_global_fns_encountered = new Map(),
PLACEHOLDER = {},//data argument position for dot-style Fn calls
BOX=(seed,...fns)=>new_chute({seed,fns})//becomes `chute` FN
//`chute(seed)` calls above, returns new chute ready for calls
BOX.x=PLACEHOLDER//for access by user via `(chute_fn_name).x`
function is_condition_block(o){
  //HAS {if:[q,a]} and any else_ifs [] filled with [q,a] pairs
  const keys = Object.keys(o),
  valid_q_a=x=>0 in x && 1 in x,//2 values. Not `[,,]`
  has_valid_if = 'if' in o&&is_array(o.if)&&valid_q_a(o.if)
  if(!has_valid_if)return false
  const optional_keys_count = ('else' in o) + ('else_if' in o)
  if('else_if' in o){
    if(!is_array(o.else_if))return false
    if(o.else_if.length>0){
      if(!o.else_if.every(x=>is_array(x)&&valid_q_a(x)))return false
    }
  }
  const other_keys_count = keys.length - 1 - optional_keys_count
  return other_keys_count === 0 && optional_keys_count <= 2
}
function process_condition_block(c,data) {
  //Block won't pass as "if block" if a pair lacks Q or A value
  //Code below allows a user to explicitly provide `undefined`.
  //User may pass in non-global functions as Q's or A's.
  //Memoize when possible, to allow dot-style calling later.
  [c.if,...c.else_if].forEach(([q,a])=>{
    if(is_fn(q))memoize_if_applicable(q)
    if(is_fn(a))memoize_if_applicable(a)
  })
  function evaluate({condition,data}){ 
    if(is_fn(condition)){return condition(data)}
    return condition
  }
  //Return returnable of first truthy match
  if(evaluate({condition:c.if[0],data})){
    return c.if[1]
  }
  if('else_if' in c){
    for (const [condition,then] of c.else_if){
      if (evaluate({condition,data})) return then
    }
  }
  if('else' in c){
    return c.else
  }
  return data//No matches
}
function memoize_if_applicable(f){
  if(f.name && !is_global_fn(f.name)){
  //Passed in named non-global function, probably a unary
    if(!non_global_fns_encountered.has(f.name)){
      //memoize, to allow DOT calls in this same chain
      non_global_fns_encountered.set(f.name,f)
    }
  }
  return f
}
function sub_chain_reducer(data,f){
  //Initial call, Nameless calls, .do calls
  //console.log({n:sub_chain_reducer,data:stringy(data),f})
  if(f==='log'){
    console.log(data)
    return data
  }
  else if(is_fn(f)){
    memoize_if_applicable(f)
    return f(data)
  }
  return f//likely a result of Token expression EG`.do(token*5)`
}
const sub_chain=(a,data)=>a.reduce(sub_chain_reducer,data)
const call_a_function=(fn,data,a)=>{
  if(a.length===0)return fn(data)
  //has args
  let processed_args=swap_placeholders(a,data)
  if(processed_args!==a){//had placeholders
    return fn(...processed_args)
  }
  //no placeholder for data in args
  //expect this fn to return a fn to give data to
  else{
    return fn(...a)(data)
  }
}
const swap_placeholders=(a,data)=>{
  let has_placeholder = a.length>0&&a.indexOf(PLACEHOLDER)!==-1
  if(has_placeholder){//replace any placeholders with data
    return a.map(arg=>arg===PLACEHOLDER?data:arg)
  }
  return a
}
const void_returning_methods=new Set([
  'forEach',//no return
  'push',//returns new length
  'unshift',//as above
])
const dot_style_call=(data,key,a)=>{
  // Dot-style call means chute has access to (or memoized) FN
    /**
  console.log({
    n:'dot_style_call',
    data:data,//stringy(data),
    key,
    a
  })/**/
  if(is_fn(data[key])){//This IF considers any FN in data
    //to only look at native methods use: is_js_method(data,key)
    let rv = data[key](...swap_placeholders(a,data))
    return void_returning_methods.has(key)?data:rv
  }
  if(is_global_fn(key)){
    let fn = globalThis[key]
    return call_a_function(fn,data,a)
  }
  if(non_global_fns_encountered.has(key)){
    return call_a_function(
      non_global_fns_encountered.get(key),
      data,
      a)
  }
  else {
    error(`"${key}" not in data nor a global function`)
    return data
  }
}
const when_then=({when,then,data})=>{
  let condition = when
  if(is_fn(when)){
    memoize_if_applicable(when)
    condition = call_a_function(when,data,[])
  }
  if(condition && is_fn(then)){
    memoize_if_applicable(then)
    return call_a_function(then,data,[])
  }
  else if(condition){
    return then 
  }
  return data//no match
}
const dot_if=({args,data})=>{
  if(args.length==2){
    return when_then({when:args[0],then:args[1],data})
  }
  if(args.length==1
    &&is_object(args[0])
    &&is_condition_block(args[0])){
    let rv = process_condition_block(args[0],data)
    /**console.log({
      data,
      if_else_rv:rv,
      rv_a_fn   :is_fn(rv),
      unchanged :data===rv
    })/**/
    let unchanged=data===rv
    if(unchanged)return data
    if(is_fn(rv)){//memoized this FN in process_condition_block
      return call_a_function(rv,data,[])
    }
    return rv
  }
  error(`.if block incorrect`,args)
  return data
}
function handle_nested_access(keys_so_far,key,data,args){
  keys_so_far.push(key)//Collect path
  if(!args) return //Args follow final key in path
  //Find root: (A) property of data; or (B) global object
  let root=data[keys_so_far[0]]!==undefined?data:globalThis
  let context//The level above the function, for `this` context.
  function check_path_and_get_item(){
    return keys_so_far.reduce((a,x,i)=>{
      if(a[x]!==undefined){
        a=a[x]
        if(i<keys_so_far.length-1){//not last
          context=a
        }
        return a
      }
      else {
        console.log(a[x])
        error(
          `"${x}" not found at path: "${root===globalThis?'GlobalThis':'CurrentData'}.${
            keys_so_far.join('.')}"`
        )
      }
    },root)
  }
  let fn = check_path_and_get_item()
  if(is_fn(fn)){
    //let o={root,path:keys_so_far.join('.'),fn,data,args}
    //console.log(o)
    if(root===data){
      //Call a function the current data holds.
        //e.g. `.classList.add` in a DOM element.
      //Because data holds the FN:
      //If 0 args, call with 0 args: Don't send data as arg 1.
      //If 1+ args, args may hold data placeholder where needed.
      return fn.call(context,...swap_placeholders(args,data))
      //Reason for ".call": some functions lose context.
        //e.g. if you separate ".add" from "classList.add"
        //".add" on its own won't know what it should add to.
      //using ".call" lets the function know the relevant object
    }
    else{
      //a call to a function in global namespace
      //e.g. a_library.a_group.a_function
      return call_a_function(fn,data,args)
    }
  }
  else return data
}
function new_chute({seed,fns}){
  //Private data per chute
  let data = null,
    with_received=false,
    sync_data=null,//Chute sends current data to any FN given
    //Takes a FN like: `chute_data=>out_of_scope_variable=chute`
    //Which lets user access data mid-chute
    skip_void=false//default if not given
  //set and get data allows easy change of data location
  const set_data=x=>{
  //console.log(`result of "${keys[0]||'nameless'}"`,x,typeof x)
    if(skip_void/*avoid saving if*/&&x===undefined)return
    if(sync_data/*provided*/){sync_data(x)}
    data=x
  },
  nested_access=[],
  get_data=()=>data,
  target=()=>{}
  function get(target,key){
    //chute._=data//for wider access
    if(is_number(Number(key))){//(vs HAS a number) //GET INDEX
      //dot-style calls don't allow leading digits: ".0"
      //user may attempt to access data index with brackets: [0]
      //If so, expect no arguments. Set data to value of index.
      set_data(get_data()[key])
      //Treat any '()' with arguments after [\d] as a .do call
        //in apply fn: set_data(sub_chain(a,get_data()))
      return proxy
    }
    keys.push(key)
    return proxy
  }
  function handle_dot_with(a){
    if(with_received)error(`1 with per chute`)
    with_received=true
    if(a.length!==1||!is_object(a[0])){
      error('.with accepts 1 object for settings')
    }
    //settings object
    a=a[0]
    if(a.token){
      if(is_fn(a.token)){
        sync_data=a.token
        //Token needs a value to work.
        //User may have put `let x;`
        sync_data(data)
      }
      else{
        error('token accepts `v=>your_variable=v`')
      }
    }
    if(a.skip_void){//accept truthy
      skip_void=Boolean(a.skip_void)//default false
    }
  }
  function apply(target,_, a){
    /**console.log({
      n:'proxy_apply',
      data:stringy(get_data()),
      keys:stringy(keys),
      args:a
    })/**/
    if(keys.length==0){
      if(a.length===0){//E.G. `.log()()` Empty call ends chute
        return get_data()
      }
      else{//EG .log()/*no key*/(<-nameless .do call)(<-another)
        set_data(sub_chain(a,get_data()))
        return proxy
      }
    }
    let last_key = keys.length-1
    return keys.reduce((rv,key,i)=>{
      //User may have written:
      //.log   .reverse  .map   (              args) 
      //^1     ^2        ^3     ^the 'apply'   ^belong to ^3
      //Chute stores each .name_style_call until user gives '()'
        //`()` applies to the key it directly follows.
        //`()` may contain arguments for that most recent key.
      //On apply, Chute goes through each stored `.name_call`.
      //It performs appropriate action based on the exact call.
      let key_without_parens=keys.length>1&&i!==last_key
      if(key_without_parens){
        if(key=='log')error('.log needs parens')
        else if(key=='if')error('.if needs 1-2 arguments')
        else if(key=='tap')error('.tap needs 1 fn argument')
        else if(key==='do')error('.do needs 1+ arguments')
        else if(is_number(Number(key))){
          set_data(get_data()[key])
        }
        else if(key){
          //e.g k1 == `JSON`, k2 == 'stringify' then "()"
          //handling item in path before method
          //method == string before ()
          handle_nested_access(nested_access,key,get_data())//a.b.c()
        }
        return rv
      }
      if(keys.length===1||i===last_key){
        if(key=='log'){console.log(...a,get_data())}
        else if(key=='with'){//Setup FN
          handle_dot_with(a)
        }
        else if(key=='if'){
          set_data(dot_if({args:a,data:get_data()}))
        }
        else if(key=='tap'){
          if(is_fn(a[0])) a[0](get_data())
          else error('give .tap a fn to send data to')
        }
        else if(key==='do'){
          set_data(sub_chain(a,get_data()))
        }
        else if(key){
          if(nested_access.length>0){//if .a.b.c() this == 'c()'
            set_data(
              handle_nested_access(nested_access,key,get_data(),a)
            )
            nested_access.length=0//Reset
          }
          else{//.something()
            set_data(dot_style_call(get_data(),key,a))
          }
        }
        keys.length=0//Processed all keys
      }
      return rv
    },proxy)
  }
  let proxy = new Proxy(target, {get,apply})
    //chute() may have provided initial value and fns
  set_data(seed)
  if(fns.length>0)set_data(sub_chain(/*initial*/fns,seed))
  return proxy
}
return BOX
})()