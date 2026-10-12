/* Projected 3D genealogy. Coordinates describe ancestry, never simulated social links. */
const PortoGeneGraph = (() => {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function layout(nodes) {
    const byId = new Map(nodes.map(n => [n.id, {...n, children:[]}])) ;
    const root = byId.get(nodes[0].id);
    for (const n of byId.values()) if (byId.has(n.parent)) byId.get(n.parent).children.push(n);
    function weight(n) { return n.weight = n.children.length ? n.children.reduce((sum,c) => sum + weight(c),0) : 1; }
    weight(root);
    function place(n, depth, start, end) {
      const angle = (start + end)/2, radius = depth * 150;
      n.x = Math.cos(angle)*radius; n.y = Math.sin(angle)*radius;
      n.z = depth ? Math.sin(angle*2.3 + depth)*100 : 25; n.depth = depth;
      let cursor = start;
      for (const c of n.children) { const next = cursor + (end-start)*c.weight/n.weight; place(c,depth+1,cursor,next); cursor=next; }
    }
    place(root,0,-Math.PI*.85,Math.PI*1.15);
    const extent = Math.max(280,...[...byId.values()].map(n => Math.hypot(n.x,n.y,n.z)+75));
    const scale = 320/extent;
    return [...byId.values()].map(({children,weight,...n}) => ({...n,x:n.x*scale,y:n.y*scale,z:n.z*scale}));
  }
  function project(n, yaw=-.3, pitch=.38, zoom=1) {
    const x=n.x*Math.cos(yaw)+n.z*Math.sin(yaw), z=-n.x*Math.sin(yaw)+n.z*Math.cos(yaw);
    const y=n.y*Math.cos(pitch)-z*Math.sin(pitch), depth=n.y*Math.sin(pitch)+z*Math.cos(pitch);
    const perspective=850/(850-depth);
    return {x:400+x*perspective*zoom,y:300+y*perspective*zoom,scale:perspective,depth};
  }
  function markup(nodes, selected) {
    const points=layout(nodes), byId=new Map(points.map(n=>[n.id,n]));
    const ancestry=new Set([selected]);let n=byId.get(selected);
    while(n?.parent){ancestry.add(n.parent);n=byId.get(n.parent);}
    const edges=points.filter(n=>n.parent).map(n=>{
      const a=project(byId.get(n.parent)),b=project(n);
      return `<line data-from="${esc(n.parent)}" data-to="${esc(n.id)}" class="${ancestry.has(n.id)?'on-path':''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" marker-end="url(#gene-arrow)"/>`;
    }).join('');
    const dots=points.map((n,i)=>{
      const p=project(n),r=n.parent?24:34;
      return `<a class="oct-orbit-node ${n.id===selected?'selected':''} ${!n.parent?'root':''} ${ancestry.has(n.id)?'on-path':''}" href="${esc(n.href)}" data-node="${esc(n.id)}" data-x="${n.x}" data-y="${n.y}" data-z="${n.z}" data-radius="${r}" transform="translate(${p.x} ${p.y}) scale(${p.scale})" aria-label="${esc(n.title+', '+n.handle+', '+n.plays+' plays, '+n.royalty+' demo royalties'+(n.parent?', derived from '+byId.get(n.parent).title:', original'))}" ${n.id===selected?'aria-current="page"':''}><title>${esc(n.title+' · '+n.handle+' · '+n.plays+' plays · '+n.royalty+' demo royalties')}</title><circle class="oct-orbit-halo" r="${r+9}"/><circle class="oct-orbit-core" r="${r}" fill="url(#gene-sphere-${i%4})"/><text y="5" class="oct-orbit-number">${n.parent?esc(n.number):'001'}</text><text y="${r+27}" class="oct-orbit-title">${esc(n.parent?'/'+n.number:'Original')}</text><text y="${r+44}" class="oct-orbit-meta">${esc(n.handle)}</text></a>`;
    }).join('');
    return `<div class="oct-orbit"><div class="oct-orbit-toolbar"><span><i></i>Original <i></i>Version <i></i>Selected ancestry</span><div><button type="button" data-graph-action="out" aria-label="Zoom graph out">−</button><button type="button" data-graph-action="in" aria-label="Zoom graph in">+</button><button type="button" data-graph-action="reset">Reset view</button></div></div><svg class="oct-orbit-svg" viewBox="0 0 800 600" role="group" aria-label="3D song genealogy. Drag to rotate. Arrow keys rotate, plus and minus zoom. Select a node to explore its track." tabindex="0"><defs><marker id="gene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker>${['#EE6251','#8D78B9','#72b9ad','#6E9DC1'].map((color,i)=>`<radialGradient id="gene-sphere-${i}" cx="30%" cy="25%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="${color}"/><stop offset="1" stop-color="#17151f"/></radialGradient>`).join('')}</defs><ellipse class="oct-orbit-plane" cx="400" cy="300" rx="340" ry="135"/><ellipse class="oct-orbit-plane" cx="400" cy="300" rx="190" ry="260" transform="rotate(-35 400 300)"/><g class="oct-orbit-edges">${edges}</g><g class="oct-orbit-nodes">${dots}</g></svg><div class="oct-orbit-caption">Drag to orbit · Select a version <span>${nodes.length} connected tracks</span></div></div>`;
  }
  let redraw=()=>{};
  window.addEventListener('resize',()=>redraw());
  function mount() {
    document.querySelectorAll('.oct-orbit:not([data-mounted])').forEach(host => {
      host.dataset.mounted='true';
      const svg=host.querySelector('svg.oct-orbit-svg'), layer=host.querySelector('.oct-orbit-nodes');
      const nodes=[...layer.querySelectorAll('[data-node]')], edges=[...host.querySelectorAll('[data-from]')];
      let yaw=-.3,pitch=.38,zoom=1,drag=null,moved=false;
      function draw(){
        const positions=new Map(), width=svg.clientWidth||800, height=svg.clientHeight||600, fit=Math.min(width/800,height/600);
        svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
        host.querySelectorAll('.oct-orbit-plane').forEach(el=>el.style.display='none');
        nodes.forEach(el=>{const p=project({x:+el.dataset.x,y:+el.dataset.y,z:+el.dataset.z},yaw,pitch,zoom);p.x=width/2+(p.x-400)*fit*1.3;p.y=height/2+(p.y-300)*Math.min(height/600,.95)*1.2;p.scale*=Math.max(.72,Math.min(1,fit));positions.set(el.dataset.node,p);el.setAttribute('transform',`translate(${p.x} ${p.y}) scale(${p.scale})`);el.style.opacity=String(.72+(p.depth+300)/2200);});
        nodes.slice().sort((a,b)=>positions.get(a.dataset.node).depth-positions.get(b.dataset.node).depth).forEach(el=>layer.append(el));
        edges.forEach(el=>{const a=positions.get(el.dataset.from),b=positions.get(el.dataset.to);const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;const ar=(+nodes.find(n=>n.dataset.node===el.dataset.from).dataset.radius+7)*a.scale,br=(+nodes.find(n=>n.dataset.node===el.dataset.to).dataset.radius+7)*b.scale;el.setAttribute('x1',a.x+dx/length*ar);el.setAttribute('y1',a.y+dy/length*ar);el.setAttribute('x2',b.x-dx/length*br);el.setAttribute('y2',b.y-dy/length*br);});
      }
      host.querySelectorAll('[data-graph-action]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.graphAction==='reset'){yaw=-.3;pitch=.38;zoom=1;}else zoom=Math.max(.55,Math.min(2,zoom+(b.dataset.graphAction==='in'?.15:-.15)));draw();}));
      svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};moved=false;});
      svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<5)return;moved=true;svg.setPointerCapture(e.pointerId);yaw+=dx*.008;pitch=Math.max(-1.3,Math.min(1.3,pitch+dy*.008));drag={id:e.pointerId,x:e.clientX,y:e.clientY};draw();});
      const end=e=>{if(drag?.id===e.pointerId)drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};
      svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
      svg.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
      svg.addEventListener('keydown',e=>{if(e.target!==svg)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch-=.15;if(e.key==='ArrowDown')pitch+=.15;if(e.key==='+')zoom=Math.min(2,zoom+.15);if(e.key==='-')zoom=Math.max(.55,zoom-.15);if(e.key==='Home'){yaw=-.3;pitch=.38;zoom=1;}draw();}});
      redraw=()=>{if(host.isConnected)draw();};
      draw();
    });
  }
  return {layout,project,markup,mount};
})();
