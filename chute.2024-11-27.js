const chute = (()=>{
  //CHUTE: Chain functions AND methods
  //https://github.com/gregabbott/chute
  //By + Copyright Greg Abbott 2024-11-27 (V1) + 2024-11-27 (V)
  let data
  let key_is=null
  const error=(...x)=>{throw new Error(x)}
  const is_fn=x=>x instanceof Function
  const is_js_method=(o,k)=>is_fn(Object.getPrototypeOf(o)[k])
  function sub_chain_reducer (data,f){
    if(is_fn(f))return f(data)
    if(f==='log'){console[f](data);return data}
    else if(typeof f==='string'){
      if(is_js_method(data,f)) return data[f]()
      else error(`Data lacks "${f}" method`)
    }
    else {error('Not a function:',f)}
    return data
  }
  const sub_chain=a=>a.reduce(sub_chain_reducer,data)
  const call_method_of_data=(key,a)=>{
    if(is_js_method(data,key)){data=data[key](...a)}
    else error(`Data lacks "${key}" method`)
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
  const proxy = new Proxy(
    function target(){}, 
    {
    get(target,k){
      key_is=k
      return proxy
    },
    apply:(target,_, a)=>{
      let key = key_is
      if(key_is)key_is=null
      if(key=='log'){console[key](...a,data);}
      else if(key=='if'){if_then({cond:a[0],fn:a[1]})}
      else if(key=='tap'&&is_fn(a[0]))a[0](data)
      else if(key=='tap')error('give .tap a fn to send data to')
      else if(key===null&&a.length===0)return data
      else if(key===null||key==='and')data=sub_chain(a)
      else if(key)call_method_of_data(key,a)
      return proxy
    }
  })
  return (x,...fns)=>{
    data=x
    if(fns.length>0)data=sub_chain(fns)
    return proxy
  }
})()