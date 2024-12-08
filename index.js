window.addEventListener('load', ()=>{
  fetch('demo.js')
  .then(response => response.text())
  .then(show_js)
  .catch(e => console.error('Error fetching the script:', e))
function scroll_to_hash() {
  const hash = window.location.hash
  if (!hash)return
  const target = document.getElementById(hash.replace('#',''))
  if (!target) return
  target.scrollIntoView({ behavior: 'auto' });
}
function show_js(s){
  let sections=[]
  let with_comments = s
  let to_HTML=s=>hljs.highlight(s,{language:'javascript'}).value
  document.getElementById('show_example_use').innerHTML=
    to_HTML(with_comments)
    //.replace(/>\/\/ */g,'>')
    .replace(/\/\/ ===+/g,'')
    .replace(
      /(<span class="hljs-comment">)\/\/ (#+) (.*?)(<\/span>)/g,
      (all,open,level,txt,shut)=>{
        let id= txt
          .toLowerCase()
          .trim()
          .replace(/ *[:-] .*/,'')
          .replaceAll(' ','_')
        let depth=level.length
        sections.push([id,txt,depth])
        return( 
        //`</details>`+`<details open>`+`<summary>`+
            open+
            `// <a href="#${id}" class="depth_${depth}">${level}</a> `+
            `<span id="${id}">${txt}</span>`+
            shut
        //`</summary>`
        )
      }
    )
  let sans_comments= s
  .replace(/([^\:])\/\/ *.*/g,'$1')
  .replace(/\n\s*\n+/g,'\n')  
  document
    .getElementById('show_example_use_sans_comments')
    .innerHTML=to_HTML(sans_comments)
    
  let toc=document.getElementById('toc_links')
  let hide_popover=()=>{
    document.getElementById('popover_toc').hidePopover()
  }
  toc.onclick = hide_popover
  sections.forEach(([id,txt,depth])=>{
    let el = toc.appendChild(document.createElement('a'))
      el.innerText=txt
      el.href='#'+id
      el.classList=`depth_${depth}`
  })
  document.getElementById('toc_button').hidden=false
  scroll_to_hash()
}
})