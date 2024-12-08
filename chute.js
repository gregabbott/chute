const chute = (()=>{
// https://gregabbott.github.io/chute By + Copyright Greg Abbott
// [V1=2024-11-27][V=2024-12-08.1]
const stringy=x=>JSON.stringify(x),
error=(...x)=>{throw new Error(x)},
is_fn=x=>x instanceof Function,
is_number=v=>typeof v ==='number'&&!isNaN(v),
is_array=x=>Array.isArray(x),
is_object=v=>v&& typeof v=='object'&&!Array.isArray(v),
is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k]),
is_global_fn=name=>is_fn(globalThis[name]),
loop_o=f=>o=>{for(let k in o)if(f(k,o[k],o)===!1)break},
lift_libraries=o=>{// hoist
  if(!is_object(o))error(`give .lift 1 object`)
  loop_o((k,v)=>{
    if(!is_object(v))return
    CHUTE.library[k]=v
    CHUTE.lifted_libraries.push(v)
  })(o)
},
load_feed_items=o=>{
  if(!is_object(o))error(`give .feed 1 object`)
  loop_o((k,v)=>{if(is_fn(v)||is_object(v))CHUTE.library[k]=v})
  (o)
},
chute_lib={},//Holds a chute's methods: log, tap, do, if
PLACEHOLDER = {},//Sets data argument position in .fn calls.
CHUTE=(seed,...args)=>new_chute({seed,args})//Becomes chute FN
//`chute(seed)` calls CHUTE, returns new chute setup with seed
CHUTE.x=PLACEHOLDER//Gives user access via `(chute_fn_name).x`
CHUTE.library={}//Holds Fns FEED/LIFT gave to ALL CHUTE
CHUTE.lifted_libraries=[]//Holds libs LIFT gives to all CHUTE
//lifted_libraries can call ".fn_name" and ".lib_name.fn_name"
CHUTE.lift=lift_libraries
CHUTE.feed=load_feed_items
chute_lib.log=({args,data})=>{
  if(args.length>0){console.log(...args,data)}
  else console.log(data)
  return data
}
chute_lib.do=({args,data,a_chute})=>{//[f1,f2,f3]->f3(f2(f1(x)))
  if(args.length==0)error('give .do >0 arguments')//.log.do.log
  return args.reduce((data,arg)=>{
        if(arg==='log'){console.log(data);return data}
    else if(is_fn(arg)){a_chute.keep(arg);return arg(data)}
    return arg//Likely an expression result: `.do(variable*5)`
  },data)
}
const make_memoizer=a_chute=>f=>{
  let n = f.name
  let keep=n&&!is_global_fn(n)&&!a_chute.fns_seen[n]
  if(keep)a_chute.fns_seen[n]=f
  return f
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
const is_condition_block=o=>{
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
const process_condition_block=(c,data,a_chute)=>{
  //Memoize non-global Q/A Fns to dot-style call in same Chute
  (c.else_if?[c.if, ...c.else_if]:[c.if]).forEach(([q,a])=>{
    if(is_fn(q))a_chute.keep(q)
    if(is_fn(a))a_chute.keep(a)
  })
  // Get first truthy's returnable (which may === undefined)
  function Q({q,data}){ if(is_fn(q)){return q(data)}return q }
  if(Q({q:c.if[0],data}))return c.if[1]//answer
  if('else_if' in c){
    for(let[q,a] of c.else_if)if(Q({q,data}))return a
  }
  if('else' in c){
    if(is_fn(c.else))a_chute.keep(c.else)
    return c.else
  }
  return data//No matches
}
chute_lib.pick=({args,data,a_chute})=>{
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
    if(data===rv)return data//unchanged
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
  if(a_chute.with_received)error(`1 "with" per chute`)
  a_chute.with_received=true
  let o=args.length===1&&is_object(args[0])?args[0]:0
  if(!o)error('.with accepts 1 object for settings')
  if(o.sync)load_sync_fn(o.sync,a_chute)
  if('skip' in o)a_chute.skip_void=!!o.skip
  if(o.feed)load_feed_items(o.feed)
  if(o.lift)lift_libraries(o.lift)
  if(o.path)a_chute.treat_dots_as_paths=!!o.path
  return data//Leaves data unchanged
}
function load_sync_fn(o,a_chute){
  if(!is_fn(o))error(`give SYNC FN: "v=>user_variable=v"`)
  a_chute.sync_data=o
  a_chute.sync_data(a_chute.get_data())//Make user_variable!null
}
function handle_nested_access(a_chute,args){
  let dot_list = a_chute.dot_list
  let data = a_chute.get_data()
  let skip_void = a_chute.skip_void
  // This finds break points in a dot sequence.
    //if given: ".reverse.log[4].JSON.stringify(Args)"
    //it deduces: .reverse|.log|index 4|.JSON.stringify(Args)
  function setup_root(key,a){
    //let o = {  }
    let desc = `a built in chute method; `+
    `a method of the_current_data; `+
    `a function passed in to this chute via a previous call, `+
    `or Chute's .feed or .lift properties;`+
    `or a global function.`
    //console.log(`find root of "${key}"`,a.data)
    //HIERARCHICAL ORDER
    let chute_fn=chute_lib.hasOwnProperty(key)//<-non native 
      if(chute_fn)return ['chute_lib',chute_lib]
    let seeded_chute=a.data!==null&&a.data[key]!==undefined
      if(seeded_chute)return['the_current_data',a.data]
    let memoised=a_chute.fns_seen[key]
      if(memoised)return['memoized_function',a_chute.fns_seen]
    //X
      if(CHUTE.library[key])return ['Feed_lib',CHUTE.library]
    let lifted_lib=CHUTE.lifted_libraries.find(lib=>lib[key])
      if(lifted_lib)return['Lift_lib',lifted_lib]
    let global_el=globalThis[key]!==undefined
      if(global_el)return ['global_this',globalThis]
    error(`"${key}" is not: ${desc}`)
  }/*  globalThis.JSON.stringify(Args)
       \________/ \__/ \_______/
           |       |      |
         root   context  Fn*/
  let path_mode=a_chute.treat_dots_as_paths
  //^ if dot_list==[a.b.c] path_mode expects a[b][c] vs a|>b|>c
  return dot_list.reduce((a,key,i,l)=>{
    if(!a.path){
      ([a.root_string,a.root]=setup_root(key,a))
      a.path = a.root//a new path starts with the root
      a.context=a.root//context means the item that holds the FN
      //console.log(`root of ${key} is ${a.root_string}`)
    }
    a.path=a.path[key]//e.g. GlobalThis['JSON']
    let is_last_key=i==l.length-1
    if(is_last_key)return try_do({fn:a.path,key,a,args})
    let next_key=dot_list[i+1]
    let found_last_in_current_path=a.path[next_key]===undefined
    if(found_last_in_current_path){
      if(path_mode)error(`"${key}" lacks "${next_key}"`)
      //^ E.G. ".reverse.log()". path_mode?FAIL:reverse().log()
      //console.log(`run "${key}"`)
      a.data = try_do({fn:a.path,key,a})//not last key so 0 args
      //^ Data forms input for next FN && not saved to chute yet
      // next key starts a new path:
      a.path=null//reset
    }
    else a.context=a.path//the current item holds the next item
    return a
  },{path:null,data,context:null,root:null})
  function try_do({fn,key,a,args=[]}){
    //console.log(`RUN ${a.root_string}'s '"${key}"`)
    // Dot-style-calls use functions Chute can access already:
    // no need to memoize fn, but inspect the arguments for fns
    if(!is_fn(a.path))error(`${a.root_string}…"${key}" not ƒ`)
    let rv
    if(a.root==chute_lib)rv=fn({args,data:a.data,a_chute})
    else if(
      a.root===globalThis
      ||a.root==a_chute.fns_seen
      ||a.root==CHUTE.library
      ||a.root_string=='Lift_lib'
    ){ rv = call_a_function({fn,data:a.data,args}) }
    else {//current_data.a.b.c.fn(),
      //Call any function the current_data contains.
        //To restrict to native methods (e.g. .map .reduce),
        //add condition is_js_method(data,key)
      rv = fn.call(a.context,...swap_placeholders(args,a.data))
      rv = chain_stopping_methods.has(key)?a.data:rv
    }
    return rv===undefined&&skip_void?/*old*/a.data:/*new*/rv
  }
}
const blank_chute=()=>({
  data:null,
  fns_seen: {},//non-global named fns encountered memoized
  with_received:false,
  treat_dots_as_paths:false,//.log.reverse vs .log().reverse()
  sync_data:null,//Receives `x=>user_variable=x` to send data
  skip_void:true,//Default
  dot_list:[],//^.a.b.c collected until '()'
})
function _get(a_chute,key){
  a_chute.dot_list.push(key)//store all keys pre '()' apply
}
function _apply(a_chute, args){
  let named_end_chute=['_end','_$']
    .includes(a_chute.dot_list.at(-1))
  if(named_end_chute)a_chute.dot_list.pop()
  let is_nameless_call = a_chute.dot_list.length==0,
  is_nameless_do_call = is_nameless_call && args.length>0,
  is_nameless_end_chute = is_nameless_call && args.length===0,
  is_named_call = !is_nameless_call,
  should_end_chute = is_nameless_end_chute || named_end_chute
  let update_value = is_nameless_do_call||is_named_call
  let rv
  if(is_nameless_do_call){
    rv=chute_lib.do({args, data:a_chute.get_data(), a_chute})
  }
  else if(is_named_call)rv=handle_nested_access(a_chute, args)
  if(update_value)a_chute.set_data(rv)
  a_chute.dot_list.length=0//Reset : processed all call keys
  return should_end_chute?a_chute.get_data():a_chute.proxy
}
function new_chute({seed,args}){
  let a_chute=blank_chute()
      a_chute.keep=make_memoizer(a_chute)
  a_chute.set_data=x=>{
    if(x===undefined&&a_chute.skip_void)return/*move on*/
    if(a_chute.sync_data/*provided*/){a_chute.sync_data(x)}
    a_chute.data=x
  }
  a_chute.get_data=()=>a_chute.data
  if(seed)a_chute.set_data(seed)
  if(args.length>0){
    a_chute.set_data(chute_lib.do({args,data:seed,a_chute}))
  }
  a_chute.proxy = new Proxy(()=>{},{
    get:(_,k)=>{_get(a_chute,k);return a_chute.proxy},
    apply:(_,__,args)=>_apply(a_chute,args)
  })
  return a_chute.proxy
}
return CHUTE
})()