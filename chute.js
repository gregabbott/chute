const chute = (()=>{
/*
CHUTE: Chain functions AND methods
https://github.com/gregabbott/chute
By + Copyright Greg Abbott 2024-11-27 (V1) + 2024-11-28.3 (V)
Changes:
Adds calling global functions via method style
Adds placeholder to call function with data at specific argument
* Adds calling without parentheses e.g. '.log.reverse.log'
*/
  let data
  let keys=[]
  let data_placeholder={}
  const stringy=x=>JSON.stringify(x,null,'\t')//DEBUG
  const error=(...x)=>{throw new Error(x)}
  const is_fn=x=>x instanceof Function
  const is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k])
  function sub_chain_reducer (data,f){
    if(f==='log'){console[f](data);return data}
    else if(typeof f==='string'){
      if(is_js_method(data,f)) return call_method_of_data(f,[])
      else error(`Data lacks "${f}" method`)
    }
    else if(is_fn(f))return f(data)
    
    else {error('Not a function:',f)}
    return data
  }
  const sub_chain=a=>a.reduce(sub_chain_reducer,data)
  const methods_that_return_nothing=[
    //return nothing
      'forEach',
    //modifies data but doesn't return data
      'push',//returns new length
      'unshift',//returns new length
    //Ambiguous: return a value, mutate data. 
        //some want the mutated data
        //some want the return value
      //'pop',//mutates array, removes and returns last item
      //'shift',//mutates array, removes and returns item 0
  ]
  function is_global_fn(name){return is_fn(globalThis[name])}
  const call_method_of_data=(key,a)=>{
    if(is_js_method(data,key)){     
      if(methods_that_return_nothing.includes(key)){
        data[key](...a)//Don't update data
      }
      else{//returns something
        data=data[key](...a)
      }
      return data
    }
    else if(is_global_fn(key)){
      if(a.length==0)data= globalThis[key](data)
      if(a.length>0){
        let placeholder_i = a.indexOf(data_placeholder)
        if(placeholder_i!==-1){
          a[placeholder_i]=data//Swap placeholder for data
          data = globalThis[key](...a)
        }
        else{
          data= globalThis[key](...a)(data)
        }
      }
    }
    else error(`Data lacks "${key}" method|Not a global Fn`)
  }
  const if_then=({cond,fn})=>{
    const cond_is_fn=is_fn(cond)
    const good_cond=cond_is_fn||cond===false||cond===true
    if(!good_cond){
      error('give .if(arg1) bool OR test=data=>{…return bool}')
    }
    if(!is_fn(fn)){
      error('give .if(,arg2) a Fn to send data to',fn)
    }
    else if(cond_is_fn&&cond(data)===true)data=fn(data)
    else if(cond===true)data=fn(data)
  }

  var target=function target(){}
  const proxy = new Proxy(
    target, 
    {
      get(target,k){
        keys.push(k)
        return proxy
      },
      apply:(target,_, a)=>{
        if(keys.length==0){
          if(a.length===0)return data//.log()()/*<- END CALL*/
          //else
          data=sub_chain(a)
          return proxy
        }
        let last_key = keys.length-1
        return keys.reduce((rv,the_key,i)=>{
          let key = the_key//store before clearing array
          if(keys.length>1&&i!==last_key){
            //calls BEFORE args .log.reverse
            if(key=='log'){console.log(data)}
            else if(key=='if'){error('.if needs 2 arguments')}
            else if(key=='tap')error('.tap needs 1 fn argument')
            else if(key==='and')error('.and needs 1+ arguments')
            else if(key)call_method_of_data(key,[])
            return rv
          }
          if(keys.length===1||i===last_key){
            keys.length=0//reset when processed all
          
            if(key=='log'){console.log(...a,data);}
            else if(key=='if'){if_then({cond:a[0],fn:a[1]})}
            else if(key=='tap'&&is_fn(a[0]))a[0](data)
            else if(key=='tap')error('give .tap a fn to send data to')
            
            else if(key==='and')data=sub_chain(a)
            else if(key)call_method_of_data(key,a)
          }
          return rv
        },proxy)
        
      }
    }
  )
  let set_up = (x,...fns)=>{
    data=x
    if(fns.length>0)data=sub_chain(fns)
    return proxy
  }
  set_up._=data_placeholder
  return set_up 
})()