const $ = sel => document.querySelector(sel); //$ is just a shortcut name so we don’t have to type document.querySelector every time
const bankEl = $('#bank');
const betEl = $('#bet');
const betDisplay = $('#betDisplay');
const statusEl = $('#status');
const dealerEl = $('#dealer');
const playerEl = $('#player');
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
          betEl.value = Math.max(0, Number(betEl.value) || 0) + Number(chip.dataset.chip); //Makes sure the result is never less than 0 (prevents weird negative bets if something broke)
          updateBetDisplay();
        })
      );

      const STATE = { BETTING:'betting', PLAYER:'player', DEALER:'dealer', DONE:'done' };
      let deck = []; //deck starts empty prior to first shuffle
      let dealer = [];//dealer starts with no cards
      let player = []; //player starts with no cards
      let hiddenDealerCard = null; //hidden "hole" card 
      let bankroll = Number(localStorage.getItem('bankroll')||1000); //get bankroll from local storage
      let bet = 0; //bet initialized to 0
      let state = STATE.BETTING; //begin game in betting phase
      
      function saveBank(){
        localStorage.setItem('bankroll', String(bankroll)); //save as a string to local storage
        bankEl.textContent = bankroll.toFixed(0);
        }

    function updateBetDisplay(){
    betDisplay.textContent = (Number(betEl.value)||0).toFixed(0); //make betEl.value a number and use is as text for bet
    }

    function setStatus(msg){ statusEl.textContent = msg; }
    function setHint(msg, cls='hint'){
        ruleHintEl.className = 'hint ' + cls;
        ruleHintEl.textContent = msg;
        }

    function renderHands(){ //renders both players hands
        renderHand(playerEl, player); //render hand for player, that function will be defined down below
        renderHand(dealerEl, dealer, !!hiddenDealerCard); //render hand for dealer, using !! creates  boolean with value of true
        playerTotalEl.textContent = handValue(player); //calculate user score
        dealerTotalEl.textContent = hiddenDealerCard ? '?' : handValue(dealer);//show dealer score when hole card has been revealed
        }

    function renderHand(root, cards, hasHole){
        root.innerHTML = ''; //root is the DOM element where we want to draw cards (playerEl or dealerEl)
        cards.forEach((c, i) => { //iterate though each cad in the hand
        if (i===0 && hasHole) root.appendChild(cardBack()); //deal delers first card upside down
        else root.appendChild(cardEl(c));//deal users cards and other dealers cards face up
        });
        }

        function cardEl(card){
            const el = document.createElement('div'); //create div for new card
            const red = (card.s === '♥' || card.s === '♦');//red for diamonds and hearts
            el.className = 'card' + (red ? ' red' : '');//defaults to black otherwise due to css styling we added
            el.innerHTML = `
            <div class="rank">${card.r}</div>
            <div class="suit">${card.s}</div>
            <div class="big">${card.s}</div> 
            `;
            //use "big" create effect of a watermark in center of card, similar to real card
            return el;
            }

    function cardBack(){
        const el = document.createElement('div');
        el.className = 'card back';
        return el;
         }
    
         function burnIfLow(){ if (deck.length < 52) deck = createDeck(6); }//create new shuffled deck when current deck gets low

        saveBank(); updateBetDisplay(); deck=createDeck(6);