/**
 * Mock conversation flow — canned responses keyed off the user's last input.
 *
 * The point of this hook is to demo the full voice flow end-to-end without a
 * backend: greet → order → disambiguate → combo → close → bag fills.
 *
 * Replace by setting `voiceOrdering` flag to `'live'` once the proxy is wired.
 */

import { useCallback, useRef } from 'react';

interface MockResponse {
  /** Substrings (lowercase) that route to this response. */
  match: (input: string) => boolean;
  /** Optional state predicate — only fire if turn matches. */
  whenTurn?: (turnIndex: number) => boolean;
  /** Static reply OR a builder that derives the reply from the input
   * (used by dynamic cases like emitting the spoken pickup method into
   * the set_fulfillment fence). */
  reply: string | ((input: string) => string);
}

/** Map a freeform pickup-method utterance to the canonical id used by
 * LocationContext + the location fence. Returns null if no match. */
function detectFulfillmentMethod(i: string): 'drive-thru' | 'dine-in' | 'carry-out' | null {
  if (/\bdrive.?thru\b/.test(i)) return 'drive-thru';
  if (/\bdine.?in\b|\bin.?store\b/.test(i)) return 'dine-in';
  if (/\bcarry.?out\b|\bto.?go\b/.test(i)) return 'carry-out';
  return null;
}

/**
 * Each scripted reply is keyed by an utterance pattern AND the conversation
 * stage. The order matters — first match wins.
 *
 * The final reply contains a `\`\`\`order` JSON block so orderParser sends
 * items into the bag.
 */
const SCRIPT: MockResponse[] = [
  {
    match: i => /^(hi|hello|hey|start|begin)/.test(i) || i === '',
    whenTurn: t => t === 0,
    reply: "Hi! Are you ordering for pickup or delivery?",
  },
  {
    match: i => /\b(deliver(y|ed)?|bring it|drop off|doordash)\b/.test(i),
    reply: `Got it — I'll send you over to delivery. One sec.

\`\`\`handoff
{ "destination": "delivery" }
\`\`\``,
  },
  {
    // Initial pickup pick (turn 1) — confirm location + ask for method.
    // Mock can't read the runtime context, so we use a generic store name.
    match: i => /\bpick.?up\b/.test(i),
    whenTurn: t => t === 1,
    reply: "Picking up at your nearest Wendy's — drive thru, dine in, or carryout?",
  },
  {
    // User picked a method (spoken). Emit the set_fulfillment fence so
    // the screen flips fulfillmentMethod, then wait for the
    // [system: pickup_method_selected: ...] nudge to advance.
    match: i => detectFulfillmentMethod(i) !== null,
    reply: (input) => {
      const method = detectFulfillmentMethod(input)!;
      const phrase =
        method === 'drive-thru' ? 'Drive thru'
        : method === 'dine-in' ? 'Dine in'
        : 'Carryout';
      return `${phrase} it is — one moment.

\`\`\`location
{ "action": "set_fulfillment", "method": "${method}" }
\`\`\``;
    },
  },
  {
    // After the screen flashes the chosen tile, the synthetic nudge
    // arrives — move to the order ask.
    match: i => i.includes('[system: pickup_method_selected:'),
    reply: "Great — what can I get started for you?",
  },
  {
    // ZIP path (denied geo branch). Mock uses a Columbus, OH ZIP since
    // resolveByZip needs a real ZIP that exists in wendys-locations.json.
    match: i => /\b\d{5}\b/.test(i),
    whenTurn: t => t <= 2,
    reply: `One sec — finding your nearest Wendy's.

\`\`\`location
{ "action": "resolve_zip", "zip": "43215" }
\`\`\``,
  },
  {
    // Synthetic nudge after the screen has set the resolved store.
    // Confirm by name + ask for pickup method in one turn.
    match: i => i.includes('[system: location_resolved]'),
    reply: "Got it — picking up at your nearest Wendy's. Drive thru, dine in, or carryout?",
  },
  {
    // ZIP didn't match anything in the dataset. Re-ask.
    match: i => i.includes('[system: zip_not_found]'),
    reply: "Hmm, I couldn't find a Wendy's near that ZIP. Want to try a different one?",
  },
  {
    match: i => i.includes("dave") && (i.includes("single") || i.includes("burger")),
    reply: `Got it — one Dave's Single. Would you like to make that a combo?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": false,
      "combo_drink": null,
      "combo_size": null,
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => i.includes("dave") && i.includes("double"),
    reply: `Got it — one Dave's Double. Would you like to make that a combo?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2388",
      "name": "Dave's Double",
      "quantity": 1,
      "modifiers": [],
      "is_combo": false,
      "combo_drink": null,
      "combo_size": null,
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => i.includes("dave"),
    reply: "Sure — Single, Double, or Triple Dave's?",
  },
  {
    match: i => i.includes("biggie") && !/sandwich/.test(i),
    reply: "Sure — which sandwich for the Biggie Bag? Double Stack, Crispy Chicken, Jr. Bacon Cheeseburger, or Jr. Cheeseburger?",
  },
  {
    match: i => i.includes("jalape") && !i.includes("biscuit") && !i.includes("burger") && !i.includes("cheeseburger"),
    reply: "We've got Jalapeño Ranch Cheeseburgers (Single, Double, or Triple), Jalapeño Bacon Biscuit, Jalapeño Sausage Biscuit, and Jalapeño Bacon Breakfast Potato. Which are you thinking?",
  },
  {
    match: i => i.includes("jalape") && (i.includes("burger") || i.includes("cheeseburger")),
    reply: "Single, Double, or Triple Jalapeño Ranch Cheeseburger?",
  },
  {
    match: i => /\b(yes|yeah|yep|sure|combo|please|combo it)\b/.test(i),
    reply: `Nice. We have a strawberry lemonade — want that as your drink?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_id": "2488",
      "combo_drink": null,
      "combo_size": "medium",
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => i.includes("strawberry") || i.includes("lemonade"),
    reply: `Would you like to make it Medium or Large?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_id": "2488",
      "combo_drink": "Strawberry Lemonade",
      "combo_size": "medium",
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => /\b(medium|med)\b/.test(i),
    reply: `Medium it is. Quick heads up — you've got a free 6-piece Nuggets offer available. Want to add them? Otherwise, anything else?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_id": "2488",
      "combo_drink": "Strawberry Lemonade",
      "combo_size": "medium",
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => /\b(large|lg)\b/.test(i),
    reply: `Large it is. Quick heads up — you've got a free 6-piece Nuggets offer available. Want to add them? Otherwise, anything else?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_id": "2488",
      "combo_drink": "Strawberry Lemonade",
      "combo_size": "large",
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => /\b(nugg|6.?pc|six piece)\b/.test(i) && /\b(yes|yeah|sure|add)\b/.test(i),
    reply: `Nuggets added. Anything else?

\`\`\`draft
{
  "items": [
    {
      "draft_id": "i-1",
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_id": "2488",
      "combo_drink": "Strawberry Lemonade",
      "combo_size": "medium",
      "combo_side": null
    },
    {
      "draft_id": "i-2",
      "id": "726",
      "name": "6 PC. Chicken Nuggets",
      "quantity": 1,
      "modifiers": [],
      "is_combo": false,
      "combo_drink": null,
      "combo_size": null,
      "combo_side": null
    }
  ],
  "notes": ""
}
\`\`\``,
  },
  {
    match: i => /\b(no|nope|that'?s it|done|finish|all set|nothing)\b/.test(i),
    reply: `By the way — you've got 2,450 points. You may be able to redeem at checkout.

2 items for pickup — you'll see it in your bag.

\`\`\`order
{
  "items": [
    {
      "id": "2387",
      "name": "Dave's Single",
      "quantity": 1,
      "modifiers": [],
      "is_combo": true,
      "combo_drink": "Strawberry Lemonade",
      "combo_size": "medium"
    },
    {
      "id": "726",
      "name": "6 PC. Chicken Nuggets",
      "quantity": 1,
      "modifiers": [],
      "is_combo": false,
      "combo_drink": null,
      "combo_size": null
    }
  ],
  "estimated_subtotal": null,
  "notes": "Free Nuggets offer available — surface at checkout."
}
\`\`\``,
  },
];

const FALLBACK_REPLY =
  "Sorry, I'm in mock mode and don't have a canned answer for that. Try: \"I'd like a Dave's Single\" → \"yes combo\" → \"strawberry lemonade\" → \"medium\" → \"that's it\".";

export function useMockConversation() {
  const turnRef = useRef(0);

  const generate = useCallback(async (userInput: string): Promise<string> => {
    const i = userInput.toLowerCase().trim();
    const turn = turnRef.current;
    turnRef.current += 1;

    // Simulate network latency for realism (300-700ms).
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    const match = SCRIPT.find(s => s.match(i) && (!s.whenTurn || s.whenTurn(turn)));
    if (!match) return FALLBACK_REPLY;
    return typeof match.reply === 'function' ? match.reply(i) : match.reply;
  }, []);

  const reset = useCallback(() => {
    turnRef.current = 0;
  }, []);

  return { generate, reset };
}
