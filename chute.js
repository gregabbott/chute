const chute = (()=>{
/* https://gregabbott.github.io/chute By + Copyright Greg Abbott
[V1=2024-11-27][V=2024-12-07.1]*/
const stringy=x=>JSON.stringify(x),
error=(...x)=>{throw new Error(x)},
is_fn=x=>x instanceof Function,
is_number=v=>typeof v ==='number'&&!isNaN(v),
is_array=x=>Array.isArray(x),
is_object=v=>v&& typeof v=='object'&&!Array.isArray(v),
is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k]),
is_global_fn=name=>is_fn(globalThis[name]),
loop_o=f=>o=>{for(let k in o)if(f(k,o[k],o)===!1)break},
chute_lib={},//Holds chute's own functions: log, tap, do, if
PLACEHOLDER = {},//Sets data argument position in .fn calls.
chutes=(seed,...args)=>new_chute({seed,args})//Becomes chute FN
//`chute(seed)` calls chutes, returns new chute setup with seed
chutes.x=PLACEHOLDER//Gives user access via `(chute_fn_name).x`
chutes.library={}//Holds Fns FEED/LIFT gave to ALL chutes
chutes.lifted_libraries=[]//Holds libs LIFT gives to all chutes
//lifted_libraries can call ".fn_name" and ".lib_name.fn_name"
const load_library_given_to_lift =(k,v)=>{
  if(!is_object(v))return
  chutes.library[k]=v
  chutes.lifted_libraries.push(v)
}
function load_lift(o){// hoist
  if(!is_object(o)) error(`give .lift 1 object`)
  loop_o(load_library_given_to_lift)(o)
}
chutes.lift= load_lift
const load_item_given_to_feed=(k,v)=>{
  if(is_fn(v)||is_object(v))chutes.library[k]=v
}
function load_feed(o){
  if(!is_object(o))error(`feed accepts an objects`)
  loop_o(load_item_given_to_feed)(o)
}
chutes.feed=load_feed
function make_memoizer(a_chute){return f=>{
  let n = f.name,
  keep=n&&!is_global_fn(n)&&!a_chute.fns_seen[n]
  if(keep)a_chute.fns_seen[n]=f
  return f
}}
chute_lib.log=({args,data})=>{
  if(args.length>0){console.log(...args,data)}
  else console.log(data)
  return data
}
chute_lib.do=({args,data,a_chute})=>{//[f1,f2,f3]->f3(f2(f1(x)))
  if(args.length==0)error('.do needs 1+ arguments')
  return args.reduce((data,arg)=>{
    if(arg==='log'){
      console.log(data)
      return data
    }
    else if(is_fn(arg)){
      a_chute.keep(arg)
      return arg(data)
    }
    return arg//Likely an expression result: `.do(variable*5)`
  }
  ,data)
}
const call_a_function=({fn,data,args})=>{
  if(args.length===0)return fn(data)
  let processed_args=swap_placeholders(args,data)
  let had_placeholder=processed_args!==args
  if(had_placeholder)return fn(...processed_args)
  // Arguments lack placeholder for data
  else return fn(...args)(data)//Expect a Fn to provide data.
}
const swap_placeholders=(args,data)=>{
  let must_swap=args.length>0&&args.includes(PLACEHOLDER)
  if(must_swap)return args.map(a=>a===PLACEHOLDER?data:a)
  return args
}
const chain_stopping_methods=new Set([
  'forEach',//returns undefined
  'push',//returns new length
  'unshift',//returns new length
])
function is_condition_block(o){
  //Has {if:[q,a]} and any else_ifs have valid [q,a] pairs
  if(!is_object(o))return false
  if(!'if' in o)return false
  const is_q_a=x=>is_array(x)&&x.length===2&&0 in x && 1 in x
  let results = Object.entries(o).reduce((a,[k,v])=>{
    if(k=='if'&&is_array(v)&&is_q_a(v)){ a.valid[k]=v }
    else if(k=='else_if'){
      let Y=is_array(v)&&v.map(is_q_a).filter(x=>!x).length<1
      a[Y?'valid':'invalid'][k]=v
    }
    else if(k=='else'){ a.valid[k]=v }
    else { a.invalid[k]=v }
    return a
  },{valid:{},invalid:{}})
  //console.log(results)
  return Object.keys(results.invalid).length===0
}
function process_condition_block(c,data,a_chute) {
  //Code below allows a user to provide `undefined` as a 'Then'
  //User may pass in non-global functions, in Ifs and or Thens:
  //Memoize these for dot-style calling in the same chute.
  let to_remember = c.else_if
    ?[c.if, ...c.else_if]
    :[c.if]
  to_remember.forEach(([q,a])=>{
    if(is_fn(q))a_chute.keep(q)
    if(is_fn(a))a_chute.keep(a)
  })
  function evaluate({condition,data}){ 
    if(is_fn(condition))return condition(data)
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
    if(is_fn(c.else))a_chute.keep(c.else)
    return c.else
  }
  return data//No matches
}
chute_lib.if=({args,data,a_chute})=>{
  if(args.length==0)error('.if needs 1-2 arguments')
  let conditions_block=
     args.length===2?{if:args}//reshape as if-else object
    :args.length===1?args[0]
    :false
  if(is_condition_block(conditions_block)){
    let rv = process_condition_block(
      conditions_block,
      data,
      a_chute
    )
    let unchanged=data===rv
    if(unchanged)return data
    if(is_fn(rv))return call_a_function({fn:rv,data,args:[]})
    //^If above true, memoized the FN in process_condition_block
    return rv
  }
  else {
    error(`.if block incorrect`,args)
    return data
  }
}
chute_lib.tap=({args,data})=>{
  let fn = args[0]
  if(is_fn(fn)) fn(data)//ignore return
  else error('give .tap a fn to send data to')
  return data
}
chute_lib.with=({args,data,a_chute})=>{//configure a chute
  let config = args
  if(a_chute.with_received)error(`1 with per chute`)
    a_chute.with_received=true
  let valid_config=config.length===1&&is_object(config[0])
  if(!valid_config)error('.with accepts 1 object for settings')
  config=config[0]//settings object
  if(config.sync)load_sync_fn(config.sync,a_chute)
  if(config.skip_void)a_chute.skip_void=!!config.skip_void
  if(config.feed)load_feed(config.feed)
  if(config.lift)load_lift(config.lift)
  return data//Leaves data unchanged
}
function load_sync_fn(o,a_chute){
  if(!is_fn(o))error(`"sync" takes "v=>external_variable=v"`)
  a_chute.sync_data=o
  a_chute.sync_data(a_chute.get_data())//Define external_variable
}
function handle_nested_access({keys,args,a_chute,chute_lib}){
  let data = a_chute.get_data()
  let skip_void = a_chute.skip_void
  // This finds break points in a dot sequence.
    //if given: ".reverse.log[4].JSON.stringify(Args)"
    //it deduces: .reverse|.log|index 4|.JSON.stringify(Args)
  function setup_root(key,a){
    //let o = {  }
    let desc = `a built in chute method, `+
    `a method of the_current_data, `+
    `a global function, `+
    `a function passed in to this chute via a previous call, `+
    `or Chute's .feed or .lift properties`
    //console.log(`find root of "${key}"`,a.data)
    //HIERARCHICAL ORDER
    let chute_fn=chute_lib.hasOwnProperty(key)//<-non native 
      if(chute_fn)return ['chute_lib',chute_lib]
    let seeded_chute=a.data!==null&&a.data[key]!==undefined
      if(seeded_chute)return['the_current_data',a.data]
    let memoised=a_chute.fns_seen[key]
      if(memoised)return['memoized_function',a_chute.fns_seen]
      if(chutes.library[key])return ['Feed_lib',chutes.library]
    let lifted_lib=chutes.lifted_libraries.find(lib=>lib[key])
      if(lifted_lib)return['Lift_lib',lifted_lib]
    let global_el=globalThis[key]!==undefined
      if(global_el)return ['global_this',globalThis]
    error(`"${key}" is not: ${desc}`)
  }
  return keys.reduce((a,key,i,l)=>{
    if(!a.path){
      ([a.root_string,a.root]=setup_root(key,a))
      a.path = a.root//a new path starts with the root
      a.context=a.root//context means the item that holds the FN
      /*  globalThis.JSON.stringify(Args)
          \________/ \__/ \_______/
              |       |      |
            root   context  Fn
      */
      //console.log(`root of ${key} is ${a.root_string}`)
    }
    a.path=a.path[key]//e.g. GlobalThis['JSON']
    let is_last_key=i==l.length-1
    if(is_last_key)return try_do({fn:a.path,key,a,args})
    let next_key=keys[i+1]
    let found_last_in_current_path=a.path[next_key]===undefined
    if(found_last_in_current_path){
      //console.log(`run "${key}"`)
      a.data = try_do({fn:a.path,key,a})//not last key so 0 args
      //^ Data forms input for next FN && not saved to chute yet
      // next key starts a new path:
      a.path=null//reset
    }
    a.context=a.path//the current item holds the next item
    return a
  },{path:null,data,context:null,root:null})
  function try_do({fn,key,a,args=[]}){
    //console.log(`RUN ${a.root_string}'s '"${key}"`)
    // Dot-style-calls use functions Chute can access already:
    // no need to memoize fn, but inspect the arguments for fns
    if(!is_fn(a.path)){
      error(`${a.root_string}'s … "${key}" is not a FN`)
    }
    let rv
    if(a.root==chute_lib)rv=fn({args,data:a.data,a_chute})
    else if(
      a.root===globalThis
      ||a.root==a_chute.fns_seen
      ||a.root==chutes.library
      ||a.root_string=='Lift_lib'
    ){
      rv = call_a_function({fn,data:a.data,args})
    }
    else {//current_data.a.b.c.fn(),
      //Call any function the current_data contains.
        //To restrict to native methods (e.g. .map .reduce),
        //add condition is_js_method(data,key)
      rv = fn.call(a.context,...swap_placeholders(args,a.data))
      rv = chain_stopping_methods.has(key)?a.data:rv
    }
    return skip_void&&rv===undefined?a.data:rv
  }
}
const blank_chute=()=>({
  data:null,
  fns_seen: {},//non-global named fns encountered memoized
  with_received:false,
  sync_data:null,//Receives `x=>user_variable=x` to send data
  skip_void:true,//Default
})
function new_chute({seed,args}){
  let a_chute=blank_chute()
      a_chute.keep=make_memoizer(a_chute)
  a_chute.set_data=x=>{
  //console.log(`result of "${keys[0]||'nameless'}"`,x,typeof x)
    if(a_chute.skip_void&&x===undefined)return/*move on*/
    if(a_chute.sync_data/*provided*/){a_chute.sync_data(x)}
    a_chute.data=x
  }
  a_chute.get_data=()=>a_chute.data
  a_chute.set_data(seed)//initial chute call may give seed value
  if(args.length>0){
    a_chute.set_data(chute_lib.do({args,data:seed,a_chute}))
  }
  const target=()=>{}
  const keys=[]//i.e call_list
      //^current keys (named calls) in this chute
  function get(target,key){
    keys.push(key)//collect all keys until user calls with '()'
    return proxy
  }
  function apply(target,this_arg, args){
    let named_end_chute=['_end','_$'].includes(keys.at(-1))
    if(named_end_chute)keys.pop()
    let nameless_call=keys.length==0
      let nameless_do_call=nameless_call&&args.length>0
      let nameless_end_chute = nameless_call&&args.length===0
    let named_call=keys.length>0
    let end_chute = nameless_end_chute || named_end_chute
    if(nameless_do_call){
      a_chute.set_data(
        chute_lib.do({args, data:a_chute.get_data(), a_chute})
      )
    }
    if(named_call){// .x(anything) x==anything except end
      a_chute.set_data(handle_nested_access({
        keys, a_chute, args, chute_lib
      }))
    }
    //processed all keys
    keys.length=0
    return end_chute?a_chute.get_data():proxy
  }
  let proxy = new Proxy(target, {get,apply})
  return proxy
}
return chutes
})()