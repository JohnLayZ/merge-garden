import './style.css';
import { newGame } from './game/state';
import { createView } from './ui/view';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');
const view = createView(root);
view.render(newGame(Date.now() >>> 0), 0);
