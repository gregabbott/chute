const chute = (()=>{
/* https://gregabbott.github.io/chute By + Copyright Greg Abbott
[V1=2024-11-27][V=2024-12-01]*/
const keys=[],
stringy=x=>JSON.stringify(x),
log=(...a)=>x=>(console.log(...a),x&&console.log(x),x),
error=(...x)=>{throw new Error(x)},
is_fn=x=>x instanceof Function,
is_number=v=>typeof v ==='number'&&!isNaN(v),
is_array=x=>Array.isArray(x),
is_object=v=>v&& typeof v=='object'&&!Array.isArray(v),
is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k]),
is_global_fn=name=>is_fn(globalThis[name]),
non_global_fns_encountered = new Map(),
BOX=(seed,...fns)=>make_proxy({seed,fns}),//becomes `chute` FN
//`chute(seed)` calls above, returns new chute, ready for calls
PLACEHOLDER = {}//named call data argument position PLACEHOLDER
BOX.x=PLACEHOLDER//for access by user via `(chute Fn name).x`
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
  //This method allows user to provide `undefined` explicitly 
  //Block won't pass as "if block" if a pair lacks Q or A value
  //User may pass in non-globals Fns as questions AND answers
  //memoize so user may .name call them later in chute.
  [c.if,...c.else_if].forEach(([q,a])=>{
    if(is_fn(q))memoize_if_applicable(q)
    if(is_fn(a))memoize_if_applicable(a)
  })
  function evaluate({condition,data}){ 
    if(is_fn(condition)){return condition(data)}//test data
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
  //No matches
  return data
}
function memoize_if_applicable(f){
  if(f.name && !is_global_fn(f.name)){
  //Passed in non-global function, probably a unary
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
  if(is_object(f)&&is_condition_block(f)){
    let rv = process_condition_block(f,data)
    /**console.log({
      data,
      if_else_rv:rv,
      rv_a_fn   :is_fn(rv),
      unchanged :data===rv
    })/**/
    let unchanged=data===rv
    if(unchanged)return data
    if(is_fn(rv)){//already memoized in process_condition_block
      return call_a_function(rv,data,[])
    }
    return rv
  }
  return f//likely a result of Token expression EG`.do(token*5)`
}
const sub_chain=(a,data)=>a.reduce(sub_chain_reducer,data)
const void_returning_methods=new Set([
  'forEach',//no return
  'push',//returns new length
  'unshift',//as above
])
const call_a_function=(fn,data,a)=>{
  if(a.length===0)return fn(data)
  let i = a.indexOf(PLACEHOLDER)
  if(i!==-1){//has placeholder
    a[i]=data//replace placeholder with data
    return fn(...a)
  }
  else{
    return fn(...a)(data)
  }
}
const call_method_of_data=(data,key,a)=>{
  // .not_a_chute_key()
  // already memoized any fn this sees
  if(is_js_method(data,key)){
    let i = a.indexOf(PLACEHOLDER)
    if(i!==-1){a[i]=data}//replace placeholder with data
    let rv= data[key](...a)
    return void_returning_methods.has(key)?data:rv
  }
  /*
  console.log({
    fn,
    n:'call_method_of_data',
    data:stringy(data),
    key,
    a
  })
  /**/
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
    error(`Data lacks "${key}" and not a global function`)
    return data
  }
}
const dot_if=({when,then,data})=>{
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
function make_proxy({seed,fns}){
  //Private data per chute
  let data = null,
    update_token_fn=null//lets user access running chute data
  //set and get data allows easy change of data location
  const set_data=x=>{
  //console.log(`result of "${keys[0]||'nameless'}"`,x,typeof x)
    if(update_token_fn/*provided*/){update_token_fn(x)}
    data=x
  },
  get_data=()=>data,
  target=()=>{}
  function get(target,k){
    //chute._=data//give access
    keys.push(k)
    return proxy
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
      else{//EG .log()/*no key*/(<-nameless do call)(<-another)
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
      //GET INDEX
      //When user types [0], this takes no arguments
      //As no function or method will start with or == a number,
      //Chute can treat as instruction to make data this value.
      let key_without_parens=keys.length>1&&i!==last_key
      if(key_without_parens){
        if(key=='log')console.log(get_data())
        else if(key=='if')error('.if needs 2 arguments')
        else if(key=='tap')error('.tap needs 1 fn argument')
        else if(key==='do')error('.do needs 1+ arguments')
        else if(is_number(Number(key))){
          set_data(data[key])
        }
        else if(key)set_data(
          call_method_of_data(get_data(),key,[])
        )
        return rv
      }
      if(keys.length===1||i===last_key){
        if(key=='log'){console.log(...a,get_data())}
        else if(key=='with'){//Setup FN
          if(update_token_fn!==null){
            error('already set up. 1 with per chute')
          }
          else{
            if(a.length!==1||!is_fn(a[0])){
              error('with accepts v=>your_variable=v')
            }
            else{
              update_token_fn=a[0]
              //Token needs a value, user may have put `let x;`
              update_token_fn(data)
            }
          }
        }
        else if(key=='if'){
          set_data(
            dot_if({when:a[0],then:a[1],data:get_data()})
          )
        }
        else if(key=='tap'){
          if(is_fn(a[0])) a[0](get_data())
          else error('give .tap a fn to send data to')
        }
        else if(key==='do'){
          set_data(sub_chain(a,get_data()))
        }
        else if(is_number(Number(key))){
          set_data(data[key])
          //Index access takes no arguments. (e.g. `[0]`)
          //So any '()' with arguments after [\d] is a .do call
          set_data(sub_chain(a,get_data()))
        }
        else if(key){
          set_data(call_method_of_data(get_data(),key,a))
        }
        keys.length=0//Processed all keys, reset array
      }
      return rv
    },proxy)
  }
  let proxy = new Proxy(target, {get,apply})
  //Use any seed value initial `chute()` may have provided:
    set_data(seed)
  //Run data through any functions the initial chute call gave.
    if(fns.length>0)set_data(sub_chain(fns,seed))
  return proxy
}
return BOX
})()