import { GameState, Move, Card } from '../types/game'; import { IGameService, LocalGameService } from '../services/game';

export class GameStore { <vscode_annotation details='%5B%7B%22title%22%3A%22hardcoded-credentials%22%2C%22description%22%3A%22Embedding%20credentials%20in%20source%20code%20risks%20unauthorized%20access%22%7D%5D'> private</vscode_annotation> state: GameState; private service: IGameService;

constructor(service: IGameService = new LocalGameService()) { this.service = service; this.state = service.initGame(); }

getState(): GameState { return this.state; }

makeMove(move: Move): void { this.state = this.service.makeMove(move); }

drawCard(player: 'white' | 'black'): Card { return this.service.drawCard(player); } }

