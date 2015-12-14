var stepUp = 0.1;
var speedDown = stepUp * 3.5;
var paper = null;

function main(){
  // First lets create our drawing surface out of existing SVG element
// If you want to create new surface just provide dimensions
// like s = Snap(800, 600);
    paper = Snap("#svg");
    //paper.attr({ viewBox: "0 0 600 1000", with: 600, height: 600  });
    //var s = Snap(800, 1000);
    Snap.load("hud.simple.svg", function (f) {
      // Note that we traversre and change attr before SVG
      // is even added to the page
      //f.select("polygon[fill='#09B39C']").attr({fill: "#bada55"});
        var g = f.select("g");
        paper.append(g);
        //paper.attr({viewBox: f.select("#svg2").viewBox});
      // Making croc draggable. Go ahead drag it around!
      //g.drag();
      // Obviously drag could take event handlers too
      // Looks like our croc is made from more than one polygon...
      //var bar_A = f.select("#bar_A");
      //console.log("x : " + bar_A.getAttribute("x") + " .. " + bar_A.x);

      var dataA = makeData("A", paper);
      var dataB = makeData("B", paper);
      var timer = document.getElementById("text_timer");
      start(dataA, dataB, timer);
  });
  //paper.attr({
  //  width: 800,
  //  height: 600
  //});
}
function prepare() {
}

function end(dWinner) {
    console.log("winner :" + dWinner.suffix + ".." + dWinner.star.id);
    var star = dWinner.star;
    //var star = paper.select("#star_" + dWinner.suffix);
    var bbox = star.getBBox();
    console.log(star);
    console.log(bbox);
    var t = star.transform().string.replace("s0", "r360," + bbox.cx + "," + bbox.cy+ " s1,1,"+bbox.cx + ","+bbox.cy);
    console.log(t);
    star.animate({
        transform: t,
        opacity: 1.0
    }, 250, mina.easein);
    //explosion(10, 10);
}

function explosion(middleX, middleY) {
     var rand = function(min, max){
        return Math.floor(Math.random() * (max - min) + min);
     }

    var sample = function(a) {
        return a[rand(0, a.length)];
    }

    //var middleX = Math.floor($("#svg").width() / 2)
    //var middleY = Math.floor($("#svg").height() / 2)
    var colors = [
        "255, 224, 84",
        "254, 188, 104",
        "241, 143, 134",
        "197, 109, 157",
        "153, 103, 164"
    ];
    var interval = 10;
    var radius = 10;

    for (i = 0; i < 10; i++) {
        paper.circle(middleX, middleY, radius).attr({
            fill: "rgba("+ sample(colors) + ", #"+ rand(5, 9) / 10+")"
        }).animate({
            transform: "t#"+rand(-500, 500)+" #"+rand(-500, 500),
            opacity: 0
        }, rand(1000, 5000), mina.easein)
        ;
    }
}
function start(dA, dB, timer) {
  var last = null;
  var t0 = null;
  function step(ts) {
    if (!last) last = ts;
    if (!t0) t0 = ts;
    var dt = ts - last;
    last = ts;
    // update
    updateData(dA, dt);
    updateData(dB, dt);
    // render
    renderData(dA);
    renderData(dB);
    renderTimer(timer, ts - t0);
    if (dA.ratio >= 1.0) {
        end(dA);
    } else if (dB.ratio >= 1.0) {
        end(dB);
    } else {
        window.requestAnimationFrame(step);
     }
  }

  document.onkeyup = makeKeyUp(dA, dB);
  window.requestAnimationFrame(step);
}

function updateData(data, dt) {
  if (data.ratio < (1.0 - stepUp * 0.2)) {
      data.ratio = Math.max(0.0, data.ratio - speedDown * dt * 0.001);
  }
}

function renderData(data) {
    var rh = 0.1 + data.ratio * 0.9;
    var h = data.height0 * rh;
    data.el.height.baseVal.value = h;
    data.el.y.baseVal.value = data.y0 + (data.height0 - h);

    var rw = 0.1 + (1.0 - data.ratio * 0.9);
    var w = data.width0 * rw;
    data.el.width.baseVal.value = w;
    data.el.x.baseVal.value = data.x0 + (data.width0 - w) * 0.5;
  //console.log(data.y0 + " .. " + data.height0 + " .. " + h);
}

function renderTimer(timer, t) {
    var min = Math.floor(t/60000);
    var txt = ((min < 10) ? "0" : "") + min;
    var sec = Math.floor((t - min * 60000)/1000);
    txt = txt + (((sec < 10) ? ":0" : ":") + sec);
    var cs = Math.floor((t - min * 60000 - sec * 1000)/10);
    txt = txt + (((cs < 10) ? ".0" : ".") + cs);
    timer.textContent = txt;
}

function makeData(suffix, paper) {
  var el = document.getElementById("bar_" + suffix);
  var data = {
    "suffix": suffix,
    "el" : el,
    "x0" : el.x.baseVal.value,
    "y0" : el.y.baseVal.value,
    "width0" : el.width.baseVal.value,
    "height0" : el.height.baseVal.value,
    "ratio" : stepUp
  }

  var el = document.getElementById("btn_" + suffix);
  data.up = function(evt){
        //var coeff = 3.0;
        var coeff = 1.0 - (data.ratio * 0.08);
        data.ratio = Math.min(1.0, data.ratio + stepUp * coeff);
  };
  el.onclick = data.up;

  //var el = document.getElementById("star_"+ suffix);
  var el = paper.select("#star_" + suffix);
  el.transform(el.transform() + ",s0");
  data.star = el;
  return data;
}

function makeKeyUp(dA, dB){
    return function(evt){
        var letter = String.fromCharCode(evt.keyCode || evt.charCode).toUpperCase();
        switch(letter) {
            case "A":
                dA.up(evt);
                break;
            case "B":
                dB.up(evt);
                break;
        }
    }
}
