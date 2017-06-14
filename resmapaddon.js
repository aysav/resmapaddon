// ==UserScript==
// @name         resmapaddon
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://res.anti3z.ru/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/sugar/1.3/sugar.min.js
// --require      http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// --resource     customCSS http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==
//var newCSS = GM_getResourceText ("customCSS");
//GM_addStyle (newCSS);

GM_addStyle("ul{list-style:none;margin-left: 0px;}");
GM_addStyle(".cf:before, .cf:after {content: ' '; display: table; } .cf:after {clear: both;} .cf {*zoom: 1;}");
GM_addStyle("ul.navbar {font: 9px 'open sans', Arial, sans-serif;width: 66px;margin: 0em auto;padding: 0px;background: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px;}");
GM_addStyle("ul.navbar li {float: left;margin: 0;padding: 0;position: relative;}");
GM_addStyle("ul.navbar li a {display: block;padding: 8px 15px;color: #aaa  !important;text-decoration: none;text-transform: uppercase;transition: all .2s ease-in-out;}");
GM_addStyle("ul.navbar li a:hover, ul.navbar li:hover > a {background: #930659;color: #fff !important;}");
GM_addStyle("ul.navbar li ul {margin: 0;position: absolute;background: #222;left: 10%;font-size: 10px;opacity: 0;visibility: hidden;z-index: 99;transition: all .1s ease;width:140px;}");
GM_addStyle("ul.navbar ul li { float: none; }");
GM_addStyle("ul.navbar li:hover > ul { opacity: 1; visibility: visible; left: 0; max-height: 250px }");
GM_addStyle("ul.navbar > li:hover > ul { opacity: 1; visibility: visible; top: 100%; left: 0; }");
GM_addStyle("ul.navbar li > ul  ul { top: 0; left: 90%; }");
GM_addStyle("ul.navbar li > ul li:hover > ul { left: 100%; }");
GM_addStyle("ul.navbar li > ul {padding: 0px}");

var urshtab=6;
var ShtabCircle;

$(document).ready(function() {
  function AddMyResPanel(){
      var menu=$("<ul class='navbar cf' id='MyPanelServic' style='position: absolute;top:85px;left:10px;'></ul>"); // class='navbar cf'
      var item=$("<li id='mservic'><a href='#'>Сервис</a></li>");
      var submenu=$("<ul></ul>");
      var item0=$("<li><a href='#' id='mscan'>сканирование</a></li><li><a href='#' id='mautoplace'>Автоустановка шахт</a></li>");
      var item1=$("<li id='minfo'><a href='#'>Информация</a></li>");
      var item2=$("<li id='mdelmines'><a href='#'>Удаление шахт</a></li>");
      var item3=$("<li id='mshtab'><a href='#'>Штаб</a></li>");
      var item4=$("<li id='mload'><a href='#'>Загрузка/Выгрузка</a></li>");

      var submenu2=$("<ul><li><a href='#' id='mvinfo'>по установленным шахтам</a></li><li><a href='#' id='msinfo'>по шахтам под штабом</a></li></ul>");
      var submenu3=$("<ul><li><a href='#' id='mDelAllMines'>Удаление всех шахт</a></li><li><a href='#' id='mDelNotVisible'>Удаление не видимых шахт</a></li><li><a href='#' id='mDelPerc'>Удаление шахт ниже %</a></li></ul>");
      var submenu4=$("<ul><li><a href='#' id='ur6'>6</a></li><li><a href='#' id='ur7'>7</a></li><li><a href='#' id='ur8'>8</a></li><li><a href='#' id='ur9'>9</a></li><li><a href='#' id='ur10'>10</a></li></ul>");
      var submenu5=$("<ul><li><a href='#' id='mloadmines'>загрузка шахт</a></li><li><a href='#' id='munloadmines'>выгрузка шахт</a></li></ul>");

      item1.append(submenu2);
      item2.append(submenu3);
      item3.append(submenu4);
      item4.append(submenu5);

      submenu.append(item0);
      submenu.append(item1);
      submenu.append(item2);
      submenu.append(item3);
      submenu.append(item4);

      item.append(submenu);
      menu.append(item);
      $("#map_canvas").append(menu);

      function DeleteMineByKey(key){
         Mines[key].setMap(null);
         MineInfoWindow[key].close();
         Mines.splice(key,1);
         MineInfoWindow.splice(key,1);
         cntMines--;
      }

      // устанавливаем уровень штаба
      $('#mshtab').click(function(e){
          urshtab=Number(e.target.text);
      });

      // информаций по шахтам под штабом
      $('#msinfo').click(function(){
          var d=0;
          if (typeof ShtabCircle !== "undefined") {
              $.each(Mines, function( key, Mine ) {
                 // computeDistanceBetween
                  d=google.maps.geometry.spherical.computeDistanceBetween(Mine.getBounds().getCenter(), ShtabCircle.center);
                  if (d<=GetShtabRadius(urshtab)){
                      console.log(d);
                  }
              });
         }
      });

      $('#mDelAllMines').click(function(){
          if (cntMines>0) {
              if (confirm("Удалить все шахты?")){
                  $.each(Mines, function( key, Mine ) {
                      Mine.setMap(null);
                      MineInfoWindow[key].close();
                      cntMines--;
                  });
                  Mines.splice(0, Mines.length);
                  MineInfoWindow.splice(0, MineInfoWindow.length);
                  cntMines=0;
                  InfoBarUpdate();
              }
          }
      });

      $('#mDelNotVisible').click(function(){
          if (cntMines>0) {
            if (confirm("Удалить все не видимые шахты?")){
                var keys = [];
                $.each(Mines, function( key, Mine ) {
                    //Если шахта в пределах видимой карты
                    if (!map.getBounds().contains(Mine.getBounds().getCenter())) {
                       keys.push(key);
                    }
                });
                keys.reverse();
                $.each(keys, function( i, v) {
                   DeleteMineByKey(v);
                });
                InfoBarUpdate();
            }
        }
      });

      $('#mDelPerc').click(function(){
          var perc = prompt('Минимальный процент?', 25);
          if (!isNaN(perc)){
            var keys = [];
            $.each(Mines, function( key, Mine ) {
                if (Mine!== undefined) {
                    if ("quality" in Mine){
                        if (Mine.quality*100<perc){
                           //console.log(Mine);
                           keys.push(key);
                        }
                    }
                }
            });
            keys.reverse();
            $.each(keys, function( i, v) {
                DeleteMineByKey(v);
            });
            InfoBarUpdate();
        }
      });

      // расстановка шахт
      $("#mautoplace").click(function (){
          AutoPlaceClick_handler();
      });

      // сканирование
      $("#mscan").click(function (){
          ScanClick_handler();
      });

      // информация по установленнм шахтам
      $("#mvinfo").click(function (){
          InfoClick_handler();
      });

      // штаб
      map.addListener('rightclick', function(e) {
          SetShtab(e.latLng, urshtab);
      });

      // высчитываем радиус штаба
      function GetShtabRadius(ur){
          return 100+ur*15;
      }

      function SetShtab(pos, ur){
         var radius = GetShtabRadius(ur);

         // чистим предыдущее
         if (typeof ShtabCircle !== "undefined") {
             ShtabCircle.setMap(null);
         }

         ShtabCircle = new google.maps.Circle({
                 strokeColor: '#555555',
                 strokeOpacity: 0.8,
                 strokeWeight: 1,
                 fillColor: '#8d8d8d',
                 fillOpacity: 0.35,
                 draggable: true,
                 map: map,
                 center: pos,
                 radius: radius
         });
      }
  }
  AddMyResPanel(); // Добавление панели
});
