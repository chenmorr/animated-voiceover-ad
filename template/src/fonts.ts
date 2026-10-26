import {loadFont} from '@remotion/fonts';
import {staticFile, delayRender, continueRender} from 'remotion';

// הפונטים נטענים לפני הרינדור, ולא יותר מ-20 שניות כדי שרינדור לא ייתקע
const h = delayRender('fonts', {timeoutInMilliseconds: 60000});
let done = false;
const finish = () => { if (!done) { done = true; continueRender(h); } };
Promise.all([
  loadFont({family: 'RubikV', url: staticFile('fonts/rubik-var.ttf'), weight: '300 900'}),
  loadFont({family: 'HeeboV', url: staticFile('fonts/heebo-var.ttf'), weight: '100 900'}),
]).then(finish, finish);
setTimeout(finish, 20000);
