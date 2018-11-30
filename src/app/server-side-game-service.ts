import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class ServerSideGameService {
  url = 'http://localhost:61827/api/Game/';
  constructor(private http: HttpClient) {
  }

  recordEvent(gameId:string, name: string, message: string) {
    return this.http.post(this.url + 'LogEvent', { Name: name, Message: message, UniqueIdentifier: gameId });
  }

  requestGameId() {
    return this.http.get(this.url + 'RequestGameId', {responseType: 'text'});
  }
}
