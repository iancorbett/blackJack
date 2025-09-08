const $ = sel => document.querySelector(sel); //$ is just a shortcut name so we don’t have to type document.querySelector every time
const bankEl = $('#bank');
const betEl = $('#bet');
const betDisplay = $('#betDisplay');
const statusEl = $('#status');
const dealerEl = $('#dealer');
const playerEl = $('#player');
const dealerTotalEl = $('#dealerTotal');
const playerTotalEl = $('#playerTotal');
const ruleHintEl = $('#ruleHint');

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

         function setButtons(){
            btnDeal.disabled = state !== STATE.BETTING;//The Deal button is only clickable when you’re in the BETTING phase
            betEl.disabled = state !== STATE.BETTING;//The bet button is only clickable when you’re in the BETTING phase
            document.querySelectorAll('.chip').forEach(chip => chip.style.pointerEvents = (state===STATE.BETTING? 'auto':'none'));//Betting chips (+25, +50, +100) only respond to clicks during betting
            const canAct = state === STATE.PLAYER;//true only while it’s your turn (PLAYER state)
            btnHit.disabled = !canAct; //Hit / Stand buttons are enabled only while you’re making moves
            btnStand.disabled = !canAct;
            btnDouble.disabled = !(canAct && player.length === 2 && bankroll >= bet); //can only double down on your turn, with two cards, and with sufficient funds
            btnNew.disabled = state !== STATE.DONE;
            }

            function deal(){
                let desiredBet = Math.max(5, Number(betEl.value)||0);//cant bet less than 5
                desiredBet = Math.min(desiredBet, bankroll);//cant bet more than bankroll
                if (desiredBet <= 0) { setHint('You need money to bet 🙂', 'hint'); return; }
                bet = desiredBet;
                bankroll -= bet; saveBank(); updateBetDisplay();//subtract bankroll by bet size
                burnIfLow();
                dealer = []; player = []; hiddenDealerCard = null;
                state = STATE.PLAYER; setButtons(); setStatus('Your move.'); setHint('Hit, Stand, or Double.');
                player.push(deck.pop()); hiddenDealerCard = deck.pop(); dealer.push(hiddenDealerCard);//deal first cards
                player.push(deck.pop()); dealer.push(deck.pop());//deal second cards
                if (isBlackjack(player) || isBlackjack(dealer)){//check for blackjack
                revealHole();
                const pBJ = isBlackjack(player);//pBJ => player blackjack
                const dBJ = isBlackjack(dealer); //dBJ => dealer blackjack
                if (pBJ && dBJ) return endRound('push');//in case of two blackjacks
                if (pBJ) { bankroll += bet + Math.floor(bet*1.5); saveBank(); return endRound('player-bj'); }//1.5 times payout for blackjack
                if (dBJ) return endRound('dealer-bj');//in case of dealer blackjack
                }
                renderHands();
                setButtons();
                }

                function hit(){
                    if (state !== STATE.PLAYER) return;//only play  on usres turn
                    player.push(deck.pop());//adds top card to users hand
                    renderHands();
                    if (handValue(player) > 21) endRound('bust');//round ends on bust, endround will be defined below
                    }

                function stand(){
                     if (state !== STATE.PLAYER) return;//only play on users turn
                     revealHole();//show hole card using function that  we will define below
                     state = STATE.DEALER;//dealers turn
                     console.log('Dealer starts:', handValue(dealer), dealer.map(c => c.r + c.s).join(' '));
                     while (handValue(dealer) < 17) dealer.push(deck.pop());//dealer hits while under 17, no hitting on soft 17
                    endRound();
                    }

            function doubleDown(){
                if (state !== STATE.PLAYER || bankroll < bet) return;//oly double down on your turn and with sufficient funds
                bankroll -= bet; bet *= 2; saveBank(); //take oyt bet and update bankroll
                player.push(deck.pop()); //take another card
                renderHands();
                if (handValue(player) > 21) return endRound('bust');//check if bust
                stand();//user then stands with three cards regardless of score
                }

            function revealHole(){
                if (hiddenDealerCard){ dealer[0] = hiddenDealerCard; hiddenDealerCard=null; renderHands(); }
                 }

            function endRound(reason){
                revealHole();
                 const pVal = handValue(player), dVal = handValue(dealer);
                 state = STATE.DONE; setButtons();
                 if (reason==='bust'){ setHint('Player busts! Dealer wins.','lose'); setStatus('Bust.'); return; }
                 if (reason==='player-bj'){ setHint('Blackjack! You win 3:2','win'); setStatus('Blackjack!'); return; }
                 if (reason==='dealer-bj'){ setHint('Dealer Blackjack.','lose'); setStatus('Dealer Blackjack'); return; }
                 if (reason==='push'){ bankroll+=bet; saveBank(); setHint('Push. Bet returned.','push'); setStatus('Push.'); return; }
                 if (pVal>21){ setHint('Player busts!','lose'); return; }
                 if (dVal>21){ bankroll+=bet*2; saveBank(); setHint('Dealer busts! You win.','win'); setStatus('Dealer busts!'); return; }
                 if (pVal>dVal){ bankroll+=bet*2; saveBank(); setHint('You win!','win'); setStatus('You win!'); return; }
                 if (pVal<dVal){ setHint('Dealer wins.','lose'); setStatus('Dealer wins'); return; }
                 bankroll+=bet; saveBank(); setHint('Push.','push'); setStatus('Push.');
                }

            function newRound(){ 
                state=STATE.BETTING; setButtons(); setStatus('Place your bet.'); renderHands(); //set state back to beting and render new hands
                playerTotalEl.textContent='0'; dealerTotalEl.textContent='0'; //set both totals to 0 for new round
            }

            btnDeal.addEventListener('click', deal);
            btnHit.addEventListener('click', hit);
            btnStand.addEventListener('click', stand);
            btnDouble.addEventListener('click', doubleDown);
            btnNew.addEventListener('click', newRound);
            resetBank.addEventListener('click', ()=>{ bankroll=1000; saveBank(); setHint('Bankroll reset.','hint'); });

        saveBank(); updateBetDisplay(); setButtons(); deck=createDeck(6);