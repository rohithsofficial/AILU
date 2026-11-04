// @ts-nocheck
/* eslint-disable */
// Generated from AILU_Celebrations.html. Call startAilu(root, THREE); it returns a cleanup function.
export function startAilu(ROOT, THREE) {
  var cleanups = [], timers = [], raf = 0, dead = false;
  function on(t, e, f, o) { t.addEventListener(e, f, o); cleanups.push(function () { t.removeEventListener(e, f, o); }); }
  var setTimeout = function (f, ms) { var id = window.setTimeout(function () { if (!dead) f(); }, ms); timers.push(id); return id; };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAND='/ailu/img-7505ea92.png';
  ROOT.style.setProperty('--hand','url('+HAND+')');
  var onReady={};
  [].forEach.call(document.querySelectorAll('.waForm'),function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var note=f.querySelector('.fNote'),ready=f.querySelector('.fReady'),text=f.querySelector('.fText'),lines=[f.dataset.intro],missing=false;
      [].forEach.call(f.querySelectorAll('[data-l]'),function(el){
        var v=el.value.trim();
        if(el.hasAttribute('data-req')&&!v)missing=true;
        lines.push(el.dataset.l+': '+(v||'Not given'));
      });
      if(missing){ready.hidden=true;note.textContent='Please fill in the required details first.';return}
      function prepare(lead){
        text.value=lines.join('\n');ready.hidden=false;
        function manual(){text.focus();text.select();note.textContent=lead+' Copy your message, then open WhatsApp and paste it to send.'}
        if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text.value).then(function(){note.textContent=lead+' Your message is copied, so open WhatsApp and paste it to send.'},manual);else manual();
      }
      if(f.dataset.send){
        var btn=f.querySelector('button[type="submit"]');btn.disabled=true;note.textContent='Sending...';
        fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()}).then(function(r){
          if(!r.ok)throw new Error('send failed');
          f.reset();ready.hidden=true;note.textContent='Thank you. Your message has reached AILU, and we’ll reply soon.';
          if(onReady[f.id])onReady[f.id]();
        }).catch(function(){prepare('We couldn’t send that just now.')}).then(function(){btn.disabled=false});
        return;
      }
      prepare('Your message is ready.');
      if(onReady[f.id])onReady[f.id]();
    });
  });

  var FIG='#0b0c0a',GOLD='#f4bb25',CREAM='#fff7e6',TAU=Math.PI*2;
  function clamp(v){return v<0?0:v>1?1:v}
  function smooth(v){v=clamp(v);return v*v*(3-2*v)}
  function mix(a,b,u){var o=new Array(a.length);for(var i=0;i<a.length;i++)o[i]=a[i]+(b[i]-a[i])*u;return o}
  function tbl(rows,p){
    if(p<=rows[0][0])return rows[0].slice(1);
    for(var i=1;i<rows.length;i++){
      if(p<=rows[i][0]){
        var u=smooth((p-rows[i-1][0])/(rows[i][0]-rows[i-1][0]));
        return mix(rows[i-1].slice(1),rows[i].slice(1),u);
      }
    }
    return rows[rows.length-1].slice(1);
  }

  /* People: rounded limbs that echo the logo. A pose lists head, shoulder, hip, left elbow and hand, right elbow and hand, left knee and foot, right knee and foot. */
  var rimPass=false,low=false;
  function ink(col){return rimPass?'rgba(255,230,150,.95)':(col||FIG)}
  function seg(c,pts,w,col){
    c.strokeStyle=ink(col);c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(pts[0],pts[1]);
    for(var i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);
    c.stroke();
  }
  function box(c,x,y,w,h,r,col){c.fillStyle=ink(col);c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
  function dot(c,x,y,r,col){c.fillStyle=ink(col);c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
  function aim(c,x,y,tx,ty,len){var d=Math.hypot(tx-x,ty-y)||1;seg(c,[x,y,x+(tx-x)/d*len,y+(ty-y)/d*len],5)}

  var WALK_A=[100,46,100,82,100,140,74,112,62,146,128,110,146,138,80,188,62,238,122,186,132,240];
  var WALK_B=[100,44,100,80,100,138,72,110,54,138,126,112,138,146,120,186,134,238,84,188,66,240];
  var K={
    dance:{f:.95,a:[104,44,102,80,95,128,66,62,44,24,140,84,172,60,72,180,56,238,118,182,116,240],b:[96,46,98,80,105,128,60,84,28,60,134,62,156,24,84,184,84,240,128,180,144,238],
      back:function(c,q){c.fillStyle=ink();c.beginPath();c.moveTo(q[4]-14,q[5]-6);c.lineTo(q[4]+14,q[5]-6);c.quadraticCurveTo(q[4]+34,q[5]+24,q[4]+46,q[5]+56);c.quadraticCurveTo(q[4],q[5]+70,q[4]-44,q[5]+54);c.quadraticCurveTo(q[4]-32,q[5]+24,q[4]-14,q[5]-6);c.fill()}},
    dance2:{f:.95,a:[98,46,98,80,102,134,134,62,158,24,62,86,34,64,120,184,138,238,82,188,76,240],b:[104,44,102,80,98,134,136,86,168,66,70,62,46,24,116,188,122,240,76,182,58,238]},
    vocals:{f:.5,a:[100,46,100,82,100,140,62,98,40,62,130,104,130,66,84,188,78,240,118,188,126,240],b:[104,47,102,82,101,140,60,80,36,38,132,104,132,66,84,188,78,240,118,188,126,240],
      front:function(c,q){seg(c,[q[12],q[13],q[12]-9,q[13]-16],8);dot(c,q[12]-11,q[13]-19,7)}},
    drums:{f:1.7,a:[82,46,82,84,82,140,56,60,80,26,108,94,124,78,68,190,64,240,98,190,102,240],b:[84,48,82,84,82,140,64,92,100,84,112,70,128,38,68,190,64,240,98,190,102,240],
      back:function(c){seg(c,[82,84,128,112],5)},
      front:function(c,q){box(c,106,108,50,86,8);seg(c,[108,126,154,126],3,GOLD);seg(c,[108,176,154,176],3,GOLD);aim(c,q[8],q[9],130,106,36);aim(c,q[12],q[13],136,106,36)}},
    anchor:{f:.35,a:[100,48,100,84,100,150,70,112,84,150,140,104,160,72,88,196,84,240,112,196,116,240],b:[102,49,100,84,100,150,70,112,84,150,138,92,152,52,88,196,84,240,112,196,116,240],
      front:function(c){seg(c,[126,152,116,96],5);dot(c,115,90,7);c.fillStyle=ink();c.beginPath();c.moveTo(58,150);c.lineTo(142,150);c.lineTo(130,242);c.lineTo(70,242);c.fill();seg(c,[74,172,126,172],3,GOLD)}},
    decor:{f:.3,a:[104,50,104,84,104,124,74,62,66,28,134,62,142,28,92,152,94,174,118,152,114,174],b:[106,52,104,84,104,124,70,66,56,36,136,60,152,22,92,152,94,174,118,152,114,174],
      back:function(c){seg(c,[64,242,102,136],7);seg(c,[142,242,106,136],7);seg(c,[76,208,130,208],6);seg(c,[87,176,119,176],6)},
      front:function(c,q){seg(c,[q[8],q[9],q[12],q[13]],3);for(var i=0;i<=5;i++){var u=i/5;dot(c,q[8]+(q[12]-q[8])*u,q[9]+(q[13]-q[9])*u,6.5,CREAM)}}},
    photo:{f:.28,a:[92,90,90,122,74,176,104,140,122,112,104,140,122,112,118,188,124,240,62,234,28,240],b:[94,88,92,120,74,176,106,136,124,108,106,136,124,108,118,188,124,240,62,234,28,240],
      front:function(c,q,t){box(c,q[0]+20,q[1]-12,38,28,5);box(c,q[0]+56,q[1]-6,12,16,3);
        var fl=(t*.45)%1;if(fl<.12){var a=1-fl/.12;c.globalAlpha=a;seg(c,[q[0]+74,q[1]+2,q[0]+92,q[1]+2],3,CREAM);seg(c,[q[0]+72,q[1]-10,q[0]+86,q[1]-22],3,CREAM);seg(c,[q[0]+72,q[1]+14,q[0]+86,q[1]+26],3,CREAM);c.globalAlpha=1}}},
    tech:{f:1,a:[100,54,100,90,100,150,66,114,72,148,134,114,128,148,88,200,84,240,112,200,116,240],b:[100,58,100,90,100,150,68,116,78,146,132,116,122,148,88,200,84,240,112,200,116,240],
      head:function(c,q){seg(c,[q[0]-19,q[1],q[0]-14,q[1]-16,q[0],q[1]-22,q[0]+14,q[1]-16,q[0]+19,q[1]],5);box(c,q[0]-25,q[1]-7,9,16,4);box(c,q[0]+16,q[1]-7,9,16,4)},
      front:function(c){box(c,32,146,136,20,5);[50,66,82,118,134,150].forEach(function(x,i){seg(c,[x,152,x,160],3,GOLD)});seg(c,[48,166,44,240],6);seg(c,[152,166,156,240],6)}},
    coord:{f:.25,a:[108,46,106,82,100,138,78,110,66,138,126,112,140,110,92,188,88,240,112,188,118,240],b:[110,48,106,82,100,138,78,112,68,140,126,110,140,106,92,188,88,240,112,188,118,240],
      head:function(c,q){seg(c,[q[0]-18,q[1]-2,q[0]-12,q[1]-18,q[0],q[1]-22,q[0]+12,q[1]-18,q[0]+18,q[1]-2],4)},
      front:function(c,q){box(c,q[12]-8,q[13]-26,36,46,4);box(c,q[12]-3,q[13]-18,26,33,2,CREAM)}}
  };
  /* Costume details sit on top of the shared body */
  function cloth(c,pts){c.fillStyle=ink();c.beginPath();c.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=4)c.quadraticCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3]);c.closePath();c.fill()}
  K.dance.head=function(c,q,t){dot(c,q[0]+13,q[1]-5,8);
    var w=Math.sin(t*2.6)*10;seg(c,[q[2]-8,q[3]+4,q[2]-30,q[3]+30+w,q[2]-46,q[3]+62-w],4)};
  K.dance2.back=function(c,q){cloth(c,[q[4]-17,q[5]-14,q[4]-24,q[5]+14,q[4]-20,q[5]+30,q[4],q[5]+36,q[4]+20,q[5]+30,q[4]+24,q[5]+14,q[4]+17,q[5]-14])};
  K.dance2.head=function(c,q){seg(c,[q[0]-14,q[1]-6,q[0],q[1]-17,q[0]+14,q[1]-6],7)};
  K.vocals.back=function(c,q){cloth(c,[q[0]-14,q[1]-8,q[0]-22,q[1]+20,q[0]-16,q[1]+38,q[0],q[1]+30,q[0]+14,q[1]+38,q[0]+20,q[1]+20,q[0]+14,q[1]-8])};
  var drumBack=K.drums.back;
  K.drums.back=function(c,q){drumBack(c,q);cloth(c,[q[4]-16,q[5]-10,q[4]-24,q[5]+24,q[4]-22,q[5]+46,q[4],q[5]+52,q[4]+22,q[5]+46,q[4]+24,q[5]+24,q[4]+16,q[5]-10])};
  K.drums.head=function(c,q){seg(c,[q[0]-14,q[1]-5,q[0]+14,q[1]-5],4,rimPass?null:GOLD)};
  K.anchor.head=function(c,q){seg(c,[q[2]-9,q[3]+2,q[2],q[3]+34,q[2]+9,q[3]+2],3,rimPass?null:GOLD);seg(c,[q[0]-13,q[1]-6,q[0],q[1]-16,q[0]+13,q[1]-6],6)};
  K.decor.head=function(c,q){seg(c,[q[0]-15,q[1]-7,q[0]+15,q[1]-7],7);seg(c,[q[0]+12,q[1]-6,q[0]+25,q[1]-4],4);cloth(c,[q[4]-15,q[5]-12,q[4]-20,q[5]+8,q[4]-16,q[5]+18,q[4],q[5]+20,q[4]+16,q[5]+18,q[4]+20,q[5]+8,q[4]+15,q[5]-12])};
  K.photo.head=function(c,q){seg(c,[q[0]-14,q[1]-8,q[0]+12,q[1]-9],8);seg(c,[q[0]+12,q[1]-8,q[0]+25,q[1]-6],4)};
  var coordFront=K.coord.front;
  K.coord.front=function(c,q,t){seg(c,[q[2]-7,q[3]-2,q[2],q[3]+28,q[2]+7,q[3]-2],2.5,rimPass?null:GOLD);coordFront(c,q,t)};
  // Inspired by a Yakshagana silhouette: tall crown, wide shoulders and a full skirt
  K.yaksha={f:.8,a:[100,64,100,100,100,150,58,116,36,86,142,116,164,86,78,206,68,244,122,206,132,244],b:[106,60,102,98,100,150,62,92,44,52,146,122,170,104,74,206,58,240,126,200,136,244],
    back:function(c,q){var cx=q[0],cy=q[1]-16;c.fillStyle=ink();c.beginPath();c.moveTo(cx-24,cy);c.quadraticCurveTo(cx-34,cy-44,cx,cy-50);c.quadraticCurveTo(cx+34,cy-44,cx+24,cy);c.closePath();c.fill();
      seg(c,[cx-13,cy-44,cx-7,cy-56],4);seg(c,[cx+13,cy-44,cx+7,cy-56],4);seg(c,[cx,cy-50,cx,cy-62],4)},
    head:function(c,q){var cx=q[0],cy=q[1]-16;c.strokeStyle=ink(rimPass?null:GOLD);c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(cx-20,cy-3);c.quadraticCurveTo(cx,cy-13,cx+20,cy-3);c.stroke();
      c.beginPath();c.moveTo(cx-17,cy-20);c.quadraticCurveTo(cx,cy-31,cx+17,cy-20);c.stroke();
      dot(c,q[2]-22,q[3]+1,12);dot(c,q[2]+22,q[3]+1,12);
      cloth(c,[q[4]-16,q[5]-14,q[4]-54,q[5]+26,q[4]-46,q[5]+56,q[4],q[5]+66,q[4]+46,q[5]+56,q[4]+54,q[5]+26,q[4]+16,q[5]-14]);
      seg(c,[q[4]-38,q[5]+42,q[4],q[5]+50,q[4]+38,q[5]+42],3,rimPass?null:'#7a5206')}};

  function limb(c,ax,ay,bx,by,dx,dy,w){
    // The curve passes through the elbow or knee, so limbs bend softly
    var cx=2*bx-(ax+dx)/2,cy=2*by-(ay+dy)/2;
    c.strokeStyle=ink();c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo(cx,cy,dx,dy);c.stroke();
  }
  function body(c,k,q,t,props){
    if(k.back&&props>0){c.globalAlpha=props;k.back(c,q,t);c.globalAlpha=1}
    var hipL=q[14]<q[4]?-7:7,hipR=q[18]<q[4]?-7:7;
    limb(c,q[4]+hipL,q[5],q[14],q[15],q[16],q[17],14);
    limb(c,q[4]+hipR,q[5],q[18],q[19],q[20],q[21],14);
    seg(c,[q[16],q[17],q[16]+(q[16]<q[4]?-9:9),q[17]+1],9);
    seg(c,[q[20],q[21],q[20]+(q[20]<q[4]?-9:9),q[21]+1],9);
    seg(c,[q[2],q[3]-4,q[0],q[1]+6],11);
    cloth(c,[q[2]-17,q[3]-2,q[2]-19,(q[3]+q[5])/2-6,q[4]-12,q[5]-8,q[4],q[5]+6,q[4]+12,q[5]-8,q[2]+19,(q[3]+q[5])/2-6,q[2]+17,q[3]-2,q[2],q[3]-8,q[2]-17,q[3]-2]);
    var armL=q[6]<q[2]?-14:14,armR=q[10]<q[2]?-14:14;
    limb(c,q[2]+armL,q[3]+3,q[6],q[7],q[8],q[9],11);
    limb(c,q[2]+armR,q[3]+3,q[10],q[11],q[12],q[13],11);
    dot(c,q[8],q[9],7);dot(c,q[12],q[13],7);
    dot(c,q[0],q[1],15);
    if(k.head&&props>0){c.globalAlpha=props;k.head(c,q,t);c.globalAlpha=1}
    if(k.front&&props>0){c.globalAlpha=props;k.front(c,q,t);c.globalAlpha=1}
  }
  function person(c,name,t,e,phase){
    var k=K[name],o=.5+.5*Math.sin((t*k.f+phase)*TAU),q=mix(k.a,k.b,o),props=e>=1?1:clamp((e-.82)/.18);
    if(e<1)q=mix(mix(WALK_A,WALK_B,.5+.5*Math.sin(t*1.7*TAU)),q,smooth((e-.72)/.28));
    if(!low){rimPass=true;c.save();c.translate(-1.7,-1.3);body(c,k,q,t,props);c.restore();rimPass=false}
    body(c,k,q,t,props);
  }

  /* Reusable light sprites */
  function sprite(size,paint){var s=document.createElement('canvas');s.width=s.height=size;paint(s.getContext('2d'),size);return s}
  var halo=sprite(256,function(g,n){var r=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);r.addColorStop(0,'rgba(255,222,120,.95)');r.addColorStop(.45,'rgba(244,187,37,.5)');r.addColorStop(1,'rgba(244,187,37,0)');g.fillStyle=r;g.fillRect(0,0,n,n)});
  var ball=sprite(48,function(g,n){var r=g.createRadialGradient(n*.38,n*.34,1,n/2,n/2,n/2);r.addColorStop(0,'#ffe68f');r.addColorStop(.55,'#f6a800');r.addColorStop(1,'#a45f00');g.fillStyle=r;g.beginPath();g.arc(n/2,n/2,n/2-1,0,TAU);g.fill()});
  var ballW=sprite(48,function(g,n){var r=g.createRadialGradient(n*.38,n*.34,1,n/2,n/2,n/2);r.addColorStop(0,'#ffffff');r.addColorStop(.6,'#f6efe2');r.addColorStop(1,'#b59c6a');g.fillStyle=r;g.beginPath();g.arc(n/2,n/2,n/2-1,0,TAU);g.fill()});

  /* The stage story: everything is driven by how far the visitor has scrolled */
  var film=document.getElementById('film'),pin=document.getElementById('pin'),cv=document.getElementById('stage'),x=cv.getContext('2d');
  var caps=[].slice.call(document.querySelectorAll('.cap')),cue=document.getElementById('cue'),rail=document.getElementById('rail');
  var slow=.016,seen=0,W=0,H=0,dpr=1,crowd=[],dust=[],petals=[],t=reduce?1.3:0,p=0,pS=reduce?.93:0,last=0,filmOn=true;
  var ACTORS=[
    {n:'decor',x:112,from:-180,a:.1,d:.07,ph:0},
    {n:'tech',x:1094,from:1380,a:.24,d:.05,ph:.2},
    {n:'coord',x:968,from:1380,a:.38,d:.06,ph:.1},
    {n:'anchor',x:286,from:-180,a:.44,d:.05,ph:.4},
    {n:'drums',x:430,from:-180,a:.52,d:.05,ph:0},
    {n:'vocals',x:590,from:-180,a:.54,d:.05,ph:.3},
    {n:'dance',x:730,from:1380,a:.56,d:.05,ph:0},
    {n:'dance2',x:850,from:1380,a:.58,d:.05,ph:.5}
  ];
  var LIGHT=[[0,.26],[.24,.32],[.34,.78],[.52,.82],[.6,.96],[.84,1]];
  var BEAMS=[[0,.0],[.27,.0],[.34,.8],[.52,.7],[.6,1]];
  var CAM=[[0,600,.1],[.08,600,.1],[.15,210,1],[.22,210,1],[.28,1010,1],[.37,1010,1],[.42,950,.92],[.46,320,1],[.51,320,1],[.58,640,.55],[.67,640,.42],[.77,600,.06],[1,600,0]];
  var handSprites=[];
  var handImg=new Image();
  handImg.onload=function(){
    ['#3f2b07','#1e1404','#060402'].forEach(function(col){
      var s=document.createElement('canvas');s.width=200;s.height=143;var g=s.getContext('2d');
      g.drawImage(handImg,0,0,200,143);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,200,143);
      handSprites.push({c:s,col:col});
    });
    if(reduce)drawFilm();
  };
  handImg.src=HAND;

  function layout(){
    W=pin.clientWidth;H=cv.clientHeight||pin.clientHeight;if(!W||!H)return;
    dpr=low?1:Math.min(devicePixelRatio||1,W<700?1.5:2);cv.width=W*dpr;cv.height=H*dpr;
    var tiny=W<700;crowd=[];
    [{r:0,size:tiny?44:74,gap:tiny?38:60,base:.11},{r:1,size:tiny?60:102,gap:tiny?52:84,base:.055},{r:2,size:tiny?82:136,gap:tiny?74:122,base:0}].forEach(function(R){
      for(var px=-R.gap*.4;px<W+R.gap;px+=R.gap)crowd.push({r:R.r,x:px+(Math.random()-.5)*R.gap*.5,s:R.size*(.86+Math.random()*.26),base:R.base,th:Math.random(),ph:Math.random()*TAU,tilt:(Math.random()-.5)*.34,phone:R.r<2&&Math.random()<.34});
    });
    dust=[];for(var i=0;i<(low?14:tiny?30:70);i++)dust.push({x:Math.random(),s:Math.random(),v:.012+Math.random()*.03,r:.7+Math.random()*1.6,ph:Math.random()*TAU});
    petals=[];for(var j=0;j<(low?20:tiny?36:80);j++)petals.push({x:Math.random(),s:Math.random(),v:.05+Math.random()*.09,r:4+Math.random()*6,ph:Math.random()*TAU,col:['#ffb300','#f4c13d','#ff9d0a','#fff0c0'][j%4]});
  }

  function catenary(x0,x1,y,sag,n,g){
    x.strokeStyle='rgba(120,90,20,.9)';x.lineWidth=1.5;x.beginPath();
    var shown=Math.floor(n*g);if(shown<1)return;
    for(var i=0;i<=shown;i++){var u=i/n,px=x0+(x1-x0)*u,py=y+sag*4*u*(1-u);if(!i)x.moveTo(px,py);else x.lineTo(px,py)}
    x.stroke();
    for(var k=0;k<=shown;k++){var v=k/n,bx=x0+(x1-x0)*v,by=y+sag*4*v*(1-v);x.drawImage(k%3===2?ballW:ball,bx-11,by-11,22,22)}
  }
  function backdrop(light){
    x.globalCompositeOperation='lighter';x.globalAlpha=.08+.46*light;x.drawImage(halo,600-760,350-560,1520,1120);x.globalCompositeOperation='source-over';x.globalAlpha=1;
    x.fillStyle='rgba(244,187,37,'+(.05+.5*light)+')';
    x.beginPath();x.roundRect(146,300,134,262,[67,67,0,0]);x.fill();
    x.beginPath();x.roundRect(920,300,134,262,[67,67,0,0]);x.fill();
    x.save();x.beginPath();x.moveTo(310,560);x.lineTo(310,400);x.arc(600,400,290,Math.PI,0);x.lineTo(890,560);x.closePath();
    x.fillStyle='rgba(14,12,6,'+(.8-.25*light)+')';x.fill();x.clip();
    x.strokeStyle='rgba(244,193,61,'+(.16+.5*light)+')';x.lineWidth=3;x.beginPath();
    for(var sx=326;sx<890;sx+=24){x.moveTo(sx,90);x.lineTo(sx,560)}
    x.stroke();x.restore();
    x.strokeStyle='rgba(244,193,61,'+(.35+.65*light)+')';x.lineWidth=6;x.beginPath();x.moveTo(310,560);x.lineTo(310,400);x.arc(600,400,290,Math.PI,0);x.lineTo(890,560);x.stroke();
  }
  function beams(level){
    if(level<.02)return;
    x.globalCompositeOperation='lighter';
    var pulse=Math.pow(1-((t*1.6)%1),3);
    for(var i=0;i<7;i++){
      var ox=120+i*160,ang=Math.sin(t*.55+i*1.7)*.36,len=860,w=74,ex=ox+Math.sin(ang)*len,ey=-140+Math.cos(ang)*len;
      var g=x.createLinearGradient(ox,-140,ex,ey),al=level*(.2+.09*pulse);
      g.addColorStop(0,'rgba(255,214,90,'+al+')');g.addColorStop(1,'rgba(255,190,30,0)');
      x.fillStyle=g;x.beginPath();x.moveTo(ox-6,-140);x.lineTo(ox+6,-140);x.lineTo(ex+w,ey);x.lineTo(ex-w,ey);x.closePath();x.fill();
    }
    x.globalCompositeOperation='source-over';
  }
  function floor(light){
    var g=x.createLinearGradient(0,560,0,720);g.addColorStop(0,'rgba(120,84,16,'+(.25+.5*light)+')');g.addColorStop(1,'rgba(14,16,13,0)');
    x.fillStyle=g;x.fillRect(-1600,560,4400,200);
    x.fillStyle='rgba(244,193,61,'+(.5+.5*light)+')';x.fillRect(-1600,558,4400,4);
  }
  function drawCrowd(L){
    if(L<=.005)return;
    var g=x.createLinearGradient(0,H,0,H*.45);g.addColorStop(0,'rgba(244,170,10,'+(.55*L)+')');g.addColorStop(1,'rgba(244,170,10,0)');x.fillStyle=g;x.fillRect(0,H*.45,W,H*.55);
    if(handSprites.length<3)return;
    var beat=Math.sin(t*TAU)*.5+.5;
    crowd.forEach(function(h){
      var rise=clamp((L*1.25-h.th*.95)/.25);if(rise<=0)return;rise=1-Math.pow(1-rise,3);
      var S=handSprites[h.r],hw=h.s,hh=hw*.715,arm=hw*1.6,bob=rise*(Math.sin(t*3.14+h.ph)*hw*.06+beat*hw*.03);
      var top=H-H*h.base-hw*.78-bob+(1-rise)*(hh+arm+H*h.base+20);
      x.save();x.translate(h.x,top);x.rotate(h.tilt+Math.sin(t*1.6+h.ph)*.05);
      x.fillStyle=S.col;x.beginPath();x.roundRect(-hw*.14,hh*.8,hw*.3,arm,hw*.1);x.fill();
      x.drawImage(S.c,-hw*.5,0,hw,hh);x.restore();
      if(h.phone&&rise>.8){
        var fl=.6+.4*Math.sin(t*2.2+h.ph);x.globalCompositeOperation='lighter';x.globalAlpha=.7*fl;x.drawImage(halo,h.x-hw*.45,top-hw*.45,hw*.9,hw*.9);x.globalAlpha=1;x.globalCompositeOperation='source-over';
        x.fillStyle='#fffbe8';x.beginPath();x.arc(h.x,top,W<700?1.6:2.4,0,TAU);x.fill();
      }
    });
  }
  function drawFilm(){
    if(!W)return;
    var light=tbl(LIGHT,pS)[0],beamL=tbl(BEAMS,pS)[0],cam=tbl(CAM,pS);
    var close=Math.min(H*.5/300,W/420),all=Math.min(Math.max(W/1200,.55),close),z=all+(close-all)*cam[1];
    var camX=W/2-cam[0]*z,span=1200*z;
    if(span>W)camX=Math.min(0,Math.max(W-span,camX));else camX=(W-span)/2;
    var camY=H*.84-560*z;
    x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
    x.save();x.translate(camX,camY);x.scale(z,z);
    backdrop(light);
    var spot=(1-smooth((pS-.12)/.14));
    if(spot>.01){x.globalCompositeOperation='lighter';var sg=x.createLinearGradient(600,-120,600,560);sg.addColorStop(0,'rgba(255,226,140,'+.34*spot+')');sg.addColorStop(1,'rgba(255,200,70,'+.05*spot+')');x.fillStyle=sg;x.beginPath();x.moveTo(586,-120);x.lineTo(614,-120);x.lineTo(760,560);x.lineTo(440,560);x.closePath();x.fill();x.globalCompositeOperation='source-over'}
    beams(beamL);
    floor(light);
    var gar=clamp((pS-.12)/.1);
    if(gar>0){var gy=W<700?178:6;catenary(30,600,gy,84,26,gar);catenary(1170,600,gy,84,26,gar)}
    ACTORS.forEach(function(a){
      var e=clamp((pS-a.a)/a.d);if(e<=0)return;
      var px=a.from+(a.x-a.from)*(1-Math.pow(1-e,2.4));
      x.globalCompositeOperation='lighter';x.globalAlpha=.4*Math.min(1,e*3);x.drawImage(halo,px-210,190,420,420);x.globalAlpha=1;x.globalCompositeOperation='source-over';
      x.fillStyle='rgba(6,5,2,.5)';x.beginPath();x.ellipse(px,563,74,7,0,0,TAU);x.fill();
      x.save();x.translate(px-95,560-228);x.scale(.95,.95);person(x,a.n,t,e>=1?1:e,a.ph);x.restore();
    });
    x.restore();
    x.setTransform(dpr,0,0,dpr,0,0);
    x.globalCompositeOperation='lighter';x.fillStyle='#ffd23f';
    dust.forEach(function(d){var dy=H-((d.s+t*d.v)%1)*H;x.globalAlpha=(.15+.5*light)*(.5+.5*Math.sin(t*2+d.ph));x.beginPath();x.arc(d.x*W+Math.sin(t+d.ph)*8,dy,d.r,0,TAU);x.fill()});
    x.globalAlpha=1;x.globalCompositeOperation='source-over';
    var fallA=clamp((pS-.8)/.06);
    if(fallA>0)petals.forEach(function(q){var py=((q.s+t*q.v)%1)*(H+40)-20,rot=t*1.6+q.ph;x.globalAlpha=fallA*.92;x.fillStyle=q.col;x.save();x.translate(q.x*W+Math.sin(t*.8+q.ph)*22,py);x.rotate(rot);x.scale(1,.45+.55*Math.abs(Math.cos(rot*1.3)));x.beginPath();x.ellipse(0,0,q.r,q.r*.55,0,0,TAU);x.fill();x.restore()});
    x.globalAlpha=1;
    drawCrowd(clamp((pS-.68)/.13));
  }
  function readScroll(){
    var r=film.getBoundingClientRect(),run=r.height-pin.clientHeight;
    p=run>0?clamp(-r.top/run):0;
    filmOn=r.bottom>0&&r.top<innerHeight;
    caps.forEach(function(c){var on=p>=+c.dataset.a&&p<+c.dataset.b;if(c.classList.contains('on')!==on)c.classList.toggle('on',on)});
    cue.classList.toggle('off',p>.015);pin.classList.toggle('opening',p<.075);pin.classList.toggle('finish',p>=.84);
    rail.style.setProperty('--p',p.toFixed(4));
  }

  /* The small people in the tiles use the same drawing */
  var tiles=[].slice.call(document.querySelectorAll('.art canvas')).map(function(el,i){return{el:el,g:el.getContext('2d'),k:el.dataset.kind,on:false,ph:i*.13}});
  function sizeTile(o){var w=o.el.clientWidth,h=o.el.clientHeight;if(!w)return;var d=Math.min(devicePixelRatio||1,2);o.el.width=w*d;o.el.height=h*d;o.d=d;o.w=w;o.h=h}
  function drawTile(o){
    if(!o.w)return;
    var g=o.g,s=Math.min(o.w/200,o.h/262)*.92;
    g.setTransform(o.d,0,0,o.d,0,0);g.clearRect(0,0,o.w,o.h);
    g.fillStyle='rgba(11,12,10,.32)';g.beginPath();g.ellipse(o.w/2,o.h/2+s*118,s*76,s*5,0,0,TAU);g.fill();
    g.translate(o.w/2-100*s,o.h/2-125*s);g.scale(s,s);person(g,o.k,t,1,o.ph);
  }
  if('IntersectionObserver' in window&&!reduce){
    var io;io=new IntersectionObserver(function(es){es.forEach(function(en){tiles.forEach(function(o){if(o.el===en.target)o.on=en.isIntersecting})})},{rootMargin:'80px'});
    tiles.forEach(function(o){io.observe(o.el)});
  }else tiles.forEach(function(o){o.on=true});

  /* The world: visitors stand in the middle, turn to look around, and tap a place to fly there. Everything keeps time with one beat. */
  var world=null;
  var PLACES=[['about','About AILU'],['events','Events'],['people','People'],['culture','Culture'],['dreams','Dreams'],['rewards','Rewards'],['jobs','Join AILU'],['enquire','Enquire']];
  function buildWorld(){
    var T=THREE,el=document.getElementById('world');
    if(!T)return null;
    var r;
    try{r=new T.WebGLRenderer({canvas:el,antialias:innerWidth>=700,powerPreference:'high-performance'})}catch(err){return null}
    ROOT.classList.add('has-world','booting');setTimeout(function(){ROOT.classList.remove('booting')},200);el.hidden=false;
    r.toneMapping=T.ACESFilmicToneMapping;r.setClearColor(0x070603,1);
    var tiny=innerWidth<700,scene=new T.Scene(),cam=new T.PerspectiveCamera(58,1,.1,300);
    scene.fog=new T.FogExp2(0x070603,.011);
    var es=new T.Scene();es.background=new T.Color(0x0a0703);
    [[0,9,0,14,0xfff0c8,3],[9,1,3,6,0xffb81f,2],[-9,0,-3,6,0xffd97a,2],[0,-8,2,10,0x6b4306,1]].forEach(function(a){var m=new T.Mesh(new T.SphereGeometry(a[3]*.35,16,12),new T.MeshBasicMaterial({color:new T.Color(a[4]).multiplyScalar(a[5])}));m.position.set(a[0],a[1],a[2]);es.add(m)});
    scene.environment=new T.PMREMGenerator(r).fromScene(es,.03).texture;
    scene.add(new T.HemisphereLight(0xfff0c8,0x2a1c06,1.35));
    var gold=new T.MeshStandardMaterial({color:0xffc42e,metalness:.82,roughness:.26,envMapIntensity:2.2});
    var cream=new T.MeshStandardMaterial({color:0xfff2dc,metalness:.15,roughness:.32});
    var dark=new T.MeshStandardMaterial({color:0x17120a,metalness:.7,roughness:.45});
    var glowTex=new T.CanvasTexture(halo);glowTex.colorSpace=T.SRGBColorSpace;
    var mtx=new T.Matrix4(),pos=new T.Vector3(),quat=new T.Quaternion(),scl=new T.Vector3(),eul=new T.Euler(),colr=new T.Color(),va=new T.Vector3(),vb=new T.Vector3(),up=new T.Vector3(0,1,0);
    function glow(size,col,op){var s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:col||0xffb933,transparent:true,opacity:op==null?1:op,blending:T.AdditiveBlending,depthWrite:false,fog:false}));s.scale.set(size,size,1);return s}
    function roundBox(w,hh,d,rad){
      var s=new T.Shape(),x0=-w/2,y0=-hh/2;
      s.moveTo(x0+rad,y0);s.lineTo(x0+w-rad,y0);s.quadraticCurveTo(x0+w,y0,x0+w,y0+rad);s.lineTo(x0+w,y0+hh-rad);s.quadraticCurveTo(x0+w,y0+hh,x0+w-rad,y0+hh);s.lineTo(x0+rad,y0+hh);s.quadraticCurveTo(x0,y0+hh,x0,y0+hh-rad);s.lineTo(x0,y0+rad);s.quadraticCurveTo(x0,y0,x0+rad,y0);
      var g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:rad*.3,bevelThickness:rad*.3,bevelSegments:tiny?1:2,curveSegments:tiny?2:4});g.center();return g;
    }
    var RADIUS=34,FLOOR=-3.2,stations={},hit=[],mainG=new T.Group();scene.add(mainG);
    PLACES.forEach(function(pl,i){
      var a=i*Math.PI/4,g=new T.Group();g.position.set(Math.sin(a)*RADIUS,FLOOR,-Math.cos(a)*RADIUS);g.lookAt(0,FLOOR,0);mainG.add(g);g.updateMatrixWorld();
      var s={name:pl[0],label:pl[1],angle:a,g:g,top:13,world:'main'};
      var sphere=new T.Mesh(new T.SphereGeometry(11,10,8),new T.MeshBasicMaterial({visible:false}));sphere.position.y=6;sphere.userData.st=s;g.add(sphere);hit.push(sphere);
      var pool=glow(30,0xffb020,.5);pool.position.set(0,6,-4);g.add(pool);s.pool=pool;
      stations[pl[0]]=s;
    });

    /* The ground, and garlands joining every place */
    var floorMat=new T.MeshBasicMaterial({color:0xffc43a,transparent:true,opacity:.34,fog:true});
    [15,25,RADIUS,44].forEach(function(rr){var o=new T.Mesh(new T.RingGeometry(rr-.05,rr+.05,tiny?64:128),floorMat);o.rotation.x=-Math.PI/2;o.position.y=FLOOR;mainG.add(o)});
    for(var ln=0;ln<16;ln++){var bar=new T.Mesh(new T.PlaneGeometry(.07,30),floorMat);bar.rotation.x=-Math.PI/2;bar.rotation.z=ln*Math.PI/8;var la=ln*Math.PI/8;bar.position.set(Math.sin(la)*29,FLOOR,-Math.cos(la)*29);mainG.add(bar)}
    var ground=new T.Mesh(new T.CircleGeometry(80,48),new T.MeshStandardMaterial({color:0x100b05,metalness:.7,roughness:.5}));ground.rotation.x=-Math.PI/2;ground.position.y=FLOOR-.02;scene.add(ground);
    var perSpan=tiny?14:26,flowerN=8*perSpan,flowers=new T.InstancedMesh(new T.SphereGeometry(.3,tiny?7:10,tiny?5:8),new T.MeshStandardMaterial({metalness:.15,roughness:.5,emissive:0x5a3200}),flowerN);
    for(var fi=0;fi<flowerN;fi++){
      var span=Math.floor(fi/perSpan),u=(fi%perSpan)/perSpan,ang=(span+u)*Math.PI/4,sag=Math.sin(u*Math.PI)*3.6;
      pos.set(Math.sin(ang)*23,15-sag,-Math.cos(ang)*23);quat.identity();var ss=.85+Math.random()*.55;scl.set(ss,ss,ss);flowers.setMatrixAt(fi,mtx.compose(pos,quat,scl));flowers.setColorAt(fi,colr.set(fi%5===4?0xfff4d8:fi%2?0xff9d0a:0xffb800));
    }
    flowers.frustumCulled=false;mainG.add(flowers);

    /* People share two instanced shapes, so a full cast stays light for phones */
    var FIG_MAX=26,cyl=new T.InstancedMesh(new T.CylinderGeometry(1,1,1,tiny?6:9),new T.MeshStandardMaterial({color:0x090806,metalness:.2,roughness:.55}),FIG_MAX*9),ball2=new T.InstancedMesh(new T.SphereGeometry(1,tiny?8:12,tiny?6:10),new T.MeshStandardMaterial({color:0x090806,metalness:.2,roughness:.55}),FIG_MAX*11);
    cyl.frustumCulled=false;ball2.frustumCulled=false;scene.add(cyl);scene.add(ball2);
    var figs=[],U=.024;
    K.walk3={f:.9,a:WALK_A,b:WALK_B};
    function addFig(st,kind,x,z,sc,walk){var f={st:st,k:kind,x:x,z:z,s:sc||1,ph:Math.random(),walk:walk};figs.push(f);return f}
    var RADS=[.42,.24,.24,.24,.24,.32,.32,.32,.32],J=[[2,4],[2,6],[6,8],[2,10],[10,12],[4,14],[14,16],[4,18],[18,20]];
    function drawFigs(){
      var ci=0,bi=0;
      var here=inside||'main',drawn=0;
      figs.forEach(function(f){
        if(f.st.world!==here||f.hidden||drawn>=FIG_MAX)return;drawn++;
        var kd=K[f.k],o=.5+.5*Math.sin((t*kd.f*2+f.ph)*TAU),q=mix(kd.a,kd.b,o),M=f.st.g.matrixWorld,sc=U*f.s,oy=f.y||0;
        var ox=f.x,oz=f.z;
        if(f.walk){var w=(t*.09+f.ph)%1;ox=f.walk[0]+(f.walk[1]-f.walk[0])*w;oz=f.z}
        var isMain=f.st.world==='main',tx=Math.cos(f.rot||0),tz=Math.sin(f.rot||0);
        function P(idx,out){var lx=(q[idx]-100)*sc;return out.set(ox+lx*tx,(240-q[idx+1])*sc+(isMain?0:(oy||FLOOR)),oz+lx*tz).applyMatrix4(M)}
        J.forEach(function(j,n){
          P(j[0],va);P(j[1],vb);var mid=pos.copy(va).add(vb).multiplyScalar(.5),len=va.distanceTo(vb)||.001,rad=RADS[n]*f.s;
          vb.sub(va).normalize();quat.setFromUnitVectors(up,vb);scl.set(rad,len,rad);cyl.setMatrixAt(ci++,mtx.compose(mid,quat,scl));
          P(j[1],vb);quat.identity();scl.set(rad,rad,rad);ball2.setMatrixAt(bi++,mtx.compose(vb,quat,scl));
          if(n===0){P(j[0],va);scl.set(rad,rad,rad);ball2.setMatrixAt(bi++,mtx.compose(va,quat,scl))}
        });
        P(0,va);quat.identity();var hr=.44*f.s;scl.set(hr,hr,hr);ball2.setMatrixAt(bi++,mtx.compose(va,quat,scl));
      });
      cyl.count=ci;ball2.count=bi;cyl.instanceMatrix.needsUpdate=true;ball2.instanceMatrix.needsUpdate=true;
    }

    /* About: the whole logo inside its ring of golden tiles */
    var sAbout=stations.about,ringG=new T.Group();ringG.position.y=8.4;sAbout.g.add(ringG);
    var n=tiny?300:800,ring=new T.InstancedMesh(roundBox(1,1,.22,.14),new T.MeshStandardMaterial({metalness:.55,roughness:.28,envMapIntensity:2.2}),n);
    for(var i=0;i<n;i++){
      var a=Math.random()*Math.PI*2,clump=Math.sin(a*5+1.3)*.5+.5,R=8+Math.random()*3*(.4+clump),s0=(.25+Math.random()*Math.random()*1.1)*(.5+clump*.7);
      pos.set(Math.cos(a)*R,Math.sin(a)*R,(Math.random()-.5)*3);eul.set((Math.random()-.5)*.7,(Math.random()-.5)*.7,a+(Math.random()-.5)*.5);quat.setFromEuler(eul);scl.set(s0,s0,s0);ring.setMatrixAt(i,mtx.compose(pos,quat,scl));
      var tone=Math.random();ring.setColorAt(i,colr.set(tone<.12?0xfff6dc:tone<.62?0xf4b81f:tone<.9?0xffd14a:0xb9730a));
    }
    ringG.add(ring);
    var logoTex=new T.TextureLoader().load(document.querySelector('.top img').src);logoTex.colorSpace=T.SRGBColorSpace;logoTex.anisotropy=4;
    var logoMesh=new T.Mesh(new T.PlaneGeometry(11.5,11.5/3),new T.MeshBasicMaterial({map:logoTex,transparent:true,toneMapped:false,fog:false,depthWrite:false}));logoMesh.position.set(0,8.4,2);sAbout.g.add(logoMesh);
    sAbout.top=17.5;

    /* Events: a stage, performers and a crowd in the logo's hand shape */
    var sEv=stations.events,gEv=sEv.g;
    var plat=new T.Mesh(new T.BoxGeometry(30,.7,12),dark);plat.position.set(0,.35,-2);gEv.add(plat);
    var rim=new T.Mesh(new T.BoxGeometry(30,.08,.08),new T.MeshBasicMaterial({color:0xffd14a,toneMapped:false}));rim.position.set(0,.72,4);gEv.add(rim);
    var bigArch=new T.Mesh(new T.TorusGeometry(10.5,.26,12,tiny?40:80,Math.PI),gold);bigArch.position.set(0,.7,-6.5);gEv.add(bigArch);
    var slatN=tiny?13:27,slats=new T.InstancedMesh(new T.BoxGeometry(.09,1,.09),new T.MeshBasicMaterial({color:0xffc63f,toneMapped:false}),slatN);
    for(var si=0;si<slatN;si++){var sx=-9.6+si*19.2/(slatN-1),ht=Math.sqrt(110-sx*sx);pos.set(sx,.7+ht/2,-6.6);quat.identity();scl.set(1,ht,1);slats.setMatrixAt(si,mtx.compose(pos,quat,scl))}
    gEv.add(slats);
    var stageGlow=glow(38,0xffb020,.8);stageGlow.position.set(0,7,-7.5);gEv.add(stageGlow);
    var evLift={lift:.7};
    addFig(sEv,'drums',-7,-1,1.05);addFig(sEv,'vocals',-2.4,-.6,1.05);addFig(sEv,'dance',2.4,-1,1.05);addFig(sEv,'dance2',7,-.6,1.05);
    var drum=new T.Mesh(new T.CylinderGeometry(.68,.68,1.8,16),gold);drum.position.set(-5.8,2.2,-.9);gEv.add(drum);
    var beams3=[],beamMat=(function(){var c=document.createElement('canvas');c.width=4;c.height=128;var g=c.getContext('2d'),l=g.createLinearGradient(0,0,0,128);l.addColorStop(0,'rgba(255,236,170,.6)');l.addColorStop(.3,'rgba(255,216,110,.2)');l.addColorStop(1,'rgba(255,216,110,0)');g.fillStyle=l;g.fillRect(0,0,4,128);return new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false})})();
    var beamGeo=new T.ConeGeometry(3.4,26,tiny?14:20,1,true);beamGeo.translate(0,-13,0);
    function addBeam(g,x,y,z,ph){var b=new T.Mesh(beamGeo,beamMat);b.position.set(x,y,z);b.userData.ph=ph;g.add(b);beams3.push(b)}
    for(var bb=0;bb<(tiny?3:5);bb++)addBeam(gEv,-9+bb*(tiny?9:4.5),19,-3,bb*1.2);
    sEv.top=15;
    var handReady=false,crowd3=null,arms3=null,handCount=tiny?36:80,crowdData=[];
    function buildCrowd(){
      handReady=true;
      var tex=new T.CanvasTexture(handSprites[2].c);tex.colorSpace=T.SRGBColorSpace;
      crowd3=new T.InstancedMesh(new T.PlaneGeometry(1,.715),new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.3,side:T.DoubleSide,fog:false,toneMapped:false}),handCount);
      arms3=new T.InstancedMesh(new T.CylinderGeometry(.13,.17,1.9,6),new T.MeshBasicMaterial({color:0x060402,fog:false}),handCount);
      for(var c2=0;c2<handCount;c2++)crowdData.push({x:(Math.random()-.5)*30,z:6+Math.random()*6,ph:Math.random()*6,tilt:(Math.random()-.5)*.4,s:1+Math.random()*.5});
      crowd3.frustumCulled=false;arms3.frustumCulled=false;gEv.add(arms3);gEv.add(crowd3);
    }

    /* People: the crew among towers of sound and light */
    var sPe=stations.people,gPe=sPe.g,towerTex=(function(){
      var c=document.createElement('canvas');c.width=128;c.height=256;var g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,128,256);g.strokeStyle='#ffc53a';g.lineWidth=2;g.strokeRect(6,6,116,244);
      for(var yy=18;yy<246;yy+=26){g.fillStyle=yy%3?'#ffb81f':'#fff0c8';g.fillRect(16,yy,64+((yy*7)%34),4)}
      g.beginPath();g.arc(92,58,18,0,6.3);g.stroke();g.beginPath();g.arc(92,190,18,0,6.3);g.stroke();var tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;
    })(),towerMat=new T.MeshStandardMaterial({color:0x17120a,metalness:.7,roughness:.45,emissive:0xffffff,emissiveMap:towerTex,emissiveIntensity:1});
    [[-13,-3,3.6,18],[-8.6,-6,3,13],[8.6,-6,3,14],[13,-3,3.6,20],[-4.4,-9,3,10],[4.4,-9,3,11]].forEach(function(b){var m=new T.Mesh(new T.BoxGeometry(b[2],b[3],2.6),towerMat);m.position.set(b[0],b[3]/2,b[1]);gPe.add(m)});
    var disc=new T.Group();disc.position.set(0,10,-5);gPe.add(disc);
    var plate=new T.Mesh(new T.CylinderGeometry(3,3,.2,tiny?28:48),new T.MeshBasicMaterial({color:0x100c06}));plate.rotation.x=Math.PI/2;disc.add(plate);
    [3,2.4,1.8,1.2].forEach(function(rr,idx){disc.add(new T.Mesh(new T.TorusGeometry(rr,idx?.03:.1,8,tiny?32:56),gold))});
    disc.add(new T.Mesh(new T.SphereGeometry(.7,18,14),gold));disc.add(glow(14));
    addFig(sPe,'tech',-5,0,1);addFig(sPe,'coord',5,0,1);addFig(sPe,'photo',0,2,1);
    var cam2=new T.Mesh(new T.BoxGeometry(1.1,.8,.6),gold);cam2.position.set(.6,3.5,2);gPe.add(cam2);
    sPe.top=17;

    /* Culture: arches of marigolds around a performer inspired by Yakshagana */
    var sCu=stations.culture,gCu=sCu.g;
    [9.5,7.8,6.2].forEach(function(rr,idx){var o=new T.Mesh(new T.TorusGeometry(rr,.17,10,tiny?36:64,Math.PI),gold);o.position.z=-idx*3;gCu.add(o);
      var per=tiny?18:32,fl=new T.InstancedMesh(new T.SphereGeometry(.3,tiny?7:10,tiny?5:8),new T.MeshStandardMaterial({metalness:.15,roughness:.5,emissive:0x5a3200}),per);
      for(var k=0;k<per;k++){var an=(k+.5)/per*Math.PI;pos.set(Math.cos(an)*(rr-.7),Math.sin(an)*(rr-.7),0);quat.identity();var s2=.85+Math.random()*.5;scl.set(s2,s2,s2);fl.setMatrixAt(k,mtx.compose(pos,quat,scl));fl.setColorAt(k,colr.set(k%5===4?0xfff4d8:k%2?0xff9d0a:0xffb800))}
      fl.frustumCulled=false;fl.position.z=-idx*3+.1;gCu.add(fl)});
    addFig(sCu,'yaksha',0,-3,1.1);
    var crown=new T.Mesh(new T.CircleGeometry(1.55,28,0,Math.PI),new T.MeshBasicMaterial({color:0x090806,side:T.DoubleSide}));gCu.add(crown);
    var crownBand=new T.Mesh(new T.TorusGeometry(1.28,.07,8,28,Math.PI),gold);gCu.add(crownBand);
    var yskirt=new T.Mesh(new T.SphereGeometry(1.5,18,12),new T.MeshStandardMaterial({color:0x090806,metalness:.2,roughness:.55}));yskirt.scale.set(1.1,.62,1);gCu.add(yskirt);
    var yFig=figs[figs.length-1];
    for(var dy=0;dy<(tiny?6:12);dy++){var dg=glow(3.4,0xffb933);dg.position.set(-10+Math.random()*20,.6+Math.random()*2,3+Math.random()*4);gCu.add(dg)}
    sCu.top=13;

    /* Dreams: lanterns rising over the night, and people reaching up */
    var sDr=stations.dreams,gDr=sDr.g,lanTex=new T.CanvasTexture(sprite(96,function(g,nn){
      var rr=g.createLinearGradient(0,nn*.2,0,nn);rr.addColorStop(0,'#ffe9a6');rr.addColorStop(.6,'#f8b81f');rr.addColorStop(1,'#d97c00');g.fillStyle=rr;g.beginPath();g.moveTo(nn*.3,nn*.14);g.quadraticCurveTo(nn*.5,nn*.04,nn*.7,nn*.14);g.quadraticCurveTo(nn*.86,nn*.5,nn*.68,nn*.86);g.lineTo(nn*.32,nn*.86);g.quadraticCurveTo(nn*.14,nn*.5,nn*.3,nn*.14);g.fill();g.fillStyle='#fff6d6';g.beginPath();g.ellipse(nn*.5,nn*.76,nn*.08,nn*.13,0,0,6.3);g.fill();
    }));lanTex.colorSpace=T.SRGBColorSpace;
    var lans=[];for(var lj=0;lj<(tiny?16:34);lj++){var sp=new T.Sprite(new T.SpriteMaterial({map:lanTex,transparent:true,depthWrite:false,fog:false}));var l2={s:sp,x:(Math.random()-.5)*28,z:-8+Math.random()*12,u:Math.random(),v:.03+Math.random()*.03,z2:.9+Math.random()*1.1};var lg=glow(l2.z2*4,0xffb020,.6);sp.add(lg);lg.scale.set(3.6,3.6,1);sp.scale.set(l2.z2,l2.z2,1);gDr.add(sp);lans.push(l2)}
    var moon=new T.Mesh(new T.CircleGeometry(4,tiny?24:40),new T.MeshBasicMaterial({color:0xfff3cf,fog:false,toneMapped:false}));moon.position.set(9,22,-20);gDr.add(moon);var mg=glow(26,0xffe2a0,.6);mg.position.copy(moon.position);gDr.add(mg);
    K.dream3={f:.22,a:[100,46,100,82,100,140,68,110,60,146,126,64,138,20,90,190,86,240,110,190,114,240],b:[101,46,100,82,100,140,68,112,60,148,128,62,142,16,90,190,86,240,110,190,114,240]};
    addFig(sDr,'dream3',0,0,1.1);addFig(sDr,'dream3',-4,-1,.95);addFig(sDr,'dream3',4,-1,.98);
    sDr.top=15;

    /* Rewards: the golden hand, with five more turning around it */
    var sRe=stations.rewards,gRe=sRe.g,handTex=new T.TextureLoader().load(HAND);handTex.colorSpace=T.SRGBColorSpace;
    var ped=new T.Mesh(new T.CylinderGeometry(5.4,6.4,1.5,tiny?24:48),gold);ped.position.y=.75;gRe.add(ped);
    var ped2=new T.Mesh(new T.TorusGeometry(5.6,.09,8,tiny?36:64),new T.MeshBasicMaterial({color:0xffe08a,toneMapped:false}));ped2.rotation.x=Math.PI/2;ped2.position.y=1.5;gRe.add(ped2);
    var handMat=new T.MeshBasicMaterial({map:handTex,transparent:true,toneMapped:false,fog:false,depthWrite:false,side:T.DoubleSide});
    var bigHand=new T.Mesh(new T.PlaneGeometry(10,7.15),handMat);bigHand.position.set(0,7,0);gRe.add(bigHand);
    var orbit=new T.Group();orbit.position.set(0,7,0);gRe.add(orbit);var hs=[];
    for(var hi2=0;hi2<5;hi2++){var hm=new T.Mesh(new T.PlaneGeometry(2.5,1.79),handMat);orbit.add(hm);hs.push(hm)}
    var hg=glow(22,0xffb020,.7);hg.position.set(0,7,-1);gRe.add(hg);
    sRe.top=14;

    /* Jobs: an open stage door, with people walking towards it */
    var sJo=stations.jobs,gJo=sJo.g;
    var door=new T.Mesh(new T.PlaneGeometry(6,11),new T.MeshBasicMaterial({color:0xffe9a8,toneMapped:false,fog:false}));door.position.set(0,5.5,-6);gJo.add(door);
    var dg2=glow(26,0xffc14a,.9);dg2.position.set(0,6,-5.8);gJo.add(dg2);
    [[-3.3,5.5,.5,11.4],[3.3,5.5,.5,11.4],[0,11.3,7.2,.5]].forEach(function(b){var m=new T.Mesh(new T.BoxGeometry(b[2],b[3],.9),gold);m.position.set(b[0],b[1],-5.9);gJo.add(m)});
    for(var jf=0;jf<(tiny?2:3);jf++){var ff=addFig(sJo,'walk3',0,1.8+jf*.5,1,[-15-jf*3,-2]);if(ff)ff.ph=jf/3}
    addFig(sJo,'decor',9.5,0,1);
    sJo.top=14;

    /* Enquire: say hello into a microphone inside rings that keep time */
    var sEn=stations.enquire,gEn=sEn.g,mic=new T.Group();mic.position.set(0,7.4,0);gEn.add(mic);
    var mh=new T.Mesh(new T.SphereGeometry(1.5,24,18),cream);mh.position.y=2.6;mic.add(mh);
    mic.add(new T.Mesh(new T.CylinderGeometry(.82,.46,5.2,24),gold));
    var mb=new T.Mesh(new T.TorusGeometry(1.15,.14,10,32),gold);mb.rotation.x=Math.PI/2;mb.position.y=1.7;mic.add(mb);
    mic.rotation.z=-.4;var mg2=glow(18);mg2.position.set(0,7.4,-1);gEn.add(mg2);
    var rings=[5,7.2,9.4].map(function(rr,idx){var o=new T.Mesh(new T.TorusGeometry(rr,idx===1?.06:.1,10,tiny?48:96),gold);o.position.set(0,7.4,0);gEn.add(o);return o});
    var ticks=new T.Group();ticks.position.set(0,7.4,0);gEn.add(ticks);
    for(var tk=0;tk<16;tk++){var b2=new T.Mesh(new T.BoxGeometry(tk%4?.12:.24,tk%4?.7:1.3,.12),tk%4?gold:cream);var an2=tk/16*Math.PI*2;b2.position.set(Math.cos(an2)*8.3,Math.sin(an2)*8.3,0);b2.rotation.z=an2+Math.PI/2;ticks.add(b2)}
    sEn.top=17;

    /* Worlds you can step inside, each with something to see in every direction */
    var inside=null,subs={},pinEls=[],fadeEl=document.getElementById('fade'),subHit=[];
    K.calm={f:.18,a:[100,46,100,82,100,140,76,112,70,148,124,112,130,148,90,190,86,240,110,190,114,240],b:[101,47,100,82,100,140,76,114,70,150,124,114,130,150,90,190,86,240,110,190,114,240]};
    K.sit={f:.2,a:[100,92,100,126,100,178,78,152,84,186,122,152,116,186,70,186,70,240,130,186,130,240],b:[101,93,100,126,100,178,78,154,84,188,122,154,116,188,70,186,70,240,130,186,130,240]};
    function polar(ang,rad,y){return new T.Vector3(Math.sin(ang)*rad,y,-Math.cos(ang)*rad)}
    function place(g,o,ang,rad,y){var v=polar(ang,rad,y);o.position.copy(v);o.lookAt(0,y,0);g.add(o);return o}
    function subBase(world,opts){
      var g=new T.Group();g.visible=false;scene.add(g);g.updateMatrixWorld();
      return{g:g,st:{g:g,world:world},ticks:[],hit:[],pins:[],stops:[],si:0,fog:(opts&&opts.fog)||0x070603,density:(opts&&opts.density)||.014,exposure:(opts&&opts.exposure)||1.05,sky:(opts&&opts.sky)||0x070603,camFx:null};
    }
    function fallers(b,cols,count,size,cx,cz,w,top){
      var data=[],span=w||44,m=new T.InstancedMesh(new T.CircleGeometry(size||.13,6),new T.MeshBasicMaterial({side:T.DoubleSide,toneMapped:false,fog:false}),tiny?Math.round(count*.45):count);m.frustumCulled=false;
      for(var i2=0;i2<m.count;i2++){data.push({x:(cx||0)+(Math.random()-.5)*span,y:Math.random()*22,z:(cz||0)+(Math.random()-.5)*span,v:.7+Math.random()*1.4,ph:Math.random()*6});m.setColorAt(i2,colr.set(cols[i2%cols.length]))}
      b.g.add(m);
      b.ticks.push(function(){data.forEach(function(d,i3){pos.set(d.x+Math.sin(t*.8+d.ph)*.7,(top||17)-((d.y+t*d.v)%22),d.z);eul.set(t*1.3+d.ph,t*1.1+d.ph,0);quat.setFromEuler(eul);scl.set(1.2,.7,1);m.setMatrixAt(i3,mtx.compose(pos,quat,scl))});m.instanceMatrix.needsUpdate=true});
    }
    function balls(g,list,rad,mat){var m=new T.InstancedMesh(new T.SphereGeometry(rad,tiny?7:10,tiny?5:8),mat||new T.MeshStandardMaterial({metalness:.15,roughness:.5,emissive:0x5a3200}),list.length);m.frustumCulled=false;list.forEach(function(l,i2){pos.set(l[0],l[1],l[2]);quat.identity();var s2=l[4]||1;scl.set(s2,s2,s2);m.setMatrixAt(i2,mtx.compose(pos,quat,scl));m.setColorAt(i2,colr.set(l[3]||0xffb800))});g.add(m);return m}
    function string(list,a,b2,sag,n,cols){for(var i2=0;i2<=n;i2++){var u2=i2/n;list.push([a[0]+(b2[0]-a[0])*u2,a[1]+(b2[1]-a[1])*u2-Math.sin(u2*Math.PI)*sag,a[2]+(b2[2]-a[2])*u2,cols[i2%cols.length]])}}
    function boxAt(g,w,hh,d,x,y,z,mat){var m=new T.Mesh(new T.BoxGeometry(w,hh,d),mat);m.position.set(x,y,z);g.add(m);return m}
    function chairs(g,list,mat){var seat=new T.InstancedMesh(roundBox(1,.16,1,.06),mat,list.length),back=new T.InstancedMesh(roundBox(1,1.1,.14,.06),mat,list.length);list.forEach(function(c,i2){eul.set(0,c[2],0);quat.setFromEuler(eul);scl.set(1,1,1);pos.set(c[0],FLOOR+.9,c[1]);seat.setMatrixAt(i2,mtx.compose(pos,quat,scl));va.set(0,.55,-.45).applyQuaternion(quat);pos.set(c[0]+va.x,FLOOR+.9+va.y,c[1]+va.z);back.setMatrixAt(i2,mtx.compose(pos,quat,scl))});seat.frustumCulled=false;back.frustumCulled=false;g.add(seat);g.add(back)}
    var white=new T.MeshStandardMaterial({color:0xfff6e6,metalness:.05,roughness:.5});
    var MARI=[0xffb800,0xff9d0a,0xffb800,0xff9d0a,0xfff4d8];
    function glowAt(g,x,y,z,size,col,op){var s=glow(size,col,op);s.position.set(x,y,z);g.add(s);return s}
    function fig(b,k,x,z,s,rot,y){var f=addFig(b.st,k,x,z,s||1);f.rot=rot||0;if(y!=null)f.y=y;return f}
    function stop(b,x,y,z,yawS,pitchS,title,text){b.stops.push({p:[x,y,z],yaw:yawS,pitch:pitchS,title:title,text:text})}
    function pin(b,x,y,z,label,extra){var o={p:[x,y,z],label:label};for(var k in extra)o[k]=extra[k];b.pins.push(o)}
    function floorOf(g,w,d,x,z,color,metal,rough){var m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({color:color,metalness:metal==null?.7:metal,roughness:rough==null?.35:rough}));m.rotation.x=-Math.PI/2;m.position.set(x,FLOOR+.01,z);g.add(m);return m}
    function gate(g,x,z,R2,rot,flowers,yy){var o=new T.Group();o.position.set(x,yy==null?FLOOR:yy,z);o.rotation.y=rot||0;g.add(o);o.add(new T.Mesh(new T.TorusGeometry(R2,.2,10,tiny?36:64,Math.PI),gold));
      if(flowers){var per=tiny?18:30,fl=[];for(var k2=0;k2<per;k2++){var an=(k2+.5)/per*Math.PI;fl.push([Math.cos(an)*(R2-.6),Math.sin(an)*(R2-.6),0,MARI[k2%5]])}balls(o,fl,.3)}return o}
    function hitXYZ(b,x,y,z,radius,data){var m=new T.Mesh(new T.SphereGeometry(radius,8,6),new T.MeshBasicMaterial({visible:false}));m.position.set(x,y,z);m.userData=data;b.g.add(m);m.updateMatrixWorld();b.hit.push(m)}
    function crownFor(b,f){
      var g=b.g,cr=new T.Mesh(new T.CircleGeometry(1.55,28,0,Math.PI),new T.MeshBasicMaterial({color:0x090806,side:T.DoubleSide}));g.add(cr);var band=new T.Mesh(new T.TorusGeometry(1.28,.07,8,28,Math.PI),gold);g.add(band);var sk=new T.Mesh(new T.SphereGeometry(1.45,18,12),new T.MeshStandardMaterial({color:0x090806,roughness:.55}));sk.scale.set(1.1,.62,1);g.add(sk);
      var tx=Math.cos(f.rot||0),tz=Math.sin(f.rot||0),base=f.y!=null?f.y:FLOOR;cr.rotation.y=-(f.rot||0);band.rotation.y=-(f.rot||0);
      b.ticks.push(function(){var kq=K.yaksha,qo=.5+.5*Math.sin((t*kq.f*2+f.ph)*TAU),qq=mix(kq.a,kq.b,qo),sc=U*f.s,hl=(qq[0]-100)*sc,pl2=(qq[4]-100)*sc,hy=base+(240-qq[1])*sc,py2=base+(240-qq[5])*sc;cr.position.set(f.x+hl*tx,hy+.2,f.z+hl*tz);band.position.set(f.x+hl*tx,hy+.2,f.z+hl*tz+.03);sk.position.set(f.x+pl2*tx,py2-.72,f.z+pl2*tz)});
    }
    function palm(g,x,z,s){var o=new T.Group();o.position.set(x,FLOOR,z);o.scale.setScalar(s||1);o.rotation.y=Math.random()*6;var mat=new T.MeshStandardMaterial({color:0x0a0906,roughness:.8});var tr=new T.Mesh(new T.CylinderGeometry(.18,.34,11,8),mat);tr.position.y=5.5;tr.rotation.z=.07;o.add(tr);for(var i2=0;i2<7;i2++){var lf=new T.Mesh(new T.ConeGeometry(.5,5,5),mat);lf.scale.z=.14;var an=i2/7*TAU;lf.position.set(Math.cos(an)*1.9-.4,10.4,Math.sin(an)*1.9);lf.rotation.set(Math.sin(an)*1.1,0,-Math.cos(an)*1.1);o.add(lf)}g.add(o)}
    function hallDoor(b,x,z,side,go,label,dress){
      var g=b.g,o=new T.Group();o.position.set(x,FLOOR,z);o.rotation.y=side>0?-Math.PI/2:Math.PI/2;g.add(o);
      var lit=new T.Mesh(new T.PlaneGeometry(6,10.4),new T.MeshBasicMaterial({color:0xffcf6a,toneMapped:false,fog:false}));lit.position.set(0,5.2,-.2);o.add(lit);
      [[-3.3,5.2,.5,10.8],[3.3,5.2,.5,10.8],[0,10.6,7.1,.5]].forEach(function(f){var m=new T.Mesh(new T.BoxGeometry(f[2],f[3],.7),gold);m.position.set(f[0],f[1],0);o.add(m)});
      var gg=glow(20,0xffb020,.6);gg.position.set(0,5,.4);o.add(gg);dress(o);
      hitXYZ(b,x,FLOOR+5,z,4.6,{go:go});pin(b,x-side*.9,FLOOR+12,z,label,{go:go});
    }
    var BUILD={
      /* A long grand hall with five lit doors */
      events:function(){
        var b=subBase('events',{fog:0x0a0703,density:.012}),g=b.g;
        floorOf(g,20,110,0,-30,0x2a1d08,.9,.18);
        var runner=new T.Mesh(new T.PlaneGeometry(3,110),new T.MeshBasicMaterial({color:0x5d3f0c}));runner.rotation.x=-Math.PI/2;runner.position.set(0,FLOOR+.03,-30);g.add(runner);
        var pil=new T.CylinderGeometry(.35,.42,16,14),cei=[];for(var z2=18;z2>-74;z2-=9){[-10,10].forEach(function(xx){var m=new T.Mesh(pil,cream);m.position.set(xx,FLOOR+8,z2+4.5);g.add(m)});var ar=new T.Mesh(new T.TorusGeometry(10,.14,8,tiny?28:48,Math.PI),gold);ar.position.set(0,FLOOR+15.6,z2+4.5);ar.scale.y=.28;g.add(ar);string(cei,[-9,FLOOR+15,z2],[9,FLOOR+15,z2],2,tiny?8:14,[0xfff0c0])}
        balls(g,cei,.14,new T.MeshBasicMaterial({toneMapped:false,fog:false}));
        hallDoor(b,10,-8,1,'wedding','Wedding',function(o){var w=[];for(var w2=-2.4;w2<=2.4;w2+=.8)string(w,[w2,9.6,.1],[w2,4,.1],0,6,MARI);balls(o,w,.2)});
        hallDoor(b,-10,-22,-1,'birthday','Birthday',function(o){var bl=[];for(var b2=0;b2<8;b2++)bl.push([-2.2+Math.random()*4.4,2+Math.random()*7,.2,b2%2?0xffc42e:0xfff2dc,1.7]);balls(o,bl,.34,new T.MeshStandardMaterial({metalness:.5,roughness:.25}))});
        hallDoor(b,10,-36,1,'corporate','Corporate',function(o){var s2=new T.Mesh(new T.PlaneGeometry(4.6,2.2),new T.MeshBasicMaterial({color:0x14110b}));s2.position.set(0,6.2,.1);o.add(s2);var s3=new T.Mesh(new T.PlaneGeometry(3,.18),new T.MeshBasicMaterial({color:0xfff7e6,toneMapped:false}));s3.position.set(0,6.4,.15);o.add(s3)});
        hallDoor(b,-10,-50,-1,'stagenight','Stage night',function(o){var ln=new T.Mesh(beamGeo,beamMat);ln.position.set(0,12,.2);ln.scale.set(.8,.6,.8);o.add(ln)});
        hallDoor(b,10,-64,1,'community','Community',function(o){var mo=new T.Mesh(new T.CircleGeometry(1.1,24),new T.MeshBasicMaterial({color:0xfff3cf,toneMapped:false}));mo.position.set(1.2,7.8,.1);o.add(mo);var se=new T.Mesh(new T.PlaneGeometry(6,1),new T.MeshBasicMaterial({color:0x4a3208}));se.position.set(0,.9,.1);o.add(se)});
        stop(b,0,.8,14,0,.02,'Every occasion.','Walk down the hall and step through a door. Every plan is shaped around your occasion, your priorities and your budget.');
        stop(b,0,.8,-1,.96,.03,'The wedding door','Engagements, pre-wedding functions and intimate wedding occasions. Tap the door to step inside.');
        stop(b,0,.8,-15,-.96,.03,'The birthday door','Birthdays, baby showers, anniversaries and all the little-big moments.');
        stop(b,0,.8,-29,.96,.03,'The corporate door','Company celebrations, launches, employee engagement, annual days and team gatherings.');
        stop(b,0,.8,-43,-.96,.03,'The stage night door','Hosting, dance, singing, games and performances shaped around your people.');
        stop(b,0,.8,-57,.96,.03,'The community door','College programmes, reunions, association gatherings and cultural celebrations.');
        b.note='Every event is scoped individually.';
        return b;
      },
      /* Walk the aisle: entrance, aisle, mandap, then dinner and dancing either side */
      wedding:function(){
        var b=subBase('wedding',{fog:0x1a0d03,density:.016,sky:0x120903,exposure:1.2}),g=b.g,fl=[],bulbs=[];
        floorOf(g,70,90,0,0,0x241606,.5,.5);
        var rn=new T.Mesh(new T.PlaneGeometry(5,40),new T.MeshStandardMaterial({color:0xfff6e6,roughness:.7}));rn.rotation.x=-Math.PI/2;rn.position.set(0,FLOOR+.03,8);g.add(rn);
        gate(g,0,26,7,0,true);glowAt(g,0,FLOOR+5,24,16,0xffb020,.45);
        var seats=[];[-9,-6.8,-4.6,4.6,6.8,9].forEach(function(xx){for(var z3=20;z3>=-5;z3-=2.6)seats.push([xx,z3,Math.PI])});chairs(g,seats,white);
        for(var z2=24;z2>-9;z2-=3.4){[-3.1,3.1].forEach(function(xx){var po=new T.Mesh(new T.CylinderGeometry(.34,.24,1,10),gold);po.position.set(xx,FLOOR+.5,z2);g.add(po);fl.push([xx,FLOOR+1.2,z2,0xffb800,1.6]);glowAt(g,xx,FLOOR+1.6,z2,2.4,0xffcf6a)});string(bulbs,[-12,12,z2],[12,12,z2],2.4,tiny?8:14,[0xfff0c0]);string(fl,[-11,13,z2-1.7],[11,13,z2-1.7],3.6,tiny?10:18,MARI)}
        for(var dr=0;dr<(tiny?6:12);dr++){[-13,13].forEach(function(xx){var c=new T.Mesh(new T.PlaneGeometry(2.4,17),new T.MeshStandardMaterial({color:0xfff2dc,roughness:.8,side:T.DoubleSide,emissive:0x3a2406}));c.position.set(xx,FLOOR+8.5,24-dr*(tiny?5.4:2.7));c.rotation.y=xx<0?Math.PI/2:-Math.PI/2;g.add(c)})}
        [[-5.5,-14],[5.5,-14],[-5.5,-22],[5.5,-22]].forEach(function(c){var m=new T.Mesh(new T.CylinderGeometry(.34,.44,10,16),cream);m.position.set(c[0],FLOOR+5,c[1]);g.add(m)});
        var roof=new T.Mesh(new T.TorusGeometry(6.2,.18,10,tiny?32:56,Math.PI),gold);roof.position.set(0,FLOOR+10,-14);g.add(roof);var roof2=roof.clone();roof2.position.z=-22;g.add(roof2);
        for(var i2=-5;i2<=5;i2+=1.25)string(fl,[i2,FLOOR+10,-14],[i2,FLOOR+5.6-Math.abs(i2)*.3,-14],0,tiny?6:10,MARI);
        glowAt(g,0,FLOOR+6,-24,34,0xffb020,.8);fig(b,'calm',-1.3,-18,1.15);fig(b,'calm',1.3,-18,1.15);
        var tb=boxAt(g,5,.3,18,30,FLOOR+1.5,-16,white);for(var c2=-7;c2<=7;c2+=2.8){glowAt(g,30,FLOOR+2.3,-16+c2,2.8,0xffc65a);fl.push([30,FLOOR+1.85,-16+c2,0xffb800,1.3])}
        var dine=[];for(var d2=-6.5;d2<=6.5;d2+=2.6){dine.push([27,-16+d2,Math.PI/2]);dine.push([33,-16+d2,-Math.PI/2])}chairs(g,dine,cream);
        var dfl=new T.Mesh(new T.CircleGeometry(7,tiny?24:40),new T.MeshStandardMaterial({color:0x2a1c06,metalness:.9,roughness:.25}));dfl.rotation.x=-Math.PI/2;dfl.position.set(-30,FLOOR+.03,-16);g.add(dfl);glowAt(g,-36,FLOOR+6,-16,24,0xffb020,.55);
        fig(b,'dance',-29,-19,1.05,Math.PI/2);fig(b,'dance2',-30,-13,1.05,Math.PI/2);fig(b,'dance',-33,-16,1,Math.PI/2);
        balls(g,fl,.3);balls(g,bulbs,.13,new T.MeshBasicMaterial({toneMapped:false,fog:false}));fallers(b,[0xffb300,0xff9d0a,0xfff0c0],170,.13,0,6,44);
        stop(b,0,.8,36,0,.05,'Grand entrance','You arrive under marigolds, and the whole family is watching. Walk on.');
        stop(b,0,.3,8,0,.03,'The aisle','Flower-lined, candlelit, and every guest turning to look.');
        stop(b,0,.8,-5,0,.06,'The mandap','The heart of the day, dressed in marigolds and warm light.');
        stop(b,20,.8,-16,Math.PI/2,.0,'Reception dinner','Long tables, soft candlelight and everyone together.');
        stop(b,-20,.8,-16,-Math.PI/2,.04,'Sangeet','Dance, music and family performances, planned around your people.');
        pin(b,0,FLOOR+11.6,26,'Entrance',{stop:0});pin(b,0,FLOOR+4.2,6,'The aisle',{stop:1});pin(b,0,FLOOR+11.8,-18,'Mandap',{stop:2});pin(b,29,FLOOR+5.5,-16,'Reception',{stop:3});pin(b,-30,FLOOR+7,-16,'Sangeet',{stop:4});
        b.title='A wedding world';b.occasion='Wedding celebration';
        return b;
      },
      /* A party you rise up through: door, cake, gifts, then up among the balloons */
      birthday:function(){
        var b=subBase('birthday',{fog:0x2a1906,density:.012,sky:0x201305,exposure:1.4}),g=b.g;
        floorOf(g,60,60,0,0,0x4a3208,.4,.4);
        [[4,1.5,cream],[3,1.3,gold],[2,1.1,cream]].reduce(function(y,c){var m=new T.Mesh(new T.CylinderGeometry(c[0],c[0],c[1],tiny?24:40),c[2]);m.position.set(0,y+c[1]/2,0);g.add(m);var ri=new T.Mesh(new T.TorusGeometry(c[0],.1,8,tiny?24:48),gold);ri.rotation.x=Math.PI/2;ri.position.set(0,y+c[1],0);g.add(ri);return y+c[1]},FLOOR);
        var flames=[];for(var i2=0;i2<7;i2++){var an=i2/7*TAU,ca=new T.Mesh(new T.CylinderGeometry(.08,.08,.8,8),cream);ca.position.set(Math.cos(an)*1.3,FLOOR+4.3,Math.sin(an)*1.3);g.add(ca);flames.push(glowAt(g,Math.cos(an)*1.3,FLOOR+4.9,Math.sin(an)*1.3,1.9,0xffc65a))}
        glowAt(g,0,FLOOR+5,-3,26,0xffb020,.7);b.ticks.push(function(){flames.forEach(function(f,i3){var s2=1.7+Math.sin(t*12+i3*2)*.25;f.scale.set(s2,s2,1)})});
        var count=tiny?34:80,bl=new T.InstancedMesh(new T.SphereGeometry(1,tiny?12:20,tiny?10:16),new T.MeshStandardMaterial({metalness:.5,roughness:.22,envMapIntensity:2.2}),count),data=[];bl.frustumCulled=false;
        for(var j2=0;j2<count;j2++){var a2=Math.random()*TAU,rr=5+Math.random()*19;data.push({x:Math.sin(a2)*rr,z:-Math.cos(a2)*rr,y:5+Math.random()*26,s:.7+Math.random()*.8,ph:Math.random()*6});bl.setColorAt(j2,colr.set(j2%3===0?0xfff2dc:j2%3===1?0xffc42e:0xffa91f))}g.add(bl);
        b.ticks.push(function(){data.forEach(function(d,i3){pos.set(d.x+Math.sin(t*.5+d.ph)*.4,d.y+Math.sin(t*.7+d.ph)*.6,d.z);quat.identity();scl.set(d.s,d.s*1.18,d.s);bl.setMatrixAt(i3,mtx.compose(pos,quat,scl))});bl.instanceMatrix.needsUpdate=true});
        var giftG=roundBox(1,1,1,.1);for(var k2=0;k2<10;k2++){var gm=new T.Mesh(giftG,k2%2?gold:cream),s4=1.2+Math.random()*1.7;gm.scale.setScalar(s4);gm.position.set(18+Math.random()*7,FLOOR+s4/2+.1,-8+k2*1.7);gm.rotation.y=Math.random();g.add(gm);gm.add(new T.Mesh(new T.BoxGeometry(1.03,1.03,.16),k2%2?cream:gold))}
        fig(b,'dance',-18,-3,1,Math.PI/2);fig(b,'dance2',-20,2,1,Math.PI/2);fig(b,'anchor',-16,5,1.05,Math.PI/2);glowAt(g,-24,FLOOR+5,0,24,0xffb020,.5);
        var dr=new T.Mesh(new T.PlaneGeometry(6,10),new T.MeshBasicMaterial({color:0xffe9a8,toneMapped:false,fog:false}));dr.position.set(0,FLOOR+5,26);dr.rotation.y=Math.PI;g.add(dr);glowAt(g,0,FLOOR+5,25.6,26,0xffc14a,.9);
        [[-3.3,5.2,.5,10.4],[3.3,5.2,.5,10.4],[0,10.2,7.1,.5]].forEach(function(f){boxAt(g,f[2],f[3],.9,f[0],FLOOR+f[1],25.8,gold)});
        fallers(b,[0xffc42e,0xfff2dc,0xffa91f],220,.16,0,0,44,26);
        stop(b,0,.8,14,Math.PI,.03,'The surprise entrance','Lights down, everyone quiet, and every eye on this door.');
        stop(b,0,1.6,11,0,-.06,'The cake','The moment everyone gathers for.');
        stop(b,6,.9,1,Math.PI/2,-.03,'Gifts and games','Friendly games that welcome everyone, without putting anyone on the spot.');
        stop(b,-6,.9,1,-Math.PI/2,.02,'Your host','A host who keeps the room laughing and the programme moving.');
        stop(b,0,19,10,0,-.62,'Up among the balloons','From up here you can see the whole party, planned around one person.');
        pin(b,0,FLOOR+11.6,26,'Surprise door',{stop:0});pin(b,0,FLOOR+7,0,'The cake',{stop:1});pin(b,20,FLOOR+5,-2,'Gifts',{stop:2});pin(b,-18,FLOOR+7,0,'Your host',{stop:3});
        b.title='A birthday world';b.occasion='Personal celebration';
        return b;
      },
      /* A clean auditorium: you start in a seat, then stand on the stage */
      corporate:function(){
        var b=subBase('corporate',{fog:0x0c0c0a,density:.012,sky:0x0a0a09,exposure:1}),g=b.g,sz=-16;
        floorOf(g,44,60,0,2,0x171612,.5,.4);
        var wallM=new T.MeshStandardMaterial({color:0x14130f,metalness:.3,roughness:.5});
        [-20,20].forEach(function(xx){for(var z2=-22;z2<30;z2+=4){var w=boxAt(g,.4,16,3.7,xx,FLOOR+8,z2,wallM);var st=new T.Mesh(new T.BoxGeometry(.06,15,.08),new T.MeshBasicMaterial({color:0xfff7e6,toneMapped:false}));st.position.set(xx-(xx>0?.24:-.24),FLOOR+8,z2+1.9);g.add(st)}});
        for(var z3=-20;z3<30;z3+=5){var c=new T.Mesh(new T.BoxGeometry(38,.05,.1),new T.MeshBasicMaterial({color:0xfff7e6,toneMapped:false}));c.position.set(0,FLOOR+15.6,z3);g.add(c)}
        boxAt(g,34,1,11,0,FLOOR+.5,sz,dark);var rm=new T.Mesh(new T.BoxGeometry(34,.08,.08),new T.MeshBasicMaterial({color:0xf4c13d,toneMapped:false}));rm.position.set(0,FLOOR+1.03,sz+5.5);g.add(rm);
        var cv2=document.createElement('canvas');cv2.width=1024;cv2.height=420;var gg=cv2.getContext('2d');gg.fillStyle='#0b0c0a';gg.fillRect(0,0,1024,420);gg.strokeStyle='#f4c13d';gg.lineWidth=6;gg.strokeRect(10,10,1004,400);gg.fillStyle='#fff7e6';gg.textAlign='center';gg.font='600 84px Manrope,Arial,sans-serif';gg.fillText('Your big moment',512,195);gg.fillStyle='#f4c13d';gg.font='italic 52px Fraunces,Georgia,serif';gg.fillText('launches, annual days, award nights',512,285);
        var scr=new T.CanvasTexture(cv2);scr.colorSpace=T.SRGBColorSpace;var screen=new T.Mesh(new T.PlaneGeometry(24,10),new T.MeshBasicMaterial({map:scr,toneMapped:false,fog:false}));screen.position.set(0,FLOOR+7,sz-5);g.add(screen);glowAt(g,0,FLOOR+7,sz-5.8,48,0xffe9b0,.3);
        var pod=new T.Mesh(new T.CylinderGeometry(1,.75,2.8,14),gold);pod.position.set(-12,FLOOR+2.4,sz+1.8);g.add(pod);fig(b,'calm',-12,sz+.6,1.15,0,FLOOR+1);
        for(var bb2=0;bb2<(tiny?2:4);bb2++)addBeam(g,-9+bb2*6,FLOOR+20,sz+1,bb2*1.3);
        var seats=[];for(var row=0;row<(tiny?6:9);row++)for(var x2=-14;x2<=14;x2+=2.5){if(Math.abs(x2)<1.6)continue;seats.push([x2,row*2.9,Math.PI])}chairs(g,seats,white);
        var aud=[];for(var a3=0;a3<(tiny?3:5);a3++){var sx=[-11,-6,6,11,-8.5][a3];fig(b,'sit',sx,2.9*(1+a3%4)+.4,1)}
        [[28,-3],[28,1.5],[28,6]].forEach(function(pl){});
        [[15,-16],[11,-16.5]].forEach(function(pl){var tr=new T.Group();tr.position.set(pl[0],FLOOR+1,pl[1]);g.add(tr);var bs=new T.Mesh(new T.BoxGeometry(1.6,2,1.6),dark);bs.position.y=1;tr.add(bs);var stem=new T.Mesh(new T.CylinderGeometry(.14,.32,1.2,10),gold);stem.position.y=2.6;tr.add(stem);var cup=new T.Mesh(new T.SphereGeometry(.7,16,12,0,TAU,0,Math.PI/2),gold);cup.rotation.x=Math.PI;cup.position.y=3.9;tr.add(cup);var q2=glow(5.5,0xffc14a);q2.position.y=4;tr.add(q2)});
        stop(b,0,-.6,17,0,.12,'From your seat','This is what your guests see. Hosting, presentations and entertainment planned around your company’s tone.');
        stop(b,5,1.4,-10,.45,.04,'Award moments','Moments that make your team feel seen.');
        stop(b,0,1.8,-11,Math.PI,-.02,'On your stage','Stand where your speaker stands, and see every seat planned for your guest count and venue.');
        pin(b,0,FLOOR+13.4,sz-5,'Main stage',{stop:0});pin(b,13,FLOOR+7,-16,'Awards',{stop:1});pin(b,0,FLOOR+5,12,'Stand on stage',{stop:2});
        b.title='A corporate world';b.occasion='Corporate event';
        return b;
      },
      /* Inside the crowd, moving with the beat, then up on the stage looking back */
      stagenight:function(){
        var b=subBase('stagenight',{fog:0x120a03,density:.018,sky:0x090603,exposure:1.2}),g=b.g,sz=-14;
        floorOf(g,70,70,0,6,0x120d05,.8,.3);boxAt(g,34,1.4,10,0,FLOOR+.7,sz,dark);
        var ar=new T.Mesh(new T.TorusGeometry(12,.3,12,tiny?40:80,Math.PI),gold);ar.position.set(0,FLOOR+1.4,sz-5);g.add(ar);
        var gl=glowAt(g,0,FLOOR+8,sz-6,48,0xffb020,.85);b.ticks.push(function(){gl.material.opacity=.55+Math.pow(1-((t*2)%1),3)*.4});
        fig(b,'drums',-8,sz,1.1,0,FLOOR+1.4);fig(b,'vocals',-2.6,sz+.8,1.15,0,FLOOR+1.4);fig(b,'dance',2.6,sz,1.1,0,FLOOR+1.4);fig(b,'dance2',8,sz+.8,1.1,0,FLOOR+1.4);
        var dm=new T.Mesh(new T.CylinderGeometry(.68,.68,1.8,16),gold);dm.position.set(-6.6,FLOOR+3.6,sz+.1);g.add(dm);
        for(var bb2=0;bb2<(tiny?4:8);bb2++)addBeam(g,-14+bb2*4,FLOOR+22,sz+2,bb2*1.1);
        [-1,1].forEach(function(s2){for(var i2=0;i2<(tiny?2:4);i2++){var hh=10+i2*3,m=new T.Mesh(new T.BoxGeometry(3,hh,2.6),towerMat);m.position.set(s2*(21+i2*.5),FLOOR+hh/2,-10+i2*5);g.add(m)}});
        var hc=tiny?60:160,tex=new T.CanvasTexture(handSprites[2]?handSprites[2].c:halo);tex.colorSpace=T.SRGBColorSpace;
        var ch=new T.InstancedMesh(new T.PlaneGeometry(1,.715),new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.3,side:T.DoubleSide,fog:false,toneMapped:false}),hc),ca=new T.InstancedMesh(new T.CylinderGeometry(.13,.17,1.9,6),new T.MeshBasicMaterial({color:0x060402,fog:false}),hc),hd=[];
        ch.frustumCulled=false;ca.frustumCulled=false;g.add(ca);g.add(ch);
        for(var c2=0;c2<hc;c2++){var hx,hz;do{hx=(Math.random()-.5)*40;hz=-6+Math.random()*30}while(Math.abs(hx)<1.8&&Math.abs(hz-16)<3);hd.push({x:hx,z:hz,ph:Math.random()*6,tilt:(Math.random()-.5)*.4,s:.85+Math.random()*.5})}
        var pg=new T.BufferGeometry(),pa=new Float32Array(hc*3);pg.setAttribute('position',new T.BufferAttribute(pa,3));var phones2=new T.Points(pg,new T.PointsMaterial({map:glowTex,size:.8,transparent:true,blending:T.AdditiveBlending,depthWrite:false,color:0xfff2c8,fog:false}));phones2.frustumCulled=false;g.add(phones2);
        b.ticks.push(function(){var bt=Math.pow(1-((t*2)%1),3);hd.forEach(function(d,i3){var yy=FLOOR+2.5+Math.sin(t*3.14+d.ph)*.14+bt*.1;pos.set(d.x,yy,d.z);eul.set(0,0,d.tilt+Math.sin(t*1.6+d.ph)*.07);quat.setFromEuler(eul);scl.set(d.s,d.s,d.s);ch.setMatrixAt(i3,mtx.compose(pos,quat,scl));pos.set(d.x,yy-1.15*d.s,d.z);ca.setMatrixAt(i3,mtx.compose(pos,quat,scl));pa[i3*3]=d.x;pa[i3*3+1]=i3%3===0?yy+.5:-60;pa[i3*3+2]=d.z});ch.instanceMatrix.needsUpdate=true;ca.instanceMatrix.needsUpdate=true;pg.attributes.position.needsUpdate=true});
        b.camFx=function(bt){return bt*.18};
        glowAt(g,0,FLOOR+4,28,70,0xffb020,.42);fallers(b,[0xffc42e,0xfff2dc],110,.12,0,4,40);
        stop(b,0,-.4,16,0,.1,'In the crowd','Energy, warmth and participation. You’re not watching this night, you’re in it.');
        stop(b,0,.1,-1,0,.14,'Front row','Live music, dance and an anchor who keeps the energy high until the last song.');
        stop(b,0,1.8,-11,Math.PI,-.07,'On the stage','This is what your performers see, with every hand in the room up.');
        stop(b,15,9,4,-.75,-.3,'Sound and lighting','Technical needs are agreed well before the day.');
        pin(b,0,FLOOR+15,sz-5,'The stage',{stop:1});pin(b,0,FLOOR+6,6,'Back in the crowd',{stop:0});pin(b,21,FLOOR+15,-6,'Sound and light',{stop:3});pin(b,-8,FLOOR+8,sz,'Stand on stage',{stop:2});
        b.title='A stage night world';b.occasion='Personalised entertainment';
        return b;
      },
      /* Open air by the sea on our coast */
      community:function(){
        var b=subBase('community',{fog:0x0d0a07,density:.009,sky:0x0a0806,exposure:1.05}),g=b.g,fl=[],sz=-8;
        floorOf(g,200,70,0,20,0x2b1f10,.1,.9);
        var sea=new T.Mesh(new T.PlaneGeometry(320,150),new T.MeshStandardMaterial({color:0x14100a,metalness:.95,roughness:.22,envMapIntensity:1.4}));sea.rotation.x=-Math.PI/2;sea.position.set(0,FLOOR,-90);g.add(sea);
        var mo=new T.Mesh(new T.CircleGeometry(8,tiny?28:48),new T.MeshBasicMaterial({color:0xfff3cf,fog:false,toneMapped:false}));mo.position.set(-24,26,-120);g.add(mo);glowAt(g,-24,26,-121,60,0xffe2a0,.6);
        var path=new T.Mesh(new T.PlaneGeometry(320,5),new T.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:.14,fog:false}));path.rotation.x=-Math.PI/2;path.rotation.z=Math.PI/2.15;path.position.set(-14,FLOOR+.03,-90);g.add(path);
        [[-26,-2,1.2],[-34,8,1],[-20,14,.9],[27,0,1.25],[36,10,1],[22,18,.85],[-44,-8,1.1],[46,-6,1.1]].forEach(function(p2){palm(g,p2[0],p2[1],p2[2])});
        [11,9,7].forEach(function(rr,idx){gate(g,0,sz-idx*2.6,rr,0,true)});glowAt(g,0,FLOOR+7,sz-9,38,0xffb020,.7);
        var ya=fig(b,'yaksha',0,sz-1.5,1.15);crownFor(b,ya);fig(b,'drums',-5.4,sz-1,1.05);fig(b,'vocals',5.4,sz-1,1.05);var dm=new T.Mesh(new T.CylinderGeometry(.68,.68,1.8,16),gold);dm.position.set(-4.2,FLOOR+1.5,sz-.9);g.add(dm);
        var seats=[];for(var row=0;row<(tiny?2:4);row++)for(var x2=-11;x2<=11;x2+=2.4){if(Math.abs(x2)<1.6)continue;seats.push([x2,row*2.7+4,Math.PI])}chairs(g,seats,cream);
        var lanE=[];for(var l2=0;l2<(tiny?16:36);l2++){var sp=new T.Sprite(new T.SpriteMaterial({map:lanTex,transparent:true,depthWrite:false,fog:false}));var z4=.9+Math.random();sp.scale.set(z4,z4,1);sp.position.set(-30+Math.random()*60,6+Math.random()*12,-14+Math.random()*44);var gg2=glow(3.6,0xffb020,.6);sp.add(gg2);g.add(sp);lanE.push({s:sp,y:sp.position.y,ph:Math.random()*6})}
        b.ticks.push(function(){lanE.forEach(function(l){l.s.position.y=l.y+Math.sin(t*.6+l.ph)*.5})});
        var cl=[];for(var a3=0;a3<10;a3++){var q3=a3/10*TAU;cl.push([-22+Math.cos(q3)*5,16+Math.sin(q3)*5,-q3+Math.PI/2])}chairs(g,cl,gold);glowAt(g,-22,FLOOR+1.5,16,14,0xffb020,.6);
        fig(b,'calm',22,14,1,-.6);fig(b,'vocals',19,17,1,-.6);fig(b,'calm',25,18,1,-.6);glowAt(g,22,FLOOR+2,15,14,0xffb020,.5);
        stop(b,0,1.2,30,0,.03,'Under the open sky','College programmes, reunions, association gatherings and cultural celebrations, here on our coast.');
        stop(b,0,.8,9,0,.08,'Cultural programme','Yakshagana and Chande from coastal Karnataka, discussed with suitable artists. This figure is an illustration, not a full traditional costume.');
        stop(b,-14,.8,22,-.9,-.04,'Reunions','Old friends, one circle and a programme that flows.');
        stop(b,14,.8,22,.8,.0,'Association meet','Space for everyone to take part.');
        pin(b,0,FLOOR+13,sz,'Cultural programme',{stop:1});pin(b,-22,FLOOR+5,16,'Reunions',{stop:2});pin(b,22,FLOOR+7,15,'Association meet',{stop:3});
        b.title='A community world';b.occasion='Community or cultural event';
        return b;
      },
      /* Backstage: the camera slides sideways past the people at work */
      people:function(){
        var b=subBase('people',{fog:0x0b0804,density:.014,sky:0x080603,exposure:1.1}),g=b.g,D=[['dance',-30],['vocals',-22],['drums',-10],['anchor',-2],['decor',10],['photo',18],['tech',30],['coord',38]];
        floorOf(g,110,24,4,-2,0x1b1408,.8,.3);
        var wall=new T.Mesh(new T.PlaneGeometry(110,24),new T.MeshStandardMaterial({color:0x100b05,roughness:.6}));wall.position.set(4,FLOOR+12,-10);g.add(wall);
        var rl=[];string(rl,[-50,FLOOR+15,-8],[58,FLOOR+15,-8],0,tiny?40:90,[0xfff0c0,0xffc63f]);balls(g,rl,.12,new T.MeshBasicMaterial({toneMapped:false,fog:false}));
        D.forEach(function(d){fig(b,d[0],d[1],-3,1.4);var pl=new T.Mesh(new T.CylinderGeometry(2.6,2.9,.25,tiny?18:30),dark);pl.position.set(d[1],FLOOR+.12,-3);g.add(pl);glowAt(g,d[1],FLOOR+5,-8,15,0xffb020,.8);var ln=new T.Mesh(beamGeo,beamMat);ln.position.set(d[1],FLOOR+18,-3);ln.scale.set(.55,.75,.55);g.add(ln);
          var hh=10+Math.abs(d[1])%7,tw=new T.Mesh(new T.BoxGeometry(3,hh,1.4),towerMat);tw.position.set(d[1]+4,FLOOR+hh/2,-9);g.add(tw)});
        stop(b,-26,.8,12,0,.04,'On stage','Dance and vocals: movement, songs and dedications shaped around your occasion.');
        stop(b,-6,.8,12,0,.04,'Music and hosting','Chande, Chenda and live music, with a warm welcome and a programme that flows.');
        stop(b,14,.8,12,0,.04,'The makers','Themes, florals and stage planning, and moments kept for the people in them.');
        stop(b,34,.8,12,0,.04,'Behind the scenes','Sound and lighting planned before the day, and a clear rhythm on it.');
        b.note='Today you work directly with the founder. Illustrations, not AILU team members.';
        return b;
      },
      /* A road from the coast through India's traditions */
      culture:function(){
        var b=subBase('culture',{fog:0x0e0904,density:.013,sky:0x0a0603,exposure:1.1}),g=b.g;
        floorOf(g,120,190,0,-70,0x170f05,.5,.6);
        var S=[[0,-16],[14,-46],[-12,-78],[12,-110],[0,-142]],road=[];for(var i2=0;i2<S.length;i2++){var a=i2?S[i2-1]:[0,22],c=S[i2];for(var u=0;u<14;u++){var u2=u/14;road.push([a[0]+(c[0]-a[0])*u2,FLOOR+.15,a[1]+(c[1]-a[1])*u2,0xffc63f,.7])}}balls(g,road,.18,new T.MeshBasicMaterial({toneMapped:false}));
        var sea=new T.Mesh(new T.PlaneGeometry(44,44),new T.MeshStandardMaterial({color:0x1a140b,metalness:.95,roughness:.2}));sea.rotation.x=-Math.PI/2;sea.position.set(-28,FLOOR+.03,-16);g.add(sea);palm(g,-14,-22,1.1);palm(g,16,-24,1);palm(g,22,-52,1.1);palm(g,6,-54,.9);
        gate(g,0,S[0][1],9.5,0,true);glowAt(g,0,FLOOR+6,S[0][1]-5,30,0xffb020,.75);var ya=fig(b,'yaksha',-1,S[0][1]+1,1.2);crownFor(b,ya);fig(b,'drums',4.4,S[0][1]+1,1.05);
        gate(g,S[1][0],S[1][1],7.5,0,true);glowAt(g,S[1][0],FLOOR+5,S[1][1]-5,24,0xffb020,.7);fig(b,'drums',S[1][0],S[1][1]+1,1.1);
        for(var s2=0;s2<6;s2++){var w=13-s2*2,hh=2,sb=new T.Mesh(new T.BoxGeometry(w,hh,6),new T.MeshStandardMaterial({color:0x4a3208,metalness:.6,roughness:.4}));sb.position.set(S[2][0],FLOOR+1+s2*hh,S[2][1]-7);g.add(sb)}glowAt(g,S[2][0],FLOOR+6,S[2][1]-10,26,0xffb020,.7);fig(b,'dance',S[2][0],S[2][1]+1,1.1);
        var sticks=[];for(var r3=0;r3<14;r3++){var an=r3/14*TAU;sticks.push([S[3][0]+Math.cos(an)*6,FLOOR+.3,S[3][1]+Math.sin(an)*6,MARI[r3%5],1.4])}balls(g,sticks,.3);fig(b,'dance',S[3][0]-2.6,S[3][1],1.05);fig(b,'dance2',S[3][0]+2.6,S[3][1],1.05);glowAt(g,S[3][0],FLOOR+6,S[3][1]-5,26,0xffb020,.7);
        boxAt(g,16,1,8,S[4][0],FLOOR+.5,S[4][1],dark);fig(b,'vocals',S[4][0]-2.5,S[4][1],1.1,0,FLOOR+1);fig(b,'dance2',S[4][0]+3,S[4][1],1.1,0,FLOOR+1);for(var b3=0;b3<(tiny?3:5);b3++)addBeam(g,S[4][0]-8+b3*4,FLOOR+20,S[4][1],b3*1.3);glowAt(g,S[4][0],FLOOR+7,S[4][1]-6,32,0xffb020,.7);
        var T1=[['Coastal Karnataka','Yakshagana, Pili Vesha and Chande, from the home of AILU.'],['Kerala','Kathakali, Chenda and cultural programmes.'],['South Indian classical','Bharatanatyam, Kuchipudi and Mohiniyattam.'],['North and West India','Bhangra, Garba, Dandiya and Kathak.'],['Contemporary and fusion','Western dance, hip-hop, DJ and live music.']];
        S.forEach(function(s3,i3){stop(b,s3[0]*.7,.7,s3[1]+15,0,.05,T1[i3][0],T1[i3][1]);pin(b,s3[0],FLOOR+(i3===0?11.5:9.8),s3[1],T1[i3][0],{stop:i3})});
        fallers(b,[0xffb300,0xff9d0a],90,.13,0,-20,40);
        b.note='Illustrations, not full traditional costumes. Regional forms keep their own identities.';
        return b;
      },
      /* Flying through a tunnel of golden tiles, with the logo at the far end */
      about:function(){
        var b=subBase('about',{fog:0x070503,density:.012,sky:0x050403,exposure:1.15}),g=b.g,L=96,tn=tiny?700:2200,rm=new T.InstancedMesh(roundBox(1,1,.22,.14),new T.MeshStandardMaterial({metalness:.55,roughness:.28,envMapIntensity:2.2}),tn);
        for(var i2=0;i2<tn;i2++){var a=Math.random()*TAU,cl=Math.sin(a*5+Math.floor(i2/50))*.5+.5,R=8.5+Math.random()*3.4*(.4+cl),s0=(.2+Math.random()*Math.random()*1.1)*(.5+cl*.7);pos.set(Math.cos(a)*R,.8+Math.sin(a)*R,10-Math.random()*L);eul.set((Math.random()-.5)*.7,(Math.random()-.5)*.7,a);quat.setFromEuler(eul);scl.set(s0,s0,s0);rm.setMatrixAt(i2,mtx.compose(pos,quat,scl));var tone=Math.random();rm.setColorAt(i2,colr.set(tone<.12?0xfff6dc:tone<.62?0xf4b81f:tone<.9?0xffd14a:0xb9730a))}
        rm.frustumCulled=false;g.add(rm);b.ticks.push(function(){rm.rotation.z=t*.05});
        var lg=new T.Mesh(new T.PlaneGeometry(13,13/3),new T.MeshBasicMaterial({map:logoTex,transparent:true,toneMapped:false,fog:false,depthWrite:false}));lg.position.set(0,.8,-86);g.add(lg);glowAt(g,0,.8,-88,34,0xffb020,.8);
        stop(b,0,.8,4,0,.0,'Starting small. Caring deeply.','AILU is a new, founder-led event planning and hosting business based in Udupi. A meaningful celebration starts with listening.');
        stop(b,0,.8,-14,0,.0,'Why AILU','Event companies set the stage and leave. Performers perform and go. AILU connects them.');
        stop(b,0,.8,-30,0,.0,'How it works','Tell us your idea. We shape the plan and prepare a tailored quotation. Once scope, terms and booking payment are agreed, the planning begins.');
        stop(b,0,.8,-46,0,.0,'What does it cost?','Every quotation depends on the occasion, guest count, location, duration and services required.');
        stop(b,0,.8,-60,0,.0,'Outside Udupi?','Yes, we consider selected bookings across South India. An enquiry is not a confirmed booking.');
        stop(b,0,.8,-74,0,.0,'Creating Moments. Delivering Smiles.','Personal attention. Clear plans. Room to grow.');
        pin(b,0,-3.4,-76,'Privacy and terms',{go:'policies',range:18});
        b.note='Based in Udupi. Selected bookings across South India.';
        return b;
      },
      /* A tall wall of golden hands you rise up */
      rewards:function(){
        var b=subBase('rewards',{fog:0x120b03,density:.01,sky:0x0c0703,exposure:1.2}),g=b.g;
        var wall=new T.Mesh(new T.PlaneGeometry(46,80),new T.MeshStandardMaterial({color:0x2a1c08,metalness:.5,roughness:.45,emissive:0x2a1a05}));wall.position.set(0,FLOOR+40,-14);g.add(wall);glowAt(g,0,FLOOR+10,-13.8,46,0xffb020,.35);glowAt(g,0,FLOOR+26,-13.8,46,0xffb020,.3);floorOf(g,60,44,0,6,0x241808,.8,.25);
        var darkMat=new T.MeshBasicMaterial({color:0x5a3f10,map:handTex,transparent:true,side:T.DoubleSide,fog:false,depthWrite:false});
        var P2=[[-9,3],[8,8],[-7,14],[9,19],[-3,25]];b.hands=[];
        P2.forEach(function(p2,n){var nic=new T.Mesh(new T.CylinderGeometry(3.3,3.3,.5,tiny?20:36),dark);nic.rotation.x=Math.PI/2;nic.position.set(p2[0],FLOOR+p2[1]+1.4,-13.6);g.add(nic);var ring3=new T.Mesh(new T.TorusGeometry(3.3,.12,8,tiny?28:48),gold);ring3.position.copy(nic.position);ring3.position.z+=.3;g.add(ring3);var m=new T.Mesh(new T.PlaneGeometry(4.6,3.29),darkMat);m.position.set(p2[0],FLOOR+p2[1]+1.4,-13);g.add(m);var gl=glowAt(g,p2[0],FLOOR+p2[1]+1.4,-13.2,11,0xffb020,.2);b.hands.push({m:m,gl:gl,done:false,pop:0});hitXYZ(b,p2[0],FLOOR+p2[1]+1.4,-13,3.4,{hand:n});pin(b,p2[0],FLOOR+p2[1]+5.6,-12.6,'Collect',{hand:n})});
        var big=new T.Mesh(new T.PlaneGeometry(13,9.3),handMat);big.position.set(0,FLOOR+36,-12.8);g.add(big);glowAt(g,0,FLOOR+36,-13.4,34,0xffb020,.8);
        b.ticks.push(function(){big.scale.setScalar(1+Math.pow(1-((t*2)%1),3)*.03);b.hands.forEach(function(st){st.pop*=.92;st.m.scale.setScalar(1+st.pop*.45)})});
        b.collect=function(n){var st=b.hands[n];if(st.done)return;st.done=true;st.pop=1;st.m.material=handMat;st.gl.material.opacity=.9;var c=b.hands.filter(function(x){return x.done}).length;titleEl.textContent=c<5?c+' of 5 hands collected':'All 5 collected';lineEl.textContent=c<5?'Keep climbing and find the next golden hand.':'That’s the AILU way of saying thank you.';hitPulse=.7;pinEls.forEach(function(el2){if(el2.__p.hand===n)el2.__gone=true});if(c<5&&n<4)setTimeout(function(){if(cur===b)goStop(Math.min(b.stops.length-1,Math.ceil((n+1)/2)))},350)};
        stop(b,0,3,12,0,.05,'Good moments. Golden hands.','Our signature hand is the face of AILU points. Tap the dark hands to collect them as you climb.');
        stop(b,0,12,12,0,.05,'A hand for every little joy.','A collection built through eligible bookings when the programme opens.');
        stop(b,0,22,12,0,.05,'Keep climbing','What your hands can be used for will be shared before the programme opens.');
        stop(b,0,32,14,0,.08,'The golden hand','Earning and redemption are not active yet.');
        b.note='A playful preview. It does not earn, spend or change real points.';
        return b;
      },
      /* Rising above the coast at night, among the lanterns */
      dreams:function(){
        var b=subBase('dreams',{fog:0x060604,density:.006,sky:0x050504,exposure:1.05}),g=b.g;
        var ms=new T.Mesh(new T.CircleGeometry(7,tiny?28:48),new T.MeshBasicMaterial({color:0xfff3cf,fog:false,toneMapped:false}));ms.position.set(-10,70,-110);g.add(ms);glowAt(g,-10,70,-111,60,0xffe2a0,.55);
        var sea=new T.Mesh(new T.CircleGeometry(170,48),new T.MeshStandardMaterial({color:0x17100a,metalness:.95,roughness:.2,envMapIntensity:1.5}));sea.rotation.x=-Math.PI/2;sea.position.y=FLOOR+.01;g.add(sea);
        var sCount=tiny?120:320,sg2=new T.BufferGeometry(),sa=new Float32Array(sCount*3);for(var s2=0;s2<sCount;s2++){var a2=Math.random()*TAU,el2=.15+Math.random()*1.3,rr=140;sa[s2*3]=Math.sin(a2)*Math.cos(el2)*rr;sa[s2*3+1]=Math.sin(el2)*rr;sa[s2*3+2]=-Math.cos(a2)*Math.cos(el2)*rr}sg2.setAttribute('position',new T.BufferAttribute(sa,3));var st2=new T.Points(sg2,new T.PointsMaterial({color:0xfff7e6,size:.7,fog:false,transparent:true,opacity:.8}));st2.frustumCulled=false;g.add(st2);
        var list=[];for(var j2=0;j2<(tiny?36:90);j2++){var sp=new T.Sprite(new T.SpriteMaterial({map:lanTex,transparent:true,depthWrite:false,fog:false})),a3=Math.random()*TAU,r2=6+Math.random()*34,z2=.9+Math.random()*1.7;sp.scale.set(z2,z2,1);sp.add(glow(3.8,0xffb020,.6));g.add(sp);list.push({s:sp,x:Math.sin(a3)*r2,z:-Math.cos(a3)*r2,u:Math.random(),v:.012+Math.random()*.018})}
        b.ticks.push(function(){list.forEach(function(l){l.u=(l.u+(reduce?0:l.v)*.016)%1;l.s.position.set(l.x+Math.sin(t*.4+l.u*9)*.8,FLOOR+1+l.u*68,l.z);l.s.material.opacity=clamp(l.u*6)*clamp((1-l.u)*5)})});
        var own=[];b.release=function(){var sp=new T.Sprite(new T.SpriteMaterial({map:lanTex,transparent:true,depthWrite:false,fog:false}));sp.scale.set(2.6,2.6,1);sp.add(glow(4.2,0xffc14a,.9));g.add(sp);own.push({s:sp,y:camP.y-1.5,a:yaw});hitPulse=.6};
        b.ticks.push(function(){own.forEach(function(l){l.y+=.02;l.s.position.set(camP.x+Math.sin(l.a)*8,l.y,camP.z-Math.cos(l.a)*8)})});
        [[0,-9,1.15],[-3.6,-10,1],[3.6,-10,1.02]].forEach(function(d){fig(b,'dream3',d[0],d[1],d[2])});
        stop(b,0,.8,2,0,.22,'A dream starts small.','A stage you want to stand on. A skill you hope to learn. A moment for someone you love.');
        stop(b,0,14,6,0,.14,'Share it privately','Describe your dream and why it matters.');
        stop(b,0,28,6,0,.08,'We listen with care','We review the idea, practical needs and available support. Not every dream can be selected.');
        stop(b,0,42,6,0,.06,'Build a possibility','If selected, we discuss a realistic plan and consent before anything is arranged or shared.');
        stop(b,0,56,6,0,-.25,'The Donation Box','Opening soon. A way to help other people’s dreams along. No payment is taken on this website.');
        b.note='Private submissions for adults. Fulfilment is not guaranteed.';
        b.primary=['Share my dream',function(){goTo('share')}];b.secondary=['Release a lantern',function(){b.release()}];
        return b;
      },
      /* One small, quiet room and a single light */
      enquire:function(){
        var b=subBase('enquire',{fog:0x060503,density:.03,sky:0x040302,exposure:1.1}),g=b.g,o=new T.Group();o.position.set(tiny?0:-4,1,-9);g.add(o);
        floorOf(g,50,50,0,-8,0x120c05,.85,.2);
        var ln=new T.Mesh(beamGeo,beamMat);ln.position.set(o.position.x,16,-9);ln.scale.set(.9,.75,.9);g.add(ln);
        var mh2=new T.Mesh(new T.SphereGeometry(1.5,24,18),cream);mh2.position.y=2.6;var m3=new T.Group();m3.add(mh2);m3.add(new T.Mesh(new T.CylinderGeometry(.8,.45,5,24),gold));var mb2=new T.Mesh(new T.TorusGeometry(1.15,.14,10,32),gold);mb2.rotation.x=Math.PI/2;mb2.position.y=1.7;m3.add(mb2);m3.rotation.z=-.34;o.add(m3);
        var gl=glow(18,0xffb933,.75);gl.position.z=-2;o.add(gl);
        var stand=new T.Mesh(new T.CylinderGeometry(.09,.12,5,10),dark);stand.position.set(o.position.x+.6,FLOOR+2.5,-9);g.add(stand);
        var r5=new T.Mesh(new T.TorusGeometry(6,.05,8,tiny?48:96),gold);o.add(r5);
        b.ticks.push(function(){var bt=Math.pow(1-((t*.5)%1),3);r5.scale.setScalar(1+bt*.08);r5.rotation.y=Math.sin(t*.3)*.5;m3.rotation.y=Math.sin(t*.4)*.3});
        stop(b,0,1,4,0,.03,'Something good starts with hello.','WhatsApp or call +91 82967 93486, or email worldofailu24@gmail.com.');
        b.note='No payment is needed to enquire. An enquiry is not a confirmed booking.';
        return b;
      },
      /* Tiers of empty seats rising in front of you */
      seats:function(){
        var b=subBase('seats',{fog:0x0a0703,density:.012,sky:0x070503,exposure:1.1}),g=b.g;
        floorOf(g,60,44,0,-2,0x1b1408,.8,.25);
        var seatG=roundBox(2.6,.34,2.4,.14),backG=roundBox(2.6,3,.34,.14),seatMat=new T.MeshStandardMaterial({color:0xffc42e,metalness:.7,roughness:.26,envMapIntensity:2});
        var P3=[[-10,-6,0],[0,-5,0],[10,-6,0],[-14,-13,4],[-5,-12,4],[5,-12,4],[14,-13,4],[0,-18,8]];
        [[0,-9,28,0,5],[4,-16,36,4,5],[8,-22,18,8,4]].forEach(function(st){if(st[3]===0)return;var m=new T.Mesh(new T.BoxGeometry(st[2],st[3],st[4]+6),dark);m.position.set(0,FLOOR+st[3]/2,st[1]);g.add(m)});
        b.seats=P3.map(function(p3,i2){
          var o=new T.Group();o.position.set(p3[0],FLOOR+p3[2],p3[1]);o.rotation.y=-p3[0]*.02;g.add(o);
          var pl=new T.Mesh(new T.CylinderGeometry(2.3,2.6,.3,tiny?18:28),dark);pl.position.y=.15;o.add(pl);
          var se=new T.Mesh(seatG,seatMat);se.position.y=1.6;o.add(se);var ba=new T.Mesh(backG,seatMat);ba.position.set(0,3.1,-1.1);o.add(ba);var leg=new T.Mesh(new T.CylinderGeometry(.22,.3,1.3,10),gold);leg.position.y=.8;o.add(leg);
          var spot=new T.Mesh(beamGeo,beamMat);spot.position.set(0,18,0);spot.scale.set(.5,.8,.5);o.add(spot);var gl=glow(10,0xffb020,.55);gl.position.set(0,3,-2);o.add(gl);
          hitXYZ(b,p3[0],FLOOR+p3[2]+3,p3[1],3.2,{seat:i2});pin(b,p3[0],FLOOR+p3[2]+6.6,p3[1],'Take this seat',{seat:i2});
          var sitter=fig(b,'sit',p3[0],p3[1]+.2,1.05,0,FLOOR+p3[2]+.1);sitter.hidden=true;
          return{o:o,gl:gl,sitter:sitter,yaw:Math.atan2(p3[0],-(p3[1]-12))};
        });
        b.ticks.push(function(){b.seats.forEach(function(s3,i3){s3.gl.material.opacity=.3+Math.pow(1-(((t*.5)+i3*.125)%1),4)*.65})});
        stop(b,0,1.2,12,0,.12,'There’s a seat for you.','Take any empty seat, then tell us what you’d love to do.');
        b.note='For adults. Opportunities depend on projects and suitability; this is not a job offer.';
        return b;
      }
    };
    var stopNav=document.getElementById('stopNav'),stopPrev=document.getElementById('stopPrev'),stopNext=document.getElementById('stopNext'),stopCount=document.getElementById('stopCount'),stopT=0,pitchGoal=null,lastWheel=0;
    stopPrev.addEventListener('click',function(){goStop(cur.si-1)});stopNext.addEventListener('click',function(){goStop(cur.si+1)});
    var titleEl=document.getElementById('subTitle'),lineEl=document.getElementById('subLine'),noteEl=document.getElementById('subNote'),planEl=document.getElementById('subPlan'),twoEl=document.getElementById('subTwo'),backEl=document.getElementById('subBack'),cur=null,swapT=0,swapT2=0,travelling=false,rush=0,rushGoal=0,lastAngle=0,formCard=document.getElementById('formCard'),openForm=null,root=ROOT,rootKeep=null;
    function applyInside(name){
      var from=inside;
      inside=name;mainG.visible=!name;Object.keys(subs).forEach(function(k){subs[k].g.visible=k===name});
      pinEls.forEach(function(p2){p2.remove()});pinEls=[];
      yawV=0;pitchV=0;yawGoal=null;yawS=0;hitPulse=.6;rush=1;rushGoal=0;camV.set(0,0,0);
      if(!name){
        cur=null;scene.fog.color.set(0x070603);scene.fog.density=.011;r.setClearColor(0x070603,1);yaw=lastAngle;pitch=.05;camP.set(Math.sin(yaw)*24,.9,-Math.cos(yaw)*24);camGoal.set(0,.8,0);camV.set(-Math.sin(yaw)*14,0,Math.cos(yaw)*14);return
      }
      if(!subs[name]){subs[name]=BUILD[name]();subs[name].g.visible=true}
      cur=subs[name];
      scene.fog.color.set(cur.fog);scene.fog.density=cur.density;r.setClearColor(cur.sky,1);
      var s0=cur.stops[0];yaw=s0.yaw;pitch=s0.pitch;cur.si=0;
      camP.set(s0.p[0]-Math.sin(yaw)*16,s0.p[1]+1,s0.p[2]+Math.cos(yaw)*16);camGoal.set(s0.p[0],s0.p[1],s0.p[2]);
      camV.set(Math.sin(yaw)*22,-1.4,-Math.cos(yaw)*22);noteEl.textContent=cur.note||'Illustrated ideas, not a real AILU event.';showStop(0);
      var prim=cur.primary||(cur.occasion?['Plan this celebration',function(){var f=document.getElementById('fType');if(f)f.value=cur.occasion;goTo('enquire')}]:name==='enquire'?['Write to us',function(){showForm('enqForm')}]:null);
      planEl.hidden=!prim;if(prim){planEl.firstChild.textContent=prim[0]+' ';planEl.__fn=prim[1]}
      twoEl.hidden=!cur.secondary;if(cur.secondary){twoEl.textContent=cur.secondary[0];twoEl.__fn=cur.secondary[1]}
      backEl.lastChild.textContent=(cur.occasion?'All events':'Back to the world');
      cur.pins.forEach(function(pp){
        var b2=document.createElement('button');b2.type='button';b2.className='hot';var d=document.createElement('i');b2.appendChild(d);b2.appendChild(document.createTextNode(pp.label));
        b2.addEventListener('click',function(){
          if(pp.go){goTo(pp.go);return}
          if(pp.hand!=null){cur.collect(pp.hand);return}
          if(pp.seat!=null){chooseSeat(pp.seat);return}
          if(pp.stop!=null)goStop(pp.stop);
        });
        document.getElementById('hots').appendChild(b2);b2.__p=pp;pinEls.push(b2);
      });
    }
    function showStop(i2){
      var st=cur.stops[i2];cur.si=i2;titleEl.textContent=st.title;lineEl.textContent=st.text;
      var many=cur.stops.length>1;stopNav.hidden=!many;
      stopCount.textContent=(i2+1)+' of '+cur.stops.length;stopPrev.disabled=i2===0;stopNext.disabled=i2===cur.stops.length-1;
    }
    function goStop(i2){
      if(!cur||i2<0||i2>=cur.stops.length||travelling)return;
      var st=cur.stops[i2];showStop(i2);camGoal.set(st.p[0],st.p[1],st.p[2]);yawGoal=shortest(yaw,st.yaw);pitchGoal=st.pitch;hitPulse=Math.max(hitPulse,.5);
      clearTimeout(stopT);stopT=setTimeout(function(){yawGoal=null;pitchGoal=null},1300);
    }
    function chooseSeat(i2){
      if(cur&&cur.seats)cur.seats.forEach(function(s3,n){s3.sitter.hidden=n!==i2});
      yawGoal=shortest(yaw,cur.seats[i2].yaw);hitPulse=.6;
      setTimeout(function(){yawGoal=null;goTo('apply')},reduce?0:600);
    }
    function showForm(id){
      if(openForm&&openForm.id===id){root.classList.add('form-open');return}
      hideForm();
      var f=id&&document.getElementById(id);if(!f)return;
      formCard.querySelector('#formSlot').appendChild(f);openForm=f;root.classList.add('form-open');
      formCard.querySelector('#formHead').textContent=id==='jobForm'?'Tell us about you':id==='dreamForm'?'Share your dream':'Tell us about your occasion';
    }
    function hideForm(){if(openForm){document.getElementById('formStore').appendChild(openForm);openForm=null}root.classList.remove('form-open')}
    document.getElementById('formClose').addEventListener('click',function(){hideForm();if(inside==='seats')history.replaceState?null:null});
    function setInside(name,formId){
      name=name||null;
      if(name===inside&&!travelling){if(formId)showForm(formId);else hideForm();return}
      clearTimeout(swapT);clearTimeout(swapT2);hideForm();
      var go=function(){applyInside(name);root.classList.toggle('is-inside',!!name);if(formId)setTimeout(function(){showForm(formId)},reduce?0:650)};
      if(reduce){go();return}
      if(name&&!subs[name]){var cb2=BUILD[name]();cb2.g.visible=false;subs[name]=cb2}
      travelling=true;root.classList.add('travelling');
      var wait=0;
      if(!inside&&name){
        var st=stations[name]||stations[(BUILD[name]&&name!=='seats'&&!stations[name])?'events':'jobs'];if(name==='seats')st=stations.jobs;
        lastAngle=st.angle;yawGoal=shortest(yaw,st.angle);pitchGoal=.04;camGoal.set(Math.sin(st.angle)*(RADIUS-4),.9,-Math.cos(st.angle)*(RADIUS-4));rushGoal=1;wait=760;
      }else if(inside&&name){
        camGoal.set(camP.x+Math.sin(yaw)*18,camP.y,camP.z-Math.cos(yaw)*18);rushGoal=1;wait=480;
      }
      swapT=setTimeout(function(){
        fadeEl.classList.add('on');
        swapT2=setTimeout(function(){go();fadeEl.classList.remove('on');pitchGoal=null;travelling=false;setTimeout(function(){root.classList.remove('travelling')},reduce?0:650)},230);
      },wait);
    }
    planEl.addEventListener('click',function(){if(planEl.__fn)planEl.__fn()});
    twoEl.addEventListener('click',function(){if(twoEl.__fn)twoEl.__fn()});
    backEl.addEventListener('click',function(){goTo(cur&&cur.occasion?'events':'world')});

    /* Forms become short steps so nothing needs scrolling */
    [].forEach.call(document.querySelectorAll('.waForm'),function(f){
      var labels=[].slice.call(f.querySelectorAll(':scope > label')),tail=f.querySelector(':scope > div.wide');
      if(!labels.length||!tail)return;
      f.classList.add('stepped');
      var pages=[],curPage=[];labels.forEach(function(l){var long=l.querySelector('textarea');if(long&&curPage.length){pages.push(curPage);curPage=[]}curPage.push(l);if(curPage.length===2||long){pages.push(curPage);curPage=[]}});if(curPage.length)pages.push(curPage);
      var i3=0,nav=document.createElement('div');nav.className='stepnav wide';var prog=document.createElement('span');prog.className='small';var pv=document.createElement('button');pv.type='button';pv.className='btn line';pv.textContent='Back';var nx=document.createElement('button');nx.type='button';nx.className='btn';nx.textContent='Next';nav.appendChild(prog);nav.appendChild(pv);nav.appendChild(nx);f.insertBefore(nav,tail);
      function show(){labels.forEach(function(l){l.hidden=pages[i3].indexOf(l)<0});var last=i3===pages.length-1;tail.hidden=!last;nx.hidden=last;pv.hidden=!i3;prog.textContent='Step '+(i3+1)+' of '+pages.length}
      nx.addEventListener('click',function(){var bad=pages[i3].some(function(l){var c=l.querySelector('[data-req]');return c&&!c.value.trim()});if(bad){prog.textContent='Please fill this in first';return}i3++;show()});
      pv.addEventListener('click',function(){i3--;show()});show();
    });

        /* Dust in the air */
    var dg3=new T.BufferGeometry(),da=new Float32Array((tiny?400:1100)*3);
    for(var di=0;di<da.length;di+=3){var ra=6+Math.random()*50,ta=Math.random()*6.3;da[di]=Math.sin(ta)*ra;da[di+1]=FLOOR+Math.random()*22;da[di+2]=Math.cos(ta)*ra}
    dg3.setAttribute('position',new T.BufferAttribute(da,3));
    var dust3=new T.Points(dg3,new T.PointsMaterial({map:glowTex,size:.22,color:0xffd27a,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));dust3.frustumCulled=false;scene.add(dust3);

    /* Labels that sit on each place, and the row of places at the bottom */
    var hots=document.getElementById('hots'),dockEl=document.getElementById('dock');
    PLACES.forEach(function(pl){
      var st=stations[pl[0]],b=document.createElement('button');b.type='button';b.className='hot';
      var d=document.createElement('i');b.appendChild(d);b.appendChild(document.createTextNode(st.label));b.addEventListener('click',function(){openPlace(st.name)});hots.appendChild(b);st.hot=b;
      var c=document.createElement('button');c.type='button';c.textContent=st.label;c.addEventListener('click',function(){openPlace(st.name)});dockEl.appendChild(c);st.dockBtn=c;
    });

    /* Looking around */
    var yaw=0,pitch=.02,yawV=0,pitchV=0,focus=null,hitPulse=0,sheetS=0,yawGoal=null;
    var camP=new T.Vector3(0,.8,0),camGoal=new T.Vector3(0,.8,0),camV=new T.Vector3(),yawS=0,rollS=0,look=new T.Vector3();
    var drag=null,ray=new T.Raycaster(),ndc=new T.Vector2(),lowDone=false,gyroBase=null,gyroYaw=null;
    function moved(){ROOT.classList.add('moved')}
    function pick(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,cam);var o=ray.intersectObjects(inside?(cur?cur.hit:[]):hit,false);return o.length?o[0].object.userData:null}
    el.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,tm:performance.now(),far:false};try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('grabbing')});
    el.addEventListener('pointermove',function(e){
      if(!drag){if(e.pointerType==='mouse'&&!focus){var over=pick(e.clientX,e.clientY);el.classList.toggle('over',!!over)}return}
      var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>9){drag.far=true;moved();if(focus)goWorld()}
      if(drag.far&&!focus){var sp2=(tiny?.0062:.0034);yaw-=dx*sp2;pitch=Math.max(-.75,Math.min(.6,pitch+dy*sp2*.7));yawV=-dx*sp2*60;pitchV=dy*sp2*40}
    });
    function endDrag(e){
      el.classList.remove('grabbing');if(!drag)return;
      if(!drag.far&&performance.now()-drag.tm<500){if(openForm)hideForm();else if(focus)goWorld();else{var got=pick(e.clientX,e.clientY);if(got&&got.seat!=null)chooseSeat(got.seat);else if(got&&got.go)goTo(got.go);else if(got&&got.hand!=null)cur.collect(got.hand);else if(got&&got.st)openPlace(got.st.name)}}
      drag=null;
    }
    el.addEventListener('pointerup',endDrag);el.addEventListener('pointercancel',function(){drag=null;el.classList.remove('grabbing')});
    el.addEventListener('wheel',function(e){if(focus)return;e.preventDefault();moved();if(inside&&cur&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){var now=performance.now();if(now-lastWheel>750&&Math.abs(e.deltaY)>6){lastWheel=now;goStop(cur.si+(e.deltaY>0?1:-1))}return}yawV+=(e.deltaY+e.deltaX)*.0035},{passive:false});
    on(window,'keydown',function(e){
      if(focus||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      if(e.key==='ArrowLeft'){yawV-=1.1;moved()}else if(e.key==='ArrowRight'){yawV+=1.1;moved()}else if(inside&&cur&&e.key==='ArrowUp'){goStop(cur.si+1)}else if(inside&&cur&&e.key==='ArrowDown'){goStop(cur.si-1)}
    });
    /* Optional: turning the phone turns the view */
    var gyroBtn=document.getElementById('gyroBtn');
    function onGyro(e){if(e.alpha==null||focus)return;var ya=e.alpha*Math.PI/180;if(gyroBase==null){gyroBase=ya;gyroYaw=yaw}var d=ya-gyroBase;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;yaw=gyroYaw-d}
    if(window.DeviceOrientationEvent&&matchMedia('(pointer:coarse)').matches){
      gyroBtn.hidden=false;
      gyroBtn.addEventListener('click',function(){
        function start(){on(window,'deviceorientation',onGyro);gyroBtn.textContent='Now turn your phone';moved()}
        if(DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().then(function(s){if(s==='granted')start();else gyroBtn.textContent='Motion is turned off'},function(){gyroBtn.textContent='Not available here'});else start();
      });
    }
    function openPlace(name){moved();goTo(name)}
    function goWorld(){goTo('world')}
    function shortest(from,to){var d=(to-from)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return from+d}
    function setFocus(name){
      var st=name&&stations[name];
      if(st===focus)return;
      focus=st||null;hitPulse=1;
      if(focus){yawGoal=shortest(yaw,focus.angle);var dist=RADIUS-(tiny?13:15);camGoal.set(Math.sin(focus.angle)*dist,.9,-Math.cos(focus.angle)*dist)}
      else{yawGoal=null;camGoal.set(0,.8,0)}
    }
    var prepList=['events','wedding','birthday','corporate','stagenight','community','people','culture','about','rewards','dreams','enquire','seats'];
    function prepareNext(){
      if(low||tiny&&prepList.length<8)return;
      if(travelling||!handSprites[2]){setTimeout(prepareNext,500);return}
      var nm=prepList.shift();if(!nm)return;
      if(!subs[nm]){var cb=BUILD[nm]();cb.g.visible=false;subs[nm]=cb;try{var was=cb.g.visible;cb.g.visible=true;r.compile(scene,cam);cb.g.visible=was}catch(_){}}
      setTimeout(prepareNext,tiny?900:350);
    }
    setTimeout(prepareNext,1500);
    function size(){var w=innerWidth,hh=innerHeight;r.setPixelRatio(Math.min(devicePixelRatio||1,low?1:w<700?1.3:1.6));r.setSize(w,hh,false);cam.aspect=w/hh;cam.updateProjectionMatrix()}
    function render(dt){
      if(low&&!lowDone){lowDone=true;size();dust3.visible=false}
      if(!handReady&&handSprites.length>=3)buildCrowd();
      var beat=reduce?.4:Math.pow(1-((t*2)%1),3);
      hitPulse*=Math.exp(-dt*4.5);
      if(yawGoal!==null){if(reduce)yaw=yawGoal;else{var kY=6,dY=2*Math.sqrt(kY);yawS+=((yawGoal-yaw)*kY-yawS*dY)*dt;yaw+=yawS*dt}pitch+=((pitchGoal==null?.1:pitchGoal)-pitch)*(1-Math.exp(-dt*3));yawV=0;pitchV=0}
      else if(!drag){yawS=0;yaw+=yawV*dt;yawV*=Math.exp(-dt*2.8);pitch+=pitchV*dt;pitchV*=Math.exp(-dt*5);pitch=Math.max(-.75,Math.min(.6,pitch));
        if(!ROOT.classList.contains('moved')&&!reduce)yaw+=Math.sin(t*.25)*.0009}
      if(reduce){camP.copy(camGoal);camV.set(0,0,0)}else{var kS=travelling?11:5.2,dS=2*Math.sqrt(kS);camV.x+=((camGoal.x-camP.x)*kS-camV.x*dS)*dt;camV.y+=((camGoal.y-camP.y)*kS-camV.y*dS)*dt;camV.z+=((camGoal.z-camP.z)*kS-camV.z*dS)*dt;camP.x+=camV.x*dt;camP.y+=camV.y*dt;camP.z+=camV.z*dt}
      cam.position.copy(camP);cam.position.y+=Math.sin(t*.7)*.04+(cur&&cur.camFx?cur.camFx(beat):0);
      look.set(camP.x+Math.sin(yaw)*Math.cos(pitch)*10,camP.y+Math.sin(pitch)*10,camP.z-Math.cos(yaw)*Math.cos(pitch)*10);cam.lookAt(look);var side=camV.x*Math.cos(yaw)+camV.z*Math.sin(yaw);rollS+=((-side*.012+(yawGoal!==null?-yawS*.05:-yawV*.018))-rollS)*(1-Math.exp(-dt*5));cam.rotateZ(rollS);
      rush+=(rushGoal-rush)*(1-Math.exp(-dt*3.2));
      cam.fov=(tiny?68:56)+hitPulse*6+rush*34-beat*.2;
      // The view shifts aside so the place stays visible beside its information
      var open=!!focus||ROOT.classList.contains('is-open');sheetS+=((open?1:0)-sheetS)*(1-Math.exp(-dt*4));
      var w=innerWidth,hh=innerHeight;
      if(sheetS>.002){if(w>900){var sw=Math.min(1000,w-200);cam.setViewOffset(w,hh,sheetS*sw/2,0,w,hh)}else cam.setViewOffset(w,hh,0,sheetS*hh*.3,w,hh)}else cam.clearViewOffset();
      cam.updateProjectionMatrix();
      r.toneMappingExposure=(cur?cur.exposure:1.05)+hitPulse*.3+rush*.9+beat*.04;
      if(cur)cur.ticks.forEach(function(fn){fn()});
      beams3.forEach(function(b){b.rotation.z=Math.sin(t*.7+b.userData.ph)*.5;b.rotation.x=Math.cos(t*.5+b.userData.ph)*.28});
      towerMat.emissiveIntensity=.8+beat*.8;
      if(!inside){
      ringG.rotation.z=t*.13;ringG.scale.setScalar(1+beat*.012);
      disc.rotation.z=t*1.2;disc.rotation.y=Math.sin(t*.5)*.5;
      stageGlow.material.opacity=.65+beat*.3;
      orbit.rotation.z=t*.5;hs.forEach(function(m,i2){var an=i2/5*TAU+t*.3;m.position.set(Math.cos(an)*8,Math.sin(an)*5.6,Math.sin(an)*2);m.rotation.z=-t*.5;m.scale.setScalar(1+Math.pow(1-(((t*2)+i2*.2)%1),3)*.14)});
      bigHand.scale.setScalar(1+beat*.03);
      mic.scale.setScalar(1+beat*.04);rings.forEach(function(o,i3){o.rotation.x=Math.sin(t*(.5+i3*.2)+i3)*.9;o.rotation.y=t*(.4+i3*.18)*(i3%2?-1:1);o.scale.setScalar(1+Math.pow(1-(((t*2)+i3*.25)%1),3)*.06)});
      ticks.rotation.z=-Math.floor(t*2)*(Math.PI/8)-Math.pow((t*2)%1,6)*(Math.PI/8);
      lans.forEach(function(l){l.u=(l.u+(reduce?0:l.v)*dt)%1;l.s.position.set(l.x+Math.sin(t*.4+l.u*9)*.8,1+l.u*26,l.z);l.s.material.opacity=clamp(l.u*6)*clamp((1-l.u)*5)});
      }
      drawFigs();
      if(!inside){
      // Costume pieces on the Yakshagana-inspired figure follow its head and hips
      var kq=K.yaksha,qo=.5+.5*Math.sin((t*kq.f*2+yFig.ph)*TAU),qq=mix(kq.a,kq.b,qo),sc=U*yFig.s;
      var hx=(qq[0]-100)*sc,hy=(240-qq[1])*sc,px=(qq[4]-100)*sc,py=(240-qq[5])*sc;
      crown.position.set(hx,hy+.2,yFig.z-.05);crownBand.position.set(hx,hy+.2,yFig.z+.02);yskirt.position.set(px,py-.75,yFig.z);
      if(crowd3){
        crowdData.forEach(function(d,i5){var yy=2.4+Math.sin(t*3.14+d.ph)*.1+beat*.06;pos.set(d.x,yy,d.z);eul.set(0,0,d.tilt+Math.sin(t*1.6+d.ph)*.06);quat.setFromEuler(eul);scl.set(d.s,d.s,d.s);crowd3.setMatrixAt(i5,mtx.compose(pos,quat,scl));pos.set(d.x,yy-1.15*d.s,d.z);arms3.setMatrixAt(i5,mtx.compose(pos,quat,scl))});
        crowd3.instanceMatrix.needsUpdate=true;arms3.instanceMatrix.needsUpdate=true;
      }
      }
      dust3.material.size=.2+beat*.05;
      r.render(scene,cam);
      // Keep labels on their places
      function placeHot(el2,ang,vx,show){
        var dd=Math.abs(((ang-yaw)%TAU+TAU+Math.PI)%TAU-Math.PI);vb.copy(vx).project(cam);
        var vis=show&&dd<1.15&&vb.z<1&&Math.abs(vb.x)<1.02;el2.classList.toggle('off',!vis);
        if(vis)el2.style.transform='translate('+((vb.x*.5+.5)*w).toFixed(1)+'px,'+Math.max(92,(-vb.y*.5+.5)*hh).toFixed(1)+'px) translate(-50%,-50%)';
        return dd;
      }
      var nearest=null,best=9;
      PLACES.forEach(function(pl){
        var st=stations[pl[0]];va.set(0,st.top,0).applyMatrix4(st.g.matrixWorld);
        var dd=placeHot(st.hot,st.angle,va,!focus&&!inside&&!travelling);if(dd<best){best=dd;nearest=st}
      });
      pinEls.forEach(function(el2){var pp=el2.__p;va.set(pp.p[0],pp.p[1],pp.p[2]);var dx=va.x-camP.x,dz=va.z-camP.z,dist=Math.hypot(dx,dz);placeHot(el2,Math.atan2(dx,-dz),va,!travelling&&!el2.__gone&&!root.classList.contains('form-open')&&dist<(pp.range||52)&&!(pp.stop!=null&&pp.stop===cur.si))});
      if(nearest!==world.near){world.near=nearest;PLACES.forEach(function(pl){stations[pl[0]].dockBtn.classList.toggle('here',stations[pl[0]]===nearest)})}
    }
    return{render:render,size:size,setFocus:setFocus,setInside:setInside,lantern:function(){if(subs.dreams)subs.dreams.release()}};
  }

  /* Page switching */
  var START=ROOT.dataset.view,view=START||'home',VIEWS={jobs:'AILU Jobs',rewards:'AILU Rewards',dreams:'AILU Dreamers',policies:'Privacy and terms | AILU'},MAINS={home:'homeView',jobs:'jobsView',rewards:'rewardsView',dreams:'dreamsView',policies:'policiesView',notfound:'notfoundView'};
  var firstRoute=true,links=document.getElementById('navLinks'),menuBtn=document.getElementById('menuBtn');
  menuBtn.addEventListener('click',function(){var o=links.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o?'true':'false')});
  var INSIDE={wedding:1,birthday:1,corporate:1,stagenight:1,community:1};
  var PANEL_OF={services:'events',inspiration:'events',how:'events',events:'events',people:'people',culture:'culture',about:'about',faq:'about',join:'about',enquire:'enquire'};
  var PATHS={world:'/',apply:'/jobs#apply',share:'/dreams#share',jobs:'/jobs',rewards:'/rewards',dreams:'/dreams',policies:'/policies',wedding:'/#wedding',birthday:'/#birthday',corporate:'/#corporate',stagenight:'/#stagenight',community:'/#community',events:'/#events',people:'/#people',culture:'/#culture',about:'/#about',enquire:'/#enquire'};
  var sheetEl=document.getElementById('sheet'),homeKids=[].slice.call(document.getElementById('homeView').children),navigated=false;
  var KID_PANEL={services:'events',inspiration:'events',how:'events',people:'people',culture:'culture',about:'about',join:'about',faq:'about',enquire:'enquire'};
  function goTo(name){
    navigated=true;
    if(START){history.pushState({},'',PATHS[name]||'/');route()}
    else if(name==='world'){if(location.hash&&location.hash!=='#film')location.hash='film';else route()}
    else{var want=(PATHS[name]||'').split('#')[1]||name;if(location.hash==='#'+want)route();else location.hash=want}
  }
  var WORLD_OF={events:'events',services:'events',inspiration:'events',people:'people',culture:'culture',about:'about',faq:'about',how:'about',join:'about',enquire:'enquire',jobs:'seats',apply:'seats',rewards:'rewards',dreams:'dreams',share:'dreams',donate:'dreams',wedding:'wedding',birthday:'birthday',corporate:'corporate',stagenight:'stagenight',community:'community'};
  var FORM_OF={enquire:'enqForm',apply:'jobForm',share:'dreamForm'};
  var NAV_OF={seats:'jobs',wedding:'events',birthday:'events',corporate:'events',stagenight:'events',community:'events'};
  function routeWorld(name){
    var root=ROOT,sheetView=(name==='policies')?'policies':(START==='notfound'&&!navigated)?'notfound':null,w=sheetView?null:(WORLD_OF[name]||null);
    Object.keys(MAINS).forEach(function(k){document.getElementById(MAINS[k]).hidden=k!==sheetView});
    root.classList.toggle('is-open',!!sheetView);
    if(sheetView||w)root.classList.add('moved');
    if(!sheetView){world.setInside(w,FORM_OF[name]||null)}
    view=sheetView||'home';
    var here=NAV_OF[w]||w;
    [].forEach.call(links.querySelectorAll('a[data-v]'),function(a){if(a.dataset.v===here)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    links.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');
    if(!START||navigated)document.title=sheetView?VIEWS.policies:w?((name==='jobs'||name==='apply'?'Join AILU':w.charAt(0).toUpperCase()+w.slice(1))+' | AILU'):'AILU | Events, thoughtfully made in Udupi';
    resize();sheetEl.scrollTop=0;
  }
  function route(){
    var hash=location.hash.slice(1),path=START?location.pathname.replace(/^\/+|\.html$/g,''):'';
    if(path==='index')path='';
    var name=hash&&hash!=='film'?hash:path,target=name&&!VIEWS[name]&&!INSIDE[name]?document.getElementById(name):null,insideName=null,closed=false;
    if(world){routeWorld(name);return}
    var next='home',panel=null;
    if(START==='notfound'&&!navigated)next='notfound';
    else if(INSIDE[name]&&world)insideName=name;
    else if(name==='jobs'&&world){next='jobs';insideName='seats';closed=true}
    else if(VIEWS[name])next=name;
    else if(PANEL_OF[name])panel=PANEL_OF[name];
    else if(target&&document.getElementById(MAINS.jobs).contains(target)){next='jobs';if(world)insideName='seats'}
    else if(target&&document.getElementById(MAINS.dreams).contains(target))next='dreams';
    else if(target&&document.getElementById(MAINS.rewards).contains(target))next='rewards';
    var changed=next!==view||panel!==route.panel;route.panel=panel;
    Object.keys(MAINS).forEach(function(k){document.getElementById(MAINS[k]).hidden=k!==next});
    view=next;
    if(!START||navigated)document.title=VIEWS[next]||(panel?panel.charAt(0).toUpperCase()+panel.slice(1)+' | AILU':'AILU | Events, thoughtfully made in Udupi');
    var here=panel||next;
    [].forEach.call(links.querySelectorAll('a[data-v]'),function(a){if(a.dataset.v===here)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    links.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');
    if(world){
      homeKids.forEach(function(k){var own=KID_PANEL[k.id]||(k.classList.contains('film')?'none':'events');k.hidden=own!==panel});
      var open=(next!=='home'||!!panel)&&!closed;
      ROOT.classList.toggle('is-open',open);
      var station=panel||(next==='jobs'||next==='rewards'||next==='dreams'?next:next==='policies'||next==='notfound'?'about':null);
      if(open||insideName)ROOT.classList.add('moved');
      ROOT.classList.toggle('is-inside',!!insideName);
      world.setInside(insideName);
      world.setFocus(open&&!insideName?station:null);
      document.getElementById('sheetBack').setAttribute('href',next==='jobs'?(START?'/jobs':'#jobs'):(START?'/':'#film'));
      document.getElementById('sheetBackLabel').textContent=next==='jobs'?'Back to the seats':'Back to the world';
    }
    resize();
    if(world){if(changed||target){if(target)target.scrollIntoView({behavior:'instant'});else sheetEl.scrollTop=0}}
    else if(target)target.scrollIntoView({behavior:'instant'});else if(changed)scrollTo({top:0,behavior:'instant'});
  }
  on(window,'hashchange',route);
  on(window,'popstate',function(){navigated=true;route()});
  if(START)on(document,'click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||!world||a.target)return;
    var u=new URL(a.href,location.href);if(u.origin!==location.origin)return;
    var key=u.pathname.replace(/^\/+|\.html$/g,'');if(key&&!VIEWS[key]&&key!=='index')return;
    e.preventDefault();navigated=true;history.pushState({},'',u.pathname+u.hash);route();
  });

  /* A canvas that keeps itself the right size */
  function fit(el){
    var w=el.clientWidth,h=el.clientHeight,d=Math.min(devicePixelRatio||1,low?1:2);
    if(el.width!==Math.round(w*d)||el.height!==Math.round(h*d)){el.width=Math.round(w*d);el.height=Math.round(h*d)}
    var g=el.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
    return{g:g,w:w,h:h};
  }

  /* Jobs: choose a talent and that person steps forward */
  var ROLES=new Array(8);
  function pickRole(){}
  function drawJobs(){}

  /* Rewards: collect the golden hands */
  var handsEl=document.getElementById('hands'),rwFx=document.getElementById('rwFx'),sparks=[],tally=document.getElementById('tally');
  for(var hi=0;hi<5;hi++)(function(n){
    var b=document.createElement('button');b.type='button';b.className='hand';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Collect hand '+(n+1));b.appendChild(document.createElement('i'));
    b.addEventListener('click',function(){
      if(b.getAttribute('aria-pressed')==='true')return;
      b.setAttribute('aria-pressed','true');
      var done=handsEl.querySelectorAll('.hand[aria-pressed="true"]').length;
      tally.textContent=done<5?done+' of 5 hands collected':'All 5 collected. That’s the AILU way of saying thank you.';
      if(reduce)return;
      var r=b.getBoundingClientRect(),o=rwFx.getBoundingClientRect();
      burstAt(r.left+r.width/2-o.left,r.top+r.height/2-o.top,done<5?36:70);
      if(done===5)handsEl.querySelectorAll('.hand').forEach(function(x,i){setTimeout(function(){var q=x.getBoundingClientRect();burstAt(q.left+q.width/2-o.left,q.top+q.height/2-o.top,40)},i*120)});
    });
    handsEl.appendChild(b);
  })(hi);
  document.getElementById('rwReset').addEventListener('click',function(){
    handsEl.querySelectorAll('.hand').forEach(function(b){b.setAttribute('aria-pressed','false')});
    tally.textContent='Tap a hand to collect it.';
  });
  function burstAt(px,py,n){
    for(var i=0;i<n&&sparks.length<320;i++){var a=Math.random()*TAU,v=70+Math.random()*210;sparks.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:.6+Math.random()*.7,col:['#ffe27a','#f4c13d','#fff4d0'][i%3],w:1.4+Math.random()*1.6})}
  }
  function drawRewards(dt){
    var f=fit(rwFx),g=f.g;if(!f.w)return;
    g.lineCap='round';
    for(var i=sparks.length-1;i>=0;i--){
      var s=sparks[i];s.life+=dt;s.vy+=150*dt;s.vx*=1-1.2*dt;s.vy*=1-1.2*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
      if(s.life>=s.max){sparks[i]=sparks[sparks.length-1];sparks.pop();continue}
      g.globalAlpha=clamp((1-s.life/s.max)*1.5);g.strokeStyle=s.col;g.lineWidth=s.w;g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x-s.vx*.03,s.y-s.vy*.03);g.stroke();
    }
    g.globalAlpha=1;
  }

  /* Dreams: lanterns over the coast */
  K.dream={f:.22,a:[100,46,100,82,100,140,68,110,60,146,126,64,138,20,90,190,86,240,110,190,114,240],b:[101,46,100,82,100,140,68,112,60,148,128,62,142,16,90,190,86,240,110,190,114,240]};
  var dreamSky=document.getElementById('dreamSky'),lanterns=[],stars=[];
  var lanternImg=sprite(96,function(g,n){
    var r=g.createLinearGradient(0,n*.2,0,n);r.addColorStop(0,'#ffe9a6');r.addColorStop(.6,'#f8b81f');r.addColorStop(1,'#d97c00');
    g.fillStyle=r;g.beginPath();g.moveTo(n*.3,n*.14);g.quadraticCurveTo(n*.5,n*.04,n*.7,n*.14);g.quadraticCurveTo(n*.86,n*.5,n*.68,n*.86);g.lineTo(n*.32,n*.86);g.quadraticCurveTo(n*.14,n*.5,n*.3,n*.14);g.fill();
    g.fillStyle='#fff6d6';g.beginPath();g.ellipse(n*.5,n*.76,n*.08,n*.13,0,0,TAU);g.fill();
  });
  for(var li=0;li<26;li++)lanterns.push({x:Math.random(),s:Math.random(),v:.012+Math.random()*.018,z:.45+Math.random()*.75,ph:Math.random()*TAU});
  for(var si=0;si<90;si++)stars.push({x:Math.random(),y:Math.random()*.62,r:.5+Math.random()*1.1,ph:Math.random()*TAU});
  var released=[];
  function releaseLantern(){released.push({x:.5+(Math.random()-.5)*.18,y:.74,life:0,ph:Math.random()*TAU});if(released.length>12)released.shift();if(reduce)drawDreams(0)}
  document.getElementById('lantern').addEventListener('click',releaseLantern);
  onReady.dreamForm=function(){releaseLantern();if(world&&world.lantern)world.lantern()};
  function drawLantern(g,x0,y0,size,alpha){
    g.globalCompositeOperation='lighter';g.globalAlpha=alpha*.65;g.drawImage(halo,x0-size*1.9,y0-size*1.9,size*3.8,size*3.8);g.globalCompositeOperation='source-over';
    g.globalAlpha=alpha;g.drawImage(lanternImg,x0-size/2,y0-size/2,size,size);g.globalAlpha=1;
  }
  function drawDreams(dt){
    var f=fit(dreamSky),g=f.g,w=f.w,h=f.h;if(!w)return;
    var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0a0c0a');sky.addColorStop(.6,'#1a1408');sky.addColorStop(.82,'#4a3208');g.fillStyle=sky;g.fillRect(0,0,w,h);
    stars.forEach(function(s){g.globalAlpha=.3+.5*Math.abs(Math.sin(t*.7+s.ph));g.fillStyle='#fff7e6';g.beginPath();g.arc(s.x*w,s.y*h,s.r,0,TAU);g.fill()});g.globalAlpha=1;
    var sea=h*.8;
    var base=Math.min(w,h)*.05;
    lanterns.forEach(function(l){
      var u=(l.s+t*l.v)%1,y0=sea-u*(sea+60),a=clamp(u*6)*clamp((1-u)*5);
      drawLantern(g,l.x*w+Math.sin(t*.4+l.ph)*12,y0,base*l.z,a*(.5+.3*l.z));
    });
    released.forEach(function(l){
      if(dt)l.life+=dt;
      var y0=l.y*h-l.life*h*.07;
      if(y0>-80)drawLantern(g,l.x*w+Math.sin(t*.6+l.ph)*14,y0,base*1.5,1);
    });
    var sg=g.createLinearGradient(0,sea,0,h);sg.addColorStop(0,'#2b1e07');sg.addColorStop(1,'#0e100d');g.fillStyle=sg;g.fillRect(0,sea,w,h-sea);
    for(var r=0;r<5;r++){var y1=sea+6+r*r*(h-sea)/30;g.strokeStyle='rgba(255,210,110,'+(.1+r*.02)+')';g.lineWidth=1;g.beginPath();for(var px=0;px<=w;px+=20){var yy=y1+Math.sin(px*.014+t*.8+r)*(1.5+r*.5);if(!px)g.moveTo(px,yy);else g.lineTo(px,yy)}g.stroke()}
    var s=Math.min(h*.24/254,w*.3/200);
    [[.5,1,0],[.36,.82,.3],[.64,.86,.6]].forEach(function(p0){
      var k=s*p0[1];g.save();g.translate(w*p0[0]-100*k,sea+h*.02-240*k);g.scale(k,k);person(g,'dream',t,1,p0[2]);g.restore();
    });
  }

  function resize(){layout();if(world)world.size();tiles.forEach(function(o){sizeTile(o);if(reduce)drawTile(o)});if(reduce){if(view==='home'){if(world)world.render(0);else drawFilm()}if(view==='jobs')drawJobs();if(view==='dreams')drawDreams(0)}}
  if('ResizeObserver' in window)(function(){var ro=new ResizeObserver(resize);ro.observe(pin);cleanups.push(function(){ro.disconnect()})})();
  on(window,'resize',resize);
  world=reduce&&false?null:buildWorld();
  pickRole(0);
  route();

  function frame(now){
    var real=(now-last)/1000||0,dt=Math.min(.05,real);last=now;if(!reduce)t+=dt;
    readScroll();
    if(world&&real<1){slow+=(real-slow)*.04;if(!low&&++seen>90&&slow>.036){low=true;layout()}}
    pS+=(p-pS)*(1-Math.exp(-Math.min(1,real)*7));
    if(Math.abs(p-pS)<.0002)pS=p;
    if(world)world.render(dt);
    if(view==='home')tiles.forEach(function(o){if(o.on)drawTile(o)});
    if(view==='jobs')drawJobs(dt);
    if(view==='rewards')drawRewards(dt);
    if(view==='dreams')drawDreams(dt);
    (raf=requestAnimationFrame(frame));
  }
  (raf=requestAnimationFrame(frame));
  return function stop() {
    dead = true; cancelAnimationFrame(raf);
    timers.forEach(function (id) { window.clearTimeout(id); });
    cleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
    try { io && io.disconnect(); } catch (e) {}
  };
}
