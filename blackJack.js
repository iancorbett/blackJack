const $ = sel => document.querySelector(sel); //$ is just a shortcut name so we don’t have to type document.querySelector every time
const bankEl = $('#bank');
const betEl = $('#bet');
const betDisplay = $('#betDisplay');
const statusEl = $('#status');
const dealerTotalEl = $('#dealerTotal');
const playerTotalEl = $('#playerTotal');
const ruleHintEl = $('#ruleHintEl');

//buttons
const btnDeal = $('#deal');
const btnHit = $('#hit');
const btnStand = $('#stand');
const btnDouble = $('#double');
const btnNew = $('#newRound');
const resetBank = $('#resetBank');

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck(n=6) { //using six decks, as most casinos use 6 or 8 in real life
    const d = []; //create deck starting with empty array
    for (let i=0;i<n;i++) {//run for loop  once for all 6 decks
      for (const s of SUITS) {//iterate through each of 4 suits once for each deck
        for (const r of RANKS) d.push({ r, s }); //iterate through each of the thirteen cards for each suit in each deck, 52 cards per deck, 312 cards in total
      }
    }
    return shuffle(d);
  }

  function shuffle(a){
    for (let i=a.length-1;i>0;i--){ //start at last element, fisher-yates shuffle
    const j = Math.floor(Math.random()*(i+1)); //select a random index, set as j
    [a[i],a[j]]=[a[j],a[i]]; //switch i and j
    }
    return a; //return shuffled deck
    }

function valueOf(card){
    if (card.r === 'A') return 11; //aces worth 11
    if (["K","Q","J"].includes(card.r)) return 10; //face cards worth 10
    return Number(card.r);//numbered cards worth the number value on card
    }

function handValue(cards){
    let total = 0, aces = 0; //initialize total to zero, track aces to potentially adjust scoring as aces by rule can be counted as 1 also
    for (const c of cards){//iterate through cards in hand 
    total += valueOf(c); //add values of cards in hands
    if (c.r === 'A') aces++; //r refers to rank, if ace then increment aces count
     }
     while (total > 21 && aces > 0){//if score is over 21, and an ace is present, subtract 10 and count ace as a 1
       total -= 10;
    aces--;
     }
    return total;
}

function isBlackjack(cards){ //determie if thre is a blackjack dealt immediately
    return cards.length === 2 && handValue(cards) === 21;
    }

    document.querySelectorAll('.chip').forEach(chip => //select all the chips
        chip.addEventListener('click', () => {//make them all clickable
          betEl.value = Math.max(0, Number(betEl.value) || 0) + Number(ch.dataset.chip); //Makes sure the result is never less than 0 (prevents weird negative bets if something broke)
          updateBetDisplay();
        })
      );
      


  