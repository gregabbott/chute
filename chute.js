const chute = (()=>{
/*
CHUTE: Chain functions AND methods
https://github.com/gregabbott/chute
By + Copyright Greg Abbott 2024-11-27 (V1) + 2024-11-29 (V)
*/
  let keys=[]
  //const stringy=x=>JSON.stringify(x)
  const log=(...a)=>x=>(console.log(...a),x&&console.log(x),x)
  const error=(...x)=>{throw new Error(x)}
  const is_fn=x=>x instanceof Function
  const is_object=v=>v&& typeof v=='object'&&!Array.isArray(v)
  const is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k])
  const is_global_fn=name=>is_fn(globalThis[name])
  const update_data=x=>{
    //log(`result of "${keys[0]}"`,x)()
    BOX._=x//Current data value in namespace placeholder
    //using a property available to reference outside
  }
  let non_global_fns_encountered = new Map()
  let BOX = (seed,...fns)=>{
    //Chute becomes this function
    //this receives first chute call: chute(seed)…()
    update_data(seed)
    if(fns.length>0)update_data(sub_chain(fns,seed))
    return proxy
  }
  BOX.x = {}//<-- PLACEHOLDER for data argument position
  function is_condition_block(o) {
    //has if[q,a], any elseIf==[] and items therein [q,a]
    const is_array=x=>Array.isArray(x)
    const keys = Object.keys(o)
    const has_if = keys.includes('if')
      &&is_array(o.if)
      &&o.if.length===2
    if(!has_if)return false
    const optional_keys_count = 
      keys.filter(k =>['else', 'else_if'].includes(k)).length
    if('else_if' in o){
      if(!is_array(o.else_if))return false
      if(o.else_if.length>0){
        if(!o.else_if.every(x=>is_array(x)&&x.length==2))return false
      }
    }
    const other_keys_count = 
      keys.length - 1/*if*/ - optional_keys_count
    return other_keys_count === 0 && optional_keys_count <= 2
  }
  function process_condition_block(c,data) {
    //When 'if' condition met, keep any answer given
      //i.e. keep explicit undefined VS no data provided.
    //if value doesn't exist treat differently

    //memoise all functions in questions AND answers
      //so that if any true, user may .name call it
    [c.if,...c.else_if].forEach(([q,a])=>{
      if(is_fn(q))memoize_if_applicable(q)
      if(is_fn(a))memoize_if_applicable(a)
    })
    //only call FNs as needed
    function evaluate_condition(cond,data){
      if(is_fn(cond)){return cond(data)}
      return cond
    }
    
    if ('if' in c && 0 in c.if && 1 in c.if){
      if(evaluate_condition(c.if[0],data)) {
        return c.if[1]
      }

    }
    if('else_if' in c){
      for (const pair of c.else_if){
        if(0 in pair && 1 in pair){
          if (evaluate_condition(pair[0])) return pair[1]
        }
      } 
    }
    if('else' in c){
      return c.else
    }
    return data
  }
  function memoize_if_applicable(f){
    if(f.name && !is_global_fn(f.name)){
      //Passed in (scoped) non-global function without arguments
      //Probably a unary
        if(!non_global_fns_encountered.has(f.name)){
          //memoize, to allow DOT calls in this same chain
          non_global_fns_encountered.set(f.name,f)
        }
      }
      return f
  }
  function sub_chain_reducer (data,f){
    //log({n:sub_chain_reducer,data:stringy(data),f})()
    if(f==='log'){
      console[f](data);
      return data
    }
    else if(is_fn(f)){
      memoize_if_applicable(f)
      return f(data)
    }
    if(is_object(f)&&is_condition_block(f)){
      let rv = process_condition_block(f,data)
      /*log({
        if_else_rv:rv,
           rv_a_fn:is_fn(rv),
         unchanged:data===rv
      })()/**/
      let unchanged=data===rv
      if(unchanged)return data
      if(is_fn(rv)){//memoized in if section
        //memoize_if_applicable(rv)
        return call_a_function(rv,data,[])
      }
      return rv
    }
    //user gave some expression 
      //expression likely used data via token "._"
    return f
  }
  const sub_chain=(a,data)=>a.reduce(sub_chain_reducer,data)
  const void_returning_methods=new Set([
    //methods that return nothing
      'forEach',
    //methods that modify data but return nothing relevant
      'push',//returns new length
      'unshift',//returns new length
    //methods that return and mutate
      //Ambiguous:
        //some want the mutated data
        //some want the return value
      //'pop',//removes and returns last item from array
      //'shift',//removes and returns first item from array
  ])

  const call_a_function=(fn,data,a)=>{
    if(a.length===0)return fn(data)
      //Swap data argument placeholder for actual data
      let placeholder_i = a.indexOf(BOX.x)
      if(placeholder_i!==-1){
        a[placeholder_i]=data
        return fn(...a)
      }
      else{
        return fn(...a)(data)
      }
  }
  const call_method_of_data=(data,key,a)=>{
    // .not_a_built_in_key()
    //NOTE: already memoized any fn this sees
    if(is_js_method(data,key)){
      let placeholder_i = a.indexOf(BOX.x)
      if(placeholder_i!==-1){a[placeholder_i]=data}
      let rv= data[key](...a)
      return void_returning_methods.has(key)?data:rv
    }
    if(is_global_fn(key)){
      let fn = globalThis[key]
      /*
      log({
      fn,
      n:'call_method_of_data',
      data:stringy(data),
      key,
      a
      })()
      /**/
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
  const proxy = new Proxy(
    BOX, 
    {
      get(target,k){
        keys.push(k)
        return proxy
      },
      apply:(target,_, a)=>{
        /*log({
          n:'proxy_apply',
          data:stringy(BOX._),
          keys:stringy(keys),
          args:a
        })()/**/
        if(keys.length==0){
          if(a.length===0){//.log()()/*Empty call == END*/
            return BOX._
          }
          else{
            update_data(sub_chain(a,BOX._))
            return proxy
          }
        }
        let last_key = keys.length-1
        return keys.reduce((rv,key,i)=>{
          //last name given called FN with ()
          if(keys.length>1&&i!==last_key){
            //.names given before last which lacked '()'
            
            //.log     .reverse  .map   (args) 
            //^stored  ^stored   ^last  ^call
            //call triggers all above
            //args only 'apply' to last key
            
            if(key=='log'){log(BOX._)()}
            else if(key=='if'){error('.if needs 2 arguments')}
            else if(key=='tap')error('.tap needs 1 fn argument')
            else if(key==='do')error('.do needs 1+ arguments')
            else if(key)update_data(
              call_method_of_data(BOX._,key,[])
            )
            return rv
          }
          if(keys.length===1||i===last_key){
            if(key=='log'){log(...a,BOX._)()}
            else if(key=='if'){
              update_data(
                dot_if({when:a[0],then:a[1],data:BOX._})
              )
            }
            else if(key=='tap'&&is_fn(a[0]))a[0](BOX._)
            else if(key=='tap')error('give .tap a fn to send data to')
            else if(key==='do')update_data(sub_chain(a,BOX._))
            else if(key)update_data(call_method_of_data(BOX._,key,a))
            //reset keys when processed all
            keys.length=0
          }
          return rv
        },proxy)
      }
    }
  )
  return BOX 
})()