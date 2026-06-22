---
title: 用量统计
date: 2026-06-21 19:50:00
comments: false
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

<div id="token-stats-app">
  <div id="token-summary-cards" class="token-row">
    <div class="token-card token-card-today">
      <div class="token-card-icon"><i class="fas fa-bolt"></i></div>
      <div class="token-card-body">
        <div class="token-card-label">今日消耗</div>
        <div class="token-card-value" id="today-tokens">--</div>
        <div class="token-card-sub" id="today-cost"></div>
      </div>
    </div>
    <div class="token-card token-card-month">
      <div class="token-card-icon"><i class="fas fa-calendar-alt"></i></div>
      <div class="token-card-body">
        <div class="token-card-label">本月消耗</div>
        <div class="token-card-value" id="month-tokens">--</div>
        <div class="token-card-sub" id="month-cost"></div>
      </div>
    </div>
    <div class="token-card token-card-total">
      <div class="token-card-icon"><i class="fas fa-database"></i></div>
      <div class="token-card-body">
        <div class="token-card-label">累计消耗</div>
        <div class="token-card-value" id="total-tokens">--</div>
        <div class="token-card-sub" id="total-requests"></div>
      </div>
    </div>
    <div class="token-card token-card-cost">
      <div class="token-card-icon"><i class="fas fa-coins"></i></div>
      <div class="token-card-body">
        <div class="token-card-label">总费用</div>
        <div class="token-card-value" id="total-cost">--</div>
        <div class="token-card-sub" id="last-updated"></div>
      </div>
    </div>
  </div>
  <div class="token-section" style="margin-bottom:24px;">
    <h2 style="font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #eee;"><i class="fas fa-chart-bar" style="margin-right:8px;"></i>每日趋势</h2>
    <div id="token-chart" style="width:100%;height:400px;"></div>
  </div>
  <div class="token-section" style="margin-bottom:24px;">
    <h2 style="font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #eee;"><i class="fas fa-table" style="margin-right:8px;"></i>每日明细</h2>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid #eee;">
      <table id="token-table" style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">日期</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">模型</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">请求数</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">输入 Tokens</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">输出 Tokens</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">缓存</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600;color:#666;border-bottom:2px solid #e0e0e0;white-space:nowrap;">费用 ($)</th>
          </tr>
        </thead>
        <tbody id="token-table-body"></tbody>
      </table>
    </div>
  </div>
</div>
<style>
.token-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
.token-card{display:flex;align-items:center;padding:20px;border-radius:12px;background:#fff;border:1px solid #eee;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:transform .2s,box-shadow .2s;}
.token-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.1);}
.token-card-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-right:16px;flex-shrink:0;}
.token-card-today .token-card-icon{background:#e8f5e9;color:#2e7d32;}
.token-card-month .token-card-icon{background:#e3f2fd;color:#1565c0;}
.token-card-total .token-card-icon{background:#fff3e0;color:#e65100;}
.token-card-cost .token-card-icon{background:#fce4ec;color:#c62828;}
.token-card-body{flex:1;min-width:0;}
.token-card-label{font-size:13px;color:#999;margin-bottom:4px;}
.token-card-value{font-size:24px;font-weight:700;color:#333;line-height:1.2;}
.token-card-sub{font-size:12px;color:#999;margin-top:4px;}
.token-section h2 i{margin-right:8px;}
#token-table td{padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#333;}
#token-table tr:hover td{background:rgba(0,0,0,0.02);}
.token-model-tag{display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:500;background:#e3f2fd;color:#1565c0;}
@media(max-width:768px){.token-row{grid-template-columns:repeat(2,1fr);}.token-card-value{font-size:20px;}}
@media(prefers-color-scheme:dark){.token-card{background:#2a2a3a;border-color:#3a3a4e;}.token-card-label,.token-card-sub{color:#aaa;}.token-card-value{color:#e0e0e0;}#token-table th{background:#2a2a3a;color:#aaa;border-color:#3a3a4e;}#token-table td{color:#ccc;border-color:#2a2a3e;}#token-table tr:hover td{background:rgba(255,255,255,0.03);}.token-card-today .token-card-icon{background:rgba(255,78,78,0.18);color:#ff6b6b;}.token-card-month .token-card-icon{background:rgba(255,140,56,0.18);color:#ffa64d;}.token-card-total .token-card-icon{background:rgba(232,168,56,0.18);color:#f0c040;}.token-card-cost .token-card-icon{background:rgba(232,89,110,0.18);color:#f0758a;}.token-model-tag{background:rgba(255,78,78,0.12);border-color:rgba(255,78,78,0.3);}}</style>
<script>
fetch('/token-stats/data.json')
  .then(function(r){return r.json()})
  .then(function(data){
    var s = data.summary;
    var daily = data.daily || [];
    function fmt(n){return n>=10000?(n/10000).toFixed(1)+'w':n.toLocaleString();}
    function fmtFull(n){return n.toLocaleString();}
    document.getElementById('today-tokens').textContent = fmt(s.todayTokens);
    document.getElementById('today-cost').textContent = '$'+s.todayCost.toFixed(4);
    document.getElementById('month-tokens').textContent = fmt(s.monthTokens);
    document.getElementById('month-cost').textContent = '$'+s.monthCost.toFixed(4);
    document.getElementById('total-tokens').textContent = fmt(s.totalTokens);
    document.getElementById('total-requests').textContent = '共 '+fmtFull(s.totalRequests)+' 次请求';
    document.getElementById('total-cost').textContent = '$'+s.totalCost.toFixed(4);
    document.getElementById('last-updated').textContent = (s.lastUpdated||'').split(' ')[0];
    var tbody = document.getElementById('token-table-body');
    for(var i=0;i<daily.length;i++){
      var d = daily[i];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>'+d.date+'</td><td><span class="token-model-tag">'+d.model+'</span></td><td>'+d.requests+'</td><td>'+fmtFull(d.inputTokens||0)+'</td><td>'+fmtFull(d.outputTokens||0)+'</td><td>'+fmtFull((d.cacheReadTokens||0)+(d.cacheCreationTokens||0))+'</td><td>'+(d.costUSD||0).toFixed(6)+'</td>';
      tbody.appendChild(tr);
    }
    var dateMap={};
    for(var i=0;i<daily.length;i++){var d=daily[i];if(!dateMap[d.date])dateMap[d.date]=0;dateMap[d.date]+=(d.inputTokens||0)+(d.outputTokens||0);}
    var dates=Object.keys(dateMap).sort();
    var values=dates.map(function(d){return Math.round(dateMap[d]/10000);});
        var fmtDates=dates.map(function(d){var p=d.split('-');return p[1]+'/'+p[2];});
    var chart=echarts.init(document.getElementById('token-chart'));
    chart.setOption({
  tooltip:{
    trigger:'axis',
    backgroundColor:'rgba(15,23,42,0.92)',
    borderColor:'rgba(255,78,78,0.3)',
    borderWidth:1,
    padding:[12,16],
    textStyle:{color:'#e2e8f0',fontSize:13},
    formatter:function(p){
      var d=p[0];
      return '<div style="font-weight:600;font-size:14px;color:#f8fafc;margin-bottom:6px;">'+d.axisValue+'</div>'
        +'<div style="display:flex;align-items:center;gap:6px;margin:4px 0;">'
        +'<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:linear-gradient(135deg,#ff6b6b,#ff4e4e);"></span>'
        +'Tokens: <strong style="color:#f87171;">'+(d.value*10000).toLocaleString()+'</strong></div>';
    }
  },
  grid:{left:'3%',right:'4%',bottom:'8%',containLabel:true},
  xAxis:{
    type:'category',
    data:fmtDates,
    axisLine:{lineStyle:{color:'rgba(100,116,139,0.3)'}},
    axisLabel:{color:'rgba(148,163,184,0.8)',fontSize:11},
    splitLine:{show:false}
  },
  yAxis:{
    type:'value',
    name:'万 Tokens',
    nameTextStyle:{color:'rgba(148,163,184,0.6)',fontSize:12},
    axisLine:{show:false},
    axisTick:{show:false},
    splitLine:{lineStyle:{color:'rgba(100,116,139,0.1)',type:'dashed'}},
    axisLabel:{color:'rgba(148,163,184,0.8)',fontSize:11}
  },
  series:[
    {
      type:'bar',
      data:values,
      barWidth:'60%',
      itemStyle:{
        color:{
          type:'linear',x:0,y:0,x2:0,y2:1,
          colorStops:[
            {offset:0,color:'rgba(255,78,78,0.85)'},
            {offset:0.6,color:'rgba(255,78,78,0.6)'},
            {offset:1,color:'rgba(255,78,78,0.2)'}
          ]
        },
        borderRadius:[6,6,0,0],
        shadowBlur:10,
        shadowColor:'rgba(255,78,78,0.3)',
        shadowOffsetY:4
      },
      emphasis:{
        itemStyle:{
          color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'#ff6b6b'},{offset:1,color:'#ff4e4e'}]},
          shadowBlur:20,
          shadowColor:'rgba(255,78,78,0.5)'
        }
      }
    }
  ]
});
window.addEventListener('resize',function(){chart.resize();});
    window.addEventListener('resize',function(){chart.resize();});
  })
  .catch(function(err){
    document.getElementById('token-stats-app').innerHTML='<div style="padding:40px;text-align:center;color:#999;">数据加载失败'+err.message+'</div>';
  });
</script>