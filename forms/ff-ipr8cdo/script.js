/* FormFlow | My Form | 2026-03-05 */
(function(){
var C={"formId":"ff-ipr8cdo","formName":"My Form","steps":[{"id":"36y8fzw","index":0,"name":"I am step 1","dataStep":"1","isSuccess":false},{"id":"y6srpfn","index":1,"name":"I am step 2","dataStep":"2","isSuccess":false},{"id":"kimybnq","index":2,"name":"I am step 3","dataStep":"3","isSuccess":false},{"id":"5n0mukw","index":3,"name":"I am step 4","dataStep":"4","isSuccess":false},{"id":"adox3gv","index":4,"name":"ami final","dataStep":"5","isSuccess":false}],"edges":[{"from":"36y8fzw","to":"y6srpfn","isLogic":false},{"from":"y6srpfn","to":"kimybnq","isLogic":false},{"from":"kimybnq","to":"5n0mukw","isLogic":false},{"from":"5n0mukw","to":"adox3gv","isLogic":false}]};
function init(){
  var forms=document.querySelectorAll('[data-flowform]');
  if(!forms.length)forms=document.querySelectorAll('form');
  forms.forEach(setupForm);
}
function setupForm(form){
  /* Build ordered step list from config flow (edges) */
  var allStepEls={};
  C.steps.forEach(function(s){
    var el=form.querySelector('[data-step="'+s.dataStep+'"]');
    if(el)allStepEls[s.id]={cfg:s,el:el};
  });

  /* Order steps by following edges from start node */
  var startNode=C.steps.find(function(s){
    return !C.edges.find(function(e){return e.to===s.id;});
  })||C.steps[0];

  var ordered=[];
  var visited={};
  function walk(nodeId){
    if(!nodeId||visited[nodeId])return;
    visited[nodeId]=true;
    var s=allStepEls[nodeId];
    if(s)ordered.push(s);
    C.edges.forEach(function(e){if(e.from===nodeId)walk(e.to);});
  }
  walk(startNode.id);

  /* Fallback: add any unvisited steps */
  C.steps.forEach(function(s){
    if(!visited[s.id]&&allStepEls[s.id])ordered.push(allStepEls[s.id]);
  });

  if(ordered.length===0){console.warn('[FormFlow] No steps found in DOM');return;}

  var cur=0,total=ordered.length;

  /* Hide all steps except first */
  ordered.forEach(function(s,i){if(i!==0)s.el.style.display='none';});

  function go(i){
    ordered[cur].el.style.display='none';
    cur=i;
    ordered[cur].el.style.display='';
    updateUI();
    var top=form.getBoundingClientRect().top+window.scrollY-20;
    window.scrollTo({top:top,behavior:'smooth'});
  }

  function getNextIndex(){
    /* Check edges from current step */
    var curId=ordered[cur].cfg.id;
    var edge=C.edges.find(function(e){return e.from===curId;});
    if(edge){
      var ti=ordered.findIndex(function(s){return s.cfg.id===edge.to;});
      if(ti!==-1)return ti;
    }
    return cur+1<total?cur+1:-1;
  }

  function updateUI(){
    var isSuccess=ordered[cur].cfg.isSuccess;
    var pct=((cur+1)/total)*100;

    /* Progress bar */
    document.querySelectorAll('[data-ff-progress]').forEach(function(b){b.style.width=pct+'%';});

    /* Step counter */
    document.querySelectorAll('[data-ff-count]').forEach(function(c){c.textContent=(cur+1)+' / '+total;});

    /* Back button — hide on first step, show on all others */
    document.querySelectorAll('[data-ff-prev]').forEach(function(b){
      b.style.display=cur===0?'none':'';
    });

    /* Next button — hide on last step and success step */
    document.querySelectorAll('[data-ff-next]').forEach(function(b){
      var shouldHide=isSuccess||(getNextIndex()===-1);
      b.style.display=shouldHide?'none':'';
    });
  }

  function validate(){
    var ok=true;
    ordered[cur].el.querySelectorAll('input[required],select[required],textarea[required]').forEach(function(f){
      f.style.outline='';
      if(!f.value||!f.value.trim()){f.style.outline='2px solid #ff4f6a';ok=false;}
    });
    return ok;
  }

  /* Bind global next/prev buttons (placed anywhere in form, shared across steps) */
  document.querySelectorAll('[data-ff-next]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      if(!validate())return;
      var ni=getNextIndex();
      if(ni!==-1)go(ni);
    });
  });

  document.querySelectorAll('[data-ff-prev]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      if(cur>0)go(cur-1);
    });
  });

  /* Submit guard — only allow on last step or success step */
  form.addEventListener('submit',function(e){
    var isSuccess=ordered[cur].cfg.isSuccess;
    var isLast=getNextIndex()===-1;
    if(!isSuccess&&!isLast){
      e.preventDefault();
      if(validate()){var ni=getNextIndex();if(ni!==-1)go(ni);}
    }
  });

  updateUI();
  console.log('[FormFlow] Ready — '+total+' steps, flow: '+ordered.map(function(s){return s.cfg.dataStep;}).join(' → '));
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
if(window.Webflow){window.Webflow.push(init);}
})();