## Blackjack (Vanilla JS)

A clean, responsive Blackjack game built with HTML + CSS + JavaScript.
Features a 6-deck shoe, chip betting, double down, proper blackjack payout (3:2), and persistent bankroll via localStorage.

---

## Features

 **6-deck shoe (configurable)**

 **Correct hand values with soft Ace handling**

 **Blackjack pays 3:2**

 **Dealer stands on all 17 (toggleable; notes below)**

 **Bet via input or chips (+$25, +$50, +$100)**

 **Double Down (first two cards)**

 **Bankroll persists across refreshes (localStorage)**

 **Responsive layout; clean “felt table” UI**

## Getting Started

Option 1: Just open it

Open index.html in your browser.

Option 2: Run a local server (recommended)

Any of these work:

Python

# Python 3
python3 -m http.server 8080
# then open http://localhost:8080


Node (http-server)

npx http-server -p 8080


VS Code

Install the Live Server extension

Right-click index.html → Open with Live Server

How to Play

Set your bet (input or click chips) → Deal

On your turn: Hit, Stand, or Double

Round ends; press New Round to bet again

Reset Bank returns bankroll to $1000

Rules implemented

Dealer stands on all 17

Blackjack pays 3:2

Double allowed on first two cards and auto-stand after drawing one

Configuration

All in blackJack.js:

Number of decks
At bottom init:

deck = createDeck(6); // change to 1 or 8, etc.


Table minimum
In deal():

let desiredBet = Math.max(5, Number(betEl.value) || 0); // min = 5


Dealer hits soft 17 (optional)
Replace the dealer loop in stand() with:

function isSoftHand(cards){
  let total = 0, aces = 0;
  for (const c of cards){ total += valueOf(c); if (c.r === 'A') aces++; }
  while (total > 21 && aces > 0){ total -= 10; aces--; }
  return aces > 0; // at least one Ace still counted as 11
}

while (
  handValue(dealer) < 17 ||
  (handValue(dealer) === 17 && isSoftHand(dealer)) // hit soft 17
) {
  dealer.push(deck.pop());
}

Architecture Notes

State machine

const STATE = { BETTING:'betting', PLAYER:'player', DEALER:'dealer', DONE:'done' };


UI is gated by setButtons() so only valid actions are clickable in each phase.

Rendering

renderHands() draws both hands and updates totals

Dealer’s hole card is tracked as hiddenDealerCard; shown via revealHole()

Persistence

localStorage.setItem('bankroll', String(bankroll));


Bankroll survives refreshes; Reset Bank sets it back to 1000.

DOM IDs (must match your HTML)
#bank           #bet            #betDisplay
#status         #dealer         #player
#dealerTotal    #playerTotal    #ruleHint
#deal #hit #stand #double #newRound #resetBank


Status/hint elements

<div class="status" id="status">Place your bet to begin.</div>
<div id="ruleHint" class="hint">Dealer stands on all 17. Blackjack pays 3:2.</div>

Troubleshooting

“Nothing happens when I click Deal” / cards don’t render

Open DevTools → Console. If you see
Cannot set properties of null (setting 'textContent')
one of the queried IDs doesn’t exist in your HTML (commonly #status or #ruleHint).

Ensure your JS, CSS, and HTML are in separate files. Don’t paste CSS/HTML into blackJack.js.

Confirm <script src="blackJack.js"></script> matches the actual filename (case-sensitive).

Dealer didn’t look like they hit

Make sure you re-render after dealer finishes in stand():

while (handValue(dealer) < 17) dealer.push(deck.pop());
renderHands(); // show final dealer hand
endRound();


If you want to see each hit, render inside the loop with a small delay (async).

New Round shows cards from the last round

Clear hands before rendering:

dealer = []; player = []; hiddenDealerCard = null;
renderHands();


Bankroll doesn’t change

Check saveBank() is called after payouts and bets.

localStorage can be blocked in some privacy modes.

Styling

Global tokens in :root (colors/shadows) for easy theming

Cards use .card + .card.red and a faint .big suit “watermark”

Responsive grid switches to two columns for dealer/player at min-width: 860px

Ideas / Next Steps

Split, Insurance, Surrender

Multiple hands / multi-bet

Sound & animations per action

Shoe penetration & cut card

Basic strategy helper overlay

Light theme

License

MIT — use it, remix it, ship it. 🎰

