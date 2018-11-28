import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class GamplayService {
  constructor(private http: HttpClient) {
  }
}
