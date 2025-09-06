const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck(n=6) { //using six decks, as most casinos use 6 or 8 in real life
    const d = []; //create deck starting with empty array
    for (let i=0;i<n;i++) {//run for loop  once for all 6 decks
      for (const s of SUITS) {//iterate through each of 4 suits once for each deck
        for (const r of RANKS) d.push({ r, s }); //iterate through each of the thirteen cards for each suit in each deck, 52 cards per deck, 312 cards in total
      }
    }
   
  }

  function shuffle(a){
    for (let i=a.length-1;i>0;i--){ //start at last element, fisher-yates shuffle
    const j = Math.floor(Math.random()*(i+1)); //select a random index, set as j
    [a[i],a[j]]=[a[j],a[i]]; //switch i and j
    }
    return a; //return shuffled deck
    }
  