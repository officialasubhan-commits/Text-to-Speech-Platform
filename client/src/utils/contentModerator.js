/**
 * Client-Side Content Moderator & Sensitive Word Filter
 * Performs instant, real-time scanning for profanity, slurs, hate speech,
 * harassment, and leetspeak evasions.
 */

export const SENSITIVE_WORDS = [
  // Profanity & Vulgarity
  'fuck', 'fucking', 'fucker', 'fucked', 'fuckoff', 'motherfucker',
  'shit', 'shitty', 'bullshit', 'horseshit', 'dipshit',
  'bitch', 'bitches', 'bitching', 'sonofabitch',
  'bastard', 'bastards',
  'ass', 'asshole', 'assholes', 'badass', 'dumbass', 'jackass',
  'crap', 'dammit', 'damn', 'goddamn',
  'dick', 'dickhead', 'dicks', 'cock', 'cocksucker',
  'pussy', 'pussies', 'cunt', 'cunts', 'twat', 'wanker',
  'prick', 'bollocks', 'bugger',
  'slut', 'whore', 'hooker', 'skank',
  
  // Hate Speech, Bigotry & Slurs
  'nigger', 'nigga', 'niggers', 'chink', 'gook', 'spic', 'wetback',
  'kike', 'faggot', 'fag', 'dyke', 'tranny', 'shemale', 'retard', 'retarded',

  // Violence, Self-Harm & Hostility
  'kill yourself', 'killyourself', 'suicide', 'die in a fire',
  'murder you', 'shoot you', 'bomb you', 'massacre', 'decapitate',
  'slit your throat', 'terrorist attack', 'blow up',
];

const LEET_MAP = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  'v': 'u',
  '*': '',
  '_': '',
  '-': '',
  '.': '',
};

function normalizeText(text) {
  if (!text) return '';
  let lower = text.toLowerCase();
  let decoded = '';
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    decoded += LEET_MAP[ch] !== undefined ? LEET_MAP[ch] : ch;
  }
  return decoded;
}

/**
 * Checks text for any sensitive or prohibited words
 * @param {string} text 
 * @returns {{ isClean: boolean, flaggedWords: string[] }}
 */
export function checkContent(text) {
  if (!text || typeof text !== 'string') {
    return { isClean: true, flaggedWords: [] };
  }

  const rawLower = text.toLowerCase();
  const normalized = normalizeText(text);
  const compressed = normalized.replace(/[^a-z0-9]/g, '');

  const flagged = new Set();

  for (const word of SENSITIVE_WORDS) {
    const wordNoSpaces = word.replace(/\s+/g, '');

    // 1. Exact word boundary match on raw text
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(rawLower)) {
      flagged.add(word);
      continue;
    }

    // 2. Exact word boundary match on normalized text
    const normRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (normRegex.test(normalized)) {
      flagged.add(word);
      continue;
    }

    // 3. Multi-word phrase match
    if (word.includes(' ') && (rawLower.includes(word) || normalized.includes(word))) {
      flagged.add(word);
      continue;
    }

    // 4. Compact evasion match for words >= 4 letters (e.g. 'f-u-c-k')
    if (wordNoSpaces.length >= 4 && compressed.includes(wordNoSpaces)) {
      flagged.add(word);
      continue;
    }
  }

  const flaggedWords = Array.from(flagged);
  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
  };
}

/**
 * Masks sensitive words with asterisks
 * @param {string} text 
 * @returns {string}
 */
export function maskSensitiveWords(text) {
  if (!text) return '';
  let result = text;
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (match.length <= 2) return '**';
      return match[0] + '*'.repeat(match.length - 1);
    });
  }
  return result;
}
