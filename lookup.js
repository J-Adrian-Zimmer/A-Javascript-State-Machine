"use strict";

var tradeDir = path.join(process.cwd(), 'trades');

// exports //

function getPL(ticker) {
   var fs = require('fs');
   fs.readFile(
      path.join(tradeDir,ticker),
      'utf8',
      function(err,brokerRec) {
         if( err ) {
            console.log(err);
         } else {
            console.log(ticker.toUpperCase());
            init_state.que(ticker, JSON.parse( brokerRec ));
          }
        }
   );
}

exports.getPL = getPL;
exports.set_tradedir = function(newdir) { tradeDir = newdir; }


// installing que in Function.prototype //

Object.defineProperty( 
   Function.prototype, 
   'que', 
   {
     enumerable: false,
     value: function() {
       var that = this,
           args = Array.from(arguments);
       setTimeout( 
         function() { that.apply({},args) }, 
         0 
       )
     }
   }
);


// Walker: an iterator class //

function Walker(status,buyOrSell) {
   this.status = status;
   this.recs = status.sources;
   this.buyOrSell = buyOrSell;
   this.idx = 0;
   this.rec = this.recs[this.idx];
}

Walker.prototype.next = function() {
   var that = this,
       selling = this.buyOrSell=="SELL";

   function advanceRec() {
      if( that.recs[that.idx] ) { 
         that.idx +=1;
         that.rec = that.recs[that.idx];
      };
   };

   function incrQty() {
      if(selling && that.rec && that.rec.buyOrSell=="BUY") {
         that.status.qtyHeld += that.rec.qtyLeft;
      };  // sale iterator will not lag
          // purchase iterator and should
          // keep track of shares bought
          // as it passes over BUY records
   }
   
   do {
      advanceRec(); incrQty();
   } while(
      this.rec && 
      this.rec.buyOrSell!=this.buyOrSell &&
      this.status.purchase.idx < this.status.sale.idx
   );

}


// helper functions //

function round2str(x) {
   // round to 2 decimal places by 
   // adding 0.005 and truncating
   var xnum = new Number(x),
       xstr = ( xnum===0 ? 
                "0.0" :
                new String(xnum+0.005)
              );
   return xstr.replace(/^(\-?)(\d+\.\d\d?)\d*$/,"$1$2");
}

function make_sources_rec(inRec) {
   var nN = (x) => new Number(x),
       comm = -nN(inRec.Commission)/nN(inRec.Qty);
               // negative iff a sale 
   return { 
     qtyLeft: Math.abs(inRec.Qty),
     buyOrSell: inRec.BuySell,
     unitCost: nN(inRec.Price)*nN(inRec.FX) + comm,
     date: inRec.Date
   }
}

function push_completions_rec(status,qty) {
  var buy = status.purchase.rec,
      sell = status.sale.rec,
      amount = sell.unitCost*qty - buy.unitCost*qty,
      rec = {
        buy_date: buy.date,
        sell_date: sell.date,
        number_shares: qty+"",
        profit_loss: round2str(amount)
      };
  status.completions.push(rec); 
  status.qtyHeld -= qty;
  status.realized += amount;
}


// state functions //

function init_state(ticker,brokerRec) {
   var status = {
         sources:  undefined,
         sale: undefined,
         purchase: undefined,
         qtyHeld: undefined,
         realized: 0,
         completions: [],
         ticker: ticker
       };
   status.sources = brokerRec.map(make_sources_rec);
   status.purchase = new Walker(status,"BUY");
   if( status.purchase.rec.buyOrSell!="BUY") {
      throw "short sale at first record";
   }
   status.qtyHeld = status.purchase.rec.qtyLeft;
   status.sale = new Walker(status,"SELL");
   status.sale.next();
   recordPL_state.que(status);
}

function recordPL_state(status) {
  var buy = status.purchase.rec, 
      sell = status.sale.rec;
  if( sell.buyOrSell=='SELL' ) {
     let qty = Math.min(buy.qtyLeft, sell.qtyLeft);
     buy.qtyLeft -= qty;
     sell.qtyLeft -= qty;
     push_completions_rec(status,qty);
  } else { 
     status.qtyHeld += sell.qtyLeft; 
  }
  advance_state.que(status);
}

function advance_state(status) {
   var purchase = status.purchase, 
       sale = status.sale;
   
   if( sale.rec && sale.rec.qtyLeft==0 )  sale.next();
                         // now !sale.rec or 
                         // sale.rec.buyOrSale == "SELL"
   
   if( purchase.rec && purchase.rec.qtyLeft==0 )  purchase.next();
                         // now !purchase.rec or 
                         // purchase.rec.buyOrSell=="BUY" or
                         // purchase.idx==sale.idx
   
   if( sale.rec && (!purchase.rec || purchase.idx>=sale.idx) ) {
      throw "selling short on " + sale.rec.date
   }
   
   if( sale.rec && sale.rec.qtyLeft ) {
      recordPL_state.que(status);
   } else {
      finish_state.que(status);
   };
}

function finish_state(status) {
   status.completions.forEach(
       rec => console.log( JSON.stringify(rec) )
   );
   console.log("total realized: " + round2str(status.realized));
   console.log( "quantity still held: " + status.qtyHeld );
}


