// Comprehensive list of words to filter out
const BANNED_WORDS = [
  // Profanity - Common
  'fuck', 'bitch', 'piss', 'cock', 'dick', 'pussy', 'cunt', 'twat', 'whore', 'slut',
  
  // Profanity - Variations and misspellings
  'f*ck', 'f**k', 'f***', 'f****', 'f*****', 'fck', 'fuk', 'fuq', 'fux', 'fuxk',
  'b*tch', 'b**ch', 'b***h', 'b!tch', 'b1tch', 'bytch', 'b!tch',
  'd*ck', 'd**k', 'd***', 'd!ck', 'd1ck', 'd!ck', 'dik', 'd!k',
  'c*ck', 'c**k', 'c***', 'c!ck', 'c1ck', 'c0ck', 'cok',
  'p*ssy', 'p**sy', 'p***y', 'p!ssy', 'p1ssy', 'p!ssy', 'pussy', 'puss',
  'c*nt', 'c**t', 'c***', 'c!nt', 'c1nt', 'c0nt', 'cnt',
  'tw*t', 'tw**', 'tw!t', 'tw1t', 'twat',
  'wh*re', 'wh**e', 'wh!re', 'wh1re', 'wh0re', 'whore',
  'sl*t', 'sl**', 'sl!t', 'sl1t', 'sl0t', 'slut',
  
  // Racial and ethnic slurs
  'nigger', 'nigga', 'n!gger', 'n1gger', 'n!gga', 'n1gga', 'n!gger', 'n1gger',
  'faggot', 'fag', 'f@ggot', 'f@gg0t', 'f@gg0t', 'f@ggot',
  'retard', 'ret@rd', 'ret@rd', 'ret@rd', 'ret@rd',
  'spic', 'sp!c', 'sp1c', 'sp!c', 'sp1c',
  'chink', 'ch!nk', 'ch1nk', 'ch!nk', 'ch1nk',
  'kike', 'k!ke', 'k1ke', 'k!ke', 'k1ke',
  'wop', 'w0p', 'w!p', 'w0p', 'w!p',
  'dago', 'd@go', 'd@go', 'd@go', 'd@go',
  'kraut', 'kr@ut', 'kr@ut', 'kr@ut', 'kr@ut',
  'mick', 'm!ck', 'm1ck', 'm!ck', 'm1ck',
  'paddy', 'p@ddy', 'p@ddy', 'p@ddy', 'p@ddy',
  'polack', 'pol@ck', 'pol@ck', 'pol@ck', 'pol@ck',
  'spook', 'sp00k', 'sp00k', 'sp00k', 'sp00k',
  'wetback', 'wetb@ck', 'wetb@ck', 'wetb@ck', 'wetb@ck',
  'gook', 'g00k', 'g00k', 'g00k', 'g00k',
  'jap', 'j@p', 'j@p', 'j@p', 'j@p',
  'cholo', 'ch0l0', 'ch0l0', 'ch0l0', 'ch0l0',
  'beaner', 'be@ner', 'be@ner', 'be@ner', 'be@ner',
  'towelhead', 'towelhe@d', 'towelhe@d', 'towelhe@d', 'towelhe@d',
  'cameljockey', 'camelj0ckey', 'camelj0ckey', 'camelj0ckey', 'camelj0ckey',
  'sandnigger', 'sandn!gger', 'sandn!gger', 'sandn!gger', 'sandn!gger',
  'tarbaby', 't@rbaby', 't@rbaby', 't@rbaby', 't@rbaby',
  'junglebunny', 'junglebunny', 'junglebunny', 'junglebunny', 'junglebunny',
  'porchmonkey', 'porchm0nkey', 'porchm0nkey', 'porchm0nkey', 'porchm0nkey',
  'coon', 'c00n', 'c00n', 'c00n', 'c00n',
  'jigaboo', 'j!gab00', 'j!gab00', 'j!gab00', 'j!gab00',
  'pickaninny', 'p!ckan!nny', 'p!ckan!nny', 'p!ckan!nny', 'p!ckan!nny',
  'raghead', 'r@ghe@d', 'r@ghe@d', 'r@ghe@d', 'r@ghe@d',
  'slanteye', 'slanteye', 'slanteye', 'slanteye', 'slanteye',
  'yellowman', 'yellowm@n', 'yellowm@n', 'yellowm@n', 'yellowm@n',
  'chink', 'ch!nk', 'ch1nk', 'ch!nk', 'ch1nk',
  'gook', 'g00k', 'g00k', 'g00k', 'g00k',
  'jap', 'j@p', 'j@p', 'j@p', 'j@p',
  'nip', 'n!p', 'n1p', 'n!p', 'n1p',
  'slant', 'sl@nt', 'sl@nt', 'sl@nt', 'sl@nt',
  'gook', 'g00k', 'g00k', 'g00k', 'g00k',
  'chink', 'ch!nk', 'ch1nk', 'ch!nk', 'ch1nk',
  'jap', 'j@p', 'j@p', 'j@p', 'j@p',
  'nip', 'n!p', 'n1p', 'n!p', 'n1p',
  'slant', 'sl@nt', 'sl@nt', 'sl@nt', 'sl@nt',
  
  // Homophobic slurs
  'faggot', 'fag', 'f@ggot', 'f@gg0t', 'f@gg0t', 'f@ggot',
  'dyke', 'd!ke', 'd1ke', 'd!ke', 'd1ke',
  'lesbo', 'lesb0', 'lesb0', 'lesb0', 'lesb0',
  'homo', 'h0m0', 'h0m0', 'h0m0', 'h0m0',
  'fairy', 'f@!ry', 'f@!ry', 'f@!ry', 'f@!ry',
  'butch', 'b!tch', 'b1tch', 'b!tch', 'b1tch',
  'tranny', 'tr@nny', 'tr@nny', 'tr@nny', 'tr@nny',
  'shemale', 'shem@le', 'shem@le', 'shem@le', 'shem@le',
  'he-she', 'he-she', 'he-she', 'he-she', 'he-she',
  'she-male', 'she-m@le', 'she-m@le', 'she-m@le', 'she-m@le',
  
  // Sexist and misogynistic terms
  'whore', 'wh0re', 'wh!re', 'wh0re', 'wh!re',
  'slut', 'sl!t', 'sl1t', 'sl!t', 'sl1t',
  'cunt', 'c!nt', 'c1nt', 'c!nt', 'c1nt',
  'twat', 'tw@t', 'tw!t', 'tw@t', 'tw!t',
  'pussy', 'p!ssy', 'p1ssy', 'p!ssy', 'p1ssy',
  'skank', 'sk@nk', 'sk!nk', 'sk@nk', 'sk!nk',
  'tramp', 'tr@mp', 'tr!mp', 'tr@mp', 'tr!mp',
  'floozy', 'fl00zy', 'fl00zy', 'fl00zy', 'fl00zy',
  'hussy', 'hussy', 'hussy', 'hussy', 'hussy',
  
  // Ableist slurs
  'retard', 'ret@rd', 'ret@rd', 'ret@rd', 'ret@rd',
  'retarded', 'ret@rded', 'ret@rded', 'ret@rded', 'ret@rded',
  'spastic', 'sp@st!c', 'sp@st!c', 'sp@st!c', 'sp@st!c',
  'cripple', 'cr!pple', 'cr1pple', 'cr!pple', 'cr1pple',
  'gimp', 'g!mp', 'g1mp', 'g!mp', 'g1mp',
  'idiot', '!d!ot', '!d!ot', '!d!ot', '!d!ot',
  'moron', 'm0r0n', 'm0r0n', 'm0r0n', 'm0r0n',
  'imbecile', '!mbec!le', '!mbec!le', '!mbec!le', '!mbec!le',
  'cretin', 'cret!n', 'cret!n', 'cret!n', 'cret!n',
  'feebleminded', 'feeblem!nded', 'feeblem!nded', 'feeblem!nded', 'feeblem!nded',
  
  // Religious slurs
  'kike', 'k!ke', 'k1ke', 'k!ke', 'k1ke',
  'christkiller', 'chr!stk!ller', 'chr!stk!ller', 'chr!stk!ller', 'chr!stk!ller',
  'jewboy', 'jewb0y', 'jewb0y', 'jewb0y', 'jewb0y',
  'jewgirl', 'jewg!rl', 'jewg!rl', 'jewg!rl', 'jewg!rl',
  'jewess', 'jewess', 'jewess', 'jewess', 'jewess',
  'jewbitch', 'jewb!tch', 'jewb!tch', 'jewb!tch', 'jewb!tch',
  'jewfag', 'jewf@g', 'jewf@g', 'jewf@g', 'jewf@g',
  'jewfaggot', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t',
  'jewfag', 'jewf@g', 'jewf@g', 'jewf@g', 'jewf@g',
  'jewfaggot', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t',
  'jewfag', 'jewf@g', 'jewf@g', 'jewf@g', 'jewf@g',
  'jewfaggot', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t', 'jewf@gg0t',
  
  // Violence and threats
  'rape', 'r@pe', 'r!pe', 'r@pe', 'r!pe',
  'molest', 'm0lest', 'm0lest', 'm0lest', 'm0lest',
  'abuse', '@buse', '@buse', '@buse', '@buse',

];

// Function to check if text contains banned words
export function containsBannedWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word));
}

// Function to filter out banned words and replace with asterisks
export function filterBannedWords(text: string): string {
  let filteredText = text;
  
  BANNED_WORDS.forEach(word => {
    // Escape special regex characters
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedWord, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
}

// Function to get list of banned words found in text
export function getBannedWordsInText(text: string): string[] {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.filter(word => lowerText.includes(word));
}

// Function to validate rushmore submission
export function validateRushmoreSubmission(items: string[]): {
  isValid: boolean;
  filteredItems: string[];
  bannedWordsFound: string[];
} {
  const bannedWordsFound: string[] = [];
  const filteredItems: string[] = [];
  
  items.forEach(item => {
    const bannedInItem = getBannedWordsInText(item);
    bannedWordsFound.push(...bannedInItem);
    
    if (bannedInItem.length > 0) {
      filteredItems.push(filterBannedWords(item));
    } else {
      filteredItems.push(item);
    }
  });
  
  return {
    isValid: bannedWordsFound.length === 0,
    filteredItems,
    bannedWordsFound: [...new Set(bannedWordsFound)] // Remove duplicates
  };
}

// Function to validate comment
export function validateComment(content: string): {
  isValid: boolean;
  filteredContent: string;
  bannedWordsFound: string[];
} {
  const bannedWordsFound = getBannedWordsInText(content);
  const filteredContent = filterBannedWords(content);
  
  return {
    isValid: bannedWordsFound.length === 0,
    filteredContent,
    bannedWordsFound
  };
} 